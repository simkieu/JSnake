//Extends Array prototype for filling in a default value
Array.prototype.fill = function (value) {
    var size = this.length;
    while (size > 0) {
        this[--size] = value;
    }
    return this;
};

// Degree to Radian
function degToRad(deg) {
	return deg * Math.PI / 180;
}


// Radian to Degree
function radToDeg(rad) {
	return rad / Math.PI * 180;
}


// Get quarant from degree
function getQuarant (deg) {
	if (deg < 0)
		deg+=360;
	if (deg >= 360)
		deg-=360;
    return Math.floor(deg/90);
}