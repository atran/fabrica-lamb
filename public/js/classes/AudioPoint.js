function AudioPoint(obj, map, overlay) {
	// references
	var self = this;
	var pl = this;
	var sm = soundManager;
	this.el = null;

	// properties
	this.id 	  = obj._id 	  || "";
	this.tags 	  = obj.tags      || [];
	this.name 	  = obj.name      || "";
	this.lat  	  = obj.loc[1]    || 0.0;
	this.lng  	  = obj.loc[0] 	  || 0.0;
	this.soundURL = "/audio/" +
					obj.sound_url || "";
	
	this.mappedPt 	= null;
	this.radius   	= 1;
	this.animateInt	= null;
	this.sm_sound 	= null;
  this.buff       = null;
  
  this.ac_playing = false;


	// methods
	this.pos = function() {
		p = map.locationPoint(
			new MM.Location(
				this.lat, this.lng
			));
		return { x: p.x, y: p.y }
	}

	this.play = function(vol) {
		if (context) {
      self.createBuffSrc();      
      source = self.sm_sound;

      if (!context.createGain || context.createGain.type === undefined) {
        context.createGain = context.createGainNode
      }
      var gainNode = context.createGain();
      source.connect(gainNode);
      
      if (!source.start || source.start.type === undefined) {
        source.start = source.noteOn;
      }
      
      gainNode.connect(context.destination);
      gainNode.gain.value = vol;
      source.loop = true;
      source.start(0);
    } else {
      self.sm_sound.play({
			  volume: vol
		  });
    }
	}

  this.stop = function() {
    if (context) {
      source = self.sm_sound;

      if (!source.stop || source.stop.type === undefined) {
        source.stop = source.noteOff;
      }
      
      source.stop(0);
    } else {
      self.sm_sound.stop();
    }
  }

	// events
	this.events = {
		play: function () {
      self.animateInt = setInterval(self.animateCircle, 50);
      $(self.el).find('circle')
      .css({
        'fill': '#36DBCA',
        'fill-opacity': 1
      });
      self.ac_playing = true;
    },
		stop: function() {
  		clearInterval(self.animateInt);      
      self.radius = 10; 
      self.setRadius();   
      $(self.el).find('circle')
      .css({
        'fill': '#F00',
        'fill-opacity': 0.3
      })
      self.ac_playing = false;              
    },
		pause: function() {},
		resume: function() {},
		finish: function () {}
	}

	// event handlers
	this.handleClick = function(e) {
    if (context) {
      if (!self.ac_playing) {
        self.play(10);
        self.events.play();
      } else {
        self.stop();
        self.events.stop();
      }
    }
    else {
      if (self.sm_sound.playState === 1) {
        self.stop();
      } else {
        self.play(100);
      }
    }
	}

	this.handleResize = function(e) {
		self.refreshPosition();
	}

	// helpers
	this.stopSound = function(oSound) {
		sm.stop(oSound.id);
		sm.unload(oSound.id);
	}

	this.animateCircle = function(){
    	if (self.radius > 10) { self.radius = 1; }
        self.radius = self.radius + .25;
      self.setRadius()
  }

  this.setRadius = function() {
    self.mappedPt
        .selectAll('circle')
        .attr('r', self.radius)
  }


  this.refreshPosition = function(){
    var p = self.pos();
    self.mappedPt
    .attr('transform', "translate(" + p.x + "," + p.y + ")");
  }

	// initializer
	this.init = function() {
		self.renderMapPt();
		self.initSound();
		$(window).on('resize', self.handleResize);
		$(self.el).on('click', self.handleClick);
	}

	this.clear = function() {
		// clear animation
		clearInterval(self.animateInt);
		// remove from DOM
		$(self.el).remove();
		// unload and remove sound
		sm.unload("a"+self.id);
		sm.destroySound("a"+self.id);
	}

	// renderers
	this.renderMapPt = function() {
		self.mappedPt = overlay.append('g');
		self.el 	  = self.mappedPt[0][0];

		var g = self.mappedPt;
		self.refreshPosition();

		g.append("circle")
         .attr('style', "fill: #F00; fill-opacity: 0.3")
         .attr('r', 10);
	}

  this.initSound = function() {
    // If we have AudioContext
    if (context) {
      self.contextRequest();
    } else {
      // If we don't have AudioContext, let's use SM2
      self.sm_sound = sm.createSound({
        id: "a"+self.id,
        url: self.soundURL,
        onplay:self.events.play,
        onstop:self.events.stop,
        onpause:self.events.pause,
        onresume:self.events.resume,
        onfinish:self.events.finish
      });
    }
  }

  this.contextRequest = function() {
    var req = new XMLHttpRequest();
    req.open('GET', self.soundURL, true);
    req.responseType = 'arraybuffer';
    req.onload = function() {
      context.decodeAudioData(req.response, function(buff) {
        self.buff = buff;
        self.createBuffSrc();
      }, function(err){ console.log(err) })
    }
    req.send();
  }

  this.createBuffSrc = function() {
    self.sm_sound = context.createBufferSource();
    self.sm_sound.buffer = self.buff;    
  }

	this.init();
}
