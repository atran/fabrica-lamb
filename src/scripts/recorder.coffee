$ ->
  ## Init tags
  $(".tags").tagsInput()
  # Mini-validator
  validator =
    located: false
    sounded: false
    titled : false
    validate: (which, maybe) ->
      this[which] = maybe
      this.check()
    check: ->
      if (this.located && this.sounded && this.titled)
        $('#upload-me').removeAttr 'disabled'
      else
        $('#upload-me').attr 'disabled', 'disabled'


  ## Geolocator
  finder_button = Ladda.create( $('#find-me button')[0] )

  $('#find-me button').on 'click', (e) ->
    setTimeout getAndDisplayLocation, 500


  getAndDisplayLocation = ->
    finder_button.start()
    navigator.geolocation.getCurrentPosition(update_map)

  update_map = (pos) ->
    $('#gmap').removeClass 'hidden'

    $('.lat').attr 'value', pos.coords.latitude #45.737366
    $('.lng').attr 'value', pos.coords.longitude #12.266482

    loc = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
    #loc = new google.maps.LatLng(45.737366, 12.266482)
    map = new google.maps.Map(
      document.getElementById("gmap"),
      (
        center: loc
        zoom: 16
        mapTypeId: google.maps.MapTypeId.ROADMAP
        disableDefaultUI: true
      )
    )

    # TODO: implement flat marker dot
    marker = new google.maps.Marker({
      position: loc,
      map: map
    })
    
    finder_button.stop()
    $('#find-me h3 span').addClass 'active'
    validator.validate 'located', true
    
  ## Audio recorder
  record_button = Ladda.create( $('#record-me button')[0] )

  $('.video-upload').on 'change', (e) ->
    $('#record-me h3 span').addClass 'active'
    validator.validate 'sounded', true

  ## Metadata
  $('.name').on 'keyup', (e) ->
    if ( $(this).val().length > 0 )
      $('#metadata h3 span').addClass 'active'
      validator.validate 'titled', true
    else
      $('#metadata h3 span').removeClass 'active'
      validator.validate 'titled', false
