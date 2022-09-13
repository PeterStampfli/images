/* jshint esversion: 6 */

import {
    output,
    guiUtils
}
from "../libgui/modules.js";

/**
 * svg graphics output together with paramgui
 * @namespace SVG
 */

export const SVG = {};

// define svg namespace
const SVGns = 'http://www.w3.org/2000/svg';

// SVG.element is the actual 'svg' element
// SVG.group is the group (or 'svg' element) where drawing elements are to be added

// SVG.text the svg as text

const width = 450;
const height = 400;


// transform an attribute object into a string for svg syntax
function stringOfAttributes(attributes) {
    let result = '';
    for (var key in attributes) {
        result += '   '+key + '="' + attributes[key] + '"\n';
    }
    return result;
}

/**
 * clear the svg for a new image, including text code
 * set width and height
 * @method SVG.clear
 */
SVG.clear = function() {
    while (SVG.element.lastChild) {
        SVG.element.removeChild(SVG.element.lastChild);
    }
    guiUtils.setAttributes(SVG.element, {
        width: width,
        height: height,
    });
    SVG.group = SVG.element;
    SVG.text = '<svg\n';
    SVG.text += stringOfAttributes({
        version:1.1,
        height: height,
        width: width,
        xmlns: SVGns
    });
    SVG.text += '>\n';
};

/**
 * terminate the svg (text), and the group
 * @method SVG.terminate
 */
SVG.terminate = function() {
    if (SVG.group !== SVG.element) {
        SVG.text += '</g>\n';
    }
    SVG.text += '</svg>\n';
};


/**
 * setup/initialize the svg, inside the output.div
 * @method SVG.init
 * @param paramGui gui
 */
SVG.init = function(gui) {
    SVG.element = document.createElementNS(SVGns, 'svg');
    guiUtils.setParent(document.body, SVG.element);
    SVG.clear();

};