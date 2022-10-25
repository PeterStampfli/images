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

// inverted y-axis: scale=-1
// for clipping to the viewbox
let scaleY = 1;

// for the viewbox
// relative shift for centering
SVG.viewShiftX = 0.5;
SVG.viewShiftY = 0.5;
// minimum view, full axis
SVG.viewMinWidth = 1000;
SVG.viewMinHeight = 1000;

//viewbox data for clipping
var viewBoxLeft, viewBoxRight, viewBoxBottom, viewBoxTop;

// flag for writing on screen or text file, default is true
SVG.onScreen = true;
// flag for open group
SVG.openGroup = false;

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
            SVG.onScreen = false;
            SVG.draw();
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
        result += key + '="' + attributes[key] + '"\n';
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
    SVG.openGroup = false;
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
    viewBoxLeft = cornerX;
    viewBoxRight = cornerX + viewWidth;
    viewBoxBottom = cornerY;
    viewBoxTop = cornerY + viewHeight;
    const viewBoxData = cornerX + ' ' + cornerY + ' ' + viewWidth + ' ' + viewHeight;
    if (SVG.onScreen) {
        if (SVG.element.parentNode) {
            output.div.removeChild(SVG.element);
        }
        while (SVG.element.lastChild) {
            SVG.element.removeChild(SVG.element.lastChild);
        }
        guiUtils.setAttributes(SVG.element, {
            width: SVGWidth,
            height: SVGHeight,
            viewBox: viewBoxData
        });
        SVG.group = SVG.element;
    } else {
        SVG.text = '<svg\n';
        SVG.text += stringOfAttributes({
            version: 1.1,
            xmlns: SVGns,
            height: SVGHeight,
            width: SVGWidth,
            viewBox: viewBoxData
        });
        SVG.text += '>\n';
    }
};

/**
 * terminate the svg (text), and the group (text), add SVG to DOM if onscreen, reset to default onscreen=true
 * @method SVG.terminate
 */
SVG.terminate = function() {
    if (SVG.onScreen) {
        output.div.appendChild(SVG.element);
    } else {
        if (SVG.openGroup) {
            SVG.text += '</g>';
        }
        SVG.text += '</svg>';
    }
    SVG.onScreen = true;
};

/**
 * make an svg group, if there is one, terminate it
 * no nested groups, once a group is created, there will always be groups
 * @method SVG.createGroup
 * @param object attributes, as name,value pairs that define attributes
 */
SVG.createGroup = function(attributes) {
    if (SVG.onScreen) {
        SVG.group = document.createElementNS(SVGns, 'g');
        guiUtils.setParent(SVG.element, SVG.group);
        guiUtils.setAttributes(SVG.group, attributes);
    } else {
        if (SVG.openGroup) {
            SVG.text += '</g>\n';
        }
        SVG.text += '<g\n';
        SVG.text += stringOfAttributes(attributes);
        SVG.text += '>\n';
    }
    SVG.openGroup = true;
};

/**
 * make an svg text
 * @method SVG.createText
 * @param object attributes, as name,value pairs that define attributes
 * @param String text
 */
SVG.createText = function(attributes, text) {
    if (SVG.onScreen) {
        const textElement = document.createElementNS(SVGns, 'text');
        guiUtils.setParent(SVG.group, textElement);
        guiUtils.setAttributes(textElement, attributes);
        const textNode = document.createTextNode(text);
        guiUtils.setParent(textElement, textNode);
    } else {
        SVG.text += '<text\n';
        SVG.text += stringOfAttributes(attributes);
        SVG.text += '>\n';
        SVG.text += text;
        SVG.text += '</text>';
    }
};

/**
 * make an svg element
 * @method SVG.create
 * @param String tag
 * @param object attributes, as name,value pairs that define attributes
 */
SVG.create = function(tag, attributes) {
    if (SVG.onScreen) {
        const newElement = document.createElementNS(SVGns, tag);
        guiUtils.setParent(SVG.group, newElement);
        guiUtils.setAttributes(newElement, attributes);
    } else {
        SVG.text += '<' + tag + '\n';
        SVG.text += stringOfAttributes(attributes);
        SVG.text += '/>\n';
    }
};

/**
 * test if an array of coordinates is not outside the viewbox
 * @method notOutsideViewBox
 * @param [float] coordinates
 * @return boolean
 */
function isNotOutsideViewBox(coordinates) {
    length = coordinates.length;
    // check if all points at left
    let isAtLeft = true;
    for (let i = 0; i < length; i += 2) {
        if (coordinates[i] > viewBoxLeft) {
            isAtLeft = false;
            break;
        }
    }
    if (isAtLeft) {
        return false;
    }
    let isAtRight = true;
    for (let i = 0; i < length; i += 2) {
        if (coordinates[i] < viewBoxRight) {
            isAtRight = false;
            break;
        }
    }
    if (isAtRight) {
        return false;
    }
    let isBelow = true;
    for (let i = 1; i < length; i += 2) {
        if (scaleY * coordinates[i] > viewBoxBottom) {
            isBelow = false;
            break;
        }
    }
    if (isBelow) {
        return false;
    }
    let isAbove = true;
    for (let i = 1; i < length; i += 2) {
        if (scaleY * coordinates[i] < viewBoxTop) {
            isAbove = false;
            break;
        }
    }
    if (isAbove) {
        return false;
    }
    return true;
}

// scale a number (component of coordinates) and make it a string
function stringOf(number) {
    if (Math.abs(number) > 300) {
        return Math.round(number);
    } else {
        return number.toFixed(1);
    }
}

// make a string out of coordinate pairs
function makeString(coordinates) {
    let pointsString = stringOf(coordinates[0]) + ',' + stringOf(coordinates[1]);
    length = coordinates.length;
    for (let i = 2; i < length; i += 2) {
        pointsString += ' ' + stringOf(coordinates[i]) + ',' + stringOf(coordinates[i + 1]);
    }
    return pointsString;
}

/**
 * create an open polyline path, use for fill and stroke
 * @method SVP.createPolyline
 * @params [float] coordinates - array of x,y coordinate pairs for corners of the polygon, or array
 * @params Object attributes, optional,default is empty object
 */
SVG.createPolyline = function(coordinates, attributes = {}) {
    if (isNotOutsideViewBox(coordinates)) {
        attributes.points = makeString(coordinates);
        SVG.create('polyline', attributes);
    }
};

/**
 * create an closed polygon path, use for fill and stroke
 * @method SVP.createPolygon
 * @params [float] coordinates - array of x,y coordinate pairs for corners of the polygon, or array
 * @params Object attributes, optional,default is empty object
 */
SVG.createPolygon = function(coordinates, attributes = {}) {
    if (isNotOutsideViewBox(coordinates)) {
        attributes.points = makeString(coordinates);
        SVG.create('polygon', attributes);
    }
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
    if ((centerX + radius > viewBoxLeft) && (centerX - radius < viewBoxRight) && (scaleY * centerY + radius > viewBoxBottom) && (scaleY * centerY - radius < viewBoxTop)) {
        attributes.cx = stringOf(centerX);
        attributes.cy = stringOf(centerY);
        attributes.r = stringOf(radius);
        SVG.create('circle', attributes);
    }
};

/**
 * create an arc, only the stroke, set fill:'none' explicitely
 * @method SVG.createArcStroke
 * @params float centerX
 * @params float centerY
 * @params float radius
 * @params float startAngle
 * @params float endAngle
 * @params boolean counterclockwise
 * @params Object attributes, optional,default is empty object
 */
SVG.createArcStroke = function(centerX, centerY, radius, startAngle, endAngle, counterclockwise, attributes = {}) {
    var deltaAngle, largeArc, sweep;
    if ((centerX + radius > viewBoxLeft) && (centerX - radius < viewBoxRight) && (scaleY * centerY + radius > viewBoxBottom) && (scaleY * centerY - radius < viewBoxTop)) {
        const startX = centerX + radius * Math.cos(startAngle);
        const startY = centerY + radius * Math.sin(startAngle);
        const endX = centerX + radius * Math.cos(endAngle);
        const endY = centerY + radius * Math.sin(endAngle);
        // reduce angles to intervall between 0 and 2pi
        const zpi = 2 * Math.PI;
        startAngle -= zpi * Math.floor(startAngle / zpi);
        endAngle -= zpi * Math.floor(endAngle / zpi);
        // for counterclock wise
        if (endAngle < startAngle) {
            endAngle += zpi;
        }
        deltaAngle = endAngle - startAngle;
        if (!counterclockwise) {
            deltaAngle = zpi - deltaAngle;
        }
        if (deltaAngle > Math.PI) {
            largeArc = 1;
        } else {
            largeArc = 0;
        }
        let sweep = counterclockwise ? 1:0;
        let d = 'M ' + stringOf(startX) + ' ' + stringOf(startY);
        d += ' A ' + stringOf(radius) + ' ' + stringOf(radius) + ' ' + 0;
        d += ' ' + largeArc + ' ' + sweep;
        d += ' ' + stringOf(endX) + ' ' + stringOf(endY);
        attributes.d = d;
        SVG.create('path', attributes);
    } 
};

/**
 * create an arc, only the fill, set stroke: 'none' explicitely
 * @method SVG.createArcFill
 * @params float centerX
 * @params float centerY
 * @params float radius
 * @params float startAngle
 * @params float endAngle
 * @params boolean counterclockwise
 * @params Object attributes, optional,default is empty object
 */
SVG.createArcFill = function(centerX, centerY, radius, startAngle, endAngle, counterclockwise, attributes = {}) {
    var deltaAngle, largeArc, sweep;
    if ((centerX + radius > viewBoxLeft) && (centerX - radius < viewBoxRight) && (scaleY * centerY + radius > viewBoxBottom) && (scaleY * centerY - radius < viewBoxTop)) {
        const startX = centerX + radius * Math.cos(startAngle);
        const startY = centerY + radius * Math.sin(startAngle);
        const endX = centerX + radius * Math.cos(endAngle);
        const endY = centerY + radius * Math.sin(endAngle);
        // reduce angles to intervall between 0 and 2pi
        const zpi = 2 * Math.PI;
        startAngle -= zpi * Math.floor(startAngle / zpi);
        endAngle -= zpi * Math.floor(endAngle / zpi);
        // for counterclock wise
        if (endAngle < startAngle) {
            endAngle += zpi;
        }
        deltaAngle = endAngle - startAngle;
        if (!counterclockwise) {
            deltaAngle = zpi - deltaAngle;
        }
        if (deltaAngle > Math.PI) {
            largeArc = 1;
        } else {
            largeArc = 0;
        }
        let sweep = counterclockwise ? 1:0;
        let d = 'M ' + stringOf(centerX) + ' ' + stringOf(centerY);
        d += 'L ' + stringOf(startX) + ' ' + stringOf(startY);
        d += ' A ' + stringOf(radius) + ' ' + stringOf(radius) + ' ' + 0;
        d += ' ' + largeArc + ' ' + sweep;
        d += ' ' + stringOf(endX) + ' ' + stringOf(endY);
        attributes.d = d;
        SVG.create('path', attributes);
    } 
};

// upon resize: redraw
function resizeDraw() {
    SVG.draw();
}

/**
 * setup/initialize the svg, inside the output.div
 * @method SVG.init
 * @param boolean, invertedYAxis, default is true
 */
SVG.init = function(invertedYAxis = true) {
    scaleY = (invertedYAxis) ? -1 : 1;
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
    output.div.appendChild(SVG.element);
    window.addEventListener("resize", resizeDraw, false);
};