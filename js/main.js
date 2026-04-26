$(function () {

  /* ---- navbar scroll effect ---- */
  var $navbar = $('#navbar');
  $(window).on('scroll', function () {
    if ($(this).scrollTop() > 20) {
      $navbar.addClass('scrolled');
    } else {
      $navbar.removeClass('scrolled');
    }
  });

  /* ---- mobile menu toggle ---- */
  $('#navToggle').on('click', function () {
    $(this).toggleClass('open');
    $('#navMobile').toggleClass('open');
  });

  /* close mobile menu when a link is clicked */
  $('#navMobile .nav-mobile-link').on('click', function () {
    $('#navToggle').removeClass('open');
    $('#navMobile').removeClass('open');
  });

  /* ---- smooth scroll for anchor links ---- */
  $('a[href^="#"]').on('click', function (e) {
    var target = $(this).attr('href');
    if (target === '#') return;
    var $target = $(target);
    if ($target.length) {
      e.preventDefault();
      var offset = $target.offset().top - 68;
      $('html, body').animate({ scrollTop: offset }, 500, 'swing');
    }
  });

  /* ---- intersection observer — scroll animations ---- */
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          $(entry.target).addClass('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    $('.animate-on-scroll').each(function () {
      observer.observe(this);
    });
  } else {
    /* fallback for old browsers */
    $('.animate-on-scroll').addClass('visible');
  }

  /* ---- active nav link highlight on scroll ---- */
  var sections = ['#features', '#products', '#tech', '#cta'];
  $(window).on('scroll.spy', function () {
    var scrollPos = $(this).scrollTop() + 80;
    sections.forEach(function (id) {
      var $sec = $(id);
      if (!$sec.length) return;
      var top    = $sec.offset().top;
      var bottom = top + $sec.outerHeight();
      var $link  = $('.nav-link[href="' + id + '"]');
      if (scrollPos >= top && scrollPos < bottom) {
        $link.css({ color: 'var(--amber-700)', background: 'var(--amber-50)' });
      } else {
        $link.css({ color: '', background: '' });
      }
    });
  });

});
