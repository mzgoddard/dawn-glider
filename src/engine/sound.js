(function(window, load) {

var document = window.document,
    setInterval = window.setInterval,
    clearInterval = window.clearInterval,
    when = window.when,
    aqua = window.aqua;

var SoundContext = aqua.type(aqua.type.Base,
  {
    init: function() {
      if (window.webkitAudioContext) {
        this.context = new window.webkitAudioContext();
        
        var clipsDefer = when.defer();
        
        when.chain(when.all([
          when(load.data('music/happy.ogg')).then(this._loadClip.bind(this, 'happy')),
          when(load.data('music/zone.ogg')).then(this._loadClip.bind(this, 'zone')),
          when(load.data('music/approach_danger.ogg')).then(this._loadClip.bind(this, 'approach')),
          when(load.data('music/danger.ogg')).then(this._loadClip.bind(this, 'danger'))
        ]), clipsDefer);
        
        clipsDefer
          .then(this._playAll.bind(this))
          .then(null, console.error.bind(console));
        
        this.nodes = {
          main: this.context.createGain()
        };
        
        this.nodes.main.connect(this.context.destination);
        
        document.addEventListener(
          'webkitvisibilitychange', 
          this.onvisibilitychange.bind(this));
        this.onvisibilitychange();
      }
    },
    onvisibilitychange: function() {
      if (document.webkitVisibilityState == 'visible') {
        if (this.visibilityInterval) {
          clearInterval( this.visibilityInterval );
        }
        
        var destination = 0,
            interval = setInterval((function() {
              this.nodes.main.gain.value = (destination += aqua.game.timing.delta);
              if (destination > 0.1) {
                this.nodes.main.gain.value = 0.1;
                clearInterval(interval);
              }
            }).bind( this ),50);
        this.visibilityInterval = interval;
      } else {
        this.nodes.main.gain.value = 0;
        
        if (this.visibilityInterval) {
          clearInterval(this.visibilityInterval);
        }
      }
    },
    _loadClip: function(name, clip) {
      var node = this.nodes[name] = {
        source: this.context.createBufferSource(),
        gain: this.context.createGain(),
      };

      var defer = when.defer();
      this.context.decodeAudioData(clip, function(buffer) {
        node.buffer = buffer;
        node.source.connect(node.gain);
        node.gain.connect(this.nodes.main);
        node.source.buffer = buffer;
        defer.resolve();
      }.bind(this), function(e) { console.error(e); });
      return defer.promise;
    },
    _playAll: function() {
      this.nodes.happy.source.start(0);
      this.nodes.zone.source.start(0);
      this.nodes.approach.source.start(0);

      this.nodes.happy.source.loop = true;
      this.nodes.zone.source.loop = true;
      this.nodes.approach.source.loop = true;

      this.nodes.happy.gain.value = 0;
      this.nodes.zone.gain.value = 0;
      this.nodes.approach.gain.value = 0;
    }
  }
);

aqua.SoundContext = SoundContext;

})(this, this.load);