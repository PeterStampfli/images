/* jshint esversion: 6 */

import {
    ParamGui,
    output,
    BooleanButton,
    guiUtils
}
from "../libgui/modules.js";

/**
 * set parent for given element or array of elements
 * @param {DOMElement} parent
 * @param DOMElement or [DOMElements] elements
 */
guiUtils.setParent = function(parent, elements) {
    if (Array.isArray(elements)) {
        elements.forEach(element => parent.appendChild(element));
    } else {
        parent.appendChild(elements);
    }
};




// set attributes of a gui element

function setAttributes(element, attributes) {
    for (var key in attributes) {
        element.setAttribute(key, attributes[key]);
    }
}

const gui = new ParamGui({
    closed: false
});

const svgns = 'http://www.w3.org/2000/svg';

const svg = document.createElementNS(svgns, 'svg');
document.body.appendChild(svg);

//svg.setAttribute('width','400');
//svg.setAttribute('height','400');
setAttributes(svg, {
    width: '500',
    height: '400'
});

const rect = document.createElementNS(svgns, 'rect');
rect.setAttribute('width', '500');
rect.setAttribute('height', '400');
rect.setAttribute('fill', 'blue');
svg.appendChild(rect);