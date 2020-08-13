/* jshint esversion: 6 */

import {
    guiUtils,
    map
} from "../libgui/modules.js";

import {
    Intersection,
    circles
} from './modules.js';

/**
 * collection of intersections
 * @namespace intersections
 */

export const intersections = {};

// collecting the circles
intersections.collection = [];
// a selected circle
intersections.selected = false;

// ids for intersections
// we do not need id numbers for intersections:
// first create the circles, then their intersections, which have id numbers of the intersecting circles

let colorIndex = -1;
const colors = ['#ff0000', '#00ff00', '#ff00ff', '#0000ff', '#000000'];

/**
 * get a color
 * @method intersections.getColor
 * @return string, defines color
 */
intersections.getColor = function() {
    colorIndex += 1;
    if (colorIndex >= colors.length) {
        colorIndex -= colors.length;
    }
    return colors[colorIndex];
};

// adding and removing circles

// still no gui

/**
 * find index of intersection given its two circles
 * returns -1 if not found
 * @method intersections.indexOf
 * @param{Circle} circle1
 * @param{Circle} circle2
 * @return integer
 */
intersections.indexOf = function(circle1, circle2) {
    const length = intersections.collection.length;
    for (var i = 0; i < length; i++) {
        const intersection = intersections.collection[i];
        if ((intersection.circle1 === circle1) && (intersection.circle2 === circle2)) {
            return i;
        }
        if ((intersection.circle1 === circle2) && (intersection.circle2 === circle1)) {
            return i;
        }
    }
    return -1;
};

/**
 * make an intersection and add to the collection, set its color
 * @method circles.add
 * @param{Circle} circle1
 * @param{Circle} circle2
 * @params {integer} n - optional, has to be >=2, default 3, for tests
 * @return the intersection
 */
intersections.add = function(circle1, circle2, n = 3) {
    const index = intersections.indexOf(circle1, circle2);
    var intersection;
    if (index >= 0) {
        console.error('intersections.add: intersection between given circles already there. It is:');
        intersection = intersections.collection[index];
        console.log(intersection);
        console.log("circle ids", intersection.circle1.id, intersection.circle2.id);
    } else {
        intersection = new Intersection(circle1, circle2, intersections.getColor(), n);
        intersections.collection.push(intersection);
    }
    intersections.setSelected(intersection);
    intersections.updateUI();
    return intersection;
};

/**
 * remove an intersection from the collection
 * @method intersections.remove
 * @param {Intersection} intersection
 */
intersections.remove = function(intersection) {
    const index = intersections.collection.indexOf(intersection);
    if (index >= 0) {
        intersections.collection.splice(index, 1);
    } else {
        console.error('intersection.remove: intersection not found. It is:');
        console.log(circle);
    }
    if (intersections.selected === intersection) {
        intersections.selected = false;
    }
    intersections.updateUI();
};

/**
 * destroy all intersections
 * @method intersections.clear
 */
intersections.clear = function() {
    intersections.collection.forEach(intersection => intersection.destroy());
    intersection.collection.length = 0;
};

/**
 * draw the intersections
 * highlight selected intersection
 * @method intersections.draw
 */
intersections.draw = function() {
    if (intersections.selected) {
        intersections.selected.draw(1);
    }
    intersections.collection.forEach(intersection => intersection.draw(0));
};

// interaction with the mouse
//==================================================

/**
 * make the gui and add some buttons
 * @method intersections.makeGui
 * @param{Paramgui} parentGui
 * @param{Object} args - optional, modifying the gui
 */
intersections.makeGui = function(parentGui, args = {}) {
    intersections.gui = parentGui.addFolder('intersections', args);
    intersections.addButton = intersections.gui.add({
        type: 'button',
        buttonText: 'add intersection',
        onClick: function() {
            // add an interssection between the two selected circles
            // button cannot be clicked if this is not possible

            map.drawMapChanged();
        }
    });
    intersections.deleteButton = intersections.gui.add({
        type: 'button',
        buttonText: 'delete selected',
        onClick: function() {
            if (guiUtils.isObject(intersections.selected)) {
                intersections.selected.destroy();

                map.drawMapChanged(); // removing the intersection actually should not change the map
            }
        }
    });
    intersections.updateUI();
};

/**
 * update the UI
 * (activating buttons)
 * @method intersections.updateUI
 */
intersections.updateUI = function() {
    // can only delete selected intersection if an interssection is selected
    intersections.deleteButton.setActive(guiUtils.isObject(intersections.selected));
    // can add an intersection only if  two circles are selected, and they do not have an intersection
    if (guiUtils.isObject(circles.selected) && guiUtils.isObject(circles.otherSelected)) {
        const index = intersections.indexOf(circles.selected, circles.otherSelected);
        intersections.addButton.setActive(index < 0);
    } else {
        intersections.addButton.setActive(false);
    }
};

/**
 * check if an intersection is selected depending on (mouse) position
 * for a mouse ctrl move action
 * @method intersections.isSelected
 * @param {object} position - with (x,y) fields
 * @return boolean, true if an intersection is selected
 */
intersections.isSelected = function(position) {
    const length = intersections.collection.length;
    for (var i = 0; i < length; i++) {
        if (intersections.collection[i].isSelected(position)) {
            return true;
        }
    }
    return false;
};

/**
 * set an intersection as selected, and set that it can be deleted
 * @method intersection.setSelected
 * @param {Intersection} intersection
 */
intersections.setSelected = function(intersection) {
    // do only something if circle not selected
    intersections.selected = intersection;
};