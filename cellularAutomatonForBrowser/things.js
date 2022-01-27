/* jshint esversion: 6 */

//=====================================
// utilities

export const utils={};

// forcing odd number
utils.makeOdd=function(n){
return Math.floor(n / 2) * 2 + 1
};

// choose from a random array
utils.randomChoice=function(options) {
    const index = Math.floor(options.length * Math.random());
    return options[index];
};

// extend an array/matrix/vector
utils.extend=function(space, minLength) {
    if (space.length < minLength) {
        space.length = minLength;
    }
};

// log array of size*size elements
utils.logArray=function(array) {
    let index = 0;
    for (let j = 0; j < size; j++) {
        let message = j + ' : ';
        for (let i = 0; i < size; i++) {
            message += ' ' + array[index];
            index += 1;
        }
        console.log(message);
    }
};

// transition tables, needs number of states
utils.nStates=16;

utils.setNStates=function(n){
	utils.nStates=n;
utils.trianglePeriod = 2 * n - 2;
};

// sawtooth table
utils.sawTooth=function(sum) {
    return sum % utils.nStates;
 };

// triangle table
utils.triangle=function(sum) {
        let value = sum % utils.trianglePeriod;
        if (value >= nStates) {
            value = utils.trianglePeriod - value;
        }
     return value;
};

//=========================================
// color tables as integer colors

export const colors={};
colors.table=[];

const color = {};
color.alpha = 255;

colors.setN=function(n){
	colors.n=n;
}

colors.greys=function() {
	const nColors=colors.n;
    utils.extend(colors.table, nColors);
    for (let i = 0; i < nColors; i++) {
        const grey = Math.floor(i / (nColors - 1) * 255.9);
        color.red = grey;
        color.blue = grey;
        color.green = grey;
        colors.table[i] = Pixels.integerOfColor(color);
    }
}
