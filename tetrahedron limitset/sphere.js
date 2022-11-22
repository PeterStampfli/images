/* jshint esversion: 6 */


export function Spheres() {
    this.spheres = [];
}

Spheres.prototype.add = function(circle) {
    this.spheres.push(circle);
};

Spheres.prototype.get=function(i){
    return this.spheres[i];
}

Spheres.prototype.length=function(){
	return this.spheres.length;
}

Spheres.prototype.clear = function() {
    this.spheres.length = 0;
};


export function Sphere() {
    this.centerX = 0;
    this.centerY = 0;
    this.centerZ = 0;
    this.radius = 0;
    this.radius2 = 0;
    this.circleGenerations = [];
}

// a pool and recycling
const pool = [];

// putting back a sphere into the pool
Sphere.prototype.recycle = function() {
    pool.push(this);
    console.log(pool.length);
};
// getting a sphere from pool, or creating a new one
// with array for generations of circles
Sphere.get = function(radius, centerX, centerY, centerZ) {
    var sphere;
    if (pool.length > 0) {
        sphere = pool.pop();
    } else {
        sphere = new Sphere();
    }
    sphere.radius = radius;
    sphere.radius2 = radius * radius;
    sphere.centerX = centerX;
    sphere.centerY = centerY;
    sphere.centerZ = centerZ;
    sphere.circleGenerations.length = 0;
    return sphere;
};

// create an inverted sphere
Sphere.prototype.invertCircle = function(otherSphere) {
    const dx = otherSphere.centerX - this.centerX;
    const dy = otherSphere.centerY - this.centerY;
    const dz = otherSphere.centerZ - this.centerZ;
    const d2 = dx * dx + dy * dy;
    const factor = this.radius2 / (d2 - otherSphere.radius2);
    const absFactor = Math.abs(factor);
    return Sphere.get(this.centerX + factor * dx, this.centerY + factor * dy, this.centerZ + factor * dz, absFactor * otherSphere.radius);
    };