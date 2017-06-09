function Vector2d(x, y) {
	this.add = function(sx, sy) {
		x += sx;
		y += sy;
	}
	this.multiplyScalar = function(s) {
		x *= s;
		y *= s;
	}
	this.divideBy = function(s) {
		x /= s;
		y /= s;
	}
	this.getSquaredDistance = function(ox, oy) {
		return (ox-x)*(ox-x)+(oy-y)*(oy-y);
	}
	this.getDistance = function(ox, oy) {
		return Math.sqrt( this.getSquaredDistance(ox, oy) );
	}
	this.getX = function() {
		return x;
	}
	this.getY = function() {
		return y;
	}
}