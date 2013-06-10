$ ->
  selected_file = null
  lat = ""
  lng = ""
  name = ""
  $('.video-upload').on 'change', (e) ->
    selected_file = e.target.files[0]
    lat  = $('.lat').val()
    lng  = $('.lng').val()
    name = $('.name').val()

  $('#upload-me').on 'click', (e) ->
    FReader = new FileReader()
    FReader.onload = (e) ->
      socket.emit('upload',
        'name'  : name
        'lat'   : lat
        'lng'   : lng
        'data'  : e.target.result
      )

    socket.emit('start',
      'name'  : name
      'lat'   : lat
      'lng'   : lng
      'data'  : selected_file.size
    )


