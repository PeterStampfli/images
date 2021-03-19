/* jshint esversion: 6 */

import {
    map,
    log
} from "../libgui/modules.js";

/**
 * @namespace geometry
 */
export const geometry = {};

// constants
const eps = 0.001;
const eps2 = eps * eps;
const pi = Math.PI;
const toDeg = 180 / pi;
const fromDeg = 1/toDeg;
// abreviations for functions
const cos = Math.cos;
const sin = Math.sin;
const tan = Math.tan;
const round = Math.round;
const sqrt = Math.sqrt;
const abs = Math.abs;

// dihedral groups and mirrors
geometry.d12=5;
geometry.d13=3;
geometry.d23=2;
geometry.useFourthMirror = true;
geometry.d14 = 2;
geometry.d24 = 3;
geometry.d34 = 5;
geometry.useFifthMirror=true;
geometry.d15=3;
geometry.d25=3;
geometry.d35=3;
geometry.d45=3;

// rotation angles
geometry.xyAngle=0;
geometry.xzAngle=0;

// radius relative to the hyperbolic radius
geometry.radius=0.9;

// first map xy to sphere with normal projection
// rotate in xy plane
// rotate in xz plane
// repeat mirrors
// normalize vector plus stereographic map to xy plane
// or normal projection (to xy? plane)