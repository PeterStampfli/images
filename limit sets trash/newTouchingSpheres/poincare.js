/* jshint esversion: 6 */

import {
	draw
} from './modules.js';

export const poincare={};

poincare.color = '#888888';

poincare.radius=0.5;

poincare.drawSphere = function() {
    draw.sphere(0, 0, poincare.radius, poincare.color);
};

poincare.drawUpperBubble = function() {
    draw.upperBubble(0, 0, poincare.radius, poincare.color);
};

poincare.drawLowerBubble = function() {
    draw.lowerBubble(0, 0, poincare.radius, poincare.color);
};
