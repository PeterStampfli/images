/* jshint esversion: 6 */
import {
    ParamGui
}
from "../libgui/modules.js";

/**
 * transition table:
 * array of given length, index corresponds to weighted sum of cells
 * length is maximum of the sum of neighbors arising in the automaton
 * for Conway-like automatons: entry of table gives new cell state
 * for reversible autonatons: entry of table gives cyclic permutation of cell states
 *    (new state=(old state+ tableEntry) % number of states)
 * thus can use the same type of table for both
 * we use one unique table
 * Note: table[0]===0, always, that means that a cell with neighboring cells all ==0 does not change
 * (this does not restrict possible automatons, because a 'translation' , 
 * addition mod number of states, results in equivalent automaton)
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

/**
 * generate the transition table, set up the ui
 * make redrawing separately
 * uses the transitionTable.generator method
 * @method TransitionTable.generate
 */
transitionTable.generate = function() {
    if (transitionTable.generator === transitionTable.random) {
        scaleController.hide();
        reRandomButton.show();
    } else {
        scaleController.show();
        reRandomButton.hide();
    }
    transitionTable.generator();
    tableTextController.setValueOnly(transitionTable.createString());
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
        console.log('numberStates: ' + numberStates + ' is greater than 32 - I set it to 32');
        numberStates = 32;
    }
    if (numberStates > tableLength) {
        console.error('transitionTable.setNStatesTableLength: length of table is smaller than number of states');
        console.log('length: ' + tableLength + ' number of states: ' + numberStates);
        tableLength = numberStates;
    }
    nStates = numberStates;
    transitionTable.table.length = tableLength;
    transitionTable.generate();
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
 * skip characters that are not numbers (line breaks)
 * @transitionTable.fromString
 * @param {string} s
 */
const goodCharacters = '0123456789abcdefghijklmnopqrstuv'; // numbers 0...31 in base 32

transitionTable.fromString = function(s) {
    const tableLength = transitionTable.table.length;
    const stringLength = s.length;
    let tableIndex = 0;
    let stringIndex = 0;
    while ((tableIndex < tableLength) && (stringIndex < stringLength)) {
        const currentChar = s.charAt(stringIndex);
        const charValue = Math.min(goodCharacters.indexOf(currentChar), nStates - 1);
        if (charValue >= 0) {
            transitionTable.table[tableIndex] = charValue;
            tableIndex += 1;
        }
        stringIndex += 1;
    }
    // fill up rest of table with zeros
    while (tableIndex < tableLength) {
        transitionTable.table[tableIndex] = 0;
        tableIndex += 1;
    }
};

// making different transition tables
//=============================================================================

/*
 * create the transition table using a function
 * return value (index) modulo nStates used for table entries
 */
function makeTransitionTableWith(fun) {
    if (transitionTable.table.length > 0) {
        const length = transitionTable.table.length;
        for (var i = 0; i < length; i++) {
            transitionTable.table[i] = Math.floor(fun(i)) % nStates;
        }
    } else {
        console.error('transitionTable.makeTransitionTableWith: table has length zero');
    }
}

// test if transition table has each of the possible states
function transitionTableHasAllStates() {
    for (var i = 0; i < nStates; i++) {
        if (transitionTable.table.indexOf(i) < 0) {
            return false;
        }
    }
    return true;
}

/**
 * special test for transition table, redefine, depending on world
 * typically: use given initial world, run several generations, check frequency of states
 * @method TransitinTable.isOk
 * @return boolean, true if we can use the transition table
 */
transitionTable.isOk = function() {
    return true;
};

/**
 * make a random transition table, all states should be in the table
 * @method transitionTable.random
 */
transitionTable.random = function() {
    if (transitionTable.table.length > 0) {
        transitionTable.table.fill(0); // fail as defined start
        while (!transitionTableHasAllStates() || !transitionTable.isOk()) {
            // new random state, table[0]===0, always
            const length = transitionTable.table.length;
            for (var i = 1; i < length; i++) {
                transitionTable.table[i] = Math.floor(Math.random() * nStates);
            }
        }
    } else {
        console.error('transitionTable.random: table has length zero');
    }
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
var scaleController, tableTextController, reRandomButton;

transitionTable.createUI = function(gui) {
    transitionTable.generatorController = gui.add({
        type: 'selection',
        params: transitionTable,
        property: 'generator',
        options: typeOptions,
        onChange: function() {
            transitionTable.generate();
            transitionTable.draw();
        }
    });
    scaleController = gui.add({
        type: 'number',
        initialValue: 1,
        labelText: 'scale',
        min: 1,
        max: 256,
        onChange: function() {
            transitionTable.generate();
            transitionTable.draw();
        }
    });
    reRandomButton = gui.add({
        type: 'button',
        buttonText: 'new random table',
        onClick: function() {
            transitionTable.generate();
            transitionTable.draw();
        }
    });
    tableTextController = gui.add({
        type: 'textarea',
        initialValue: '',
        labelText: 'table',
        rows: 3,
        columns: 20
    });
    tableTextController.add({
        type: 'button',
        buttonText: 'use this table',
        onClick: function() {
            const text = tableTextController.getValue();
            if (transitionTable.createString() !== text) {
                transitionTable.fromString(text);
                tableTextController.setValueOnly(transitionTable.createString());
                transitionTable.draw();
            }
        }
    }).setMinLabelWidth(0);
};

/**
 * set up a test
 * @method colorTable.setupTest
 */
transitionTable.setupTest = function() {
    const gui = new ParamGui({}, {
        name: "transitiontable - controls",
        closed: false
    });
    transitionTable.createUI(gui);
    transitionTable.setNStatesTableLength(16, 17);
};

/*
use with

<script type="module">
import {
    transitionTable
}
from "./transitionTable.js";
transitionTable.setupTest();
</script>
*/