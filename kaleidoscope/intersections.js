/* jshint esversion: 6 */


import {
    Intersection
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
 * make an intersection and add to the collection, set its color
 * @method circles.add
 * @param{Circle} circle1
 * @param{Circle} circle2
 * @params {integer} n - optional, has to be >=2, default 3, for tests
 * @return the intersection
 */
intersections.add = function(circle1, circle2, n = 3) {
    const intersection = new Intersection(circle1, circle2, intersections.getColor(), n);
    const index = intersections.collection.indexOf(intersection);
    if (index >= 0) {
        console.error('intersections.add: intersection already there. It is:');
        console.log(intersection);
    } else {
        intersections.collection.push(intersection);
    }
    intersections.setSelected(intersection);
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