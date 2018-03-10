/*
 * how everything goes together
 */

/*
 * 
 * outputImage.map.make: pixel index (i,j) --> mapIn: coordinates (x,y) --> mapOut: (x,y) as function of mapIn (x,y)
 * 
 *                                         ^
 *                                         |
 * 
 *      outputImage.mouseEvents -> shift, scale (at mouse position as center)
 * 
 * 
 * outputImage.map.draw:              mapOut(x,y) --> image coordinates  --> inputImage
 * 
 *                                               ^    ^
 * arrowController.mouseEvents:                  |    |
 *           angle --> rotation around center of map  |
 * controlImage.mouseEvents: -> shift, scale (at origin (0,0) of map, can shift the map to put center at zero ...(avoiding interference...))
 */

/*
 * shift, scale on output image, resize image -> re make map, re draw
 * 
 * arrow controller changes angle -> correct rotation and position to get rotation around center of gravity, re draw
 *  wheel event on controlImage - > similar
 * mouse shift on controll image - > shift position, re draw
 */
