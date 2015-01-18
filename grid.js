var Grid = (function() {
	function Grid(node, w, h, s) {
		// options
		this.node = node;
		this.w = w;
		this.h = h;
		this.s = s;
		
		this.style = null;
		this.hooks = {
			updatePixels: new Function()
		}
		
		// matrix references
		this.grid = null;
		this.objs = null;
	}
	
	Grid.clone = function(grid) {
		var clone = new Grid();
		
		Object.keys(grid).forEach(function(key) {
			clone[key] = grid[key];
		});
		
		return clone;
	};
	
	var proto = Grid.prototype;
	
	proto.init = function(map) {
		// - Set grid size on DOM
		var parent = this.node;
		
		parent.css({
			width:	this.w * this.s,
			height:	this.h * this.s
		});
		
		// pixel size (<style>'d for efficiency)
		this.style = $('<style>#pixelated > .pixel{width:'+this.s+'px;height:'+this.s+'px}</style>');
		
		$('head').append(this.style);
		
		// - Populate grid & derivates
		var node_tpl = $('<div class="pixel"></div>');
		
		// new matrices
		var grid = [];
		var objs = [];
		
		// for full redraw
		var pixel_list = [];
		
		for (var y = 0; y < this.h; ++y) {
			// rows
			grid.push([]);
			objs.push([]);
			
			for (var x = 0; x < this.w; ++x) {
				// new element
				var node = node_tpl.clone();
				var obj = {
					x: x, y: y
				};
				
				// pass obj to map cb
				map(obj);
				
				// reference to obj in node
				node.data('obj', obj);
				
				// push to matrices
				grid[y].push(node);
				objs[y].push(obj);
				
				pixel_list.push(obj);
				
				parent.append(node);
			}
		}
		
		// update instance references
		this.grid = grid;
		this.objs = objs;
		
		// full redraw
		this.updatePixels(pixel_list);
	};
	
	proto.destroy = function() {
		this.node.children('.pixel').off('click').remove();
		this.style.remove();
	};
	
	proto.updatePixels = function(pixels) {
		var grid = this.grid;
		var map = this.hooks.updatePixels;
		
		for (var i = 0; i < pixels.length; ++i) {
			var pixel = pixels[i];
			var node = grid[pixel.y][pixel.x];
			
			map(pixel, node);
		}
	};
	
	proto.pixelsAt = function(ref, where) {
		var objs = this.objs;
		
		// TODO use oldschool array walk?
		// speed
		return where.map(function(rel) {
			var row = objs[ref.y + rel[1]];
			
			if (!row)
				return null;
			
			var pixel = row[ref.x + rel[0]];
			
			if (!pixel)
				return null;
			
			return pixel;
		});
	};
	
	proto.onClick = function(cb, ctx) {
		// TODO per-children event on <.pixel> VS centralized event on <node>
		// memory
		this.node.children('.pixel').on('click', function() {
			cb.call(ctx, $(this).data('obj'));
		});
	};
	
	return Grid;
})();
