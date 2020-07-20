/* jshint esversion: 6 */

/**
 * collection of mirror objects, such as Circle and Line
 * @ namespace mirrors
 */

export const mirrors = {};

// collecting the mirror objects
mirrors.collection = [];
// a selected mirror
mirrors.selected = false;

// adding and removing mirrors

/**
 * add a mirror to the collecction
 * @method mirrors.add
 * @param {object}mirror - with all "mirror" methods
 */
mirrors.add = function(mirror) {
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
 * delete all mirrors
 * @method mirrors.clear
 */
mirrors.clear = function() {
    mirrors.collection.length = 0;
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
 * select a mirror depending on (mouse) position
 * for a mouse ctrl down event
 * @method mirrors.select
 * @param {object} position - with (x,y) fields
 */
mirrors.select = function(position) {
    const length = mirrors.collection.length;
    for (var i = 0; i < length; i++) {
        if (mirrors.collection[i].isSelected(position)) {
            mirrors.selected = mirrors.collection[i];
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
const maxIterations=20;

/**
* mapping, using the mirrors, repeat until no more mapping
* or maximum number of iterations
* @method mirrors.map
* @param {object} point - with x,y,structureIndex and valid fields
*/
mirrors.map=function(point){
    const collectionLength=mirrors.collection.length;
    for (var i=0;i<maxIterations;i++){
        let mapped=false;
        for (var j=0;j<collectionLength;j++){
            if (mirrors.collection[j].map(point)){
                mapped=true;
                point.structureIndex+=1;
            }
        }
        if (!mapped){
            return;
        }
    }
    point.valid=-1;   // invalid position/pixel
}