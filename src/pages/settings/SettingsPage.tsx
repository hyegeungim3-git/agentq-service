import { UI_LANGS, t, uiLangLabel, type UiLang } from '@shared/i18n/strings'
import type { PrefsStore, Theme } from '@features/prefs/usePrefs'

/**
 * 환경설정.
 *
 * 두 가지만 둔다 — 밝기와 화면 틀 언어. 둘 다 **고르면 실제로 바뀐다.**
 * 결과를 바꾸지 않는 설정은 두지 않는다.
 *
 * 어디에 저장되는지 먼저 말한다. 계정 설정처럼 보이면 다른 기기에서도
 * 따라올 줄 안다 — 서버가 없으므로 이 브라우저에만 남는다.
 */

const THEMES: Theme[] = ['light', 'dark']

export function SettingsPage({ store }: { store: PrefsStore }) {
  const { prefs, set, reset, persisted } = store
  const lang = prefs.uiLang

  return (
    <main className="mx-auto w-full max-w-2xl p-4 sm:p-6">
      <h1 className="text-lg font-black text-slate-900">{t(lang, 'settings.title')}</h1>
      {/* 계정 설정이 아니라는 사실을 항목보다 먼저 */}
      <p className="mt-1 text-sm text-slate-600">{t(lang, 'settings.lead')}</p>

      <section
        aria-labelledby="pref-theme"
        className="mt-5 rounded-xl border border-slate-200 bg-white p-4"
      >
        <h2 id="pref-theme" className="text-sm font-black text-slate-900">
          {t(lang, 'settings.theme')}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {THEMES.map((th) => (
            <label
              key={th}
              className="flex min-h-11 cursor-pointer items-center rounded-full border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50 has-checked:border-brand has-checked:bg-brand has-checked:text-brand-fg"
            >
              <input
                type="radio"
                name="pref-theme"
                value={th}
                checked={prefs.theme === th}
                onChange={() => set({ theme: th })}
                className="sr-only"
              />
              {t(lang, th === 'light' ? 'settings.theme.light' : 'settings.theme.dark')}
            </label>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="pref-lang"
        className="mt-4 rounded-xl border border-slate-200 bg-white p-4"
      >
        <h2 id="pref-lang" className="text-sm font-black text-slate-900">
          {t(lang, 'settings.lang')}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {UI_LANGS.map((l: UiLang) => (
            <label
              key={l}
              className="flex min-h-11 cursor-pointer items-center rounded-full border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50 has-checked:border-brand has-checked:bg-brand has-checked:text-brand-fg"
            >
              <input
                type="radio"
                name="pref-lang"
                value={l}
                checked={lang === l}
                onChange={() => set({ uiLang: l })}
                className="sr-only"
              />
              {uiLangLabel(l)}
            </label>
          ))}
        </div>
        {/* 어디까지 바뀌는지 고르기 전에 말한다 */}
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          {t(lang, 'settings.lang.note')}
        </p>
      </section>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          {t(lang, 'settings.reset')}
        </button>
        {/* 저장 사실과 막혔을 때를 모두 말한다 */}
        <p className={`text-xs ${persisted ? 'text-slate-500' : 'text-rose-800'}`}>
          {t(lang, persisted ? 'settings.saved' : 'settings.notSaved')}
        </p>
      </div>
    </main>
  )
}
