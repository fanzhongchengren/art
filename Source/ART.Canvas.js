/*
---

name: ART.Canvas

description: Canvas implementation for ART

authors: [Valerio Proietti](http://mad4milk.net) && [MooTools development team](http://mootools.net/developers)

provides: ART.Canvas

requires: ART

...
*/

ART.Canvas = new Class({

	initialize: function(id, width, height){
		this.element = new Element('canvas', {'id': id || 'art-' + $time()});
		this.context = this.element.getContext('2d');
		this.resize({x: width, y: height});
	},

	resize: function(size){
		this.element.width = size.x;
		this.element.height = size.y;
		return this;
	},
	
	clear: function(){
		this.context.clearRect(0, 0, this.element.width, this.element.height);
		return this;
	},

	start: function(){
		this.drawStack = [];
		this.drawn = false;
		this.previousOutline = null;
		this.bounds = {x: [], y: []};
		this.context.beginPath();
		return this;
	},
	
	end: function(style){
		var stack = this.drawStack;
		for (var i=0; i < stack.length; i++){
			var s = stack[i], method = s[0], args = s[1];
			this.context[method].apply(this.context, args);
		}
		
		if (style.fill != null){
			var fill = $splat(style.fill);
			this.fill(fill[0], fill[1], style.fillMode);
		}
		if (style.outline != null) this.outline(style.outline, style.outlineWidth, style.outlineCap, style.outlineJoin);
		
		if (style.shadow != null) this.shadow(style.shadow, style.shadowOffset, style.shadowBlur);
		
		return this;
	},

	join: function(){
		this.drawStack.push(['closePath', []]);
		return this;
	},
	
	/* drawing methods */

	move: function(vector){
		if (!this.drawn) this.lastVector = vector;
		this.drawStack.push(['moveTo', [vector.x, vector.y]]);
		return this;
	},

	line: function(vector){
		if (!this.drawn) this.setStartCoordinate();
		this.bounds.x.push(vector.x);
		this.bounds.y.push(vector.y);
		this.drawStack.push(['lineTo', [vector.x, vector.y]]);
		return this;
	},

	bezier: function(c1, c2, end){
		if (!this.drawn) this.setStartCoordinate();
		this.bounds.x.push(c1.x, c2.x, end.x);
		this.bounds.y.push(c1.y, c2.y, end.y);
		this.drawStack.push(['bezierCurveTo', [c1.x, c1.y, c2.x, c2.y, end.x, end.y]]);
		return this;
	},
	
	setStartCoordinate: function(){
		this.bounds.x.push(this.lastVector.x);
		this.bounds.y.push(this.lastVector.y);
		this.drawn = true;
	},
	
	/* privates */
	
	fill: function(color1, color2, mode){

		var fillStyle = color1.valueOf();
		
		if (color2 != null){
			var gradient;
			
			if (mode == 'vertical'){
				var minY = Math.min.apply(Math, this.bounds.y), maxY = Math.max.apply(Math, this.bounds.y);
				gradient = this.context.createLinearGradient(0, minY, 0, maxY);
			} else if (mode == 'horizontal') {
				var minX = Math.min.apply(Math, this.bounds.x), maxX = Math.max.apply(Math, this.bounds.x);
				gradient = this.context.createLinearGradient(minX, 0, maxX, 0);
			}

			gradient.addColorStop(0, fillStyle);
			gradient.addColorStop(1, color2.valueOf());
			fillStyle = gradient;
		}
		
		this.context.fillStyle = fillStyle;
		
		this.context.fill();
		return this;
	},
	
	outline: function(color, width, cap, join){
		this.previousOutline = [width, cap, join];
		this.context.strokeStyle = color.valueOf();
		this.context.lineWidth = Number(width);
		this.context.lineCap = cap;
		this.context.lineJoin = join;
		this.context.stroke();
		return this;
	},
	
	shadow: function(color, offset, blur){
		this.context.globalCompositeOperation = 'destination-over';
		var oldPath = this.drawStack, outline = this.previousOutline;
		this.context.translate(offset.x, offset.y);
		this.start();
		this.drawStack = oldPath;
		var end = {fill: color, outline: null, shadow: null};
		if (outline != null) $extend(end, {outline: color, outlineWidth: outline[0], outlineCap: outline[1], outlineJoin: outline[2]});
		this.end(end);
		this.context.translate(-offset.x, -offset.y);
		this.context.globalCompositeOperation = 'source-over';
	},
	
	/* $ */
	
	toElement: function(){
		return this.element;
	}

});

(function(){
	
var dummy = document.createElement('canvas');
if (!!(dummy && dummy.getContext)) ART.registerAdapter(ART.Canvas);
	
})();
