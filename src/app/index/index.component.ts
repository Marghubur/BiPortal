import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {

  slides = ['assets/img/technologies/csharp.png', 'assets/img/technologies/java.png', 'assets/img/technologies/javascript.png',
            'assets/img/technologies/cpp.png', 'assets/img/technologies/angular.png', 'assets/img/technologies/react.png',
            'assets/img/technologies/html.png']

  constructor() { }

  ngOnInit(): void {
  }

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    navSpeed: 300,
    navText: ['', ''],
    responsive: {
      0: {
        items: 3
      },
      400: {
        items: 4
      },
      740: {
        items: 5
      },
      940: {
        items: 6
      }
    },
    nav: false
  }

  headerChange() {
    window.onscroll = function() {myFunction()};

    var navbar = document.getElementById("header")!;
    var sticky = navbar.offsetTop;

    function myFunction() {
      if (window.pageYOffset >= 50) {
        navbar.classList.add("header-scrolled")
      } else {
        navbar.classList.remove("header-scrolled");
      }
    };
  }

  fn () {
        // Back to top button
    $(window).scroll((e: any) => {
      // @ts-ignore
      if ($(e).scrollTop() > 100) {
        $('.back-to-top').fadeIn('slow');
      } else {
        $('.back-to-top').fadeOut('slow');
      }
    });

    $('.back-to-top').click(function(){
      $('html, body').animate({scrollTop : 0},1500, 'easeInOutExpo');
      return false;
    });

    // Initiate the wowjs animation library
     // new WOW().init();

    // Initiate superfish on nav menu
    // @ts-ignore
    $('.nav-menu').superfish({
      animation: {
        opacity: 'show'
      },
      speed: 400
    });

    // Mobile Navigation
    if ($('#nav-menu-container').length) {
      var $mobile_nav = $('#nav-menu-container').clone().prop({
        id: 'mobile-nav'
      });
      $mobile_nav.find('> ul').attr({
        'class': '',
        'id': ''
      });
      $('body').append($mobile_nav);
      $('body').prepend('<button type="button" id="mobile-nav-toggle"><i class="fa fa-bars"></i></button>');
      $('body').append('<div id="mobile-body-overly"></div>');
      $('#mobile-nav').find('.menu-has-children').prepend('<i class="fa fa-chevron-down"></i>');

      $(document).on('click', '.menu-has-children i',(e: any) => {
        $(e).next().toggleClass('menu-item-active');
        $(e).nextAll('ul').eq(0).slideToggle();
        $(e).toggleClass("fa-chevron-up fa-chevron-down");
      });

      $(document).on('click', '#mobile-nav-toggle', (e: any) => {
        $('body').toggleClass('mobile-nav-active');
        $('#mobile-nav-toggle i').toggleClass('fa-times fa-bars');
        $('#mobile-body-overly').toggle();
      });

      $(document).click((e: any) => {
        var container = $("#mobile-nav, #mobile-nav-toggle");
        if (!container.is(e.target) && container.has(e.target).length === 0) {
          if ($('body').hasClass('mobile-nav-active')) {
            $('body').removeClass('mobile-nav-active');
            $('#mobile-nav-toggle i').toggleClass('fa-times fa-bars');
            $('#mobile-body-overly').fadeOut();
          }
        }
      });
    } else if ($("#mobile-nav, #mobile-nav-toggle").length) {
      $("#mobile-nav, #mobile-nav-toggle").hide();
    }

    // Smooth scroll for the menu and links with .scrollto classes
    // @ts-ignore
    $('.nav-menu a, #mobile-nav a, .scrollto').on('click', (e: any) => {
      if (location.pathname.replace(/^\//, '') == e.pathname.replace(/^\//, '') && location.hostname == e.hostname) {
        var target = $(e.hash);
        if (target.length) {
          var top_space = 0;

          if ($('#header').length) {
            // @ts-ignore
            top_space = $('#header').outerHeight();

            if( ! $('#header').hasClass('header-fixed') ) {
              top_space = top_space - 20;
            }
          }

          $('html, body').animate({
            // @ts-ignore
            scrollTop: target.offset().top - top_space
          }, 1500, 'easeInOutExpo');

          if ($(e).parents('.nav-menu').length) {
            $('.nav-menu .menu-active').removeClass('menu-active');
            $(e).closest('li').addClass('menu-active');
          }

          if ($('body').hasClass('mobile-nav-active')) {
            $('body').removeClass('mobile-nav-active');
            $('#mobile-nav-toggle i').toggleClass('fa-times fa-bars');
            $('#mobile-body-overly').fadeOut();
          }
          return false;
        }
      }
    });

    // Header scroll class
    // $(window).scroll((e: any) => {
    //   // @ts-ignore
    //   if ($(e).scrollTop() > 100) {
    //     $('#header').addClass('header-scrolled');
    //   } else {
    //     $('#header').removeClass('header-scrolled');
    //   }
    // });

    // Intro carousel
    var introCarousel = $(".carousel");
    var introCarouselIndicators = $(".carousel-indicators");
    introCarousel.find(".carousel-inner").children(".carousel-item").each((index: any) => {
      (index === 0) ?
      introCarouselIndicators.append("<li data-target='#introCarousel' data-slide-to='" + index + "' class='active'></li>") :
      introCarouselIndicators.append("<li data-target='#introCarousel' data-slide-to='" + index + "'></li>");
    });

    // @ts-ignore
    $(".carousel").swipe({
      swipe: function(event: any, direction: any, distance: any, duration: any, fingerCount: any, fingerData: any) {
      // @ts-ignore
        if (direction == 'left') $(this).carousel('next');
      // @ts-ignore
        if (direction == 'right') $(this).carousel('prev');
      },
      allowPageScroll:"vertical"
    });

    // Skills section
    // @ts-ignore
    $('#skills').waypoint((e: any) => {
      $('.progress .progress-bar').each(function() {
        $(e).css("width", $(e).attr("aria-valuenow") + '%');
      });
    }, { offset: '80%'} );

    // jQuery counterUp (used in Facts section)
    // @ts-ignore
    $('[data-toggle="counter-up"]').counterUp({
      delay: 10,
      time: 1000
    });

    // Porfolio isotope and filter
    // @ts-ignore
    var portfolioIsotope = $('.portfolio-container').isotope({
      itemSelector: '.portfolio-item',
      layoutMode: 'fitRows'
    });

    $('#portfolio-flters li').on( 'click', (e: any) => {
      $("#portfolio-flters li").removeClass('filter-active');
      $(e).addClass('filter-active');

      portfolioIsotope.isotope({ filter: $(e).data('filter') });
    });

    // Clients carousel (uses the Owl Carousel library)
    // @ts-ignore
    $(".clients-carousel").owlCarousel({
      autoplay: true,
      dots: true,
      loop: true,
      responsive: { 0: { items: 2 }, 768: { items: 4 }, 900: { items: 6 }
      }
    });

    // Testimonials carousel (uses the Owl Carousel library)
    // @ts-ignore
    $(".testimonials-carousel").owlCarousel({
      autoplay: true,
      dots: true,
      loop: true,
      items: 1
    });

  };

}
