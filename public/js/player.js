(function() {
  
// serializeJSON
(function(e){e.fn.serializeJSON=function(){var t={};jQuery.map(e(this).serializeArray(),function(e,n){t[e["name"]]=e["value"]});return t}})(jQuery)
;
  $(function() {
    var addPoints, animateTransition, clearPoints, filter_button, initMap, location, makeView, map, mapped_points, points, submitFields, svg, tmplResults, zoomScale;
    location = {};
    points = [];
    map = null;
    svg = d3.select('#map').append('svg');
    mapped_points = [];
    zoomScale = {
      '.01': 18,
      '.1': 17,
      '.5': 17,
      '1': 15,
      '10': 11,
      '100': 10
    };
    $('#map').css({
      position: 'fixed',
      height: $(window).height()
    });
    $(".tags").tagsInput();
    $("select").selectpicker({
      style: 'btn-primary',
      menuStyle: 'dropdown-inverse'
    });
    $.getJSON('/api/templates', function(tmpls) {
      var tmpl, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = tmpls.length; _i < _len; _i++) {
        tmpl = tmpls[_i];
        _results.push(ich.addTemplate(tmpl.name, tmpl.content));
      }
      return _results;
    });
    filter_button = Ladda.create($('#filter-me')[0]);
    $('#filter-me').on('click', function(e) {
      e.preventDefault();
      clearPoints();
      filter_button.start();
      return submitFields();
    });
    $('#play-all').on('click', function(e) {
      e.preventDefault();
      return $(mapped_points).each(function(i, el) {
        el.play();
        if (context) {
          return el.events.play();
        }
      });
    });
    submitFields = function() {
      var fields;
      fields = $('.what-do-you-want').serializeJSON();
      return navigator.geolocation.getCurrentPosition(function(pos) {
        location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        $.extend(fields, location);
        return $.get('/api/audiopts', fields, tmplResults);
      });
    };
    tmplResults = function(audiopts) {
      $('#point-listing').empty();
      points = audiopts;
      return $(audiopts).each(function(i, el) {
        return $('#point-listing').append(ich.apListing(el));
      }).promise().done(makeView);
    };
    makeView = function() {
      return initMap();
    };
    initMap = function() {
      var g, p, provider, selected, template, zoom;
      template = 'http://a.tiles.mapbox.com/v3/andtran.map-e74rfs90/{Z}/{X}/{Y}.png';
      provider = new MM.TemplatedLayer(template);
      map = new MM.Map('map', provider);
      map.disableHandler('MouseHandler');
      map.disableHandler('TouchHandler');
      map.disableHandler('MouseWheelHandler');
      map.disableHandler('DoubleClickHandler');
      map.disableHandler('DragHandler');
      selected = $('[name="radius"]').find('option:selected').val().toString();
      zoom = zoomScale[selected];
      map.setZoom(zoom).setCenter({
        lat: location.lat,
        lon: location.lng
      });
      $('#map').find('svg').wrap('<div/>').parent().css({
        zIndex: '10001',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        margin: 0,
        padding: 0,
        opacity: 0
      });
      p = map.locationPoint(new MM.Location(location.lat, location.lng));
      g = svg.append('g');
      g.attr('transform', "translate(" + p.x + "," + p.y + ")");
      g.append("circle").attr('style', 'fill:#000;fill-opacity:1').attr('r', 3);
      addPoints();
      $('#map div').css({
        opacity: 0
      });
      return setTimeout(animateTransition, 4000);
    };
    animateTransition = function() {
      $('.what-do-you-want').animate({
        marginTop: '350px'
      }, 1000, 'easeOutElastic', function() {}, $('#play-all').removeClass('hidden'), $('#map').css({
        'height': 0
      }).animate({
        'height': $(window).height(),
        'opacity': 1
      }, 500));
      $('#map div').css({
        opacity: 1
      });
      return filter_button.stop();
    };
    addPoints = function() {
      var ap, pt, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = points.length; _i < _len; _i++) {
        pt = points[_i];
        ap = new AudioPoint(pt, map, svg);
        _results.push(mapped_points.push(ap));
      }
      return _results;
    };
    return clearPoints = function() {
      return $(mapped_points).each(function(i, el) {
        el.clear();
        return mapped_points.splice(i, 1);
      });
    };
  });

}).call(this);
