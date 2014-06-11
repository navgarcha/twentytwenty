/**
 * A fork of Zurb's twentytwenty image comparison plugin
 * 
 * jquery.twentytwenty.js
 * Original: https://github.com/zurb/twentytwenty/
 *
 * Modified by: Miguel Villanueva
 * - Added click events to show full 'Before' and 'After' images
 */
(function($){

  $.fn.twentytwenty = function(options) {
    var options = $.extend({default_offset_pct: 0.5, orientation: 'horizontal'}, options);
    return this.each(function() {

      var sliderPct = options.default_offset_pct;
      var container = $(this);
      var sliderOrientation = options.orientation;
      var beforeDirection = (sliderOrientation === 'vertical') ? 'down' : 'left';
      var afterDirection = (sliderOrientation === 'vertical') ? 'up' : 'right';
      var afterCls = 'twentytwenty-isafter';
      var beforeCls = 'twentytwenty-isbefore';
      
      
      container.wrap("<div class='twentytwenty-wrapper twentytwenty-" + sliderOrientation + "'></div>");
      container.append("<div class='twentytwenty-overlay'></div>");
      var beforeImg = container.find("img:first");
      var afterImg = container.find("img:last");
      container.append("<div class='twentytwenty-handle'></div>");
      var slider = container.find(".twentytwenty-handle");
      slider.append("<span class='twentytwenty-" + beforeDirection + "-arrow'></span>");
      slider.append("<span class='twentytwenty-" + afterDirection + "-arrow'></span>");
      container.addClass("twentytwenty-container");
      beforeImg.addClass("twentytwenty-before");
      afterImg.addClass("twentytwenty-after");
      
      var overlay = container.find(".twentytwenty-overlay");
      overlay.append("<div class='twentytwenty-before-label'></div>");
      overlay.append("<div class='twentytwenty-after-label'></div>");

      var calcOffset = function(dimensionPct) {
        var w = beforeImg.width();
        var h = beforeImg.height();
        return {
          w: w+"px",
          h: h+"px",
          cw: (dimensionPct*w)+"px",
          ch: (dimensionPct*h)+"px"
        };
      };

      /**
       * Calculate the click position within the target element
       */
      var calcClickOffset = function(e) {
        var xpos,
            ypos;

        if (e.offsetX === undefined) {
          xpos = e.pageX-$(e.target).offset().left;
          ypos = e.pageY-$(e.target).offset().top;
        } else {
          xpos = e.offsetX;
          ypos = e.offsetY;
        }

        return (sliderOrientation === "vertical") ? ypos : xpos;
      }

      /**
       * Return -1 if "Before", 1 in "After" and 0 if neither
       */
      var calcMousePos = function(e) {
        var el = $(e.target),
            pos = calcClickOffset(e),
            len = (sliderOrientation === "vertical") ? el.height() : el.width(),
            pct = 0.35; // hit percentage area

        if (pos < len * pct) { return -1; }
        else if (len - (len * pct) < pos) { return 1; }
        else { return 0; }
      }

      /**
       * Handles a click event on the overlay
       */
      var handleOverlayClick = function(e) {
        var mouse = calcMousePos(e);

        if (mouse === -1 && !imageIsBefore()) {
          showFullImage(true);
        } else if (mouse === 1 && !imageIsAfter()) {
          showFullImage(false);
        }
      }

      /**
       * Helper functions for the before/after labels
       */
      var removeOverlayCSS = function() {
        return overlay.removeClass(beforeCls + ' ' + afterCls);
      }

      var replaceOverlayCSS = function(before) {
        return removeOverlayCSS().addClass(before ? beforeCls : afterCls);
      }

      var imageIsBefore = function() {
        return overlay.hasClass(beforeCls);
      }

      var imageIsAfter = function() {
        return overlay.hasClass(afterCls);
      }

      var updateBeforeAfter = function(pct) {
        // adjust the before/after button styling
        // pct == 1; before == true
        
        if (pct === 0) { replaceOverlayCSS(false); }
        else if (pct === 1) { replaceOverlayCSS(true); }
        else { removeOverlayCSS(); }
      }

      /***
       * Shows either the entire before or after image
       */
      var showFullImage = function(before) {
        var pct = before ? 1 : 0,
            offset = calcOffset(pct);
        slider.animate(calcSliderCSS(offset));
        beforeImg.animate({"clip": calcClipCSS(offset)});
        updateBeforeAfter(pct);
      }

      var calcSliderCSS = function(offset) {
        var val = (sliderOrientation==="vertical") ? offset.ch : offset.cw;
        return (sliderOrientation==="vertical") ? { "top" : val } : { "left" : val };
      }

      var calcClipCSS = function(offset) {
        if (sliderOrientation === 'vertical') {
          return "rect(0px "+offset.w+" "+offset.ch+" 0px)";
        } else {
          return "rect(0px "+offset.cw+" "+offset.h+" 0px)";
        }
      }

      var adjustContainer = function(offset) {
        beforeImg.css("clip", calcClipCSS(offset));
        container.css("height", offset.h);
      };

      var adjustSlider = function(pct) {
        var offset = calcOffset(pct);
        slider.css(calcSliderCSS(offset));
        adjustContainer(offset);
        updateBeforeAfter(pct);
      }

      $(window).on("resize.twentytwenty", function(e) {
        adjustSlider(sliderPct);
      });

      var offsetX = 0;
      var imgWidth = 0;
      
      slider.on("movestart", function(e) {
        if (((e.distX > e.distY && e.distX < -e.distY) || (e.distX < e.distY && e.distX > -e.distY)) && sliderOrientation !== 'vertical') {
          e.preventDefault();
        }
        else if (((e.distX < e.distY && e.distX < -e.distY) || (e.distX > e.distY && e.distX > -e.distY)) && sliderOrientation === 'vertical') {
          e.preventDefault();
        }
        container.addClass("active");
        offsetX = container.offset().left;
        offsetY = container.offset().top;
        imgWidth = beforeImg.width(); 
        imgHeight = beforeImg.height();          
      });

      slider.on("moveend", function(e) {
        container.removeClass("active");
      });

      slider.on("move", function(e) {
        if (container.hasClass("active")) {
          sliderPct = (sliderOrientation === 'vertical') ? (e.pageY-offsetY)/imgHeight : (e.pageX-offsetX)/imgWidth;
          if (sliderPct < 0) {
            sliderPct = 0;
          }
          if (sliderPct > 1) {
            sliderPct = 1;
          }
          adjustSlider(sliderPct);
        }
      });

      overlay.on("click", handleOverlayClick);

      container.find("img").on("mousedown", function(event) {
        event.preventDefault();
      });

      $(window).trigger("resize.twentytwenty");
    });
  };

})(jQuery);
