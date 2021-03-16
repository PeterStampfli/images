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