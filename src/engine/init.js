(function(window, load) {

  var when = window.when;

  load.module('engine/init.js', 
    load.chain(
      load.script('engine/base.js'),
      function() {
        return when.all([
        load.script('engine/object.js'),
        load.script('engine/graphics.js'),
        load.script('engine/sound.js'),
        load.script('engine/physics.js')
        ]);
      }
  ), function() {});

})(this, this.load);