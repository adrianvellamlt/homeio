(function($) {
  "use strict"; // Start of use strict

  $(document).ready(() => {
    var sideBarState = localStorage.getItem("homeio-sidebar");
    if (sideBarState === undefined) localStorage.setItem("homeio-sidebar", "open");
    else if (sideBarState === "close") $("#sidebarToggle").click();

    var spinner = document.querySelector(".spinner");
    spinner.style.WebkitTransition = 'visibility .5s, opacity .5s';
    spinner.style.opacity = '0';
    spinner.style.display = 'none';
    setTimeout(() => {
      document.querySelector("#wrapper").style.display = "";
    }, 250);
  });
  // Toggle the side navigation
  $("#sidebarToggle, #sidebarToggleTop").on('click', function(e) {
    $("body").toggleClass("sidebar-toggled");
    $(".sidebar").toggleClass("toggled");
    if ($(".sidebar").hasClass("toggled")) {
      $('.sidebar .collapse').collapse('hide');
      localStorage.setItem("homeio-sidebar","close");
    }
    else localStorage.setItem("homeio-sidebar","open");
  });

  // Close any open menu accordions when window is resized below 768px
  $(window).resize(function() {
    if ($(window).width() < 768) {
      $('.sidebar .collapse').collapse('hide');
    };
  });

  // Prevent the content wrapper from scrolling when the fixed side navigation hovered over
  $('body.fixed-nav .sidebar').on('mousewheel DOMMouseScroll wheel', function(e) {
    if ($(window).width() > 768) {
      var e0 = e.originalEvent,
        delta = e0.wheelDelta || -e0.detail;
      this.scrollTop += (delta < 0 ? 1 : -1) * 30;
      e.preventDefault();
    }
  });

  // Scroll to top button appear
  $(document).on('scroll', function() {
    var scrollDistance = $(this).scrollTop();
    if (scrollDistance > 100) {
      $('.scroll-to-top').fadeIn();
    } else {
      $('.scroll-to-top').fadeOut();
    }
  });

  // Smooth scrolling using jQuery easing
  $(document).on('click', 'a.scroll-to-top', function(e) {
    var $anchor = $(this);
    $('html, body').stop().animate({
      scrollTop: ($($anchor.attr('href')).offset().top)
    }, 1000, 'easeInOutExpo');
    e.preventDefault();
  });

})(jQuery); // End of use strict
