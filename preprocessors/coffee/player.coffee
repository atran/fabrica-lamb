`
// serializeJSON
(function(e){e.fn.serializeJSON=function(){var t={};jQuery.map(e(this).serializeArray(),function(e,n){t[e["name"]]=e["value"]});return t}})(jQuery)
`

$ ->
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

  # Filter event
  $('#filter-me').on 'click', (e) ->
    e.preventDefault()
    submitFields()

  submitFields = () ->
    fields = $('.what-do-you-want').serializeJSON()
    navigator.geolocation.getCurrentPosition(
      (pos) ->
        location =
          lat: pos.coords.latitude
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

    $(audiopts).each (i, el) ->
      $('#point-listing').append( ich.apListing(el) )
    .promise().done(makeView)

  makeView = () ->
    inlinePlayer = null
    inlinePlayer = new InlinePlayer()

