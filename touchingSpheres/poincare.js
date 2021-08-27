/* jshint esversion: 6 */

import {
    basics
} from "./basics.js";

export const poincare = {};

poincare.color = '#888888';

poincare.drawCircle = function() {
    basics.drawCircle(0, 0, basics.hyperbolicRadius, poincare.color);
};

poincare.drawSphere = function() {
    basics.drawSphere(0, 0, basics.hyperbolicRadius, poincare.color);
};

poincare.drawUpperBubble = function() {
    basics.drawUpperBubble(0, 0, basics.hyperbolicRadius, poincare.color);
};

poincare.drawLowerBubble = function() {
    basics.drawLowerBubble(0, 0, basics.hyperbolicRadius, poincare.color);
};
