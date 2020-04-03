/* jshint esversion: 6 */

/**
 * transition table:
 * array of given length, index corresponds to weighted sum of cells
 * length is maximum sum
 * for Conway-like automatons: entry of table gives new cell state
 * for reversible autonatons: entry of table gives cyclic permutation of cell states
 *    (new state=(old state+ tableEntry) % number of states)
 * thus can use the same type of table for both
 * input/output: number.toString(radix) has maximum 32 for radix, thus maximum number of states is 32
 * @namespace transitionTable
 */

export const transitionTable = {};
transitionTable.table = [];
// the drawing routine after changes (from the menue)
transitionTable.draw=function(){
	console.log('new table');
	console.log(transitionTable.createString());        //dummy
};

// number of states
let nStates = 2;
// index steps to sawtooth/tent steps, integer>=1
const p = {};
p.scale = 1;

// the different transition tables
//=============================================================================

/*
 * create the transition table using a function
 * return value (index) modulo nStates used for table entries
 */
function makeTransitionTableWith(fun) {
    const length = transitionTable.table.length;
    for (var i = 0; i < length; i++) {
        transitionTable.table[i] = Math.floor(fun(i)) % nStates;
    }
}

/**
 * make a random transition table
 * @method transitionTable.random
 */
transitionTable.random = function() {
    makeTransitionTableWith(function() {
        return Math.floor(Math.random() * nStates);
    });
};

/**
 * make a saw tooth transition table, depending on number of states
 * @method transitionTable.sawTooth
 */
transitionTable.sawTooth = function() {
    const nStates = this.nStates;
    makeTransitionTableWith(function(i) {
        return i / p.scale; // table entry: Math.floor(fun(i)) % nStates
    });
};

/**
 * make a tent transition table, depending on number of states
 * @method transitionTable.tent
 */
transitionTable.tent = function() {
    const period = 2 * (nStates - 1);
    makeTransitionTableWith(function(i) {
        let result = Math.floor(i / p.scale) % period;
        if (result >= nStates) {
            result = period - result;
        }
        return result;
    });
};

/**
 * make a string that represents the transition table
 * each caracter corresponds to one entry (thus number of states <= 32)
 * @transitionTable.createString
 * @return string
 */
transitionTable.createString = function() {
    let result = "";
    transitionTable.table.forEach(n => result += n.toString(32));
    return result;
};

/**
 * create a transition table from a string
 * each caracter corresponds to one entry (thus number of states <= 32)
 * @transitionTable.fromString
 * @param {string} s
 */
transitionTable.fromString = function(s) {
    const tableLength = transitionTable.table.length;
    if (tableLength !== s.length) {
        console.error("transitionTable.fromString: lengths do not agree. String length " + s.length + ", table length " + tableLength);
    }
    const length = Math.min(tableLength, s.length);
    transitionTable.table.fill(0);
    for (var i = 0; i < length; i++) {
        transitionTable.table[i] = parseInt(s.substring(i, i + 1), 32);
    }
};

// the args object for the gui
const numberControllerArgs = {
    type: 'number',
    params: p,
    max: 256,
    onChange: function(value) {
        console.log(value);
    }
};


// the options for choosing the table generator: key/value pairs
transitionTable.generator = transitionTable.sawTooth;
const typeOptions = {};
typeOptions.sawTooth = transitionTable.sawTooth;
typeOptions.tent = transitionTable.tent;
typeOptions.random = transitionTable.random;

// the args object for the gui
const typeControllerArgs = {
    type: 'selection',
    params: transitionTable,
    property: 'generator',
    options: typeOptions,
    onChange: function(value) {
        if (value===transitionTable.random){
        	scaleController.setActive(false);
        } else {
        	scaleController.setActive(true);
        }
        transitionTable.generator();
        transitionTable.draw();
    }
};

var scaleController;
/**
 * create the gui (ui elements)
 * method transitionTable.createUI
 * @param {ParamGui} gui
 */
transitionTable.createUI = function(gui) {
    transitionTable.generatorController=gui.add(typeControllerArgs);
  scaleController=  gui.add(numberControllerArgs, {
        property: 'scale',
        min:1
    });
};


// set table length, set nStates

/**
* set number of states
* if changes then recalculate table
* @method transitionTable.setNStates
* @param {integer} n
*/
transitionTable.setNStates=function(n){
 if (n!==nStates){
 	nStates=n;
 	transitionTable.generator();
 }
};


/**
* set length of transition table
* if changes then recalculate table
* @method transitionTable.setTableLength
* @param {integer} n
*/
transitionTable.setTableLength=function(n){
 if (n!==transitionTable.table.length){
 	transitionTable.table.length=n;
 	transitionTable.generator();
 }
};