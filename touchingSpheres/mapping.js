/* jshint esversion: 6 */


export const mapping = {};

// colors depending on origin
const colors = ['#ff0000', '#ffff00', '#00ff00', '#ff8800', '#ff00ff', '#00ffff'];

// switching the first 5 mapping spheres on or off
mapping.on = [true, true, true, true, true];

mapping.spheres = [];

/* mapping spheres have these fields:
on (boolean, for switching on or off)
color (string, special color, origin)
x (coordinate of center in fixed coordinates)
y (coordinate of center in fixed coordinates)
z (coordinate of center in fixed coordinates)
radius (of the inverting sphere)
viewX (coordinate of center for view)
viewY (coordinate of center for view)
viewZ (coordinate of center for view)
viewRadius (of the sphere as visible)
imageSpheres (Array of image sphere objects)
points (Array of Float32Array(3) for coordinates of limit points in fixed coordinates)
viewPoints (Array of Float32Array(3) for coordinates of transformed points as shown)
*/

/* image spheres have these fields
color (string, special color, origin)
x (coordinate of center in fixed coordinates)
y (coordinate of center in fixed coordinates)
z (coordinate of center in fixed coordinates)
radius (of the inverting sphere)
viewX (coordinate of center for view)
viewY (coordinate of center for view)
viewZ (coordinate of center for view)
viewRadius (of the sphere as visible)
*/

//mapping.config=mapping.tetrahedron;
mapping.maxGeneration = 100;
mapping.minGeneration = 6; // minimum number for creating image spheres
mapping.minRadius = 0.001; // critical radius for terminating and writing a point

mapping.tetrahedron = function() {};