module.exports = (grunt) ->
  
  # Project configuration.
  grunt.initConfig
    
    # Metadata.
    pkg: grunt.file.readJSON("package.json")
    banner: "/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - " + "<%= grunt.template.today(\"yyyy-mm-dd\") %>\n" + "<%= pkg.homepage ? \"* \" + pkg.homepage + \"\\n\" : \"\" %>" + "* Copyright (c) <%= grunt.template.today(\"yyyy\") %> <%= pkg.author.name %>;" + " Licensed <%= _.pluck(pkg.licenses, \"type\").join(\", \") %> */\n"
    
    # Task configuration.
    coffee:
      compile:
        files:
          "public/js/player.js": "src/scripts/player.coffee"
          "public/js/recorder.js": "src/scripts/recorder.coffee"

    concat:
      options:
        banner: "<%= banner %>"
        stripBanners: true

      dist:
        src: ["src/scripts/vendor/**/*.js"]
        dest: "public/js/common.js"

    uglify:
      options:
        banner: "<%= banner %>"

      dist:
        src: "<%= concat.dist.dest %>"
        dest: "public/js/common.js"

    compass:
      options:
        sassDir: "src/stylesheets"
        cssDir: "public/css"
        config: "src/config.rb"

      dev:
        outputStyle: "nested"

      dist:
        outputStyle: "compressed"

    nodemon:
      options:
        file: 'server.js'
        cwd: __dirname
        ignoredFiles: ['public/**', 'src/**', 'node_modules/**','.sass-cache/**']

    concurrent:
      target:
        tasks: ['nodemon', 'watch']
        options:
          logConcurrentOutput: true

    watch:
      files: ["src/**/*.*"]
      tasks: "generate"
      options:
        livereload: true
  
  # These plugins provide necessary tasks.
  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-concat"
  grunt.loadNpmTasks "grunt-contrib-uglify"
  grunt.loadNpmTasks "grunt-contrib-compass"
  grunt.loadNpmTasks "grunt-nodemon"
  grunt.loadNpmTasks "grunt-concurrent"
  grunt.loadNpmTasks "grunt-contrib-watch"
  
  # Default task.
  grunt.registerTask "default", ["concurrent:target"]
  grunt.registerTask "generate", ["coffee", "concat", "compass:dev"]
  grunt.registerTask "build", ["coffee", "concat", "compass:dist", "uglify"]