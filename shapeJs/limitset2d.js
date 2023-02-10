console.log('shape');

var planar = true;
var generations = 3;
var scale=80;

// define things
function projectedTetrahedron() {
    // the tetrahedron, creating the appollonian gasket
    var rt32 = Math.sqrt(3) / 2;
    var rSphere = Math.sqrt(2 / 3);
    var r3 = 2 / 3 * Math.sqrt(2);
    project(0, 0, -1, rSphere);
    project(r3, 0, 1 / 3, rSphere);
    project(-r3 / 2, rt32 * r3, 1 / 3, rSphere);
    project(-r3 / 2, -rt32 * r3, 1 / 3, rSphere);
}

//===================================== do things

var mappingCircles = [];

//=========================================circle object

function Circle(centerX, centerY, radius) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = Math.abs(radius);
    this.radius2 = radius * radius;
}

Circle.prototype.touches = function(otherCircle) {
    var eps = 0.01;
    var dx = this.centerX - otherCircle.centerX;
    var dy = this.centerY - otherCircle.centerY;
    var d2 = dx * dx + dy * dy;
    // touching circles being outside of each other
    var rr = this.radius + otherCircle.radius;
    if (Math.abs(d2 - rr * rr) < eps) {
        return true;
    }
    // touching circles: One inside of the other
    rr = this.radius - otherCircle.radius;
    if (Math.abs(d2 - rr * rr) < eps) {
        return true;
    }
    return false;
};

// generating a fourth circle from three circles
// intersecting these circles at right angles

Circle.createFromTriplett = function(circle1, circle2, circle3) {
    var eps = 0.001;
    var x1 = circle1.centerX;
    var x2 = circle2.centerX;
    var x3 = circle3.centerX;
    var y1 = circle1.centerY;
    var y2 = circle2.centerY;
    var y3 = circle3.centerY;
    // vectors from center of circle 2 to circle 1, circle 3 to circle 1
    var x12 = x1 - x2;
    var y12 = y1 - y2;
    var x13 = x1 - x3;
    var y13 = y1 - y3;
    // test if vectors are colinear
    var d = Math.abs(x12 * y13 - y12 * x13);
    // degenerate case gives a straight line through the centers
    // beware of centers 1 and 3 are equal
    if (d < eps) {
        var nX = y13;
        var nY = -x13;
        if ((nX * nX + nY * nY) < eps) {
            nX = y12;
            nY = -x12;
        }
        // distance to origin
        d = (nX * x2 + nY * y2) / Math.sqrt(nX * nX + nY * nY);
        return new Line(nX, nY, d);
    } else {
        var r12 = x1 * x1 + y1 * y1 - circle1.radius2;
        var r13 = r12;
        r12 -= x2 * x2 + y2 * y2 - circle2.radius2;
        r13 -= x3 * x3 + y3 * y3 - circle3.radius2;
        var det = 4 * (x12 * y13 - x13 * y12);
        var x = 2 * (y13 * r12 - y12 * r13) / det;
        var y = 2 * (x12 * r13 - x13 * r12) / det;
        var r = Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1) - circle1.radius2);
        return new Circle(x, y, r);
    }
};

// test if two circles are equal, if argument is not circle then they are also not equal
Circle.prototype.equals = function(other) {
    if (other instanceof Circle) {
        var eps = 0.001;
        if (Math.abs(other.centerX - this.centerX) > eps) {
            return false;
        }
        if (Math.abs(other.centerY - this.centerY) > eps) {
            return false;
        }
        if (Math.abs(other.radius - this.radius) > eps) {
            return false;
        }
        return true;
    } else {
        return false;
    }
};

// invert a circle, either expanding or contracting
// if inversion does not change the circle, then return false

Circle.prototype.invertCircle = function(otherCircle) {
    var eps = 0.001;
    var dx = otherCircle.centerX - this.centerX;
    var dy = otherCircle.centerY - this.centerY;
    var d2 = dx * dx + dy * dy;
    var factor = this.radius2 / (d2 - otherCircle.radius2);
    var absFactor = Math.abs(factor);
    if (Math.abs(factor - 1) > eps) {
        return new Circle(this.centerX + factor * dx, this.centerY + factor * dy, absFactor * otherCircle.radius);
    } else {
        return false;
    }
};

// invert a line, resulting in a circle
// if inversion does not change the line then return false

Circle.prototype.invertLine = function(line) {
    var eps = 0.001;
    // distance between center of circle and line (measure perpendicular to line)
    var delta = this.centerX * line.nX + this.centerY * line.nY - line.d;
    if (Math.abs(delta) > eps) {
        var newDelta = 0.5 * this.radius2 / delta;
        return new Circle(this.centerX - newDelta * line.nX, this.centerY - newDelta * line.nY, Math.abs(newDelta));
    } else {
        return false;
    }
};

// drawing the circle as an oriented torus

Circle.prototype.draw = function() {
	var cx,cy,cz,r,nx,ny,nz;
    if (planar) {
        // planar, for comparision,...
        var s=2*scale ;
        cx=s*this.centerX;
        cy=s*this.centerY;
        cz=0;
        r=s*this.radius;
        nx=0;
        ny=0;
        nz=1;
    } else {
        // inversion maps circle to the surface of the hyperbolic sphere of radius 1
        // we are now in three dimensions
        // inversion center at (0,0,1), radius sqrt(2)
        // invert the sphere that corresponds to the circle (same center and radius)
        // dx=centerX, dy=centerY, dz=-1
        var d2 = this.centerX * this.centerX + this.centerY * this.centerY + 1;
        var factor = 2 / (d2 - this.radius2);
        var invSphereCenterX = factor * this.centerX;
        var invSphereCenterY = factor * this.centerY;
        var invSphereCenterZ = 1 - factor;
        var invSphereRadius = Math.abs(factor) * this.radius;
        // inverted circle results from intersection of this inverted sphere with the hyperbolic sphere
        // center at (0,0,0), radius=1
        // should intersect hyperbolic sphere at right angles
        // intersection with hyperbolic sphere defines the image circle
        // normal vector is inverted sphere center
        d2 = invSphereCenterX * invSphereCenterX + invSphereCenterY * invSphereCenterY + invSphereCenterZ * invSphereCenterZ;
        var d = Math.sqrt(d2);
         r = scale  / d * invSphereRadius;
        factor = scale  / d2;
        cx = factor * invSphereCenterX;
        cy = factor * invSphereCenterY;
        cz = factor * invSphereCenterZ;
        nx=invSphereCenterX;
        ny=invSphereCenterY;
        nz=invSphereCenterZ;
    }
    console.log('circle',cx,cy,cz,r,nx,ny,nz);
};

//====================================the line object

// n is normal vector to line, d is distance from origin, d>=0
// normalizes n, enforces d >= 0, normal vector pointing away from origin.
// point d*normalVector is on the line, the line is orthogonal to the normal vector and going through this point
// thus the definition is unique
function Line(nX, nY, d) {
    var eps = 0.001;
    if (d < 0) {
        nX = -nX;
        nY = -nY;
        d = -d;
    }
    // if d approx 0, enforces nX>0 (for unique lines going through the origin), or ny>0
    if (d < eps) {
        if (Math.abs(nX) > eps) {
            if (nX < 0) {
                nX = -nX;
                nY = -nY;
            }
        } else {
            if (nY < 0) {
                nX = -nX;
                nY = -nY;
            }
        }
    }
    var normFactor = 1 / Math.sqrt(nX * nX + nY * nY);
    this.nX = normFactor * nX;
    this.nY = normFactor * nY;
    this.d = d;
}

// test if two lines are equal, if argument is not Line then they are also not equal
Line.prototype.equals = function(other) {
    var eps = 0.001;
    if (other instanceof Line) {
        if (Math.abs(other.nX - this.nX) > eps) {
            return false;
        }
        if (Math.abs(other.nY - this.nY) > eps) {
            return false;
        }
        if (Math.abs(other.d - this.d) > eps) {
            return false;
        }
        return true;
    } else {
        return false;
    }
};

// draw line as line or torus
Line.prototype.writeSCAD = function() {
    var big = 10;
    if (planar) {
        var px = this.d * this.nX;
        var py = this.d * this.nY;
        var s=2*scale ;
        var startX=scale  * (px + big * this.nY);
        var startY=scale  * (py - big * this.nX);
        var endX=scale  * (px - big * this.nY);
        var endY=scale  * (py + big * this.nX);
        console.log('line',startX,startY,endX,endY);
    } else {
        // invert line to the hyperbolic sphere with radius 1, we are now in three dimensions
        // inversion center at (0,0,1), radius sqrt(2)
        // this gives a great circle, center at origin, radius is hyperbolic radius = 1
        // normal is inside xy-plane, perpendicular to the line, thus same as normal to the line
        console.log('circle',0,0,0,scale ,this.nX,this.nY,0);
    }
};


// ===========making the structure

// add a mapping circle
function mappingCircle(centerX, centerY, radius) {
    var mappingCircle = new Circle(centerX, centerY, radius);
    mappingCircle.images = [];
    var length = generations;
    mappingCircle.images.length = length;
    for (var i = 0; i < length; i++) {
        mappingCircle.images[i] = [];
    }
    mappingCircles.push(mappingCircle);
}

// mapping spheres: normalize to hyperbolic radius =1
// do inversion: hyperbolic sphere to half-plane
function project(x, y, z, r) {
    // get actual hyperbolic radius
    var d2 = x * x + y * y + z * z;
    var r2 = r * r;
    var rHyp = Math.sqrt(d2 - r2);
    // scale 
    x /= rHyp;
    y /= rHyp;
    z /= rHyp;
    r /= rHyp;
    // hyperbolic radius is now equal to 1
    // inversion to hyperbolic half plane
    var dz = z - 1;
    d2 = x * x + y * y + dz * dz;
    r2 = r * r;
    var factor = 2 / (d2 - r2);
    x *= factor;
    y *= factor;
    z = 1 + factor * dz;
    r = Math.abs(factor) * r;
    mappingCircle(x, y, r);
}

// generation 1:
// make basic images: find tripletts of touching circles  circleI---circleJ---circleK
// add image circle resulting from triplett
function generation1() {
    var length = mappingCircles.length;
    // find tripletts of touching circles, circle j is in the middle, touching circle i and circle k
    // we can impose i<k, obviously indices are not equal
    for (var j = 0; j < length; j++) {
        var circleJ = mappingCircles[j];
        for (var i = 0; i < length - 1; i++) {
            if (i === j) {
                continue;
            }
            var circleI = mappingCircles[i];
            if (circleJ.touches(circleI)) {
                for (var k = i + 1; k < length; k++) {
                    var circleK = mappingCircles[k];
                    if (k === j) {
                        continue;
                    }
                    if (circleJ.touches(circleK)) {
                        // generate the image of the triplett, a Circle or a Line
                        var image = Circle.createFromTriplett(circleI, circleJ, circleK);
                        // check if image already there, in images of another mapping circle
                        var isCopy = false;
                        for (var c = 0; c < length; c++) {
                            var otherImages = mappingCircles[c].images[0];
                            var otherLength = otherImages.length;
                            for (var otherIndex = 0; otherIndex < otherLength; otherIndex++) {
                                var otherImage = otherImages[otherIndex];
                                if (otherImage.equals(image)) {
                                    isCopy = true;
                                    break;
                                }
                            }
                            if (isCopy) {
                                break;
                            }
                        }
                        if (!isCopy) {
                            circleJ.images[0].push(image);
                            nImages += 1;
                        }
                    }
                }
            }
        }
    }
}

// new generation from inversions
// for each mapping circle invert circles belonging to other mapping circles
//  except if image is unchanged (factor=1)
var nImages;

// the first true generation, there can be Lines and Circles to invert
function generation2() {
    var mapLength = mappingCircles.length;
    for (var m = 0; m < mapLength; m++) {
        var mappingCircle = mappingCircles[m];
        var newGeneration = mappingCircle.images[1];
        for (var i = 0; i < mapLength; i++) {
            if (i !== m) {
                var oldImages = mappingCircles[i].images[0];
                var oldLength = oldImages.length;
                for (var k = 0; k < oldLength; k++) {
                    var newImage;
                    var oldImage = oldImages[k];
                    if (oldImage instanceof Circle) {
                        newImage = mappingCircle.invertCircle(oldImage);
                    } else {
                        newImage = mappingCircle.invertLine(oldImage);
                    }
                    if (newImage) {
                        newGeneration.push(newImage);
                        nImages += 1;
                    }
                }
            }
        }
    }
}

// make a new generation, only circles for inversion
// new generation at index generation-1
function newGeneration(generation) {
    var mapLength = mappingCircles.length;
    for (var m = 0; m < mapLength; m++) {
        var mappingCircle = mappingCircles[m];
        var newGeneration = mappingCircle.images[generation - 1];
        for (var i = 0; i < mapLength; i++) {
            if (i !== m) {
                var oldGeneration = mappingCircles[i].images[generation - 2];
                var oldGenLength = oldGeneration.length;
                for (var k = 0; k < oldGenLength; k++) {
                    var newCircle = mappingCircle.invertCircle(oldGeneration[k]);
                    if (newCircle) {
                        newGeneration.push(newCircle);
                        nImages += 1;
                    }
                }
            }
        }
    }
}

function main(args) {
    var gen;
    mappingCircles.length = 0;
    projectedTetrahedron();
    if (generations >= 1) {
        generation1();
    }
    if (generations >= 2) {
        generation2();
    }
    for (gen = 3; gen <= generations; gen++) {
        newGeneration(gen);
    }
    console.log(mappingCircles);
    var mapLength = mappingCircles.length;
    for (var i = 0; i < mapLength; i++) {
        var imagesI = mappingCircles[i].images;
        console.log(i,imagesI);
        for (gen = 0; gen < generations; gen++) {
            var imagesGen = imagesI[gen];
            var imagesLength = imagesGen.length;
            for (var j = 0; j < imagesLength; j++) {
                var image = imagesGen[j];
                image.draw();
            }
        }
    }
}

main();