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


  # Filter event
  $('#filter-me').on 'click', (e) ->
    e.preventDefault()
    clearPoints()
    submitFields()

  # Play all
  $('#play-all').on 'click', (e) ->
    e.preventDefault()
    $(mapped_points).each (i, el) -> el.play()


  ## JSON populates HTML
  submitFields = () ->
    fields = $('.what-do-you-want').serializeJSON()

    navigator.geolocation.getCurrentPosition(
      (pos) ->
        location =
          lat: 45.666901 #pos.coords.latitude
          lng: 12.243039 #pos.coords.longitude
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

    map.setZoom(14).setCenter
      lat: location.lat - .01
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
              )

   

    $('.what-do-you-want').animate(
        marginTop: '350px'
      , 1000, 'easeOutElastic',
      ->
      $('#map').css( 'height': 0 )
               .animate(
                'height': $(window).height()
                'opacity' : 1
              , 500
              )
      )

    addPoints()

  addPoints = ->
    for pt in points
      ap = new AudioPoint(pt, map, svg)
      mapped_points.push( ap )

  clearPoints = ->
    $(mapped_points).each (i, el) ->
      el.clear() # destroy object
      mapped_points.splice(i, 1) # pop off array
    

