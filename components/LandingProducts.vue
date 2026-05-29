<template>
  <section class="section section-alt" id="products">
    <div class="container">
      <div class="section-header">
        <span class="section-tag">Fermentos</span>
        <h2 class="section-title">Hecho para tus elaboraciones</h2>
        <p class="section-subtitle">
          Tres tipos de fermento disponibles hoy, con soporte para muchas más bebidas en camino.
        </p>
      </div>
      <div class="products-grid">

        <div class="product-card product-active animate-on-scroll">
          <div class="product-badge badge-available">Disponible</div>
          <div class="product-icon">🍯</div>
          <h3 class="product-name">Hidromiel</h3>
          <p class="product-desc">
            La bebida de los dioses. Calcula automáticamente la proporción de miel y agua,
            levaduras, nutrientes y sigue la fermentación hasta el clarificado final.
          </p>
          <ul class="product-features">
            <li>Cálculo automático de ingredientes</li>
            <li>Control de Brix, densidad y temperatura</li>
            <li>Seguimiento de etapas y aditivos</li>
          </ul>
        </div>

        <div class="product-card product-active animate-on-scroll delay-1">
          <div class="product-badge badge-available">Disponible</div>
          <div class="product-icon">🌿</div>
          <h3 class="product-name">Vino de Caña</h3>
          <p class="product-desc">
            El sabor de la tierra. Documenta el proceso de fermentación del jugo de caña,
            desde el prensado hasta el producto terminado listo para disfrutar.
          </p>
          <ul class="product-features">
            <li>Control de Brix y pH</li>
            <li>Registro de levaduras y nutrientes</li>
            <li>Historial de clarificación</li>
          </ul>
        </div>

        <div class="product-card product-active animate-on-scroll delay-2">
          <div class="product-badge badge-available">Disponible</div>
          <div class="product-icon">🍓</div>
          <h3 class="product-name">Vino de Frutas</h3>
          <p class="product-desc">
            De la fresa a la uva, de la piña a la manzana. Más de 10 frutas soportadas
            con cálculos específicos según el Brix de cada variedad.
          </p>
          <ul class="product-features">
            <li>Uva, fresa, manzana, naranja, piña y más</li>
            <li>Edulcorantes opcionales configurables</li>
            <li>ABV y Brix final estimados automáticamente</li>
          </ul>
        </div>

        <div class="product-card product-coming animate-on-scroll delay-3">
          <div class="product-badge badge-soon">Próximamente</div>
          <div class="product-icon">🍺</div>
          <h3 class="product-name">Y mucho más...</h3>
          <p class="product-desc">
            Estamos trabajando en soporte para cerveza artesanal, kombucha,
            tepache, chicha y cualquier fermento que puedas imaginar.
          </p>
          <ul class="product-features">
            <li>Cerveza artesanal</li>
            <li>Kombucha y tepache</li>
            <li>Chicha y otros fermentos</li>
          </ul>
        </div>

      </div>
    </div>
  </section>
</template>
