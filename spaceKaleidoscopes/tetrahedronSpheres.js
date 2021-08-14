/* jshint esversion: 6 */

import {
    mappingSpheres
} from "./touchingSpheres.js";

export const tetrahedronSpheres={};



mappingSpheres.tetrahedron2d=function(){
// four inverting spheres at the corners of a tetrahedron
const rSphere = 0.8165;
const cx2 = 0.9428;
const cx34 = -0.4714;
const cy3 = 0.8165;
const cy4 = -0.8165;
const cz234 = -0.3333;
// (0,0,1),(cx2,0,cz234),(cx34,cy3,cz234),(cx34,cy4,cz234)
mappingSpheres.add3dto2d
}