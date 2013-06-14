`
// serializeJSON
(function(e){e.fn.serializeJSON=function(){var t={};jQuery.map(e(this).serializeArray(),function(e,n){t[e["name"]]=e["value"]});return t}})(jQuery)
`

$ ->
  # Globals
  location = {}
  points = []
  map = null
  svg = d3.select('#map').append('svg')
  mapped_points = []

  zoomScale =
    '.01' : 18
    '.1'  : 17
    '.5'  : 17
    '1'   : 15
    '10'  : 11
    '100' : 10

  # Init map
  $('#map').css(
    position: 'fixed'
    height: $(window).height()
  )

  # Init tags & select style
  $(".tags").tagsInput()
  $("select").selectpicker(
    style: 'btn-primary'
    menuStyle: 'dropdown-inverse'
  )

  # Init templates
  $.getJSON '/api/templates', (tmpls) ->
    for tmpl in tmpls
      ich.addTemplate(tmpl.name, tmpl.content)

  # Init context
  
  # Init Loader button
  filter_button = Ladda.create( $('#filter-me')[0] )

  # Filter event
  $('#filter-me').on 'click', (e) ->
    e.preventDefault()
    clearPoints()
    filter_button.start()
    submitFields()

  # Play all
  $('#play-all').on 'click', (e) ->
    e.preventDefault()
    $(mapped_points).each (i, el) ->
      el.play()
      if (context)
        el.events.play()


  ## JSON populates HTML
  submitFields = () ->
    fields = $('.what-do-you-want').serializeJSON()

    navigator.geolocation.getCurrentPosition(
      (pos) ->
        location =
          #lat: 45.666901 
          lat: pos.coords.latitude
          #lng: 12.243039 
          lng: pos.coords.longitude
        $.extend(fields, location)
        $.get(
          '/api/audiopts'
          fields
          tmplResults
        )
    )
    

  tmplResults = (audiopts) ->
    $('#point-listing').empty()
    points = audiopts

    $(audiopts).each (i, el) ->
      $('#point-listing').append( ich.apListing(el) )
    .promise().done(makeView)

  makeView = () ->
    initMap()

  ## Map helpers
  initMap = ->
    template = 'http://a.tiles.mapbox.com/v3/andtran.map-e74rfs90/{Z}/{X}/{Y}.png'
    provider = new MM.TemplatedLayer template
    map = new MM.Map 'map', provider

    map.disableHandler('MouseHandler')
    map.disableHandler('TouchHandler')
    map.disableHandler('MouseWheelHandler')
    map.disableHandler('DoubleClickHandler')
    map.disableHandler('DragHandler')

    selected = $('[name="radius"]').find('option:selected').val().toString()
    zoom = zoomScale[selected]
    map.setZoom(zoom).setCenter
      lat: location.lat
      lon: location.lng

    $('#map').find('svg')     # get overlay
             .wrap('<div/>')  # wrap in a div
             .parent()        # select that div wrapper
             .css(            # apply overlay style
                zIndex: '10001'
                position: 'absolute'
                top: 0
                left: 0
                width: '100%'
                height: '100%'
                margin: 0
                padding: 0
                opacity: 0
              )
    p = map.locationPoint(new MM.Location(location.lat, location.lng))
    g = svg.append('g')
    g.attr('transform', "translate(" + p.x + "," + p.y + ")")
    g.append("circle")
     .attr('style', 'fill:#000;fill-opacity:1')
     .attr('r', 3)

    addPoints()

    $('#map div').css(
      opacity: 0
    )

    setTimeout(animateTransition, 4000)

  animateTransition = ->

    $('.what-do-you-want').animate(
        marginTop: '350px'
      , 1000, 'easeOutElastic',
      ->
      $('#play-all').removeClass('hidden')
      $('#map').css( 'height': 0 )
               .animate(
                'height': $(window).height()
                'opacity' : 1
              , 500
              )
      )
      $('#map div').css(
        opacity: 1
      )
      filter_button.stop()
      


  addPoints = ->
    for pt in points
      ap = new AudioPoint(pt, map, svg)
      mapped_points.push( ap )

  clearPoints = ->
    $(mapped_points).each (i, el) ->
      el.clear() # destroy object
      mapped_points.splice(i, 1) # pop off array
    

