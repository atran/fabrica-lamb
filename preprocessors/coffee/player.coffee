$ ->
  search =
    loc: [0,0],
    radius: 123,
    tags: [ 'nyc' ]

  handleResults = (audiopts) ->
    console.log(audiopts)
    $(audiopts).each (i, el) ->
      $('body').append( ich.listing(el) )


  $.get(
    '/api/audiopts'
    search
    handleResults
  )

