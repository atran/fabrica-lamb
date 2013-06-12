$ ->
  # Init tags & select style
  $(".tags").tagsInput()
  $("select").selectpicker(
    style: 'btn-primary'
    menuStyle: 'dropdown-inverse'
  )

  search =
    loc: [0,0],
    radius: 123,
    tags: [ 'nyc' ]

  handleResults = (audiopts) ->
    console.log(audiopts)
    $(audiopts).each (i, el) ->
      $('#point-listing').append( ich.listing(el) )


  $.get(
    '/api/audiopts'
    search
    handleResults
  )

  $(document).on 'sm2-ready', ->
    inlinePlayer = new InlinePlayer()

