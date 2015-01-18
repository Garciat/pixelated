Array.prototype.rand = function() {
	return this[Math.floor(Math.random() * this.length)];
};

Array.prototype.has = function(elem) {
	return this.indexOf(elem) !== -1;
};

Array.prototype.pull = function(elem) {
	var i = this.indexOf(elem);
	
	if (i === -1)
		return;
	
	return this.splice(i, 1);
};
