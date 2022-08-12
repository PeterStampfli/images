/* jshint esversion: 6 */

import {
    ParamGui,
    output
}
from "../libgui/modules.js";

const truchet = {};

// the gui and the canvas
//===========================================================

const gui = new ParamGui({
    closed: false
});

output.createCanvas(gui, {
    name: 'canvas control',
});

// parameters for drawing
truchet.color1 = '#ff0000'; // fill color
truchet.color2 = '#0000ff'; // the other fill color
truchet.lineColor = '#000000';
truchet.lineWidth = 3;
truchet.lines = true;

const colorController = {
    type: 'color',
    params: truchet,
    onChange: function() {
        draw();
    }
};

const widthController = {
    type: 'number',
    params: truchet,
    min: 1,
    onChange: function() {
        draw();
    }
};

gui.add(colorController, {
    property: 'color1'
});

gui.add(colorController, {
    property: 'color2'
});

gui.add({
    type: 'boolean',
    params: truchet,
    property: 'lines',
    onChange: function() {
        draw();
    }
});

gui.add(widthController, {
    property: 'lineWidth'
});

gui.add(colorController, {
    property: 'lineColor'
});

// parameters for iteration

const center = {};
const upRight = {};
const upLeft = {};
const downLeft = {};
const downRight = {};

truchet.maxGeneration = 0;
truchet.startTile = center;
truchet.motif = 'original';

truchet.upLeftSubstitution = upRight; // off diagonal, all are possible
truchet.downLeftSubstitution = center; // on diagonal, only center, downLeft, and upRight
truchet.upRightSubstitution = downLeft;

gui.add({
    type: 'number',
    params: truchet,
    property: 'maxGeneration',
    labelText: 'generations',
    min: 0,
    step: 1,
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'selection',
    params: truchet,
    property: 'startTile',
    options: {
        'center': center,
        'downRight': downRight
    },
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'selection',
    params: truchet,
    property: 'motif',
    options: ['original', 'rotated', 'straight', 'straight rotated', 'simple diagonal', 'simple diagonal rotated', 'schematic'],
    onChange: function() {
        draw();
    }
});

gui.addParagraph('substitution rules:');

const upLeftSubstitutionController = gui.add({
    type: 'selection',
    params: truchet,
    property: 'upLeftSubstitution',
    options: {
        'center': center,
        'upRight': upRight,
        'upLeft': upLeft,
        'downLeft': downLeft,
        'downRight': downRight
    },
    labelText: '',
    onChange: function() {
        draw();
    }
});

upLeftSubstitutionController.add({
    type: 'selection',
    params: truchet,
    property: 'upRightSubstitution',
    options: {
        'center': center,
        'upRight': upRight,
        'downLeft': downLeft
    },
    labelText: '',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'selection',
    params: truchet,
    property: 'downLeftSubstitution',
    options: {
        'center': center,
        'upRight': upRight,
        'downLeft': downLeft
    },
    labelText: '',
    onChange: function() {
        draw();
    }
});

// the tiles
//=================================

function nextGeneration(substitution, cornerX, cornerY, size, generation) {
    substitution[0].iterate(cornerX + size, cornerY + size, size, generation, 1);
    substitution[1].iterate(cornerX, cornerY + size, size, generation, 2);
    substitution[2].iterate(cornerX, cornerY, size, generation, 1);
    substitution[3].iterate(cornerX + size, cornerY, size, generation, 2);
}

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

center.iterate = function(cornerX, cornerY, size, generation, color) {
    if (generation >= truchet.maxGeneration) {
        // draw image
        // console.log('Drawing tile', center.name, 'at', cornerX, cornerY, 'size', size);
        canvasContext.setTransform(size / 100, 0, 0, size / 100, cornerX, cornerY);
        switch (truchet.motif) {
            case 'original':
            case 'rotated':
            case 'straight':
            case 'straight rotated':
                if (color === 1) {
                    colorTruchetCross1();
                } else {
                    colorTruchetCross2();
                }
                break;
            case 'schematic':
                frame();
                canvasContext.fillStyle = '#000000';
                canvasContext.beginPath();
                canvasContext.arc(50, 50, 20, 0, 2 * Math.PI);
                canvasContext.fill();
                break;
            case 'simple diagonal':
            case 'simple diagonal rotated':
                simpleUpDiagonal();
                simpleDownDiagonal();
                break;
        }
    } else {
        // corner at bottom left
        generation += 1;
        size /= 2;
        const substitution = center.substitution;
        nextGeneration(substitution, cornerX, cornerY, size, generation);
    }
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

upRight.iterate = function(cornerX, cornerY, size, generation, color) {
    if (generation >= truchet.maxGeneration) {
        // draw image
        //    console.log('Drawing tile', upRight.name, 'at', cornerX, cornerY, 'size', size);
        canvasContext.setTransform(size / 100, 0, 0, size / 100, cornerX, cornerY);
        switch (truchet.motif) {
            case 'original':
                if (color === 1) {
                    colorTruchetUp1();
                } else {
                    colorTruchetUp2();
                }
                break;
            case 'straight':
                if (color === 1) {
                    straightUp1();
                } else {
                    straightUp2();
                }
                break;
            case 'rotated':
                if (color === 1) {
                    colorTruchetDown2();
                } else {
                    colorTruchetDown1();
                }
                break;
            case 'straight rotated':
                if (color === 1) {
                    straightDown2();
                } else {
                    straightDown1();
                }
                break;
            case 'schematic':
                frame();
                canvasContext.fillStyle = '#000000';
                canvasContext.beginPath();
                canvasContext.moveTo(70, 70);
                canvasContext.lineTo(30, 70);
                canvasContext.lineTo(70, 30);
                canvasContext.closePath();
                canvasContext.fill();
                break;
            case 'simple diagonal':
                simpleUpDiagonal();
                break;
            case 'simple diagonal rotated':
                simpleDownDiagonal();
                break;
        }
    } else {
        // corner at bottom left
        generation += 1;
        size /= 2;
        const substitution = upRight.substitution;
        nextGeneration(substitution, cornerX, cornerY, size, generation);
    }
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

upLeft.iterate = function(cornerX, cornerY, size, generation, color) {
    if (generation >= truchet.maxGeneration) {
        // draw image
        //  console.log('Drawing tile', upLeft.name, 'at', cornerX, cornerY, 'size', size);
        canvasContext.setTransform(size / 100, 0, 0, size / 100, cornerX, cornerY);
        switch (truchet.motif) {
            case 'rotated':
                if (color === 1) {
                    colorTruchetUp1();
                } else {
                    colorTruchetUp2();
                }
                break;
            case 'straight rotated':
                if (color === 1) {
                    straightUp1();
                } else {
                    straightUp2();
                }
                break;
            case 'original':
                if (color === 1) {
                    colorTruchetDown2();
                } else {
                    colorTruchetDown1();
                }
                break;
            case 'straight':
                if (color === 1) {
                    straightDown2();
                } else {
                    straightDown1();
                }
                break;
            case 'schematic':
                frame();
                canvasContext.fillStyle = '#000000';
                canvasContext.beginPath();
                canvasContext.moveTo(30, 70);
                canvasContext.lineTo(30, 30);
                canvasContext.lineTo(70, 70);
                canvasContext.closePath();
                canvasContext.fill();
                break;
            case 'simple diagonal rotated':
                simpleUpDiagonal();
                break;
            case 'simple diagonal':
                simpleDownDiagonal();
                break;
        }
    } else {
        // corner at bottom left
        generation += 1;
        size /= 2;
        const substitution = upLeft.substitution;
        nextGeneration(substitution, cornerX, cornerY, size, generation);
    }
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

downLeft.iterate = function(cornerX, cornerY, size, generation, color) {
    if (generation >= truchet.maxGeneration) {
        // draw image
        //     console.log('Drawing tile', downLeft.name, 'at', cornerX, cornerY, 'size', size);
        canvasContext.setTransform(size / 100, 0, 0, size / 100, cornerX, cornerY);
        switch (truchet.motif) {
            case 'original':
                if (color === 1) {
                    colorTruchetUp1();
                } else {
                    colorTruchetUp2();
                }
                break;
            case 'straight':
                if (color === 1) {
                    straightUp1();
                } else {
                    straightUp2();
                }
                break;
            case 'rotated':
                if (color === 1) {
                    colorTruchetDown2();
                } else {
                    colorTruchetDown1();
                }
                break;
            case 'straight rotated':
                if (color === 1) {
                    straightDown2();
                } else {
                    straightDown1();
                }
                break;
            case 'schematic':
                frame();
                canvasContext.fillStyle = '#000000';
                canvasContext.beginPath();
                canvasContext.moveTo(30, 30);
                canvasContext.lineTo(30, 70);
                canvasContext.lineTo(70, 30);
                canvasContext.closePath();
                canvasContext.fill();
                break;
            case 'simple diagonal':
                simpleUpDiagonal();
                break;
            case 'simple diagonal rotated':
                simpleDownDiagonal();
                break;
        }
    } else {
        // corner at bottom left
        generation += 1;
        size /= 2;
        const substitution = downLeft.substitution;
        nextGeneration(substitution, cornerX, cornerY, size, generation);
    }
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

downRight.iterate = function(cornerX, cornerY, size, generation, color) {
    if (generation >= truchet.maxGeneration) {
        // draw image
        //     console.log('Drawing tile', downRight.name, 'at', cornerX, cornerY, 'size', size);
        canvasContext.setTransform(size / 100, 0, 0, size / 100, cornerX, cornerY);
        switch (truchet.motif) {
            case 'rotated':
                if (color === 1) {
                    colorTruchetUp1();
                } else {
                    colorTruchetUp2();
                }
                break;
            case 'straight rotated':
                if (color === 1) {
                    straightUp1();
                } else {
                    straightUp2();
                }
                break;
            case 'original':
                if (color === 1) {
                    colorTruchetDown2();
                } else {
                    colorTruchetDown1();
                }
                break;
            case 'straight':
                if (color === 1) {
                    straightDown2();
                } else {
                    straightDown1();
                }
                break;
            case 'schematic':
                frame();
                canvasContext.fillStyle = '#000000';
                canvasContext.beginPath();
                canvasContext.moveTo(70, 30);
                canvasContext.lineTo(30, 30);
                canvasContext.lineTo(70, 70);
                canvasContext.closePath();
                canvasContext.fill();
                break;
            case 'simple diagonal rotated':
                simpleUpDiagonal();
                break;
            case 'simple diagonal':
                simpleDownDiagonal();
                break;
        }
    } else {
        // corner at bottom left
        generation += 1;
        size /= 2;
        const substitution = downRight.substitution;
        nextGeneration(substitution, cornerX, cornerY, size, generation);
    }
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

// image pieces
// on transformed space, for tiles from (0,0) to (100,100)
//==========================================================

function bottomLeftArc() {
    canvasContext.beginPath();
    canvasContext.moveTo(50, 0);
    canvasContext.arc(0, 0, 50, 0, Math.PI / 2);
    canvasContext.stroke();
}

function bottomRightArc() {
    canvasContext.beginPath();
    canvasContext.moveTo(100, 50);
    canvasContext.arc(100, 0, 50, Math.PI / 2, Math.PI);
    canvasContext.stroke();
}

function topRightArc() {
    canvasContext.beginPath();
    canvasContext.moveTo(50, 100);
    canvasContext.arc(100, 100, 50, Math.PI, Math.PI * 1.5);
    canvasContext.stroke();
}

function topLeftArc() {
    canvasContext.beginPath();
    canvasContext.moveTo(0, 50);
    canvasContext.arc(0, 100, 50, Math.PI * 1.5, Math.PI * 2);
    canvasContext.stroke();
}

function upLines() {
    canvasContext.beginPath();
    canvasContext.moveTo(0, 50);
    canvasContext.lineTo(50, 100);
    canvasContext.moveTo(50, 0);
    canvasContext.lineTo(100, 50);
    canvasContext.stroke();
}

function downLines() {
    canvasContext.beginPath();
    canvasContext.moveTo(0, 50);
    canvasContext.lineTo(50, 0);
    canvasContext.moveTo(50, 100);
    canvasContext.lineTo(100, 50);
    canvasContext.stroke();
}

function upTriangles() {
    canvasContext.beginPath();
    canvasContext.moveTo(0, 50);
    canvasContext.lineTo(50, 100);
    canvasContext.lineTo(0, 100);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.beginPath();
    canvasContext.moveTo(50, 0);
    canvasContext.lineTo(100, 50);
    canvasContext.lineTo(100, 0);
    canvasContext.closePath();
    canvasContext.fill();
}

function downTriangles() {
    canvasContext.beginPath();
    canvasContext.moveTo(0, 50);
    canvasContext.lineTo(50, 0);
    canvasContext.lineTo(0, 0);
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.beginPath();
    canvasContext.moveTo(50, 100);
    canvasContext.lineTo(100, 100);
    canvasContext.lineTo(100, 50);
    canvasContext.closePath();
    canvasContext.fill();
}

function upStraight() {
    canvasContext.beginPath();
    canvasContext.moveTo(0, 50);
    canvasContext.lineTo(50, 100);
    canvasContext.lineTo(100, 100);
    canvasContext.lineTo(100, 50);
    canvasContext.lineTo(50, 0);
    canvasContext.lineTo(0, 0);
    canvasContext.closePath();
    canvasContext.fill();
}

function downStraight() {
    canvasContext.beginPath();
    canvasContext.moveTo(0, 50);
    canvasContext.lineTo(50, 0);
    canvasContext.lineTo(100, 0);
    canvasContext.lineTo(100, 50);
    canvasContext.lineTo(50, 100);
    canvasContext.lineTo(0, 100);
    canvasContext.closePath();
    canvasContext.fill();
}

function cross() {
    canvasContext.beginPath();
    canvasContext.moveTo(50, 0);
    canvasContext.lineTo(50, 100);
    canvasContext.moveTo(0, 50);
    canvasContext.lineTo(100, 50);
    canvasContext.stroke();
}

function bottomLeftQuarterDisc() {
    canvasContext.beginPath();
    canvasContext.moveTo(0, 0);
    canvasContext.lineTo(50, 0);
    canvasContext.arc(0, 0, 50, 0, Math.PI / 2);
    canvasContext.lineTo(0, 0);
    canvasContext.fill();
}

function bottomRightQuarterDisc() {
    canvasContext.beginPath();
    canvasContext.moveTo(100, 0);
    canvasContext.lineTo(100, 50);
    canvasContext.arc(100, 0, 50, Math.PI / 2, Math.PI);
    canvasContext.lineTo(100, 0);
    canvasContext.fill();
}

function topRightQuarterDisc() {
    canvasContext.beginPath();
    canvasContext.moveTo(100, 100);
    canvasContext.lineTo(50, 100);
    canvasContext.arc(100, 100, 50, Math.PI, Math.PI * 1.5);
    canvasContext.lineTo(100, 100);
    canvasContext.fill();
}

function topLeftQuarterDisc() {
    canvasContext.beginPath();
    canvasContext.moveTo(0, 100);
    canvasContext.lineTo(0, 50);
    canvasContext.arc(0, 100, 50, Math.PI * 1.5, Math.PI * 2);
    canvasContext.lineTo(0, 100);
    canvasContext.fill();
}

// the spaces between pairs of quarter discs (centered at diagonal opposite corners)

function downDiagonalBent() {
    canvasContext.beginPath();
    canvasContext.moveTo(50, 0);
    canvasContext.arc(0, 0, 50, 0, Math.PI / 2);
    canvasContext.lineTo(0, 100);
    canvasContext.lineTo(50, 100);
    canvasContext.arc(100, 100, 50, Math.PI, Math.PI * 1.5);
    canvasContext.lineTo(100, 0);
    canvasContext.closePath();
    canvasContext.fill();
}

function upDiagonalBent() {
    canvasContext.beginPath();
    canvasContext.moveTo(0, 0);
    canvasContext.lineTo(0, 50);
    canvasContext.arc(0, 100, 50, Math.PI * 1.5, Math.PI * 2);
    canvasContext.lineTo(100, 100);
    canvasContext.lineTo(100, 50);
    canvasContext.arc(100, 0, 50, Math.PI * 0.5, Math.PI);
    canvasContext.closePath();
    canvasContext.fill();
}

function upDiagonalSquares() {
    canvasContext.beginPath();
    canvasContext.moveTo(0, 0);
    canvasContext.lineTo(0, 50);
    canvasContext.lineTo(100, 50);
    canvasContext.lineTo(100, 100);
    canvasContext.lineTo(50, 100);
    canvasContext.lineTo(50, 0);
    canvasContext.closePath();
    canvasContext.fill();
}

function downDiagonalSquares() {
    canvasContext.beginPath();
    canvasContext.moveTo(0, 100);
    canvasContext.lineTo(0, 50);
    canvasContext.lineTo(100, 50);
    canvasContext.lineTo(100, 0);
    canvasContext.lineTo(50, 0);
    canvasContext.lineTo(50, 100);
    canvasContext.closePath();
    canvasContext.fill();
}

// putting pieces together to make tiles

// colorTruchet: always draw color1 first
// the number is for the color of the diagonal
function colorTruchetUp1() {
    canvasContext.fillStyle = truchet.color1;
    upDiagonalBent();
    canvasContext.fillStyle = truchet.color2;
    topLeftQuarterDisc();
    bottomRightQuarterDisc();
    canvasContext.strokeStyle = truchet.lineColor;
    if (truchet.lines) {
        bottomRightArc();
        topLeftArc();
    }
}

function straightUp1() {
    canvasContext.fillStyle = truchet.color1;
    upStraight();
    canvasContext.fillStyle = truchet.color2;
    upTriangles();
    canvasContext.strokeStyle = truchet.lineColor;
    if (truchet.lines) {
        upLines();
    }
}

function colorTruchetUp2() {
    canvasContext.fillStyle = truchet.color1;
    topLeftQuarterDisc();
    bottomRightQuarterDisc();
    canvasContext.fillStyle = truchet.color2;
    upDiagonalBent();
    canvasContext.strokeStyle = truchet.lineColor;
    if (truchet.lines) {
        bottomRightArc();
        topLeftArc();
    }
}

function straightUp2() {
    canvasContext.fillStyle = truchet.color1;
    upTriangles();
    canvasContext.fillStyle = truchet.color2;
    upStraight();
    canvasContext.strokeStyle = truchet.lineColor;
    if (truchet.lines) {
        upLines();
    }
}

function colorTruchetDown1() {
    canvasContext.fillStyle = truchet.color1;
    downDiagonalBent();
    canvasContext.fillStyle = truchet.color2;
    topRightQuarterDisc();
    bottomLeftQuarterDisc();
    canvasContext.strokeStyle = truchet.lineColor;
    if (truchet.lines) {
        bottomLeftArc();
        topRightArc();
    }
}

function straightDown1() {
    canvasContext.fillStyle = truchet.color1;
    downStraight();
    canvasContext.fillStyle = truchet.color2;
    downTriangles();
    canvasContext.strokeStyle = truchet.lineColor;
    if (truchet.lines) {
        downLines();
    }
}

function colorTruchetDown2() {
    canvasContext.fillStyle = truchet.color1;
    topRightQuarterDisc();
    bottomLeftQuarterDisc();
    canvasContext.fillStyle = truchet.color2;
    downDiagonalBent();
    canvasContext.strokeStyle = truchet.lineColor;
    if (truchet.lines) {
        bottomLeftArc();
        topRightArc();
    }
}

function straightDown2() {
    canvasContext.fillStyle = truchet.color1;
    downTriangles();
    canvasContext.fillStyle = truchet.color2;
    downStraight();
    canvasContext.strokeStyle = truchet.lineColor;
    if (truchet.lines) {
        downLines();
    }
}

function colorTruchetCross1() {
    canvasContext.fillStyle = truchet.color1;
    upDiagonalSquares();
    canvasContext.fillStyle = truchet.color2;
    downDiagonalSquares();
    canvasContext.strokeStyle = truchet.lineColor;
    if (truchet.lines) {
        cross();
    }
}

function colorTruchetCross2() {
    canvasContext.fillStyle = truchet.color1;
    downDiagonalSquares();
    canvasContext.fillStyle = truchet.color2;
    upDiagonalSquares();
    canvasContext.strokeStyle = truchet.lineColor;
    if (truchet.lines) {
        cross();
    }
}

function simpleUpDiagonal() {
    canvasContext.strokeStyle = truchet.lineColor;
    canvasContext.beginPath();
    canvasContext.moveTo(0, 0);
    canvasContext.lineTo(100, 100);
    canvasContext.stroke();
}

function simpleDownDiagonal() {
    canvasContext.strokeStyle = truchet.lineColor;
    canvasContext.beginPath();
    canvasContext.moveTo(100, 0);
    canvasContext.lineTo(0, 100);
    canvasContext.stroke();
}

function frame() {
    canvasContext.fillStyle = '#ffffff';
    canvasContext.strokeStyle = '#000000';
    canvasContext.fillRect(0, 0, 100, 100);
    canvasContext.strokeRect(0, 0, 100, 100);
}

// drawing on square canvas
//====================================

const canvas = output.canvas;
const canvasContext = canvas.getContext('2d');

output.setCanvasWidthToHeight();

function draw() {
    output.isDrawing = true;
    canvasContext.lineCap = 'round';
    canvasContext.setTransform(1, 0, 0, 1, 0, 0);
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    canvasContext.lineWidth = truchet.lineWidth;
    makeSubstitution(truchet.upLeftSubstitution, truchet.downLeftSubstitution, truchet.upRightSubstitution);
    const startSize = canvas.width;
    truchet.startTile.iterate(0, 0, startSize, 0, 1);
}

output.drawCanvasChanged = draw;
draw();