<script setup lang="ts">
import { Line } from 'vue-chartjs'

const route = useRoute()
const batchId = route.params.batchId as string

const { batch, batchDetail, fermentationLogs, profile, pending, error } = usePublicBatch(batchId)

// ---- static metadata ----
const TYPE_META: Record<string, { label: string; icon: string; cls: string }> = {
  mead: { label: 'Hidromiel', icon: '🍯', cls: 'badge-mead' },
  'fruit ferment': { label: 'Vino de Frutas', icon: '🍓', cls: 'badge-fruit-ferment' },
  sugarcane: { label: 'Vino de Caña', icon: '🌿', cls: 'badge-sugarcane' },
}

const STATUS_META: Record<string, { label: string; cls: string }> = {
  begin: { label: 'Iniciado', cls: 'badge-begin' },
  in_process: { label: 'En Fermentación', cls: 'badge-active' },
  active: { label: 'En Fermentación', cls: 'badge-active' },
  finished: { label: 'Finalizado', cls: 'badge-done' },
  done: { label: 'Finalizado', cls: 'badge-done' },
  failed: { label: 'Fallido', cls: 'badge-failed' },
}

const SUBTYPE_ES: Record<string, string> = {
  grape: 'Uva', strawberry: 'Fresa', apple: 'Manzana',
  pear: 'Pera', pineapple: 'Piña', mango: 'Mango',
  blackberry: 'Mora', peach: 'Durazno', banana: 'Banano',
  honey: 'Miel', 'cane juice': 'Caña',
}

const YEAST_TYPE_ES: Record<string, string> = {
  vinifera: 'Vinífera',
  panifera: 'Panadera',
}

// ---- computed ----
const typeInfo = computed(() =>
  batch.value
    ? TYPE_META[batch.value.type] ?? { label: batch.value.type, icon: '🫗', cls: '' }
    : null,
)

const statusInfo = computed(() =>
  batch.value
    ? STATUS_META[batch.value.status] ?? { label: batch.value.status, cls: '' }
    : null,
)

useHead(
  computed(() => ({
    title: batch.value ? `${batch.value.name} — HAYAYAKU` : 'HAYAYAKU — Lote',
  })),
)

// ---- formatters ----
function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' })
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmt(val: number | null | undefined, suffix = ''): string {
  return val == null ? '—' : `${val}${suffix}`
}

function capitalize(str: string | null | undefined): string {
  if (!str) return '—'
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ')
}

function formatDateShort(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

// ---- metrics ----
const metrics = computed(() => {
  if (!batch.value) return []
  const d = batchDetail.value as any
  const result: { icon: string; value: string; label: string }[] = []

  if (d) {
    if (d.total_must_liters != null) result.push({ icon: '🫗', value: `${d.total_must_liters} L`, label: 'Volumen Total' })
    if (d.abv_estimated != null) result.push({ icon: '🍷', value: `${d.abv_estimated}%`, label: 'ABV Estimado' })
    const initialBrix = d.initial_brix ?? d.sugarcane_brix
    if (initialBrix != null) result.push({ icon: '🔬', value: `${initialBrix}°`, label: 'Brix Inicial' })
    if (d.final_brix_desired != null) result.push({ icon: '🎯', value: `${d.final_brix_desired}°`, label: 'Brix Objetivo' })
  }

  if (result.length === 0) {
    result.push({ icon: '📅', value: formatDate(batch.value.created_at), label: 'Creado' })
  }

  return result
})

// ---- recipe ----
const recipeItems = computed(() => {
  if (!batch.value || !batchDetail.value) return []
  const type = batch.value.type
  const d = batchDetail.value as any
  const items: { label: string; value: string }[] = []

  if (type === 'mead') {
    if (d.honey_kg != null) items.push({ label: 'Miel', value: `${d.honey_kg} kg` })
    if (d.honey_brix != null) items.push({ label: 'Brix de miel', value: `${d.honey_brix}°` })
    if (d.water_liters != null) items.push({ label: 'Agua', value: `${d.water_liters} L` })
    if (d.total_must_liters != null) items.push({ label: 'Mosto total', value: `${d.total_must_liters} L` })
    if (d.final_brix_desired != null) items.push({ label: 'Brix objetivo', value: `${d.final_brix_desired}°` })
    if (d.abv_estimated != null) items.push({ label: 'ABV estimado', value: `${d.abv_estimated}%` })
  } else if (type === 'fruit ferment') {
    items.push({ label: 'Fruta', value: SUBTYPE_ES[d.fruit_type] ?? capitalize(d.fruit_type) })
    if (d.fruit_kg != null) items.push({ label: 'Peso de fruta', value: `${d.fruit_kg} kg` })
    if (d.fruit_brix != null) items.push({ label: 'Brix de fruta', value: `${d.fruit_brix}°` })
    if (d.water_liters != null) items.push({ label: 'Agua', value: `${d.water_liters} L` })
    if (d.total_must_liters != null) items.push({ label: 'Mosto total', value: `${d.total_must_liters} L` })
    if (d.sweetener_type) items.push({ label: 'Edulcorante', value: capitalize(d.sweetener_type) })
    if (d.abv_estimated != null) items.push({ label: 'ABV estimado', value: `${d.abv_estimated}%` })
  } else if (type === 'sugarcane') {
    if (d.juice_liters != null) items.push({ label: 'Jugo de caña', value: `${d.juice_liters} L` })
    if (d.sugarcane_brix != null) items.push({ label: 'Brix del jugo', value: `${d.sugarcane_brix}°` })
    if (d.water_liters != null) items.push({ label: 'Agua', value: `${d.water_liters} L` })
    if (d.total_must_liters != null) items.push({ label: 'Mosto total', value: `${d.total_must_liters} L` })
    if (d.final_brix_desired != null) items.push({ label: 'Brix objetivo', value: `${d.final_brix_desired}°` })
    if (d.abv_estimated != null) items.push({ label: 'ABV estimado', value: `${d.abv_estimated}%` })
  }

  if (d.yeast_type) {
    let yeastLabel = YEAST_TYPE_ES[d.yeast_type] ?? capitalize(d.yeast_type)
    if (d.yeast_strain) yeastLabel += ` · ${d.yeast_strain}`
    items.push({ label: 'Levadura', value: yeastLabel })
  }

  return items
})

// ---- additives ----
const additives = computed(() => {
  if (!batchDetail.value) return []
  const d = batchDetail.value as any
  const result: string[] = []
  if (d.use_sorbate) result.push('Sorbato')
  if (d.use_benzoate) result.push('Benzoato')
  if (d.use_metabisulfite) result.push('Metabisulfito' + (d.metabisulfite_type ? ` (${d.metabisulfite_type})` : ''))
  if (d.use_bentonite) result.push('Bentonita')
  if (d.use_albumin) result.push('Albúmina')
  return result
})

const sortedLogs = computed(() =>
  [...fermentationLogs.value].sort(
    (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime(),
  ),
)

// ---- chart data (vue-chartjs handles lifecycle automatically) ----
const chartData = computed(() => {
  const logs = sortedLogs.value
  const hasBrix = logs.some((l) => l.brix != null)
  const hasTemp = logs.some((l) => l.temperature != null)
  const hasDens = logs.some((l) => l.density != null)

  const datasets: any[] = []

  if (hasBrix) {
    datasets.push({
      label: 'Brix (°)', data: logs.map((l) => l.brix),
      borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.12)',
      fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6, yAxisID: 'y',
    })
  }
  if (hasTemp) {
    datasets.push({
      label: 'Temperatura (°C)', data: logs.map((l) => l.temperature),
      borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0)',
      fill: false, tension: 0.4, pointRadius: 4, pointHoverRadius: 6,
      borderDash: [6, 3], yAxisID: 'y1',
    })
  }
  if (hasDens && !hasBrix) {
    datasets.push({
      label: 'Densidad', data: logs.map((l) => l.density),
      borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.1)',
      fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6, yAxisID: 'y',
    })
  }

  return {
    labels: logs.map((l) => formatDateShort(l.recorded_at)),
    datasets,
  }
})

const hasBrix = computed(() => sortedLogs.value.some((l) => l.brix != null))
const hasTemp = computed(() => sortedLogs.value.some((l) => l.temperature != null))
const hasDens = computed(() => sortedLogs.value.some((l) => l.density != null))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: { position: 'top' as const, labels: { font: { family: 'Inter', size: 12 }, usePointStyle: true } },
    tooltip: { backgroundColor: '#111827', titleFont: { family: 'Inter', size: 12 }, bodyFont: { family: 'Inter', size: 12 }, padding: 10, cornerRadius: 8 },
  },
  scales: {
    x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { family: 'Inter', size: 11 } } },
    y: {
      type: 'linear' as const,
      display: hasBrix.value || (hasDens.value && !hasBrix.value),
      position: 'left' as const,
      title: { display: true, text: hasBrix.value ? 'Brix (°)' : 'Densidad', font: { family: 'Inter', size: 11 }, color: '#6B7280' },
      grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { family: 'Inter', size: 11 } },
    },
    y1: {
      type: 'linear' as const,
      display: hasTemp.value,
      position: 'right' as const,
      title: { display: true, text: 'Temperatura (°C)', font: { family: 'Inter', size: 11 }, color: '#6B7280' },
      grid: { drawOnChartArea: false }, ticks: { font: { family: 'Inter', size: 11 } },
    },
  },
}))

// ---- error message ----
const errorMessage = computed(() => {
  if (!error.value) return ''
  const msg = (error.value as any).data?.error ?? error.value.message ?? 'Error al cargar el lote.'
  if (msg === 'Batch not found') return 'El lote no existe o no está disponible públicamente.'
  if (msg === 'Profile not found') return 'El perfil no existe.'
  return msg
})

const hasNoSlug = computed(() => !useSubdomainSlug())
</script>

<template>
  <div class="batch-page">
    <!-- ===== NAV ===== -->
    <nav class="navbar">
      <div class="nav-inner">
        <a href="https://hayayaku.com" class="brand">
          <img src="/favicon-32x32.png" alt="HAYAYAKU logo" />
          HAYAYAKU
        </a>
        <a href="https://webapp.hayayaku.com" class="btn btn-primary" target="_blank" rel="noopener">
          Ir a la App
        </a>
      </div>
    </nav>

    <!-- ===== MAIN ===== -->
    <main>

      <!-- Loading -->
      <div v-if="pending" class="state-container">
        <div class="spinner"></div>
        <p>Cargando lote...</p>
      </div>

      <!-- No slug -->
      <div v-else-if="hasNoSlug" class="state-container">
        <div class="error-icon">🍶</div>
        <h2>URL inválida</h2>
        <p>No se encontró el perfil en la dirección.</p>
        <a href="https://hayayaku.com" class="btn btn-outline" style="margin-top:8px;">Ir a HAYAYAKU</a>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="state-container">
        <div class="error-icon">🍶</div>
        <h2>Lote no encontrado</h2>
        <p>{{ errorMessage }}</p>
        <a href="https://hayayaku.com" class="btn btn-outline" style="margin-top:8px;">Ir a HAYAYAKU</a>
      </div>

      <!-- Content -->
      <template v-else-if="batch">

        <!-- Batch header -->
        <div class="batch-header">
          <div class="container">
            <div class="batch-header-inner">
              <div>
                <div class="batch-badges">
                  <span v-if="typeInfo" class="badge" :class="typeInfo.cls">
                    {{ typeInfo.icon }} {{ typeInfo.label }}
                  </span>
                  <span v-if="statusInfo" class="badge" :class="statusInfo.cls">
                    {{ statusInfo.label }}
                  </span>
                </div>
                <p v-if="profile" class="batch-profile-name">{{ profile.name }}</p>
                <h1 class="batch-name">{{ batch.name }}</h1>
                <p class="batch-code">{{ batch.code }}</p>
              </div>
              <div class="batch-date-block">
                <span class="batch-date-label">Creado</span>
                <span class="batch-date-value">{{ formatDate(batch.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Metrics -->
        <section class="section">
          <div class="container">
            <h2 class="section-title">Resumen</h2>
            <div class="metrics-grid">
              <div v-for="m in metrics" :key="m.label" class="metric-card">
                <span class="metric-icon">{{ m.icon }}</span>
                <span class="metric-value">{{ m.value }}</span>
                <span class="metric-label">{{ m.label }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Recipe -->
        <section v-if="batchDetail && recipeItems.length" class="section section-alt">
          <div class="container">
            <h2 class="section-title">
              Receta · {{ typeInfo?.label }}
            </h2>
            <div class="recipe-grid">
              <div v-for="item in recipeItems" :key="item.label" class="recipe-card">
                <span class="recipe-label">{{ item.label }}</span>
                <span class="recipe-value">{{ item.value }}</span>
              </div>
            </div>
            <div v-if="additives.length" style="margin-top:20px;">
              <p style="font-size:.8rem;text-transform:uppercase;letter-spacing:.07em;color:var(--gray-400);font-weight:600;margin-bottom:10px;">
                Estabilizadores / Clarificantes
              </p>
              <div class="additives-list">
                <span v-for="a in additives" :key="a" class="additive-pill">{{ a }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Fermentation logs -->
        <section class="section">
          <div class="container">
            <h2 class="section-title">Registros de Fermentación</h2>

            <p v-if="!sortedLogs.length" class="logs-empty">
              Sin registros de fermentación aún.
            </p>

            <template v-else>
              <div class="chart-wrapper">
                <ClientOnly>
                  <Line :data="chartData" :options="chartOptions" />
                </ClientOnly>
              </div>
              <div class="table-wrapper">
                <table class="log-table">
                  <thead>
                    <tr>
                      <th>Fecha y hora</th>
                      <th>Brix (°)</th>
                      <th>Densidad</th>
                      <th>Temperatura (°C)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="log in sortedLogs" :key="log.id">
                      <td>{{ formatDateTime(log.recorded_at) }}</td>
                      <td class="value">{{ fmt(log.brix, '°') }}</td>
                      <td class="value">{{ fmt(log.density) }}</td>
                      <td class="value">{{ fmt(log.temperature, ' °C') }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
          </div>
        </section>

        <!-- Share banner -->
        <div class="share-banner">
          <div class="container share-inner">
            <p class="share-text">
              Registros gestionados con <strong>HAYAYAKU</strong> — Control de fermentación artesanal
            </p>
            <a href="https://hayayaku.com" class="btn btn-outline" style="font-size:.8rem;padding:6px 14px;">
              Conocer más →
            </a>
          </div>
        </div>

      </template>
    </main>

    <!-- ===== FOOTER ===== -->
    <footer class="footer">
      <div class="container footer-inner">
        <div>
          <a href="https://hayayaku.com" class="brand">
            <img src="/favicon-32x32.png" alt="HAYAYAKU logo" />
            HAYAYAKU
          </a>
          <p class="footer-tagline" style="margin-top:6px;">Control de fermentación artesanal.</p>
        </div>
        <div class="footer-right">
          <a href="https://hayayaku.com#features" class="footer-link">Características</a>
          <a href="https://webapp.hayayaku.com" class="footer-link" target="_blank" rel="noopener">App</a>
          <a href="mailto:info@hayayaku.com" class="footer-link">Contacto</a>
        </div>
      </div>
    </footer>
  </div>
</template>
