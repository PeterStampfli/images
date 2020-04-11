/* jshint esversion: 6 */

/**
 * transition table:
 * array of given length, index corresponds to weighted sum of cells
 * length is maximum of the sum of neighbors arising in the automaton
 * for Conway-like automatons: entry of table gives new cell state
 * for reversible autonatons: entry of table gives cyclic permutation of cell states
 *    (new state=(old state+ tableEntry) % number of states)
 * thus can use the same type of table for both
 * we use one unique table
 * input/output: number.toString(radix) has maximum 32 for radix, thus maximum number of states is 32
 * @namespace transitionTable
 */

export const transitionTable = {};
transitionTable.table = [];

/**
 * drawing after changes of parameters: number of different colors and the color table type
 * here: logging the table for tests instead of drawing
 * overwrite for running life
 * @method colorTable.draw
 */
transitionTable.draw = function() {
    console.log('new table');
    console.log(transitionTable.createString()); //dummy
};

// set table length, set number of States
//===============================================================
let nStates = 2;
// initially transitionTable.table===0

/**
 * set number of states and length of transition table
 * (most of the time both change)
 * the table length has to be at least as large as the number of states
 * if changes then recalculate table
 * call from the main program
 * @method transitionTable.setNStatesTableLength
 * @param {integer} numberStates
 * @param {integer} tableLength
 */
transitionTable.setNStatesTableLength = function(numberStates, tableLength) {
    if (numberStates > 32) {
        console.error('transitionTable.setNStatesTableLength: number of states is too large');
        console.log('numberStates: ' + numberStates + ' is greater than 32 - now set to 32');
        numberStates = 32;
    }
    if (numberStates > tableLength) {
        console.error('transitionTable.setNStatesTableLength: length of table is smaller than number of states');
        console.log('length: ' + tableLength + ' number of states: ' + numberStates);
        tableLength = numberStates;
    }
    nStates = numberStates;
    transitionTable.table.length = tableLength;
    transitionTable.generator();
};

// transition table to and from strings
//=====================================================

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

// making different transition tables
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
    makeTransitionTableWith(function(i) {
        return i / scaleController.getValue(); // table entry: Math.floor(fun(i)) % nStates
    });
};

/**
 * make a tent transition table, depending on number of states
 * @method transitionTable.tent
 */
transitionTable.tent = function() {
    const period = 2 * (nStates - 1);
    makeTransitionTableWith(function(i) {
        let result = Math.floor(i / scaleController.getValue()) % period;
        if (result >= nStates) {
            result = period - result;
        }
        return result;
    });
};

// the options for choosing the table generator: key/value pairs
transitionTable.generator = transitionTable.sawTooth;

const typeOptions = {
    sawTooth: transitionTable.sawTooth,
    tent: transitionTable.tent,
    random: transitionTable.random
};

/**
 * create the gui (ui elements)
 * method transitionTable.createUI
 * @param {ParamGui} gui
 */
var scaleController, tableTextController;

transitionTable.createUI = function(gui) {
    transitionTable.generatorController = gui.add({
        type: 'selection',
        params: transitionTable,
        property: 'generator',
        options: typeOptions,
        onChange: function() {
            if (value === transitionTable.random) {
                scaleController.setActive(false);
            } else {
                scaleController.setActive(true);
            }
            transitionTable.generator();
            transitionTable.draw();
        }
    });
    scaleController = gui.add({
        type: 'number',
        initialValue: 1,
        labelText: 'scale',
        max: 256,
        onChange: function() {
            transitionTable.generator();
            transitionTable.draw();
        }
    });
    tableTextController = gui.add({
        type: 'textarea',
        initialValue: 'xxx',
        labelText: 'table',
        rows: 3,
        columns: 20
    });
    tableTextController.add({
        type: 'button',
        buttonText: 'use this table',
        onClick: function() {
            console.log('table ' + tableTextController.getValue());
        }
    }).setMinLabelWidth(0);
};