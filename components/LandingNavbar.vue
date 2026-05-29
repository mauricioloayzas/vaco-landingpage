<script setup lang="ts">
const isScrolled = ref(false)
const isOpen = ref(false)

let removeScroll: (() => void) | null = null

onMounted(() => {
  const handler = () => { isScrolled.value = window.scrollY > 20 }
  window.addEventListener('scroll', handler, { passive: true })
  removeScroll = () => window.removeEventListener('scroll', handler)
})

onUnmounted(() => removeScroll?.())

const close = () => { isOpen.value = false }
</script>

<template>
  <nav class="navbar" :class="{ scrolled: isScrolled }" id="navbar">
    <div class="container nav-inner">
      <a href="#" class="brand">
        <span class="brand-icon">
          <img src="/favicon-32x32.png" alt="HAYAYAKU logo" />
        </span>
        <span class="brand-name">HAYAYAKU</span>
      </a>
      <div class="nav-links">
        <a href="#features" class="nav-link">Características</a>
        <a href="#products" class="nav-link">Fermentos</a>
        <a href="#tech" class="nav-link">Tecnología</a>
        <a href="https://webapp.hayayaku.com" class="btn btn-primary nav-cta" target="_blank" rel="noopener">
          Ir a la App
        </a>
      </div>
      <button class="nav-toggle" :class="{ open: isOpen }" @click="isOpen = !isOpen" aria-label="Menú">
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="nav-mobile" :class="{ open: isOpen }">
      <a href="#features" class="nav-mobile-link" @click="close">Características</a>
      <a href="#products" class="nav-mobile-link" @click="close">Fermentos</a>
      <a href="#tech" class="nav-mobile-link" @click="close">Tecnología</a>
      <a href="https://webapp.hayayaku.com" class="btn btn-primary w-full" target="_blank" rel="noopener">
        Ir a la App
      </a>
    </div>
  </nav>
</template>
