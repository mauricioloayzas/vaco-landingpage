<script setup lang="ts">
useHead({
  title: 'HAYAYAKU — Control de Fermentación Artesanal',
  meta: [
    {
      name: 'description',
      content:
        'HAYAYAKU es el sistema de control de procesos para la elaboración de productos alcohólicos artesanales obtenidos por fermentación. Hidromiel, vino de caña y mucho más.',
    },
  ],
})

let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible')
      })
    },
    { threshold: 0.1 },
  )
  document.querySelectorAll('.animate-on-scroll').forEach((el) => observer!.observe(el))
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
  <div>
    <LandingNavbar />
    <LandingHero />
    <LandingEtymology />
    <LandingFeatures />
    <LandingProducts />
    <LandingTech />
    <LandingCta />
    <LandingFooter />
  </div>
</template>
