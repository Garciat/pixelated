var Pixelated = (function() {
	function Pixelated(node, w, h, s) {
		this.grid = new Grid(node, w, h, s);
		
		this.node = node;
		this.w = w;
		this.h = h;
		this.s = s;
		
		// selected area variables
		this.color = undefined;
		this.active = [];
		this.border = [];
		
		// score variables
		this.moves = Pixelated.MAX_MOVES;
		this.over = false;
		
		this.init();
	}
	
	Pixelated.MAX_MOVES = 21;
	Pixelated.COLORS = ['red', 'blue', 'purple', 'yellow', 'green', 'darkorange'];
	Pixelated.CROSS = [
		[0, -1],	// top
		[0, 1],		// bot
		[-1, 0],	// left
		[1, 0]		// right
	];
	
	var proto = Pixelated.prototype;
	
	proto.init = function() {
		this.node.hide();
		
		// mapping function for redrawn pixels
		this.grid.hooks.updatePixels = function(pixel, node) {
			node
				.css('background', pixel.color)
				.removeClass('active border other').addClass(pixel.type);
		};
		
		// init + mapping function for all pixels
		this.grid.init(function(pixel) {
			pixel.color = Pixelated.COLORS.rand();
			pixel.type = 'other';
		});
		
		// master color & init game state
		var first = this.grid.objs[0][0];
		
		this.setColor(first.color);
		this.border.push(first);
		
		this.update();
		
		// pixel click event
		this.grid.onClick(this.click, this);
		
		var self = this;
		
		this.node.fadeIn(function() {
		});
	};
	
	proto.destroy = function() {
		this.grid.destroy();
	};
	
	proto.click = function(pixel) {
		if (this.over)
			return this.end('Restart?');
		
		if (!this.border.has(pixel))
			return;
		
		// all good. update master color
		this.setColor(pixel.color);
		
		// update game
		this.update();
		
		// new turn
		this.nextTurn();
	};
	
	proto.solve = function() {
		// TODO separate DOM from matrix logic to enable simulations
		var self = this;
		var steps = 0;
		
		function solveStep() {
			if (self.over)
				return;
			
			var click = {}
			var count = {};
			var checked = [];
			
			function checkPixel(pixel, color) {
				if (checked.has(pixel))
					return 0;
				
				var count = 1;
				checked.push(pixel);
				
				self.grid.pixelsAt(pixel, Pixelated.CROSS).forEach(function(other) {
					if (!other || other.color !== color)
						return;
					
					count += checkPixel(other, color);
				});
				
				return count;
			}
			
			self.border.forEach(function(pixel) {
				var color = pixel.color;
				
				if (!(color in click)) {
					click[color] = pixel;
					count[color] = 0;
				}
				
				count[color] += checkPixel(pixel, color);
			});
			
			var colors = Object.keys(count);
			var click_color = colors.shift();
			
			colors.forEach(function(color) {
				if (count[color] > count[click_color])
					click_color = color;
			});
			
			self.click(click[click_color]);
			
			++steps;
			
			//solveStep();
			setTimeout(solveStep, 1000);
		}
		
		solveStep();
		
		return steps;
	};
	
	proto.update = function() {
		var master = this.color;
		
		var active = this.active;
		var border = this.border;
		
		var grid = this.grid;
		
		var modified = [];
		
		function loop(pixel) {
			if (pixel.color !== master) {
				if (!border.has(pixel)) {
					pixel.type = 'border';
					border.push(pixel);
					modified.push(pixel);
				}
				
				return;
			}
			
			pixel.type = 'active';
			active.push(pixel);
			border.pull(pixel);
			modified.push(pixel);
			
			grid.pixelsAt(pixel, Pixelated.CROSS).forEach(function(other) {
				if (!other || active.has(other) || border.has(other) || modified.has(other))
					return;
				
				loop(other);
			});
		}
		
		// loop on copy; original modified in loop
		[].concat(border).forEach(loop);
		
		// redraw
		this.grid.updatePixels(modified);
	};
	
	proto.nextTurn = function() {
		--this.moves;
		
		if (this.moves <= 5)
			this.showMoves();
		
		if (this.border.length === 0) {
			this.end('Game finished in ' + (Pixelated.MAX_MOVES - this.moves) + ' moves! Restart?');
		} else if (!this.moves) {
			this.end('Game over! Restart?');
		}
	};
	
	proto.showMoves = function() {
		var $number = $('<div class="score">' + this.moves + '</div>');
		
		this.node.append($number);
		
		$number.css({
			top: (this.node.height() - $number.height()) / 2,
			left: (this.node.width() - $number.width()) / 2
		}).addClass('animate');
		
		$number.on('webkitTransitionEnd', function() {
			$number.off('webkitTransitionEnd');
			
			$number.remove();
		});
	};
	
	proto.setColor = function(color) {
		this.color = color;
		
		this.active.forEach(function(pixel) {
			pixel.color = color;
		});
		
		this.grid.updatePixels(this.active);
	};
	
	proto.end = function(prompt) {
		this.over = true;
		
		// TODO start_game does not belong to this class
		if (confirm(prompt))
			start_game();
	};
	
	return Pixelated;
})();
