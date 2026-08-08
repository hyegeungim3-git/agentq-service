/**
 * 관리자 '인프라 · 개발' 화면 묶음 — **이 섹션을 열 때 받는다.**
 *
 * 관리자 전체를 한 덩어리로 두면 시스템 현황만 보는 사람도 44화면을 다 받는다.
 * 섹션은 사이드바에서 눈에 보이는 경계라 나누기에 자연스럽다.
 */
import { BenchmarkPage } from '@pages/admin/datainfra/BenchmarkPage'
import { CatalogPage } from '@pages/admin/datainfra/CatalogPage'
import { DatasetPage } from '@pages/admin/mlops/DatasetPage'
import { DevEnvPage } from '@pages/admin/mlops/DevEnvPage'
import { EvaluationPage } from '@pages/admin/mlops/EvaluationPage'
import { IngestPage } from '@pages/admin/datainfra/IngestPage'
import { PredOpsPage } from '@pages/admin/mlops/PredOpsPage'
import { RegistryPage } from '@pages/admin/mlops/RegistryPage'
import { TrainingPage } from '@pages/admin/mlops/TrainingPage'
import { VectorDbPage } from '@pages/admin/datainfra/VectorDbPage'
import { VolumePage } from '@pages/admin/mlops/VolumePage'

export function InfraSection({ menuId }: { menuId: string }) {
  return (
    <>
      {menuId === 'data.sets' && <DatasetPage />}
      {menuId === 'data.vector' && <VectorDbPage />}
      {menuId === 'data.ingest' && <IngestPage />}
      {menuId === 'data.catalog' && <CatalogPage />}
      {menuId === 'devenv.workspace' && <DevEnvPage />}
      {menuId === 'devenv.volume' && <VolumePage />}
      {menuId === 'registry' && <RegistryPage />}
      {menuId === 'training' && <TrainingPage />}
      {menuId === 'evaluation.internal' && <EvaluationPage />}
      {menuId === 'evaluation.benchmark' && <BenchmarkPage />}
      {menuId === 'evaluation.predops' && <PredOpsPage />}
    </>
  )
}
