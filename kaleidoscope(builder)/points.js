/* jshint esversion: 6 */

import {
    guiUtils,
    output
}
from "../libgui/modules.js";

import {
    julia
} from "./julia.js";

const drawRadius = 5;
const selectionRadius = 6;
const linewidth = 2;
const amplitude = {};
amplitude.real = 2;
amplitude.imag = 0;

// colors
const borderSelected = '#ff8800';
const borderNotSelected = '#000000';
const fill = [];
fill[0] = '#8888ff';
fill[1] = '#ffff00';
fill[2] = '#999999';

// a point object that can be selected and drawn
// inverted y-axis
export const Point = function Point(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
};

Point.zero = 0;
Point.singularity = 1;
Point.neutral = 2;

// set properties of this point equal to another point-like object
// does not update display
Point.prototype.set = function(point) {
    this.x = point.x;
    this.y = point.y;
    this.type = point.type;
};

// return a clone of the point
Point.prototype.clone = function() {
    return new Point(this.x, this.y, this.type);
};

// see if point is selected by position.x, position.y
Point.prototype.isSelected = function(position) {
    let selectionRadius2 = selectionRadius * output.coordinateTransform.totalScale;
    selectionRadius2 = selectionRadius2 * selectionRadius2;
    const dx = position.x - this.x;
    const dy = position.y + this.y;
    return (dx * dx + dy * dy) < selectionRadius2;
};

// draw the point, depending on whether is selected
Point.prototype.draw = function(isSelected) {
    const context = output.canvasContext;
    const radius = drawRadius * output.coordinateTransform.totalScale;
    output.setLineWidth(linewidth);
    if (isSelected) {
        context.strokeStyle = borderSelected;
    } else {
        context.strokeStyle = borderNotSelected;
    }
    context.fillStyle = fill[this.type];
    context.beginPath();
    context.arc(this.x, -this.y, radius, 0, 2 * Math.PI);
    context.fill();
    context.stroke();
};

// drag a point
Point.prototype.drag = function(event) {
    this.x += event.dx;
    this.y -= event.dy;
};

// collecting the points and doing the main work
// particularly rapid calculations

export const points = {};

points.collection = [];

points.clear = function() {
    points.collection.length = 0;
};

points.add = function(point) {
    points.collection.push(point);
    points.setTop(points.collection[points.collection.length - 1]);
};

// check if one of the points is selected, position or event (x,y) fields
points.isSelected = function(position) {
    for (let i = points.collection.length - 1; i >= 0; i--) {
        if (points.collection[i].isSelected(position)) {
            return true;
        }
    }
    return false;
};

// select the point corresponding to event position, move it to top
// (if not at top)
points.select = function(position) {
    const length = points.collection.length;
    for (let i = length - 1; i >= 0; i--) {
        if (points.collection[i].isSelected(position)) {
            const selectedPoint = points.collection[i];
            for (let j = i; j < length - 1; j++) {
                points.collection[j] = points.collection[j + 1];
            }
            points.collection[length - 1] = selectedPoint;
            points.setTop(selectedPoint);
            return;
        }
    }
};

// draw points
points.draw = function() {
    const length = points.collection.length;
    if (length > 0) {
        for (let i = 0; i < length - 1; i++) {
            points.collection[i].draw(false);
        }
        points.collection[length - 1].draw(true);
    }
};

// remove selected point, at top
points.remove = function() {
    points.collection.pop();
    const length = points.collection.length;
    if (length > 0) {
        points.setTop(points.collection[length - 1]);
    }
};

// drag selected point at top
points.drag = function(event) {
    const length = points.collection.length;
    if (length > 0) {
        points.collection[length - 1].drag(event);
        points.setTop(points.collection[length - 1]);
    }
};

// UI

const top = new Point(0, 0, Point.zero);

points.setTop = function(point) {
    points.topXController.setValueOnly(point.x);
    points.topYController.setValueOnly(point.y);
    points.topTypeController.setValueOnly(point.type);
};

// set data of last point equal to top, data changed needs redraw
points.setLastPoint = function() {
    const length = points.collection.length;
    if (length > 0) {
        points.collection[length - 1].set(top);
        julia.drawNewStructure();
    }
};

const config = {};
config.radius = 0.4;
config.n = 5;
config.type = Point.zero;
config.angle = 0;
config.centerX = 0;
config.centerY = 0;

const randomize = {};
randomize.amount = 0.2;

points.setup = function(gui) {
    gui.add({
        type: 'number',
        params: amplitude,
        property: 'real',
        labelText: 'amplitude re',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: amplitude,
        property: 'imag',
        labelText: 'im',
        onChange: julia.drawNewStructure
    });
    // controlling the selected point, deleting and cloning
    gui.addParagraph('selected point:');
    points.topXController = gui.add({
        type: 'number',
        params: top,
        property: 'x',
        labelText: 'position',
        onChange: points.setLastPoint
    });
    points.topYController = points.topXController.add({
        type: 'number',
        params: top,
        property: 'y',
        labelText: '',
        onChange: points.setLastPoint
    });
    points.topTypeController = gui.add({
        type: 'selection',
        params: top,
        property: 'type',
        options: {
            zero: Point.zero,
            singularity: Point.singularity,
            neutral: Point.neutral
        },
        onChange: points.setLastPoint
    });
    gui.add({
        type: 'button',
        buttonText: 'remove',
        onClick: function() {
            points.remove();
            julia.drawNewStructure();
        }
    }).add({
        type: 'button',
        buttonText: 'clone',
        onClick: function() {
            points.add(top.clone());
            julia.drawNewStructure();
        }
    });

    gui.addParagraph('configurations:');
    gui.add({
        type: 'button',
        buttonText: 'randomize',
        onClick: function() {
            const length = points.collection.length;
            for (let i = 0; i < length; i++) {
                const point = points.collection[i];
                point.x += randomize.amount * (Math.random() - 0.5);
                point.y += randomize.amount * (Math.random() - 0.5);
            }
            points.setTop(points.collection[length - 1]);
            julia.drawNewStructure();
        }
    }).add({
        type: 'number',
        params: randomize,
        property: 'amount',
        min: 0
    });
    gui.add({
        type: 'number',
        params: config,
        property: 'n',
        labelText: 'n of points',
        step: 1,
        min: 1
    }).add({
        type: 'selection',
        params: config,
        property: 'type',
        options: {
            zero: Point.zero,
            singularity: Point.singularity,
            neutral: Point.neutral
        }
    });
    gui.add({
        type: 'number',
        params: config,
        property: 'radius',
        min: 0
    }).add({
        type: 'number',
        params: config,
        property: 'angle',
        labelText: 'angle in degrees'
    });
    gui.add({
        type: 'number',
        params: config,
        property: 'centerX',
        labelText: 'center'
    }).add({
        type: 'number',
        params: config,
        property: 'centerY',
        labelText: ''
    });
    gui.add({
        type: 'button',
        buttonText: 'generate',
        onClick: function() {
            const angle = Math.PI / 180 * config.angle;
            const radius = config.radius;
            const dAngle = 2 * Math.PI / config.n;
            for (let i = 0; i < config.n; i++) {
                const x = config.centerX + radius * Math.cos(angle + i * dAngle);
                const y = config.centerY + radius * Math.sin(angle + i * dAngle);
                const point = new Point(x, y, config.type);
                points.add(point);
            }
            julia.drawNewStructure();
        }
    }).add({
        type: 'button',
        buttonText: 'clear',
        onClick: function() {
            console.log('clear');
            points.clear();
            julia.drawNewStructure();
        }
    });

    const saveButton = gui.add({
        type: 'button',
        buttonText: 'save',
        onClick: function() {
            const text = JSON.stringify(points.collection, null, 2);
            console.log(text);
            console.log(saveName.getValue());
            guiUtils.saveTextAsFile(text, saveName.getValue(), 'json');
        }
    });
    const saveName = saveButton.add({
        type: "text",
        initialValue: "points",
        labelText: "as",
        textInputWidth: 150,
        minLabelWidth: 20
    });

    const fileReader = new FileReader();
    var file;

    fileReader.onload = function() {
        let result = fileReader.result;
        try {
            result = JSON.parse(result);
        } catch (err) {
            alert('JSON syntax error in: ' + file.name + '\n\ncheck with https://jsonchecker.com/');
            return;
        }
        console.log(result);
        points.clear();
        result.forEach(point => points.add(new Point(point.x, point.y, point.type)));
        julia.drawNewStructure();
    };

    fileReader.onerror = function() {
        alert("Failed to read file!\n\n" + reader.error);
    };

    // make the button
    const openButton = gui.add({
        type: 'button',
        buttonText: 'open file with points data'
    });
    openButton.uiElement.asFileInput('.json');
    openButton.uiElement.onFileInput = function(files) {
        file = files[0];
        fileReader.readAsText(file);
    };
};

// make table of singularities

const zerosRe = [];
const zerosIm = [];
const singuRe = [];
const singuIm = [];

points.zerosAndSingularities = function() {
    zerosRe.length = 0;
    zerosIm.length = 0;
    singuRe.length = 0;
    singuIm.length = 0;
    const length = points.collection.length;
    for (let i = 0; i < length; i++) {
        const point = points.collection[i];
        if (point.type === Point.zero) {
            zerosRe.push(point.x);
            zerosIm.push(-point.y);
        } else if (point.type === Point.singularity) {
            singuRe.push(point.x);
            singuIm.push(-point.y);
        }
    }
};

const eps = 0.0001;
// evaluate the rational function
points.evaluate = function(point) {
    let zRe=point.x;
    let zIm=point.y;
    // nominator, including amplitude
    let nomRe = amplitude.real;
    let nomIm = amplitude.imag;
    let length = zerosRe.length;
    for (let i = 0; i < length; i++) {
        const re = zRe - zerosRe[i];
        const im = zIm - zerosIm[i];
        const h = re * nomRe - im * nomIm;
        nomIm = re * nomIm + im * nomRe;
        nomRe = h;
    }
    //denominator
    let denRe = 1;
    let denIm = 0;
    length = singuRe.length;
    for (let i = 0; i < length; i++) {
        const re = zRe - singuRe[i];
        const im = zIm - singuIm[i];
        const h = re * denRe - im * denIm;
        denIm = re * denIm + im * denRe;
        denRe = h;
    }
    // division, avoiding div by zero
    const norm = 1 / (denRe * denRe + denIm * denIm + eps);
    point.x = norm * (denRe * nomRe + denIm * nomIm);
    point.y = norm * (nomIm * denRe - nomRe * denIm);
};