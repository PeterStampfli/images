/* jshint esversion: 6 */

import {
    output,
    guiUtils,
    MouseEvents
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

// invert y-axis: attribute  'transform': SVG.invertYAxis
SVG.invertYAxis = 'matrix(1 0 0 1 0 0)';

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
    // offset relative to viewBox image size
    const SVGWidth = output.divWidth;
    const SVGHeight = output.divHeight;
    // view=svg*viewScale
    const viewScale = Math.max(SVG.viewMinWidth / SVGWidth, SVG.viewMinHeight / SVGHeight);
    const viewHeight = Math.round(viewScale * SVGHeight);
    const viewWidth = Math.round(viewScale * SVGWidth);
    const cornerX = -Math.round(SVG.viewShiftX * viewWidth);
    const cornerY = -Math.round(SVG.viewShiftY * viewHeight);
    const viewBoxData = cornerX + ' ' + cornerY + ' ' + viewWidth + ' ' + viewHeight;
    guiUtils.setAttributes(SVG.element, {
        width: SVGWidth,
        height: SVGHeight,
        viewBox: viewBoxData
    });
    SVG.group = SVG.element;
    SVG.text = '<svg\n';
    SVG.text += stringOfAttributes({
        version: 1.1,
        xmlns: SVGns,
        height: SVGHeight,
        width: SVGWidth,
        viewBox: viewBoxData
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
    SVG.text += '<g\n';
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
 * create an open polyline path, use for fill and stroke
 * @method SVP.createPolyline
 * @params [float] coordinates - array of x,y coordinate pairs for corners of the polygon, or array
 * @params Object attributes, optional,default is empty object
 */
SVG.createPolyline = function(coordinates, attributes = {}) {
    let pointsString = coordinates[0].toPrecision(3) + ',' + coordinates[1].toPrecision(3);
    length = coordinates.length;
    for (let i = 2; i < length; i += 2) {
        pointsString += ' ' + coordinates[i].toPrecision(3) + ',' + coordinates[i + 1].toPrecision(3);
    }
    attributes.points = pointsString;
    SVG.create('polyline', attributes);
};

/**
 * create an closed polygon path, use for fill and stroke
 * @method SVP.createPolygon
 * @params [float] coordinates - array of x,y coordinate pairs for corners of the polygon, or array
 * @params Object attributes, optional,default is empty object
 */
SVG.createPolygon = function(coordinates, attributes = {}) {
    let pointsString = coordinates[0].toPrecision(3) + ',' + coordinates[1].toPrecision(3);
    length = coordinates.length;
    for (let i = 2; i < length; i += 2) {
        pointsString += ' ' + coordinates[i].toPrecision(3) + ',' + coordinates[i + 1].toPrecision(3);
    }
    attributes.points = pointsString;
    SVG.create('polygon', attributes);
};

/**
 * create a circle, use for fill and stroke
 * @method SVP.createCircle
 * @params float centerX
 * @params float centerY
 * @params float radius
 * @params Object attributes, optional,default is empty object
 */
SVG.createCircle = function(centerX, centerY, radius, attributes = {}) {
    attributes.cx = centerX.toPrecision(3);
    attributes.cy = centerY.toPrecision(3);
    attributes.r = radius.toPrecision(3);
    SVG.create('circle', attributes);
};

// upon resize: redraw
function resizeDraw() {
    SVG.draw();
}

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
    output.div.style.cursor = "pointer";
    SVG.mouseEvents = new MouseEvents(output.div);
    const mouseEvents = SVG.mouseEvents;
    mouseEvents.dragAction = function() {
        SVG.setViewShifts(SVG.viewShiftX + mouseEvents.dx / output.divWidth, SVG.viewShiftY + mouseEvents.dy / output.divHeight);
        SVG.draw();
    };
    mouseEvents.wheelAction = function() {
        const delta = mouseEvents.wheelDelta * 0.1;
        SVG.setMinViewWidthHeight((1 + delta) * SVG.viewMinWidth, (1 + delta) * SVG.viewMinHeight);
        SVG.setViewShifts(0.5 + (SVG.viewShiftX - 0.5) / (1 + delta), 0.5 + (SVG.viewShiftY - 0.5) / (1 + delta));
        SVG.draw();
    };
    SVG.element = document.createElementNS(SVGns, 'svg');
    guiUtils.setParent(output.div, SVG.element);
    window.addEventListener("resize", resizeDraw, false);
};