/* jshint esversion: 6 */

import {
    ParamGui,
    output
}
from "../libgui/modules.js";

// the gui
//===========================================================

const gui = new ParamGui({
    closed: false
});

// the tiles
//=================================

const center = {};
const upRight = {};
const upLeft = {};
const downLeft = {};
const downRight = {};

// center tile
center.substitution = [upRight, upLeft, downLeft, downRight];
center.name = 'center';
center.rotated = center; // rotating 90 degrees
center.logSubstitution = function() {
    console.log();
    console.log('center substitution is:');
    console.log(center.substitution[1].name, center.substitution[0].name);
    console.log(center.substitution[2].name, center.substitution[3].name);
};

// upRight
upRight.substitution = new Array(4);
upRight.name = 'upRight';
upRight.rotated = upLeft; // rotating 90 degrees
upRight.logSubstitution = function() {
    console.log();
    console.log('upRight substitution is:');
    console.log(upRight.substitution[1].name, upRight.substitution[0].name);
    console.log(upRight.substitution[2].name, upRight.substitution[3].name);
};

// upLeft
upLeft.substitution = new Array(4);
upLeft.name = 'upLeft';
upLeft.rotated = downLeft; // rotating 90 degrees
upLeft.logSubstitution = function() {
    console.log();
    console.log('upLeft substitution is:');
    console.log(upLeft.substitution[1].name, upLeft.substitution[0].name);
    console.log(upLeft.substitution[2].name, upLeft.substitution[3].name);
};

// downLeft
downLeft.substitution = new Array(4);
downLeft.name = 'downLeft';
downLeft.rotated = downRight; // rotating 90 degrees
downLeft.logSubstitution = function() {
    console.log();
    console.log('downLeft substitution is:');
    console.log(downLeft.substitution[1].name, downLeft.substitution[0].name);
    console.log(downLeft.substitution[2].name, downLeft.substitution[3].name);
};

// downRight
downRight.substitution = new Array(4);
downRight.name = 'downRight';
downRight.rotated = upRight; // rotating 90 degrees
downRight.logSubstitution = function() {
    console.log();
    console.log('downRight substitution is:');
    console.log(downRight.substitution[1].name, downRight.substitution[0].name);
    console.log(downRight.substitution[2].name, downRight.substitution[3].name);
};

// rotate substition 90 degrees
function rotateSubstition(toTile, fromTile) {
    toTile.substitution[1] = fromTile.substitution[0].rotated;
    toTile.substitution[2] = fromTile.substitution[1].rotated;
    toTile.substitution[3] = fromTile.substitution[2].rotated;
    toTile.substitution[0] = fromTile.substitution[3].rotated;
}

// make substitution rules from given tiles for upper off diagonal, and diagonal

function makeSubstitution(offDiagonal, lowerDiagonal, upperDiagonal) {
    // all tiles are possible:
    upRight.substitution[1] = offDiagonal;
    // only center, upRight and downLeft
    upRight.substitution[2] = lowerDiagonal;
    upRight.substitution[0] = upperDiagonal;
    // mirror at diagonal
    if (offDiagonal === upLeft) {
        upRight.substitution[3] = downRight;
    } else if (offDiagonal === downRight) {
        upRight.substitution[3] = upLeft;
    } else {
        upRight.substitution[3] = offDiagonal;
    }
    rotateSubstition(upLeft, upRight);
    rotateSubstition(downLeft, upLeft);
    rotateSubstition(downRight, downLeft);
}



makeSubstitution(upLeft, center, downLeft);
upRight.logSubstitution();
upLeft.logSubstitution();
downLeft.logSubstitution();
downRight.logSubstitution();