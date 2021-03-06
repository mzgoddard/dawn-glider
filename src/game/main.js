(function(window, load) {

window.glider = {};

var when = window.when;

load.module('game/main.js',
  load.chain(load.script('engine/init.js'),
    function() {
      return when.all([
        load.script('game/glider.js'),
        load.script('game/jet.js')
      ]);
    }
  ),
function() {

var $ = window.$,
    when = window.when,
    mat4 = window.mat4,
    aqua = window.aqua,
    glider = window.glider;


aqua.game = aqua.Game.create();

aqua.game.graphics = aqua.initGraphics($('canvas')[0]);
aqua.game.graphics.addShader({name: 'basic', path:'shaders/basic'});
aqua.game.task(aqua.game.call.bind(aqua.game, 'render'), aqua.Game.Priorities.RENDER);
aqua.game.task(aqua.game.graphics.draw.bind(aqua.game.graphics), aqua.Game.Priorities.RENDER);

aqua.game.timing = {
  delta: 0,
  last: Date.now()
};
aqua.game.task(function() {
  var now = Date.now();
  aqua.game.timing.delta = Math.clamp((now - aqua.game.timing.last) / 1000, 0, 0.3);
  aqua.game.timing.last = now;
}, -10);

aqua.game.world = aqua.World.create(aqua.Box.create(400, 640, 0, 0));
aqua.game.add(aqua.game.world);
aqua.game.world.add(aqua.World.Renderer.create());

for ( var idx = 0; idx < 500; idx++ )
  aqua.game.world.addParticle(
    aqua.Particle.create([
        640 * (idx / 500),
        Math.random()*480,
        0],
      15+Math.random()*3,
      1));

aqua.game.world.add(glider.Jet.create());

aqua.game.graphics.addDrawCall(aqua.PriorityItem.create(function(graphics, gl) {
  // graphics setup (once)
  gl.clearColor(0, 22 / 255, 55 / 255, 255 / 255);
  graphics.useShader('basic');
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);
}, -1000, false, true));

aqua.game.graphics.addDrawCall(aqua.PriorityItem.create(function(graphics, gl) {
  var width = window.innerWidth,
      height = window.innerHeight;
  
  graphics.canvas.width = width;
  graphics.canvas.height = height;
  
  gl.viewport(0, 0, width, height);
  mat4.ortho(
    aqua.game.world.box.left, aqua.game.world.box.width + aqua.game.world.box.left, 0, aqua.game.world.box.height, 0, 1000,
    graphics.projection);
  
  // graphics setup
  gl.clear(gl.COLOR_BUFFER_BIT);
  graphics.useShader('basic');
}, -1000));

aqua.game.sound = aqua.SoundContext.create();

// aqua.game.task(function(){console.log('beep');});

aqua.game.score = glider.GliderScore.create();
aqua.game.add((function(){
  var scoreObject = aqua.GameObject.create();

  scoreObject.add(aqua.game.score);

  return scoreObject;
})());

aqua.game.player = glider.makeGlider();
aqua.game.add(aqua.game.player);

function loop() {
  aqua.requestAnimFrame.call(null, loop);
  
  aqua.game.step();
}
loop();

});
})(this, this.load);
