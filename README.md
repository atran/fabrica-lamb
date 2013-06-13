Location-based, user-generated audio mosaic.

## To run
  - mongod --fork
  - coffee -o public/js/ -cw preprocessors/coffee/
  - compass watch preprocessors/
  - node app.js
