$ ->
  # Init tags & select style
  $(".tags").tagsInput()
  $("select").selectpicker(
    style: 'btn-primary'
    menuStyle: 'dropdown-inverse'
  )
  # Init templates
  $.getJSON '/api/templates', (tmpls) ->
    console.log(tmpls)
    for tmpl in tmpls
      ich.addTemplate(tmpl.name, tmpl.content)

  handleResults = (audiopts) ->
    console.log(audiopts)
    $(audiopts).each (i, el) ->
      $('#point-listing').append( ich.apListing(el) )

  $('#filter-me').on 'click', (e) ->
    e.preventDefault()

    $.get(
      '/api/audiopts'
      {}
      handleResults
    )

  $(document).on 'sm2-ready', ->
    inlinePlayer = new InlinePlayer()

