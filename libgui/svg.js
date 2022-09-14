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

// drawing upon resizing
SVG.draw = function() {
    alert('SVG.draw function undefined');
};

// for the viewbox
// relative shift for centering
SVG.viewShiftX = 0.5;
SVG.viewShiftY = 0.5;
// minimum view, full axis
SVG.viewMinWidth = 200;
SVG.viewMinHeight = 200;

/**
 * making the gui for the image, independent of the initialization of svg
 * thus can have this on top, and initialize svg towards the end
 * @method SVG.makeGui
 * @param paramGui gui
 */
SVG.makeGui = function(gui) {
    gui = gui.addFolder('output image', {
        closed: false
    });
    SVG.gui = gui;
    // the save button and text field for changing the name
    SVG.saveButton = gui.add({
        type: "button",
        buttonText: "save",
        minLabelWidth: 20,
        onClick: function() {
            guiUtils.saveTextAsFile(SVG.text, SVG.saveName.getValue(), 'svg');
        }
    });
    SVG.saveName = SVG.saveButton.add({
        type: "text",
        initialValue: "image",
        labelText: "as",
        textInputWidth: 150,
        minLabelWidth: 20
    });
    SVG.viewMinWidthController = gui.add({
        type: 'number',
        params: SVG,
        property: 'viewMinWidth',
        labelText: 'min width',
        min: 0,
        step: 1,
        onChange: function() {
            SVG.draw();
        }
    });
    SVG.viewMinHeightController = SVG.viewMinWidthController.add({
        type: 'number',
        params: SVG,
        property: 'viewMinHeight',
        labelText: 'height',
        min: 0,
        step: 1,
        onChange: function() {
            SVG.draw();
        }
    });
    SVG.viewShiftXController = gui.add({
        type: 'number',
        params: SVG,
        property: 'viewShiftX',
        labelText: 'shift x',
        onChange: function() {
            SVG.draw();
        }
    });
    SVG.viewShiftYController = SVG.viewShiftXController.add({
        type: 'number',
        params: SVG,
        property: 'viewShiftY',
        labelText: 'shift y',
        onChange: function() {
            SVG.draw();
        }
    });
};

/**
 * set value for min width and height for view
 * @method SVG.setMinViewWidthHeight
 * @param integer minWidth
 * @param integer minHeight
 */
SVG.setMinViewWidthHeight = function(minWidth, minHeight) {
    SVG.viewMinWidthController.setValueOnly(minWidth);
    SVG.viewMinHeightController.setValueOnly(minHeight);
};

/**
 * set value for shifts for view
 * @method SVG.setViewShifts
 * @param float shiftX
 * @param float shiftY
 */
SVG.setViewShifts = function(shiftX, shiftY) {
    SVG.viewShiftXController.setValueOnly(shiftX);
    SVG.viewShiftYController.setValueOnly(shiftY);
};

// define svg namespace
const SVGns = 'http://www.w3.org/2000/svg';

// SVG.element is the actual 'svg' element
// SVG.group is the group (or 'svg' element) where drawing elements are to be added

// SVG.text the svg as text

// transform an attribute object into a string for svg syntax
function stringOfAttributes(attributes) {
    let result = '';
    for (var key in attributes) {
        result += '   ' + key + '="' + attributes[key] + '"\n';
    }
    return result;
}

/**
 * begin the svg for a new image, including text code
 * set width and height, fit to window
 * set viewbox
 * @method SVG.begin
 */
SVG.begin = function() {
    while (SVG.element.lastChild) {
        SVG.element.removeChild(SVG.element.lastChild);
    }
    // for viewbox: minimum widths and heights given
    // viewbox corner, then width and height
    // offset relative to svg image size
    const SVGWidth = output.divWidth;
    const SVGHeight = output.divHeight;
    console.log(SVGWidth, SVGHeight);
    // view=svg*viewScale
    const viewScale = Math.max(SVG.viewMinWidth / SVGWidth, SVG.viewMinHeight / SVGHeight);
    const viewHeight = Math.round(viewScale * SVGHeight);
    const viewWidth = Math.round(viewScale * SVGWidth);
    console.log(viewScale, viewWidth, viewHeight);
    const cornerX = -Math.round(SVG.viewShiftX * SVGWidth);
    const cornerY = -Math.round(SVG.viewShiftY * SVGHeight);
    const viewBoxData = cornerX + ' ' + cornerY + ' ' + viewWidth + ' ' + viewHeight;
    console.log(viewBoxData);
    guiUtils.setAttributes(SVG.element, {
        width: SVGWidth,
        height: SVGHeight,
    });
    SVG.group = SVG.element;
    SVG.text = '<svg\n';
    SVG.text += stringOfAttributes({
        version: 1.1,
        height: SVGHeight,
        width: SVGWidth,
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
 * make an svg group, if there is one, terminate it
 * no nested groups
 * @method SVG.createGroup
 * @param object attributes, as name,value pairs that define attributes
 */
SVG.createGroup = function(attributes) {
    if (SVG.group !== SVG.element) {
        SVG.text += '</g>\n';
    }
    SVG.group = document.createElementNS(SVGns, 'g');
    guiUtils.setParent(SVG.element, SVG.group);
    guiUtils.setAttributes(SVG.group, attributes);
    SVG.text = '<g\n';
    SVG.text += stringOfAttributes(attributes);
    SVG.text += '/>\n';
};

/**
 * make an svg text
 * @method SVG.createText
 * @param object attributes, as name,value pairs that define attributes
 * @param String text
 */
SVG.createText = function(attributes, text) {
    const textElement = document.createElementNS(SVGns, 'text');
    guiUtils.setParent(SVG.group, textElement);
    guiUtils.setAttributes(textElement, attributes);
    const textNode = document.createTextNode(text);
    guiUtils.setParent(textElement, textNode);
    SVG.text += '<text\n';
    SVG.text += stringOfAttributes(attributes);
    SVG.text += '>\n';
    SVG.text += text;
    SVG.text += '</text>';
};

/**
 * make an svg element
 * @method SVG.create
 * @param String tag
 * @param object attributes, as name,value pairs that define attributes
 */
SVG.create = function(tag, attributes) {
    const newElement = document.createElementNS(SVGns, tag);
    guiUtils.setParent(SVG.group, newElement);
    guiUtils.setAttributes(newElement, attributes);
    SVG.text += '<' + tag + '\n';
    SVG.text += stringOfAttributes(attributes);
    SVG.text += '/>\n';
};

/**
 * setup/initialize the svg, inside the output.div
 * @method SVG.init
 */
SVG.init = function() {
    if (SVG.element) {
        console.error("SVG.init: svg element exists already!");
        return;
    }
    if (!output.div) {
        output.createDiv();
    }
    console.log(output.divWidth, output.divHeight);
    SVG.element = document.createElementNS(SVGns, 'svg');
    guiUtils.setParent(output.div, SVG.element);
};