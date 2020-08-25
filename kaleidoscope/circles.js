/* jshint esversion: 6 */

import {
    map,
    guiUtils
} from "../libgui/modules.js";

import {
    Circle,
    intersections
} from './modules.js';

/**
 * collection of circles
 * @namespace circles
 */

export const circles = {};

// collecting the circles
circles.collection = [];
// a selected circle
circles.selected = false;
// the other selected circle (making intersections)
circles.otherSelected = false;

// ids and colors for circles
// we have to use id numbers, not indices for the array
// because we may delete elements of the collection array
// we need id numbers to reconstruct intersections between circles (presets, saving the structure)

let id = -1;

/**
 * get an id number
 * @method circles.getId
 * @return integer id
 */
circles.getId = function() {
    id += 1;
    return id;
};

let colorIndex = -1;
const colors = ['#ff0000', '#00ff00', '#ff00ff', '#0000ff', '#000000'];

/**
 * get a color
 * @method circles.getColor
 * @return string, defines color
 */
circles.getColor = function() {
    colorIndex += 1;
    if (colorIndex >= colors.length) {
        colorIndex -= colors.length;
    }
    return colors[colorIndex];
};

// adding and removing circles

/**
 * make a circle and add to the collection, set its id and color
 * @method circles.add
 * @param{object} properties - optional, with fields: radius, centerX, centerY, isOutsideInMap (all optional)
 * @return the circle
 */
circles.add = function(properties = {}) {
    properties.id = circles.getId();
    properties.color = circles.getColor();
    const circle = new Circle(circles.gui, properties); // this creates a unique new circle, which is not in the collection
    circles.collection.push(circle);
    circles.setSelected(circle);
    return circle;
};

/**
 * remove a circle from the collection
 * beware if selected
 * @method circles.remove
 * @param {Circle} circle
 */
circles.remove = function(circle) {
    const index = circles.collection.indexOf(circle);
    if (index >= 0) {
        circles.collection.splice(index, 1);
    } else {
        console.error('circles.remove: circle not found. It is:');
        console.log(circle);
    }
    if (circles.selected === circle) {
        circles.selected = circles.otherSelected;
        circles.otherSelected = false;
    }
    if (circles.otherSelected === circle) {
        circles.otherSelected = false;
    }
    circles.activateUI();
    intersections.activateUI();
};

/**
 * destroy all circles
 * @method circles.clear
 */
circles.clear = function() {
    circles.collection.forEach(circle => circle.destroy());
    circles.collection.length = 0;
};

/**
 * make an array of properties for the circles, stringify it in JSON
 * @method circles.getJSON
 * @return JSON string
 */
circles.getJSON = function() {
    const result = [];
    circles.collection.forEach(circle => result.push(circle.getProperties()));
    return JSON.stringify(result);
};

/**
 * set the array of circles from a JSON string
 * @method circles.setJSON
 * @param {string} json
 */
circles.setJSON = function(json) {
    const input = JSON.parse(json);
    circles.clear();
    input.forEach(properties => circles.add(properties));
};

/**
 * draw the circles
 * highlight selected circle
 * @method circles.draw
 */
circles.draw = function() {
    if (circles.otherSelected) {
        circles.otherSelected.draw(2);
    }
    if (circles.selected) {
        circles.selected.draw(1);
    }
    circles.collection.forEach(circle => circle.draw(0));
};

// interaction with the mouse
//==================================================

/**
 * make the gui and add some buttons
 * @method circles.makeGui
 * @param{Paramgui} parentGui
 * @param{Object} args - optional, modifying the gui
 */
circles.makeGui = function(parentGui, args = {}) {
    circles.gui = parentGui.addFolder('circles',{closed:false}, args);
    circles.gui.add({
        type: 'button',
        buttonText: 'add circle',
        onClick: function() {
            circles.add();
            intersections.activateUI();
            map.drawMapChanged();
        }
    });
    circles.deleteButton = circles.gui.add({
        type: 'button',
        buttonText: 'delete selected',
        onClick: function() {
            if (guiUtils.isObject(circles.selected)) {
                circles.selected.destroy();
                intersections.activateUI();
                map.drawMapChanged();
            }
        }
    });
    circles.activateUI();
};

/**
 * activate the UI (the dlete button depending whether there is a circle left over)
 * @method circles.activateUI
 */
circles.activateUI = function() {
    circles.deleteButton.setActive(guiUtils.isObject(circles.selected));
};

/**
 * check if a circle is selected depending on (mouse) position
 * for a mouse ctrl move action
 * @method circles.isSelected
 * @param {object} position - with (x,y) fields
 * @return boolean, true if a circle is selected
 */
circles.isSelected = function(position) {
    const length = circles.collection.length;
    for (var i = 0; i < length; i++) {
        if (circles.collection[i].isSelected(position)) {
            return true;
        }
    }
    return false;
};

/**
 * set a circle as selected, and set that it can be deleted
 * note already selected circle as other selected circle (for making intersections)
 * select the corresponding intersection, if there is one
 * @method circles.setSelected
 * @param {Circle} circle
 */
circles.setSelected = function(circle) {
    // do only something if circle not selected
    if (circle !== circles.selected) {
        circles.otherSelected = circles.selected;
        circles.selected = circle;
        const index = intersections.indexOf(circles.selected, circles.otherSelected);
        if (index >= 0) {
            intersections.selected = intersections.collection[index];
        } else {
            intersections.selected = false;
        }
        circles.activateUI();
        intersections.activateUI();
    }
};

/**
 * select a circle depending on (mouse) position
 * for a mouse ctrl down event
 * @method circles.select
 * @param {object} position - with (x,y) fields
 */
circles.select = function(position) {
    const length = circles.collection.length;
    for (var i = 0; i < length; i++) {
        if (circles.collection[i].isSelected(position)) {
            circles.setSelected(circles.collection[i]);
            return;
        }
    }
};

/**
 * wheel action on the selected circle
 * actually depends on its intersections (but that's its problem)
 * @method circles.wheelAction
 * @param {object} event - with wheel data
 */
circles.wheelAction = function(event) {
    if (circles.selected) {
        circles.selected.wheelAction(event);
    }
};

/**
 * drag action on the selected circle
 * actually depends on its intersections (but that's its problem)
 * @method circles.dragAction
 * @param {object} event - with wheel data
 */
circles.dragAction = function(event) {
    if (circles.selected) {
        circles.selected.dragAction(event);
    }
};

// mapping
//==================================

// basic, rudimentary

// max number of iterations
const maxIterations = 20;

/**
 * mapping, using the circles, repeat until no more mapping
 * or maximum number of iterations
 * @method circles.map
 * @param {object} point - with x,y,structureIndex and valid fields
 */
circles.map = function(point) {
    const collectionLength = circles.collection.length;
    for (var i = 0; i < maxIterations; i++) {
        let mapped = false;
        for (var j = 0; j < collectionLength; j++) {
            if (circles.collection[j].map(point)) {
                mapped = true;
                point.structureIndex += 1;
            }
        }
        if (!mapped) {
            return;
        }
    }
    point.valid = -1; // invalid position/pixel
};

// determine target regions of the mapping
//===========================================

// for each pixel
// number of the target region its mapping goees to
// region 0 contains infinity
// region 255 is not a target
// region 254 is unspecified target
circles.targetRegions = new Uint8Array(1);

/**
 * determine of a point is inside any target region of combined mapping
 * @method circles.isInTarget
 * @param {object} position - with x and y fields, such as mouseEvents
 * @return boolean, true if in target region (inside for outsideIn)
 */
circles.isInTarget = function(position) {
    const length = circles.collection.length;
    const collection = circles.collection;
    for (var i = 0; i < length; i++) {
        if (!collection[i].isInTarget(position)) {
            return false;
        }
    }
    return true;
};