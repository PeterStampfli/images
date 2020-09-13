/* jshint esversion: 6 */

import {
    map,
    BooleanButton,
    output,
    guiUtils
} from "../libgui/modules.js";

import {
    Circle,
    intersections,
    basic,
    regions
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

let lastId = -1;

/**
 * get an id number
 * @method circles.getId
 * @return integer id
 */
circles.getId = function() {
    lastId += 1;
    return lastId;
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
    if (!guiUtils.isNumber(properties.id)) {
        properties.id = circles.getId();
    } else {
        lastId = Math.max(lastId, properties.id); // for having unique ids when using presets
    }
    if (!guiUtils.isString(properties.color)) {
        properties.color = circles.getColor();
    }
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
        if (!guiUtils.isObject(circles.selected) && (circles.collection.length >= 1)) {
            circles.selected = circles.collection[circles.collection.length - 1];
        }
    }
    if (circles.otherSelected === circle) {
        circles.otherSelected = false;
    }
    circles.activateUI();
    intersections.activateUI();
};

/**
 * get a circle with a given id number
 * returns false if not found
 * @method circles.findId
 * @param {Integer} id
 * @return Circle, with given id, or false if not found
 */
circles.findId = function(id) {
    const length = circles.collection.length;
    for (var i = 0; i < length; i++) {
        if (id === circles.collection[i].id) {
            return circles.collection[i];
        }
    }
    console.error('circles.findId: id not found. Is ' + id + '. The collection of circles:');
    console.log(circles.collection);
    return false;
};


/**
 * destroy all circles
 * @method circles.clear
 */
circles.clear = function() {
    while (circles.collection.length > 0) {
        circles.collection[circles.collection.length - 1].destroy();
    }
};

/**
 * make an array of properties for the circles
 * take only circles that are mapping
 * @method circles.get
 * @return array of circle property objects
 */
circles.get = function() {
    const result = [];
    const length = circles.collection.length;
    for (var i = 0; i < length; i++) {
        const circle = circles.collection[i];
        result.push(circle.getProperties());
    }
    return result;
};

/**
 * set the array of circles from an array of properties
 * @method circles.set
 * @param {array of circle property objects} input
 */
circles.set = function(input) {
    circles.clear();
    input.forEach(properties => circles.add(properties));
};

/**
 * draw the circles
 * highlight selected circle
 * @method circles.draw
 */
circles.draw = function() {
    if (circles.visible) {
        if (circles.otherSelected) {
            circles.otherSelected.draw(2);
        }
        if (circles.selected) {
            circles.selected.draw(1);
        }
        circles.collection.forEach(circle => circle.draw(0));
    }
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
    circles.gui = parentGui.addFolder('circles', args);
    circles.visible = true;
    circles.selectedMessage = circles.gui.addParagraph('Selected: none');
    BooleanButton.greenRedBackground();
    circles.visibleButton = circles.gui.add({
        type: 'boolean',
        params: circles,
        property: 'visible',
        labelText: '',
        buttonText: ['visible', 'hidden'],
        onChange: function() {
            basic.drawCirclesIntersections();
        }
    });
    circles.gui.add({
        type: 'button',
        buttonText: 'add circle',
        onClick: function() {
            circles.add();
            basic.drawMapChanged();
        }
    });
    circles.deleteButton = circles.gui.add({
        type: 'button',
        buttonText: 'delete selected',
        onClick: function() {
            if (guiUtils.isObject(circles.selected)) {
                circles.selected.destroy();
                basic.drawMapChanged();
            }
        }
    });
    circles.gui.add({
        type: 'button',
        buttonText: 'select nothing',
        onClick: function() {
            circles.selected = false;
            circles.otherSelected = false;
            intersections.selected = false;
            basic.drawCirclesIntersections();
        }
    });
    circles.activateUI();
};

/**
 * activate the UI (the delete button depending whether there is a circle left over)
 * and update message for selected circles
 * @method circles.activateUI
 */
circles.activateUI = function() {
    circles.deleteButton.setActive(guiUtils.isObject(circles.selected));
    let message = 'Selected: ';
    if (guiUtils.isObject(circles.selected)) {
        message += '<strong>' + circles.selected.id + '</strong>';
        if (guiUtils.isObject(circles.otherSelected)) {
            message += ' and ' + circles.otherSelected.id;
        }
    } else {
        message += 'none';
    }
    circles.selectedMessage.innerHTML = message;
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
 * select circles depending on (mouse) position
 * sets selected (and otherSelected) circle
 * reurns true if something has been selected (for preventing other events)
 * @method circles.select
 * @param {object} position - with (x,y) fields
 * @return boolean, true if a circle has been selected
 */
circles.select = function(position) {
    const length = circles.collection.length;
    let selected = false;
    for (var i = 0; i < length; i++) {
        if (circles.collection[i].isSelected(position)) {
            circles.setSelected(circles.collection[i]);
            selected = true;
        }
    }
    return selected;
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

/**
 * check if all mapping circles are mapping inside out
 * @circles.allInsideOut
 * @return boolean, true if all circles are mapping inside out, false if there is no mapping circle
 */
circles.allInsideOut = function() {
    let mappingCircle = false;
    const length = circles.collection.length;
    for (var i = 0; i < length; i++) {
        const circle = circles.collection[i];
        if (circle.isMapping) {
            if (!circle.isInsideOutMap) {
                return false;
            }
            mappingCircle = true;
        }
    }
    return mappingCircle;
};

/**
 * mapping, using the circles, repeat until no more mapping
 * make an inversion at first circle, if all circles are inside->out mapping
 * or maximum number of iterations
 * @method circles.map
 * @param {object} point - with x,y,structureIndex and valid fields
 */
circles.map = function(point) {
    map.logRegionNotFound = true;
    const collectionLength = circles.collection.length;
    while (point.iterations <= map.maxIterations) {
        let mapped = false;
        for (var j = 0; j < collectionLength; j++) {
            if (circles.collection[j].map(point)) {
                mapped = true;
                point.iterations += 1;
            }
        }
        if (!mapped) {
            // mapping is finished, we know where the point ends up
            // determine its region
          const region = regions.getPolygonIndex(point);
            if (region >= 0) {
                point.region = region;
                map.activeRegions[region]=true;
            } else {
                point.region = 255; // for error, irrelevant
                point.valid = -1; // will make size<0, do not draw invalid points
                if (map.logRegionNotFound) {
                    map.logRegionNotFound = false; // make only one error message
                    console.error('circles.map: region not found, point at');
                    console.log(point);
                }
            }
            // inversion needed to get a good mapping of input image if all circles map inside out
            if (circles.finalInversion) {
                circles.collection[0].invert(point);
            }
            return;
        }
    }
    point.region = 255; // to be safe??
    point.valid = -1; // invalid position/pixel
};

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