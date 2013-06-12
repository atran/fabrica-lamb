// Generated by CoffeeScript 1.6.3
(function() {
  $(function() {
    var handleResults, search;
    $(".tags").tagsInput();
    $("select").selectpicker({
      style: 'btn-primary',
      menuStyle: 'dropdown-inverse'
    });
    search = {
      loc: [0, 0],
      radius: 123,
      tags: ['nyc']
    };
    handleResults = function(audiopts) {
      console.log(audiopts);
      return $(audiopts).each(function(i, el) {
        return $('#point-listing').append(ich.listing(el));
      });
    };
    $.get('/api/audiopts', search, handleResults);
    return $(document).on('sm2-ready', function() {
      var inlinePlayer;
      return inlinePlayer = new InlinePlayer();
    });
  });

}).call(this);
