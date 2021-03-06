 /* jshint esversion:6 */

 /**
  * generate an object (circle or line ) as outer reflection border with hyperbolic, euclidic or elliptic geometry
  * set dihedral order before
  * @method circleScope.reflection
  * @param {float} radius of circle, or intersection of line with x-axis
  * @param {integer} m - symmetry at "right" corner
  * @param {integer} n - symmetry at "left" corner
  * @param {boolean} outer - true for outer (towards the center), false for inner reflection (away fromcenter)
  * @return circle or line suitable as outer reflection
  */
 circleScope.outerReflection = function(radius, m, n) {
     const k = circleScope.getDihedral();
     console.log("k " + k);
     const angleSum = 1.0 / k + 1.0 / m + 1.0 / n;
     console.log("angsu " + angleSum);

     const cosGamma = Fast.cos(Math.PI / k);
     const sinGamma = Fast.sin(Math.PI / k);
     const cosAlpha = Fast.cos(Math.PI / m);
     const sinAlpha = Fast.sin(Math.PI / m);
     const cosBeta = Fast.cos(Math.PI / n);
     const sinBeta = Fast.sin(Math.PI / n);
     // elliptic
     if (angleSum > 1.000001) {
         const circle = new Circle(radius, -radius * (cosAlpha * cosGamma + cosBeta) / sinGamma, -radius * cosAlpha);
         circle.map = circle.invertOutsideIn;
         return circle;
     }
     // euklidic
     else if (angleSum > 0.999999) {
         const big = 100000;
         const line = new Line(new Vector2(radius - big * cosAlpha, big * sinAlpha), new Vector2(radius + big * cosAlpha, -big * sinAlpha));
         line.map = line.mirrorLeftToRight;
         return line;
     }
     // hyperbolic
     else {
         const circle = new Circle(radius, radius * (cosAlpha * cosGamma + cosBeta) / sinGamma, radius * cosAlpha);
         circle.map = circle.invertInsideOut;
         return circle;
     }
 };

 /**
  * generate a circle as inner reflecting element
  * 
  * set dihedral order before
  * @method circleScope.innerReflection
  * @param {float} radius of circle, or intersection of line with x-axis
  * @param {integer} n - symmetry at "left" corner, intersection with upper inclined reflecting line
  * @return Circle for inner reflection
  */
 circleScope.innerReflection = function(radius, m, n) {
     const k = circleScope.getDihedral();


     const cosGamma = Fast.cos(Math.PI / k);
     const sinGamma = Fast.sin(Math.PI / k);
     const cosAlpha = Fast.cos(Math.PI / m);
     const sinAlpha = Fast.sin(Math.PI / m);
     const cosBeta = Fast.cos(Math.PI / n);
     const sinBeta = Fast.sin(Math.PI / n);

     const circle = new Circle(radius, radius * (cosAlpha * cosGamma + cosBeta) / sinGamma, radius * cosAlpha);
     circle.map = circle.invertInsideOut;
     return circle;
 };

 /**
  * setup for circles with centers on each straight mirror line,intersecting at right angles, the other straight line as tangent.
  * thus combination of two (k,2,infinity) kaleidoscopes, k has to be three or larger
  * the larger circles touch the poincare disc border of the other one
  * @method circleScope.doubleTriangleK2infty
  * @param {integer} k - basic dihedral order, 3 or larger
  * @param {float} r - radius of first circle
  */
 circleScope.doubleTriangleK2infty = function(k, r) {
     k = Math.max(3, k);
     circleScope.setDihedral(k);
     const sinPIK = Fast.sin(Math.PI / k);
     const cosPIK = Fast.cos(Math.PI / k);
     const tanPIK = sinPIK / cosPIK;
     const center1 = new Vector2(r / sinPIK, 0);
     const radius2 = tanPIK * r * (1 + 1 / sinPIK);

     const center2 = new Vector2(r + center1.x, radius2);
     circleScope.circle1 = new Circle(r, center1);
     circleScope.circle1.map = circleScope.circle1.invertInsideOut;

     circleScope.circle2 = new Circle(radius2, center2);
     circleScope.circle2.map = circleScope.circle2.invertInsideOut;

     circleScope.setDiscRadius(center2.x);
     circleScope.discCutoff = false;
     circleScope.discRemap = false;
     circleScope.discRemapForImage = true;

     circleScope.setMapping();

 };



 /**
  * a chain of two circles with same radius and adjustable intersection angle 
  * @method circleScope.chaink2n2
  * @param {integer} k - rotational symmetry of all
  * @param {float} radius
  * @param {float} x - position of upper circle center
  * @param {integer} n - rotational symmetry at intersection of circles
  */
 circleScope.chaink2n2 = function(k, radius, x, n) {
     k = Math.max(3, k);
     circleScope.setDihedral(k);
     const d = 2 * radius * Fast.cos(0.5 * Math.PI / n);
     const y = Math.min(x * Math.tan(Math.PI / k), d);
     const center1 = new Vector2(x, y);
     const center2x = x + Math.sqrt(d * d - y * y);
     const center2 = new Vector2(center2x, 0);
     const middle = Vector2.middle(center1, center2);
     center1.log("c1");
     center2.log("c2");
     middle.log();
     circleScope.discRadius = middle.length();


     console.log(circleScope.discRadius);
     circleScope.discCutoff = false;
     circleScope.discRemap = false;
     circleScope.discRemapForImage = true;


     circleScope.circle1 = new Circle(radius, center1);
     circleScope.circle1.map = circleScope.circle1.invertInsideOut;
     //   circleScope.circle2 = new Circle(radius, center2);
     //   circleScope.circle2.map = circleScope.circle2.invertInsideOut;

     circleScope.setMapping();


 };

 /**
  * combination of two circles, touching each others wolrdradius
  * imnsideOut
  * choose radius and distance of center from origin of first circle
  * intersection symmetry of circles
  * angle for first circle
  * @method circleScope.twoCirclesWorld
  * @param {float} radius1
  * @param {float} distance1
  * @param {integer} n - symmetry at intersection
  * @param {float} angle1
  */
 circleScope.twoCirclesWorld = function(radius1, distance1, n, angle1) {
     const ratio = Math.sqrt((distance1 + radius1) / (distance1 - radius1));
     console.log("tau", ratio);
     const distance2 = ratio * distance1;
     const radius2 = ratio * radius1;


     const beta = Math.PI / n;
     const distance = Math.sqrt(radius1 * radius1 + radius2 * radius2 - 2 * radius1 * radius2 * Math.cos(Math.PI - beta));
     const deltaPhi = Math.acos((distance1 * distance1 + distance2 * distance2 - distance * distance) / 2 / distance1 / distance2);
     const angle2 = angle1 + deltaPhi;
     circleScope.circle1 = new Circle(radius1);
     circleScope.circle1.center.setPolar(distance1, angle1);
     circleScope.circle1.map = circleScope.circle1.invertInsideOut;
     circleScope.circle2 = new Circle(radius2);
     circleScope.circle2.center.setPolar(distance2, angle2);
     circleScope.circle2.map = circleScope.circle2.invertInsideOut;

 };
