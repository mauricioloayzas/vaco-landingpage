(function () {
  'use strict';

  // ---- config ----
  var IS_DEV = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  var API_BASE = IS_DEV
    ? 'https://hxuvakvhd5.execute-api.us-east-1.amazonaws.com'
    : 'https://byzufdr1si.execute-api.us-east-1.amazonaws.com';

  // Metadata de presentación local: iconos, clases CSS y etiquetas en español.
  // La API solo devuelve { value, label } (nombre del enum), sin esta info de UI.
  var TYPE_META = {
    'mead':          { label: 'Hidromiel',      icon: '🍯', cls: 'badge-mead'          },
    'fruit ferment': { label: 'Vino de Frutas', icon: '🍓', cls: 'badge-fruit-ferment'  },
    'sugarcane':     { label: 'Vino de Caña',   icon: '🌿', cls: 'badge-sugarcane'      },
  };

  var STATUS_META = {
    'begin':      { label: 'Iniciado',        cls: 'badge-begin'  },
    'in_process': { label: 'En Fermentación', cls: 'badge-active' },
    'active':     { label: 'En Fermentación', cls: 'badge-active' }, // alias legacy
    'finished':   { label: 'Finalizado',      cls: 'badge-done'   },
    'done':       { label: 'Finalizado',      cls: 'badge-done'   }, // alias legacy
    'failed':     { label: 'Fallido',         cls: 'badge-failed' },
  };

  // Traducciones al español para los subtypes (API usa claves en inglés).
  var SUBTYPE_ES = {
    'grape': 'Uva',      'strawberry': 'Fresa',   'apple':     'Manzana',
    'pear':  'Pera',     'pineapple':  'Piña',    'mango':     'Mango',
    'blackberry': 'Mora','peach':      'Durazno', 'banana':    'Banano',
    'honey': 'Miel',     'cane juice': 'Caña',
  };

  // Traducciones al español para yeast types (API: vinifera, panifera).
  var YEAST_TYPE_ES = {
    'vinifera': 'Vinífera',
    'panifera': 'Panadera',
  };

  // Mapas en tiempo de ejecución — poblados en fetchHelpers().
  var TYPE_LABELS   = {};
  var STATUS_LABELS = {};
  var FRUIT_LABELS  = {};
  var YEAST_LABELS  = {};

  // ---- URL parsing ----
  function getSlug() {
    var host = window.location.hostname;
    var parts = host.split('.');
    // profile1.hayayaku.com → ['profile1', 'hayayaku', 'com']
    if (parts.length >= 3 && parts[parts.length - 2] === 'hayayaku') {
      return parts[0];
    }
    // Fallback para desarrollo local: ?slug=profile1
    return new URLSearchParams(window.location.search).get('slug');
  }

  function getBatchId() {
    // /batches/{batchId}
    var match = window.location.pathname.match(/\/batches\/([^\/\?#]+)/);
    if (match) return match[1];
    // Fallback para desarrollo local: ?batch_id=xxx
    return new URLSearchParams(window.location.search).get('batch_id');
  }

  // ---- DOM helpers ----
  function el(id) { return document.getElementById(id); }

  function show(id) { el(id).classList.remove('hidden'); }

  function hide(id) { el(id).classList.add('hidden'); }

  function setText(id, text) {
    var e = el(id);
    if (e) e.textContent = text;
  }

  // ---- API ----
  async function fetchHelpers() {
    var endpoints = ['batch-types', 'batch-statuses', 'batch-subtypes', 'yeast-types'];
    try {
      var results = await Promise.all(
        endpoints.map(function (ep) {
          return fetch(API_BASE + '/public/helper/' + ep).then(function (r) { return r.json(); });
        })
      );

      results[0].data.forEach(function (item) {
        TYPE_LABELS[item.value] = TYPE_META[item.value]
          || { label: capitalize(item.label), icon: '🫗', cls: '' };
      });

      results[1].data.forEach(function (item) {
        STATUS_LABELS[item.value] = STATUS_META[item.value]
          || { label: capitalize(item.label), cls: '' };
      });

      results[2].data.forEach(function (item) {
        FRUIT_LABELS[item.value] = SUBTYPE_ES[item.value] || capitalize(item.label);
      });

      results[3].data.forEach(function (item) {
        YEAST_LABELS[item.value] = YEAST_TYPE_ES[item.value] || capitalize(item.label);
      });

    } catch (_) {
      // Si la API falla, usar metadata local como fallback completo.
      TYPE_LABELS   = TYPE_META;
      STATUS_LABELS = STATUS_META;
    }
  }

  async function fetchBatch(slug, batchId) {
    var url = API_BASE + '/public/profiles/' + encodeURIComponent(slug) + '/batches/' + encodeURIComponent(batchId);
    var res = await fetch(url);
    if (!res.ok) {
      var err = {};
      try { err = await res.json(); } catch (_) {}
      throw new Error(err.error || ('Error ' + res.status));
    }
    var json = await res.json();
    return json.data;
  }

  // ---- formatters ----
  function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  function formatDateTime(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  }

  function formatDateShort(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return (d.getMonth() + 1).toString().padStart(2, '0') + '/' + d.getDate().toString().padStart(2, '0');
  }

  function fmt(val, suffix) {
    if (val == null) return '—';
    return val + (suffix || '');
  }

  function capitalize(str) {
    if (!str) return '—';
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
  }

  // ---- renderers ----
  function renderHeader(batch) {
    var typeInfo   = TYPE_LABELS[batch.type]   || { label: batch.type,   icon: '🫗', cls: '' };
    var statusInfo = STATUS_LABELS[batch.status] || { label: batch.status, cls: '' };

    document.title = batch.name + ' — HAYAYAKU';

    var typeBadge = el('badge-type');
    typeBadge.textContent = typeInfo.icon + ' ' + typeInfo.label;
    typeBadge.className = 'badge ' + typeInfo.cls;

    var statusBadge = el('badge-status');
    statusBadge.textContent = statusInfo.label;
    statusBadge.className = 'badge ' + statusInfo.cls;

    setText('batch-name', batch.name);
    setText('batch-code', batch.code);
    setText('batch-date', formatDate(batch.created_at));
  }

  function renderMetrics(batch, detail) {
    var metrics = [];

    if (detail) {
      if (detail.total_must_liters != null)
        metrics.push({ icon: '🫗', value: detail.total_must_liters + ' L',  label: 'Volumen Total' });
      if (detail.abv_estimated != null)
        metrics.push({ icon: '🍷', value: detail.abv_estimated + '%',        label: 'ABV Estimado' });

      var initialBrix = detail.initial_brix != null ? detail.initial_brix : detail.sugarcane_brix;
      if (initialBrix != null)
        metrics.push({ icon: '🔬', value: initialBrix + '°',                 label: 'Brix Inicial' });

      if (detail.final_brix_desired != null)
        metrics.push({ icon: '🎯', value: detail.final_brix_desired + '°',   label: 'Brix Objetivo' });
    }

    // Si no hay detail, al menos mostramos la fecha
    if (metrics.length === 0) {
      metrics.push({ icon: '📅', value: formatDate(batch.created_at), label: 'Creado' });
    }

    el('metrics-grid').innerHTML = metrics.map(function (m) {
      return '<div class="metric-card">'
        + '<span class="metric-icon">' + m.icon + '</span>'
        + '<span class="metric-value">' + m.value + '</span>'
        + '<span class="metric-label">' + m.label + '</span>'
        + '</div>';
    }).join('');
  }

  function buildRecipeItems(type, d) {
    var items = [];

    if (type === 'mead') {
      if (d.honey_kg != null)     items.push({ label: 'Miel',          value: d.honey_kg + ' kg' });
      if (d.honey_brix != null)   items.push({ label: 'Brix de miel',  value: d.honey_brix + '°' });
      if (d.water_liters != null) items.push({ label: 'Agua',          value: d.water_liters + ' L' });
      if (d.total_must_liters != null) items.push({ label: 'Mosto total', value: d.total_must_liters + ' L' });
      if (d.final_brix_desired != null) items.push({ label: 'Brix objetivo', value: d.final_brix_desired + '°' });
      if (d.abv_estimated != null) items.push({ label: 'ABV estimado', value: d.abv_estimated + '%' });
    }

    if (type === 'fruit ferment') {
      var fruitName = FRUIT_LABELS[d.fruit_type] || capitalize(d.fruit_type);
      items.push({ label: 'Fruta',          value: fruitName });
      if (d.fruit_kg != null)    items.push({ label: 'Peso de fruta',  value: d.fruit_kg + ' kg' });
      if (d.fruit_brix != null)  items.push({ label: 'Brix de fruta',  value: d.fruit_brix + '°' });
      if (d.water_liters != null) items.push({ label: 'Agua',          value: d.water_liters + ' L' });
      if (d.total_must_liters != null) items.push({ label: 'Mosto total', value: d.total_must_liters + ' L' });
      if (d.sweetener_type)      items.push({ label: 'Edulcorante',    value: capitalize(d.sweetener_type) });
      if (d.abv_estimated != null) items.push({ label: 'ABV estimado', value: d.abv_estimated + '%' });
    }

    if (type === 'sugarcane') {
      if (d.juice_liters != null)   items.push({ label: 'Jugo de caña',  value: d.juice_liters + ' L' });
      if (d.sugarcane_brix != null) items.push({ label: 'Brix del jugo', value: d.sugarcane_brix + '°' });
      if (d.water_liters != null)   items.push({ label: 'Agua',          value: d.water_liters + ' L' });
      if (d.total_must_liters != null) items.push({ label: 'Mosto total', value: d.total_must_liters + ' L' });
      if (d.final_brix_desired != null) items.push({ label: 'Brix objetivo', value: d.final_brix_desired + '°' });
      if (d.abv_estimated != null)  items.push({ label: 'ABV estimado', value: d.abv_estimated + '%' });
    }

    // Levadura (común)
    if (d.yeast_type) {
      var yeastLabel = (YEAST_LABELS[d.yeast_type] || capitalize(d.yeast_type));
      if (d.yeast_strain) yeastLabel += ' · ' + d.yeast_strain;
      items.push({ label: 'Levadura', value: yeastLabel });
    }

    return items;
  }

  function renderRecipe(batch, detail) {
    if (!detail) {
      hide('recipe-section');
      return;
    }

    var typeInfo = TYPE_LABELS[batch.type] || { label: 'Receta' };
    el('recipe-title').childNodes[0].textContent = 'Receta · ' + typeInfo.label + ' ';

    var items = buildRecipeItems(batch.type, detail);
    el('recipe-grid').innerHTML = items.map(function (item) {
      return '<div class="recipe-card">'
        + '<span class="recipe-label">' + item.label + '</span>'
        + '<span class="recipe-value">' + item.value + '</span>'
        + '</div>';
    }).join('');

    // Estabilizadores / clarificantes
    var additives = [];
    if (detail.use_sorbate)       additives.push('Sorbato');
    if (detail.use_benzoate)      additives.push('Benzoato');
    if (detail.use_metabisulfite) additives.push('Metabisulfito' + (detail.metabisulfite_type ? ' (' + detail.metabisulfite_type + ')' : ''));
    if (detail.use_bentonite)     additives.push('Bentonita');
    if (detail.use_albumin)       additives.push('Albúmina');

    if (additives.length > 0) {
      el('additives-list').innerHTML = additives.map(function (a) {
        return '<span class="additive-pill">' + a + '</span>';
      }).join('');
      show('additives-block');
    }
  }

  function renderLogs(logs) {
    if (!logs || logs.length === 0) {
      show('logs-empty');
      hide('logs-content');
      return;
    }

    show('logs-content');

    var sorted = logs.slice().sort(function (a, b) {
      return new Date(a.recorded_at) - new Date(b.recorded_at);
    });

    // Tabla
    el('log-tbody').innerHTML = sorted.map(function (log) {
      return '<tr>'
        + '<td>' + formatDateTime(log.recorded_at) + '</td>'
        + '<td class="value">' + fmt(log.brix, '°') + '</td>'
        + '<td class="value">' + fmt(log.density) + '</td>'
        + '<td class="value">' + fmt(log.temperature, ' °C') + '</td>'
        + '</tr>';
    }).join('');

    // Gráfico
    renderChart(sorted);
  }

  function renderChart(logs) {
    var labels    = logs.map(function (l) { return formatDateShort(l.recorded_at); });
    var brixData  = logs.map(function (l) { return l.brix; });
    var tempData  = logs.map(function (l) { return l.temperature; });
    var densData  = logs.map(function (l) { return l.density; });

    var hasBrix = brixData.some(function (v) { return v != null; });
    var hasTemp = tempData.some(function (v) { return v != null; });
    var hasDens = densData.some(function (v) { return v != null; });

    var datasets = [];

    if (hasBrix) {
      datasets.push({
        label: 'Brix (°)',
        data: brixData,
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245,158,11,0.12)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: 'y',
      });
    }

    if (hasTemp) {
      datasets.push({
        label: 'Temperatura (°C)',
        data: tempData,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59,130,246,0)',
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderDash: [6, 3],
        yAxisID: 'y1',
      });
    }

    if (hasDens && !hasBrix) {
      // Mostrar densidad solo si no hay Brix (evitar 3 ejes)
      datasets.push({
        label: 'Densidad',
        data: densData,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16,185,129,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: 'y',
      });
    }

    var ctx = el('fermentation-chart').getContext('2d');

    new Chart(ctx, {
      type: 'line',
      data: { labels: labels, datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { family: 'Inter', size: 12 }, usePointStyle: true },
          },
          tooltip: {
            backgroundColor: '#111827',
            titleFont: { family: 'Inter', size: 12 },
            bodyFont: { family: 'Inter', size: 12 },
            padding: 10,
            cornerRadius: 8,
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { font: { family: 'Inter', size: 11 } },
          },
          y: {
            type: 'linear',
            display: hasBrix || (hasDens && !hasBrix),
            position: 'left',
            title: {
              display: true,
              text: hasBrix ? 'Brix (°)' : 'Densidad',
              font: { family: 'Inter', size: 11 },
              color: '#6B7280',
            },
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { font: { family: 'Inter', size: 11 } },
          },
          y1: {
            type: 'linear',
            display: hasTemp,
            position: 'right',
            title: {
              display: true,
              text: 'Temperatura (°C)',
              font: { family: 'Inter', size: 11 },
              color: '#6B7280',
            },
            grid: { drawOnChartArea: false },
            ticks: { font: { family: 'Inter', size: 11 } },
          },
        },
      },
    });
  }

  function showError(message) {
    hide('state-loading');
    setText('error-message', message);
    show('state-error');
  }

  // ---- init ----
  async function init() {
    var slug    = getSlug();
    var batchId = getBatchId();

    if (!slug || !batchId) {
      showError('URL inválida. No se encontró el perfil o el lote en la dirección.');
      return;
    }

    try {
      var results = await Promise.all([fetchHelpers(), fetchBatch(slug, batchId)]);
      var data = results[1];
      var batch            = data.batch;
      var batchDetail      = data.batch_detail;
      var fermentationLogs = data.fermentation_logs;

      renderHeader(batch);
      renderMetrics(batch, batchDetail);
      renderRecipe(batch, batchDetail);
      renderLogs(fermentationLogs);

      hide('state-loading');
      show('state-content');

    } catch (e) {
      var msg = e.message;
      if (msg === 'Batch not found')   msg = 'El lote no existe o no está disponible públicamente.';
      if (msg === 'Profile not found') msg = 'El perfil no existe.';
      showError(msg);
    }
  }

  document.addEventListener('DOMContentLoaded', init);

})();
