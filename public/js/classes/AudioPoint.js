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

	// methods
	this.pos = function() {
		p = map.locationPoint(
			new MM.Location(
				this.lat, this.lng
			));
		return { x: p.x, y: p.y }
	}

	// events
	this.events = {
		play: function () {},
		stop: function() {},
		pause: function() {},
		resume: function() {},
		finish: function () {}
	}

	// event handlers
	this.handleClick = function(e) {
		self.sm_sound.play({
			volume: 100
		})
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

        self.animateInt = setInterval(self.animateCircle, 50);
	}

	this.initSound = function() {
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

	this.init();
}