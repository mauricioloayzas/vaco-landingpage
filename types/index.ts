export interface Batch {
  id: string
  code: string
  name: string
  profile_id: string
  type: string
  subtype: string
  status: string
  created_at: string
  updated_at: string | null
}

export interface FermentationLog {
  id: string
  batch_id: string
  brix: number | null
  density: number | null
  temperature: number | null
  recorded_at: string
  created_at: string
}

export interface BatchMeadDetail {
  id: string
  batch_id: string
  honey_kg: number | null
  honey_brix: number | null
  initial_brix: number | null
  water_liters: number | null
  total_must_liters: number | null
  final_brix_desired: number | null
  yeast_type: string | null
  yeast_strain: string | null
  abv_estimated: number | null
  use_sorbate: boolean
  use_benzoate: boolean
  use_metabisulfite: boolean
  metabisulfite_type: string | null
  use_bentonite: boolean
  use_albumin: boolean
  created_at: string
  updated_at: string | null
}

export interface BatchFruitWineDetail {
  id: string
  batch_id: string
  fruit_type: string | null
  fruit_kg: number | null
  fruit_brix: number | null
  initial_brix: number | null
  water_liters: number | null
  sweetener_type: string | null
  total_must_liters: number | null
  final_brix_desired: number | null
  abv_estimated: number | null
  yeast_type: string | null
  yeast_strain: string | null
  use_sorbate: boolean
  use_benzoate: boolean
  use_metabisulfite: boolean
  metabisulfite_type: string | null
  use_bentonite: boolean
  use_albumin: boolean
  created_at: string
  updated_at: string | null
}

export interface BatchSugarCaneWineDetail {
  id: string
  batch_id: string
  juice_liters: number | null
  sugarcane_brix: number | null
  water_liters: number | null
  total_must_liters: number | null
  final_brix_desired: number | null
  abv_estimated: number | null
  yeast_type: string | null
  yeast_strain: string | null
  use_sorbate: boolean
  use_benzoate: boolean
  use_metabisulfite: boolean
  metabisulfite_type: string | null
  use_bentonite: boolean
  use_albumin: boolean
  created_at: string
  updated_at: string | null
}

export type AnyBatchDetail = BatchMeadDetail | BatchFruitWineDetail | BatchSugarCaneWineDetail

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}
