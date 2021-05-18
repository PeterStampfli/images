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
const fromDeg = 1 / toDeg;
// abreviations for functions
const cos = Math.cos;
const sin = Math.sin;
const tan = Math.tan;
const round = Math.round;
const sqrt = Math.sqrt;
const abs = Math.abs;
// trigonometry
const rt3 = 1.732050808;
const tanPi10 = Math.tan(pi / 10);
const tan3Pi10 = Math.tan(3 * pi / 10);
const cosPi5 = Math.cos(pi / 5);
const sinPi5 = Math.sin(pi / 5);
const cos2Pi5 = Math.cos(2 * pi / 5);
const sin2Pi5 = Math.sin(2 * pi / 5);
const cos3Pi5 = Math.cos(3 * pi / 5);
const sin3Pi5 = Math.sin(3 * pi / 5);
const cos4Pi5 = Math.cos(4 * pi / 5);
const sin4Pi5 = Math.sin(4 * pi / 5);

// dihedral groups and mirrors
geometry.d12 = 5;
geometry.d13 = 3;
geometry.d23 = 2;
geometry.d14 = 2;
geometry.d24 = 2;
geometry.d34 = 3;
geometry.tiling='ikosahedral 533';