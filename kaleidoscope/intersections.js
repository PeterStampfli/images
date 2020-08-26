/* jshint esversion: 6 */

import {
    guiUtils,
    output,
    BooleanButton,
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
 * add intersection to its circles' intersection list
 * @method intersections.add
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
        intersection = new Intersection(intersections.gui, circle1, circle2, intersections.getColor(), n);
        intersections.collection.push(intersection);
    }
    intersections.selected = intersection;
    intersections.activateUI();
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
    intersections.activateUI();
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
    if (intersections.visible) {
        if (intersections.selected) {
            intersections.selected.draw(1);
        }
        intersections.collection.forEach(intersection => intersection.draw(0));
    }
};

// interaction with the mouse
//==================================================

/**
 * make the gui and add some buttons
 * @method intersections.makeGui
 * @param{Paramgui} parentGui
 * @param{Object} args - optional, modifying the gui (keep it closed)
 */
intersections.makeGui = function(parentGui, args = {}) {
    intersections.gui = parentGui.addFolder('intersections', {
        closed: false
    }, args);
    intersections.visible = true;
    BooleanButton.greenRedBackground();
    intersections.visibleButton = intersections.gui.add({
        type: 'boolean',
        params: intersections,
        property: 'visible',
        labelText:'',
        buttonText: ['visible', 'hidden'],
        onChange: function() {
            output.pixels.show(); // no new map
            circles.draw();
            intersections.draw();
        }
    });
    intersections.addButton = intersections.gui.add({
        type: 'button',
        buttonText: 'add intersection',
        onClick: function() {
            // add an interssection between the two selected circles
            // button cannot be clicked if this is not possible

            Circle.draw();
        }
    });
    intersections.deleteButton = intersections.gui.add({
        type: 'button',
        buttonText: 'delete selected',
        onClick: function() {
            if (guiUtils.isObject(intersections.selected)) {
                intersections.selected.destroy();
                output.pixels.show(); // no new map
                circles.draw();
                intersections.draw();
            }
        }
    });
    intersections.activateUI();
};

/**
 * activate the UI of the intersections collection and of all intersections
 * call when circles change
 * @method intersections.activateUI
 */
intersections.activateUI = function() {
    // can always delete selected intersection if an interssection is selected
    intersections.deleteButton.setActive(guiUtils.isObject(intersections.selected));
    // can add an intersection only if two circles are selected ...
    let canAddIntersection = (guiUtils.isObject(circles.selected) && guiUtils.isObject(circles.otherSelected));
    // and they do not already have an intersection ...
    canAddIntersection = canAddIntersection && (intersections.indexOf(circles.selected, circles.otherSelected) < 0);
    // and the circles intersect
    canAddIntersection = canAddIntersection && (circles.selected.intersectsCircle(circles.otherSelected));
    // and at least one of the circles can adjust to intersections
    canAddIntersection = canAddIntersection && (circles.selected.canAdjust() || circles.otherSelected.canAdjust());
    intersections.addButton.setActive(canAddIntersection);
    intersections.collection.forEach(intersection => intersection.activateUI());

    console.log(Intersection.estimateN(circles.selected, circles.otherSelected));
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
 * set that given intersection is selected
 * makes that the corresponding two circles are selected
 * @method intersection.setSelected
 * @param {Intersection} intersection
 */
intersections.setSelected = function(intersection) {
    intersections.selected = intersection;
    if (circles.selected === intersection.circle1) {
        circles.otherSelected = intersection.circle2;
    } else if (circles.selected === intersection.circle2) {
        circles.otherSelected = intersection.circle1;
    } else {
        circles.selected = intersection.circle1;
        circles.otherSelected = intersection.circle2;
    }
    circles.activateUI();
    intersections.activateUI();
};

/**
 * select an intersection depending on (mouse) position
 * sets selected intersection
 * reurns true if something has been selected (for preventing other events)
 * @method intersections.select
 * @param {object} position - with (x,y) fields
 * @return boolean, true if a circle has been selected
 */
intersections.select = function(position) {
    const length = intersections.collection.length;
    for (var i = 0; i < length; i++) {
        if (intersections.collection[i].isSelected(position)) {
            intersections.setSelected(intersections.collection[i]);
            return true;
        }
    }
    return false;
};
