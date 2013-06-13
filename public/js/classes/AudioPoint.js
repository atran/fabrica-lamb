function AudioPoint(obj, map, overlay) {
	// references
	var self = this;
	var pl = this;
	var sm = soundManager;

	// properties
	this.tags 	  = obj.tags      || [];
	this.name 	  = obj.name      || "";
	this.lat  	  = obj.loc[1]    || 0.0;
	this.lng  	  = obj.loc[0] 	  || 0.0;
	this.soundURL = "/audio/" +
					obj.sound_url || "";
	
	this.mappedPt 	= null;
	this.radius   	= 1;
	this.animateInt	= null;

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
	this.handleClick = function(e) {}

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

	// initializer
	this.init = function() {
		self.renderMapPt();
	}

	this.clear = function() {
		$(self.mappedPt[0][0]).remove();
		clearInterval(self.animateInt);
	}

	// renderers
	this.renderMapPt = function() {
		var g = overlay.append('g');
		self.mappedPt = g;
		var p = this.pos();

		var node = g.attr('transform', "translate(" + p.x + "," + p.y + ")");
      	node.append("circle")
        	.attr('style', "fill: #F00; fill-opacity: 0.3")
        	.attr('r', 10)


        self.animateInt = setInterval(self.animateCircle, 50);
	}

	this.init();
}