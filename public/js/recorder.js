(function() {
  $(function() {
    var finder_button, getAndDisplayLocation, record_button, update_map, validator;
    $(".tags").tagsInput();
    validator = {
      located: false,
      sounded: false,
      titled: false,
      validate: function(which, maybe) {
        this[which] = maybe;
        return this.check();
      },
      check: function() {
        if (this.located && this.sounded && this.titled) {
          return $('#upload-me').removeAttr('disabled');
        } else {
          return $('#upload-me').attr('disabled', 'disabled');
        }
      }
    };
    finder_button = Ladda.create($('#find-me button')[0]);
    $('#find-me button').on('click', function(e) {
      return setTimeout(getAndDisplayLocation, 500);
    });
    getAndDisplayLocation = function() {
      finder_button.start();
      return navigator.geolocation.getCurrentPosition(update_map);
    };
    update_map = function(pos) {
      var loc, map, marker;
      $('#gmap').removeClass('hidden');
      $('.lat').attr('value', pos.coords.latitude);
      $('.lng').attr('value', pos.coords.longitude);
      loc = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
      map = new google.maps.Map(document.getElementById("gmap"), {
        center: loc,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true
      });
      marker = new google.maps.Marker({
        position: loc,
        map: map
      });
      finder_button.stop();
      $('#find-me h3 span').addClass('active');
      return validator.validate('located', true);
    };
    record_button = Ladda.create($('#record-me button')[0]);
    $('.video-upload').on('change', function(e) {
      $('#record-me h3 span').addClass('active');
      return validator.validate('sounded', true);
    });
    return $('.name').on('keyup', function(e) {
      if ($(this).val().length > 0) {
        $('#metadata h3 span').addClass('active');
        return validator.validate('titled', true);
      } else {
        $('#metadata h3 span').removeClass('active');
        return validator.validate('titled', false);
      }
    });
  });

}).call(this);
