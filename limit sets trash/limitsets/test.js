/* jshint esversion: 6 */

import {
    Sphere
} from "./sphere.js";

console.log('hello');
const sphere=Sphere.get(1,2,3,4);
console.log(sphere);
sphere.recycle();