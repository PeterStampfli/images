/* jshint esversion: 6 */

/**
 * collection of mirror objects, such as Circle and Line
 * @ namespace mirrors
 */

export const mirrors = {};

// collecting the mirror objects
mirrors.collection = [];
// a selected mirror
mirrors.selected=false;

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
mirrors.clear=function(){
mirrors.collection.length=0;
};

/**
* draw the mirrors
* highlight selected circle
* @method mirrors.draw
*/
mirrors.draw=function(){
	if (mirrors.selected){
		mirrors.selected.draw(true);
	}
	mirrors.collection.forEach(mirror => mirror.draw(false));
};

// interaction with the mouse