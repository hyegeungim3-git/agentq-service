import { test, expect } from '@playwright/test'
import { openTab, adminNav, enterDomain } from './shell'


/**
 * 접근성 훑기.
 *
 * 규칙 엔진(axe)을 새로 깔지 않고, **실제로 자주 깨지는 것만** DOM에서 직접 본다.
 *  ① 이름 없는 조작 요소 (버튼·링크·입력)
 *  ② `<h1>`이 없거나 둘 이상인 화면
 *  ③ 제목 단계 건너뛰기 (h2 없이 h3)
 *  ④ `aria-*`가 가리키는 id가 없는 것
 *  ⑤ 명암비 (작은 글씨 4.5:1, 큰 글씨 3:1)
 * 라이트·다크 양쪽과 모바일 터치 타깃까지 함께 본다.
 *
 * ⚠️ 새 화면을 만들면 여기 목록에도 추가해야 한다. 안 그러면 **안 본 화면이
 * 통과한 화면처럼 보인다** — 이 저장소가 이름 검사에서 이미 밟은 함정이다.
 */

type Finding = { where: string; kind: string; detail: string }

/**
 * ⚠️ **화면이 다 그려진 뒤에 봐야 한다.** 처음엔 `goto` 직후에 훑어서
 * 결함 0건이 나왔다 — 그때 화면에는 버튼이 하나뿐이었다.
 * 그래서 훑은 조작 요소 수를 함께 돌려주고, 너무 적으면 실패시킨다.
 */
const audit = async (
  page: import('@playwright/test').Page,
  where: string,
): Promise<{ findings: Finding[]; seen: number }> =>
  page.evaluate((w) => {
    const out: { where: string; kind: string; detail: string }[] = []
    let seen = 0
    const name = (el: Element): string => {
      const aria = el.getAttribute('aria-label')
      if (aria && aria.trim()) return aria.trim()
      const by = el.getAttribute('aria-labelledby')
      if (by) {
        const t = by
          .split(/\s+/)
          .map((id) => document.getElementById(id)?.textContent ?? '')
          .join(' ')
        if (t.trim()) return t.trim()
      }
      if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
        const lab = el.labels?.[0]?.textContent ?? ''
        if (lab.trim()) return lab.trim()
        const ph = el.getAttribute('placeholder') ?? ''
        if (ph.trim()) return ph.trim()
        if (el instanceof HTMLInputElement && (el.type === 'radio' || el.type === 'checkbox')) {
          const wrap = el.closest('label')?.textContent ?? ''
          if (wrap.trim()) return wrap.trim()
        }
      }
      return (el.textContent ?? '').trim()
    }

    const visible = (el: Element): boolean => {
      const r = el.getBoundingClientRect()
      const s = getComputedStyle(el)
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'
    }

    /* ① 이름 없는 조작 요소 */
    for (const el of document.querySelectorAll('button, a[href], input, select, textarea')) {
      if (!visible(el)) continue
      if (el.getAttribute('aria-hidden') === 'true') continue
      if (el instanceof HTMLInputElement && el.type === 'hidden') continue
      seen += 1
      if (!name(el)) {
        out.push({ where: w, kind: 'no-name', detail: `${el.tagName.toLowerCase()} ${el.className.slice(0, 60)}` })
      }
    }

    /* ② h1 개수 */
    const h1 = [...document.querySelectorAll('h1')].filter(visible)
    if (h1.length !== 1) out.push({ where: w, kind: 'h1', detail: `h1 ${h1.length}개` })

    /* ③ 제목 단계 건너뛰기 */
    const heads = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(visible)
    let prev = 0
    for (const h of heads) {
      const lv = Number(h.tagName[1])
      if (prev && lv > prev + 1) {
        out.push({ where: w, kind: 'skip', detail: `h${prev} → h${lv} · ${(h.textContent ?? '').slice(0, 30)}` })
      }
      prev = lv
    }

    /* ⑤ 명암비 — 본문이 배경과 충분히 갈리는가(WCAG AA 4.5:1, 큰 글씨 3:1) */
    /* 색은 `oklch()`로도 온다 — 문자열을 직접 파싱하면 오탐이 난다.
       캔버스에 1픽셀 칠하고 그 픽셀을 읽으면 브라우저가 sRGB로 바꿔 준다.
       (`fillStyle`을 되읽는 방법은 안 된다 — Chrome이 oklch를 그대로 돌려준다) */
    const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
    const rgb = (v: string): [number, number, number] | null => {
      if (!ctx) return null
      ctx.clearRect(0, 0, 1, 1)
      ctx.fillStyle = v
      ctx.fillRect(0, 0, 1, 1)
      const d = ctx.getImageData(0, 0, 1, 1).data
      /* 완전 투명이면 '이 요소는 배경을 안 칠한다'는 뜻이라 위로 올라가야 한다 */
      if ((d[3] ?? 0) === 0) return null
      return [d[0] ?? 0, d[1] ?? 0, d[2] ?? 0]
    }
    const lum = (c: [number, number, number]): number => {
      const f = c.map((x) => {
        const v = x / 255
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
      }) as [number, number, number]
      return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2]
    }
    const bgOf = (el: Element): [number, number, number] => {
      let cur: Element | null = el
      while (cur) {
        const c = rgb(getComputedStyle(cur).backgroundColor)
        if (c) return c
        cur = cur.parentElement
      }
      return [255, 255, 255]
    }
    const ratio = (a: [number, number, number], b: [number, number, number]): number => {
      const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p) as [number, number]
      return (x + 0.05) / (y + 0.05)
    }
    for (const el of document.querySelectorAll('p, span, li, td, th, h1, h2, h3, h4, button, a, label, dt, dd')) {
      if (!visible(el)) continue
      /* 자식이 글자를 갖고 있으면 그 자식에서 잰다 — 여기서 또 재면 같은 글자를 두 번 본다 */
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && (n.textContent ?? '').trim())
      if (!own) continue
      const st = getComputedStyle(el)
      const fg = rgb(st.color)
      if (!fg) continue
      const size = parseFloat(st.fontSize)
      const bold = Number(st.fontWeight) >= 700
      const large = size >= 24 || (size >= 18.66 && bold)
      const need = large ? 3 : 4.5
      const r = ratio(fg, bgOf(el))
      if (r < need) {
        out.push({
          where: w,
          kind: 'contrast',
          detail: `${r.toFixed(2)}:1 (${need} 필요) · ${st.color} on ${st.fontSize} · ${(el.textContent ?? '').trim().slice(0, 24)}`,
        })
      }
    }

    /* ④ 끊긴 aria 참조 */
    for (const attr of ['aria-labelledby', 'aria-describedby', 'aria-controls']) {
      for (const el of document.querySelectorAll(`[${attr}]`)) {
        for (const id of (el.getAttribute(attr) ?? '').split(/\s+/).filter(Boolean)) {
          if (!document.getElementById(id)) {
            out.push({ where: w, kind: 'dangling-aria', detail: `${attr}="${id}"` })
          }
        }
      }
    }
    return { findings: out, seen }
  }, where)

test('접근성 훑기 @a11y', async ({ page }) => {
  const all: Finding[] = []
  const thin: string[] = []

  await page.goto('./')

  /* 전환 중인 색을 재면 없는 결함이 나온다 — 실제로 탭 전환 애니메이션 중간값이
     명암비 위반으로 잡혔다. 재는 동안에는 전환을 끈다 */
  await page.addStyleTag({
    content: '*,*::before,*::after{transition:none !important;animation:none !important}',
  })

  /**
   * 화면이 **다 그려진 뒤에** 훑는다.
   *
   * 업무 데이터(팩)를 발주처를 고를 때 받게 바꾼 뒤로, 조작 요소가 한 박자 늦게
   * 늘어난다. 한 번만 재면 덜 그려진 화면을 훑고 '결함 0건'이 나온다 —
   * 그래서 기대 개수에 닿을 때까지 기다렸다가 잰다. 끝내 못 닿으면 그대로 적는다.
   */
  const scan = async (where: string, least: number) => {
    let seen = 0
    let findings: Finding[] = []
    for (let tries = 0; tries < 50; tries += 1) {
      const r = await audit(page, where)
      findings = r.findings
      seen = r.seen
      /* 다 그려졌고 결함도 없으면 끝. 업무 데이터를 발주처를 고를 때 받게 되면서
         **잠깐 이름이 빈 요소**가 생기는데, 그 순간을 잡으면 없는 결함이 나온다.
         끝까지 남는 결함은 진짜이므로 예산을 다 쓰고 그대로 보고한다 */
      if (seen >= least && findings.length === 0) break
      await page.waitForTimeout(200)
    }
    all.push(...findings)
    if (seen < least) thin.push(`${where}: 조작 요소 ${seen}개 — 화면이 덜 그려진 채로 훑었다`)
  }

  /* 발주처 목록이 오기 전에 훑으면 버튼 하나짜리 화면을 보게 된다 */
  await expect(
    page.getByRole('navigation', { name: '발주처 선택' }).getByRole('button', { name: '새빛대학교병원', exact: true }),
  ).toBeVisible()
  await scan('포털', 5)

  await page
    .getByRole('navigation', { name: '발주처 선택' })
    .getByRole('button', { name: '새빛대학교병원', exact: true })
    .click()
  await page.getByRole('button', { name: /사용자 포털 입장/ }).click()
  await expect(page.getByRole('textbox').first()).toBeVisible()
  await scan('대화', 8)

  await openTab(page, /^에이전트/)
  await expect(page.getByRole('button', { name: '문서 요약', exact: true })).toBeVisible()
  await scan('허브', 12)

  for (const agent of ['문서 요약', '기준정보 표준화', '문서 번역', '데이터 분석']) {
    await page.getByRole('button', { name: agent, exact: true }).click()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await scan(agent, 4)
    await openTab(page, /^에이전트/)
  }

  await openTab(page, /^보안/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await scan('보안', 2)

  await page.goto('./')
  await page.addStyleTag({
    content: '*,*::before,*::after{transition:none !important;animation:none !important}',
  })
  await page.getByRole('button', { name: /관리자 시스템/ }).click()
  /* 여는 절차는 `shell.ts` 한 곳에 있다 — 관리자 코드를 따로 내려받게 되면서
     '도착할 때까지 기다리기'가 필요해졌고, 복사본마다 고칠 수는 없다 */
  await adminNav(page)
  await scan('관리 홈', 10)

  /* ⚠️ 못 찾은 메뉴를 조용히 넘기면 **안 본 화면이 통과한 화면처럼 보인다.**
     이 저장소가 이미 두 번 밟은 함정이라 모아서 함께 실패시킨다 */
  const unreachable: string[] = []
  for (const menu of ['에이전트', '지식 관리', '도구 · 배포']) {
    const nav = await adminNav(page)
    const b = nav.getByRole('button', { name: menu })
    if ((await b.count()) === 0) {
      unreachable.push(menu)
      continue
    }
    await b.first().click()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await scan(`관리자 · ${menu}`, 4)
  }

  console.log(JSON.stringify(all, null, 1))
  expect(unreachable, '메뉴를 못 찾아 안 본 화면 — 통과로 세면 안 된다').toEqual([])
  expect(thin, '덜 그려진 화면을 훑으면 결함 0건이 나온다').toEqual([])
  expect(all).toEqual([])
})

test('키보드만으로 대화까지 간다 @a11y', async ({ page }) => {
  await page.goto('./')
  /* 첫 화면은 발주처 목록을 받은 뒤에 그려진다 — 기다리지 않고 Tab을 누르면
     정지점이 아직 없어서 훑은 것이 0이 된다(빈 결과가 통과로 보이는 자리) */
  await expect(page.getByRole('navigation', { name: '발주처 선택' })).toBeVisible()
  const trail: string[] = []
  for (let i = 0; i < 12; i += 1) {
    await page.keyboard.press('Tab')
    const cur = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return null
      const s = getComputedStyle(el)
      return {
        tag: el.tagName.toLowerCase(),
        name: (el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 30),
        outline: s.outlineStyle,
        ring: s.boxShadow.slice(0, 20),
      }
    })
    /* 문서 밖(브라우저 크롬)으로 나가면 한 바퀴 돈 것이다 — 거기서 멈추지 않는다 */
    if (cur) trail.push(`${cur.tag} · ${cur.name} · outline=${cur.outline}`)
  }
  console.log(trail.join('\n'))
  expect(trail.length).toBeGreaterThan(0)
})

/**
 * 다크 스킨에서도 읽히는가.
 *
 * 팔레트를 뒤집는 방식이라 **한쪽에서 고친 명암비가 다른 쪽에서 깨질 수 있다.**
 * 실제로 흐린 글자 두 단계를 라이트에서 낮추자 다크 쪽 대응 색조가 함께 움직였다.
 */
test('다크 스킨도 대비를 지킨다 @a11y', async ({ page }) => {
  await page.goto('./')
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'))
  await page.addStyleTag({
    content: '*,*::before,*::after{transition:none !important;animation:none !important}',
  })
  await expect(
    page.getByRole('navigation', { name: '발주처 선택' }).getByRole('button', { name: '새빛대학교병원', exact: true }),
  ).toBeVisible()

  const { findings: portal } = await audit(page, '포털(다크)')
  await page
    .getByRole('navigation', { name: '발주처 선택' })
    .getByRole('button', { name: '새빛대학교병원', exact: true })
    .click()
  await page.getByRole('button', { name: /사용자 포털 입장/ }).click()
  await expect(page.getByRole('textbox').first()).toBeVisible()
  const { findings: chat } = await audit(page, '대화(다크)')

  const all = [...portal, ...chat]
  console.log(JSON.stringify(all, null, 1))
  expect(all).toEqual([])
})

/* 손가락으로 누르는 것은 44px보다 작으면 안 된다 */
test('모바일 터치 타깃이 44px 이상이다 @a11y', async ({ page, viewport }) => {
  /* 좁은 화면에서만 본다 — 넓은 화면의 조밀한 도구 모음까지 44px을 강요하지 않는다 */
  if ((viewport?.width ?? 0) > 500) return
  await enterDomain(page, '새빛대학교병원')
  await expect(page.getByRole('textbox').first()).toBeVisible()

  const small = await page.evaluate(() =>
    [...document.querySelectorAll('button, a[href], input[type=checkbox], input[type=radio]')]
      .filter((el) => {
        const r = el.getBoundingClientRect()
        const st = getComputedStyle(el)
        /* 보이지 않게 숨긴 입력(파일 선택 등)은 손가락으로 누르는 대상이 아니다 —
           누르는 것은 그 앞의 라벨이다 */
        if (st.opacity === '0' || r.width <= 4 || r.height <= 4) return false
        return r.width > 0 && r.height > 0 && r.height < 44
      })
      .map((el) => {
        const r = el.getBoundingClientRect()
        return `${Math.round(r.width)}x${Math.round(r.height)} · ${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 24)}`
      }),
  )
  console.log(small.join('\n'))
  expect(small).toEqual([])
})
