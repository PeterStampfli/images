/* jshint esversion: 6 */

import {
    map,
    guiUtils
} from "../libgui/modules.js";

import {
    Circle
} from './modules.js';

/**
 * collection of mirror objects, such as Circle and Line
 * @ namespace mirrors
 */

export const mirrors = {};

// collecting the mirror objects
mirrors.collection = [];
// a selected mirror
mirrors.selected = false;

// ids and colors for mirror objects

let id = 0;

/**
 * get an id number
 * @method mirror.getId
 * @return integer id
 */
mirrors.getId = function() {
    id += 1;
    return id;
};

let colorIndex = -1;
const colors = ['#ff0000', '#00ff00', '#ff00ff', '#0000ff', '#000000'];

/**
 * get a color
 * @method mirrors.getColor
 * @return string, defines color
 */
mirrors.getColor = function() {
    colorIndex += 1;
    if (colorIndex >= colors.length) {
        colorIndex -= colors.length;
    }
    return colors[colorIndex];
};

// adding and removing mirrors

/**
 * add a mirror object to the collection
 * @method mirrors.addMirror
 * @param {object}mirror - with all "mirror" methods
 */
mirrors.addMirror = function(mirror) {
    const index = mirrors.collection.indexOf(mirror);
    if (index >= 0) {
        console.error('mirrors.add: mirror already there. It is:');
        console.log(mirror);
    } else {
        mirrors.collection.push(mirror);
    }
};

/**
 * remove a mirror from the collection
 * @method mirrors.remove
 * @param {object}mirror - with all "mirror" methods
 */
mirrors.remove = function(mirror) {
    const index = mirrors.collection.indexOf(mirror);
    if (index >= 0) {
        mirrors.collection.splice(index, 1);
    } else {
        console.error('mirrors.remove: mirror not found. It is:');
        console.log(mirror);
    }
};

/**
 * destroy all mirrors
 * @method mirrors.clear
 */
mirrors.clear = function() {
    mirrors.collection.forEach(mirror => mirror.destroy());
    mirrors.collection.length = 0;
};

/**
 * add a circle as mirror
 * @method mirrors.addCircle
 * @param{ParamGui} gui 
 * @param{object} properties - optional, radius, centerX, centerY, isOutsideInMap, color (all optional),id
 * @return the circle
 */
mirrors.addCircle = function(properties) {
    const circle = new Circle(mirrors.gui, properties);
    mirrors.addMirror(circle);
    return circle;
};

/**
 * add a whatever as mirror
 * @method mirrors.add
 * @param{ParamGui} gui 
 * @param{object} properties - mandatory field type:'circle',optionals: radius, centerX, centerY, isOutsideInMap, color (all optional),id
 */
mirrors.add = function(properties) {
    if (properties.type === 'circle') {
        mirrors.addCircle(properties);
    }
};

/**
 * make an array of properties for the mirrors, stringify it in JSON
 * @method mirrors.getJSON
 * @return JSON string
 */
mirrors.getJSON = function() {
    const result = [];
    mirrors.collection.forEach(mirror => result.push(mirror.getProperties()));
    return JSON.stringify(result);
};

/**
 * set the array of mirrors from a JSON string
 * @method mirrors.setJSON
 * @param {string} json
 */
mirrors.setJSON = function(json) {
    const input = JSON.parse(json);
    mirrors.clear();
    input.forEach(properties => mirrors.add(properties));
};

/**
 * draw the mirrors
 * highlight selected circle
 * @method mirrors.draw
 */
mirrors.draw = function() {
    if (mirrors.selected) {
        mirrors.selected.draw(true);
    }
    mirrors.collection.forEach(mirror => mirror.draw(false));
};

// interaction with the mouse
//==================================================

/**
 * make the gui and add some buttons
 * @method mirrors.makeGui
 * @param{Paramgui} parentGui
 */
mirrors.makeGui = function(parentGui) {
    mirrors.gui = parentGui.addFolder('mirrors');
    mirrors.gui.add({
        type: 'button',
        buttonText: 'add circle',
        onClick: function() {
            mirrors.addCircle();
            map.drawMapChanged();
        }
    });
    mirrors.deleteButton = mirrors.gui.add({
        type: 'button',
        buttonText: 'delete selected',
        onClick: function() {
            mirrors.deleteButton.setActive(false);
            if (guiUtils.isObject(mirrors.selected)) {
                mirrors.selected.destroy();
                mirrors.selected = false;
                map.drawMapChanged();
            }
        }
    });
    mirrors.deleteButton.setActive(false);
};

/**
 * check if a mirror is selected depending on (mouse) position
 * for a mouse ctrl move action
 * @method mirrors.isSelected
 * @param {object} position - with (x,y) fields
 * @return boolean, true if a mirror is selected
 */
mirrors.isSelected = function(position) {
    const length = mirrors.collection.length;
    for (var i = 0; i < length; i++) {
        if (mirrors.collection[i].isSelected(position)) {
            return true;
        }
    }
    return false;
};

/**
 * set a mirror as selected, and set that it can be deleted
 * @method mirrors.setSelected
 * @param {Mirror object} mirror
 */
mirrors.setSelected = function(mirror) {
    mirrors.selected = mirror;
    mirrors.deleteButton.setActive(true);
};

/**
 * select a mirror depending on (mouse) position
 * for a mouse ctrl down event
 * @method mirrors.select
 * @param {object} position - with (x,y) fields
 */
mirrors.select = function(position) {
    const length = mirrors.collection.length;
    for (var i = 0; i < length; i++) {
        if (mirrors.collection[i].isSelected(position)) {
            mirrors.setSelected(mirrors.collection[i]);
            return;
        }
    }
};

/**
 * wheel action on the selected mirror
 * actually depends on its intersections (but that's its problem)
 * @method mirrors.wheelAction
 * @param {object} event - with wheel data
 */
mirrors.wheelAction = function(event) {
    if (mirrors.selected) {
        mirrors.selected.wheelAction(event);
    }
};

/**
 * drag action on the selected mirror
 * actually depends on its intersections (but that's its problem)
 * @method mirrors.dragAction
 * @param {object} event - with wheel data
 */
mirrors.dragAction = function(event) {
    if (mirrors.selected) {
        mirrors.selected.dragAction(event);
    }
};

// mapping
//==================================

// basic, rudimentary

// max number of iterations
const maxIterations = 20;

/**
 * mapping, using the mirrors, repeat until no more mapping
 * or maximum number of iterations
 * @method mirrors.map
 * @param {object} point - with x,y,structureIndex and valid fields
 */
mirrors.map = function(point) {
    const collectionLength = mirrors.collection.length;
    for (var i = 0; i < maxIterations; i++) {
        let mapped = false;
        for (var j = 0; j < collectionLength; j++) {
            if (mirrors.collection[j].map(point)) {
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
mirrors.targetRegions = new Uint8Array(1);

/**
 * determine of a point is inside any target region of combined mapping
 * @method mirrors.isInTarget
 * @param {object} position - with x and y fields, such as mouseEvents
 * @return boolean, true if in target region (inside for outsideIn)
 */
mirrors.isInTarget = function(position) {
    const length = mirrors.collection.length;
    const collection = mirrors.collection;
    for (var i = 0; i < length; i++) {
        if (!collection[i].isInTarget(position)) {
            return false;
        }
    }
    return true;
};