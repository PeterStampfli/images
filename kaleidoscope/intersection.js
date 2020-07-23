/* jshint esversion: 6 */

/**
 * intersection between mirrors, making a definite n-fold dihedral symmetry
 * NOTE: this may require adjustments elsewhere
 * @constructor Intersection
 * @params {Circle} circle1
 * @params {Circle} circle2
 * @params {integer} n - optional, has to be >=2, default 3
 */

export function Intersection(circle1, circle2, n = 3) {
	if (circle1.intersections.length>2){
		console.error('Intersection: Circle1 has more than 2 intersections, cannot add more. Circle1:');
		console.log(circle1.intersections);
	} else if (circle2.intersections.length>2){
		console.error('Intersection: Circle2 has more than 2 intersections, cannot add more. Circle2:');
		console.log(circle2.intersections);
	} else {
		circle1.intersections.push(this);
		circle2.intersections.push(this);
	}
    this.circle1 = circle1;
    this.circle2 = circle2;
    this.n = n;
}

/**
 * calculate the distance between the two circles
 * resulting from their radius, mapping direction and n
 * @method Intersection#distanceBetweenCenters
 */
Intersection.prototype.distanceBetweenCenters = function() {
    const sign = (this.circle1.isOutsideInMap === this.circle2.isOutsideInMap) ? 1 : -1;
    const     cosAlpha=Math.cos(Math.PI/this.n);
    const d2 = this.circle1.radius2 + this.circle2.radius2 + 2 * sign * this.circle1.radius * this.circle2.radius*cosAlpha;
    return Math.sqrt(d2);
};