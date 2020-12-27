/* jshint esversion: 6 */

import {
    ParamGui,
    output,
    BooleanButton
}
from "../libgui/modules.js";

const gui = new ParamGui({
    closed: false
});

output.createCanvas(gui, {
    name: 'canvas control',
});
const canvas = output.canvas;
const canvasContext = canvas.getContext('2d');

output.addCoordinateTransform();
output.addCursorposition();
let size = 500;
output.setInitialCoordinates(0, 0, size);

// size is actually line length of substitution pieces
size = 100;
output.addGrid();

// parameters for drawing
const tiling = {};
// colors
tiling.rhombColor = '#ff0000';
tiling.squareColor = '#00ff00';
tiling.triangleAColor = '#aaaaaa';
tiling.triangleBColor = '#ffff00';
tiling.triangleCColor = '#0000ff';
tiling.borderColor = '#000000';
tiling.borderWidth = 2;
tiling.border = true;
tiling.hyperBorderColor = '#000000';
tiling.hyperBorderWidth = 3;
tiling.hyperBorder = true;

// tiling
// triangle A has undetermined triangles
tiling.freeTriangleA = triangleX;
// triangle B has undetermined triangles
tiling.freeTriangleB = triangleX;
tiling.maxGen = 1;

const colorController = {
    type: 'color',
    params: tiling,
    onChange: function() {
        draw();
    }
};

const widthController = {
    type: 'number',
    params: tiling,
    min: 0.1,
    onChange: function() {
        draw();
    }
};

gui.addParagraph('<strong>colors of tiles</strong>');

gui.add(colorController, {
    property: 'rhombColor',
    labelText: 'rhomb'
});

gui.add(colorController, {
    property: 'squareColor',
    labelText: 'square'
});

gui.add(colorController, {
    property: 'triangleAColor',
    labelText: 'triangleA'
});

gui.add(colorController, {
    property: 'triangleBColor',
    labelText: 'triangleB'
});

gui.add(colorController, {
    property: 'triangleCColor',
    labelText: 'triangleC'
});

gui.addParagraph('<strong>borders of tiles</strong>');

BooleanButton.greenRedBackground();
const borderController = gui.add({
    type: 'boolean',
    params: tiling,
    property: 'border',
    onChange: function() {
        draw();
    }
});

borderController.add(widthController, {
    property: 'borderWidth',
    labelText: 'width'
});

gui.add(colorController, {
    property: 'borderColor',
    labelText: 'color'
});

const hyperBorderController = gui.add({
    type: 'boolean',
    params: tiling,
    property: 'hyperBorder',
    onChange: function() {
        draw();
    }
});

hyperBorderController.add(widthController, {
    property: 'hyperBorderWidth',
    labelText: 'width'
});

gui.add(colorController, {
    property: 'hyperBorderColor',
    labelText: 'color'
});

gui.addParagraph('<strong>tiling</strong>');

gui.add({
    type: 'number',
    params: tiling,
    property: 'maxGen',
    labelText: 'iterations',
    min: 0,
    step: 1,
    onChange: function() {
        draw();
    }
});


// tiles of the tiling
//--------------------
const rt32 = 0.5 * Math.sqrt(3);
const rt3 = Math.sqrt(3);

// actually the minimum square, center of full square at (blX,blY), (trX,trY) is opposite corner
function square(gen, blX, blY, trX, trY) {
    // make center and missing corners
    let cX = 0.5 * (blX + trX);
    let cY = 0.5 * (blY + trY);
    const dX = trX - cX;
    const dY = trY - cY;
    const brX = cX + dY;
    const brY = cY - dX;
    const tlX = cX - dY;
    const tlY = cY + dX;
    if (output.isInCanvas(blX, blY, brX, brY, trX, trY, tlX, tlY)) {
        if (gen >= tiling.maxGen) {
            if (tiling.drawBorders) {
                if (tiling.border) {
                    canvasContext.strokeStyle = tiling.borderColor;
                    output.setLineWidth(tiling.borderWidth);
                    output.makePath(blX, blY, brX, brY, trX, trY, tlX, tlY);
                    canvasContext.closePath();
                    canvasContext.stroke();
                }
            } else {
                canvasContext.fillStyle = tiling.squareColor;
                output.makePath(blX, blY, brX, brY, trX, trY, tlX, tlY);
                canvasContext.fill();
            }
        } else {
            // substitution: determine "right" and "up" directions. Vectorlength=side length of new tiles
            // 0.732050808 = 2 / (1 + rt3);
            const upX = 0.732050808 * (tlX - blX);
            const upY = 0.732050808 * (tlY - blY);
            const rightX = upY;
            const rightY = -upX;
            gen += 1;
            cX = brX + 0.5 * (upX - rightX);
            cY = brY + 0.5 * (upY - rightY);
            square(gen, brX, brY, cX, cY);
            triangleB(gen, brX + 0.5 * upX, brY + 0.5 * upY, cX, cY, trX, trY);
            triangleB(gen, brX - 0.5 * rightX, brY - 0.5 * rightY, cX, cY, blX, blY);
            cX = tlX - 0.5 * (upX - rightX);
            cY = tlY - 0.5 * (upY - rightY);
            square(gen, tlX, tlY, cX, cY);
            triangleB(gen, tlX + 0.5 * rightX, tlY + 0.5 * rightY, cX, cY, trX, trY);
            triangleB(gen, tlX - 0.5 * upX, tlY - 0.5 * upY, cX, cY, blX, blY);
            rhomb(gen, blX, blY, trX, trY);
            if (tiling.drawBorders && tiling.hyperBorder && (gen === tiling.maxGen)) {
                canvasContext.strokeStyle = tiling.hyperBorderColor;
                output.setLineWidth(tiling.hyperBorderWidth);
                output.makePath(blX, blY, brX, brY, trX, trY, tlX, tlY);
                canvasContext.closePath();
                canvasContext.stroke();
            }
        }
    }
}

// the rhomb, coordinates of the corners with acute angles
function rhomb(gen, bX, bY, tX, tY) {
    // make center and missing corners
    const cX = 0.5 * (bX + tX);
    const cY = 0.5 * (bY + tY);
    // 0.378937382=tan(Math.PI/12)*sqrt(2);
    const upX = 0.378937382 * (cX - bX);
    const upY = 0.378937382 * (cY - bY);
    const rightX = upY;
    const rightY = -upX;
    const rX = cX + 0.7071 * rightX;
    const rY = cY + 0.7071 * rightY;
    const lX = cX - 0.7071 * rightX;
    const lY = cY - 0.7071 * rightY;
    if (output.isInCanvas(bX, bY, rX, rY, tX, tY, lX, lY)) {
        if (gen >= tiling.maxGen) {
            if (tiling.drawBorders) {
                if (tiling.border) {
                    canvasContext.strokeStyle = tiling.borderColor;
                    output.setLineWidth(tiling.borderWidth);
                    output.makePath(bX, bY, rX, rY, tX, tY, lX, lY);
                    canvasContext.closePath();
                    canvasContext.stroke();
                }
            } else {
                canvasContext.fillStyle = tiling.rhombColor;
                output.makePath(bX, bY, rX, rY, tX, tY, lX, lY);
                canvasContext.fill();
            }
        } else {
            gen += 1;
            const bcX = cX - 0.7071 * upX;
            const bcY = cY - 0.7071 * upY;
            const tcX = cX + 0.7071 * upX;
            const tcY = cY + 0.7071 * upY;
            rhomb(gen, bX, bY, bcX, bcY);
            rhomb(gen, tX, tY, tcX, tcY);
            square(gen, cX, cY, lX, lY);
            square(gen, cX, cY, rX, rY);
            square(gen, cX, cY, bcX, bcY);
            square(gen, cX, cY, tcX, tcY);
            // sqrt(0.5)-sqrt(3)/2*cos(75)=0.48296
            // sqrt(3)/2*sin(75)=0.83652
            let x = cX + 0.48296 * rightX + 0.83652 * upX;
            let y = cY + 0.48296 * rightY + 0.83652 * upY;
            // sqrt(0.5)-sqrt(3)*cos(75)=0.25881
            // sqrt(3)*sin(75)=1.67303
            triangleA(gen, x, y, tcX, tcY, rX, rY);
            triangleC(gen, x, y, tcX, tcY, cX + 0.25881 * rightX + 1.67303 * upX, cY + 0.25881 * rightY + 1.67303 * upY);
            x = cX - 0.48296 * rightX + 0.83652 * upX;
            y = cY - 0.48296 * rightY + 0.83652 * upY;
            triangleA(gen, x, y, tcX, tcY, lX, lY);
            triangleC(gen, x, y, tcX, tcY, cX - 0.25881 * rightX + 1.67303 * upX, cY - 0.25881 * rightY + 1.67303 * upY);
            x = cX + 0.48296 * rightX - 0.83652 * upX;
            y = cY + 0.48296 * rightY - 0.83652 * upY;
            triangleA(gen, x, y, bcX, bcY, rX, rY);
            triangleC(gen, x, y, bcX, bcY, cX + 0.25881 * rightX - 1.67303 * upX, cY + 0.25881 * rightY - 1.67303 * upY);
            x = cX - 0.48296 * rightX - 0.83652 * upX;
            y = cY - 0.48296 * rightY - 0.83652 * upY;
            triangleA(gen, x, y, bcX, bcY, lX, lY);
            triangleC(gen, x, y, bcX, bcY, cX - 0.25881 * rightX - 1.67303 * upX, cY - 0.25881 * rightY - 1.67303 * upY);
            if (tiling.drawBorders && tiling.hyperBorder && (gen === tiling.maxGen)) {
                canvasContext.strokeStyle = tiling.hyperBorderColor;
                output.setLineWidth(tiling.hyperBorderWidth);
                output.makePath(bX, bY, rX, rY, tX, tY, lX, lY);
                canvasContext.closePath();
                canvasContext.stroke();
            }
        }
    }
}

// halves of triangles, asymmetric!
// (mX,mY) is midpoint of base of full triangle. Has 90 degree angle corner
// (bX,bY) is other point at base. 60 degree angle corner
// (cX,cY) is top, 30 degree angle corner

// undetermined triangle, transparent
function triangleX(gen, mX, mY, bX, bY, cX, cY) {
    if (output.isInCanvas(mX, mY, bX, bY, cX, cY)) {
        if (gen >= tiling.maxGen) {
            if (tiling.drawBorders) {
                if (tiling.border) {
                    canvasContext.strokeStyle = tiling.borderColor;
                    output.setLineWidth(tiling.borderWidth);
                    output.makePath(mX, mY, bX, bY, cX, cY);
                    canvasContext.closePath();
                    canvasContext.stroke();
                }
            } else {}
        } else {
            // make directions
            // attention: mirror images
            // 0.732050808 = 2 / (1 + rt3);
            const rightX = 0.732050808 * (bX - mX);
            const rightY = 0.732050808 * (bY - mY);
            // 0.422649=2/(3+sqrt(3))
            const upX = 0.422649 * (cX - mX);
            const upY = 0.422649 * (cY - mY);
            gen += 1;
            const cenX = mX + 0.5 * (upX + rightX);
            const cenY = mY + 0.5 * (upY + rightY);
            square(gen, mX, mY, cenX, cenY);
            const mcX = cX - upX;
            const mcY = cY - upY;
            triangleX(gen, mX + 0.5 * upX, mY + 0.5 * upY, cenX, cenY, mcX, mcY);
            // unknown triangle
            triangleX(gen, mX + 0.5 * rightX, mY + 0.5 * rightY, cenX, cenY, bX, bY);
            //   triangleA(gen, bX - 0.433012 * rightX + 0.75 * upX, bY - 0.433012 * rightY + 0.75 * upY, cenX, cenY, bX, bY);
            if (tiling.drawBorders && tiling.hyperBorder && (gen === tiling.maxGen)) {
                canvasContext.strokeStyle = tiling.hyperBorderColor;
                output.setLineWidth(tiling.hyperBorderWidth);
                output.makePath(mX, mY, bX, bY, cX, cY);
                canvasContext.closePath();
                canvasContext.stroke();
            }
        }
    }
}

function triangleA(gen, mX, mY, bX, bY, cX, cY) {
    if (output.isInCanvas(mX, mY, bX, bY, cX, cY)) {
        if (gen >= tiling.maxGen) {
            if (tiling.drawBorders) {
                if (tiling.border) {
                    canvasContext.strokeStyle = tiling.borderColor;
                    output.setLineWidth(tiling.borderWidth);
                    output.makePath(mX, mY, bX, bY, cX, cY);
                    canvasContext.closePath();
                    canvasContext.stroke();
                }
            } else {
                canvasContext.fillStyle = tiling.triangleAColor;
                output.makePath(mX, mY, bX, bY, cX, cY);
                canvasContext.fill();
            }
        } else {
            // make directions
            // attention: mirror images
            // 0.732050808 = 2 / (1 + rt3);
            const rightX = 0.732050808 * (bX - mX);
            const rightY = 0.732050808 * (bY - mY);
            // 0.422649=2/(3+sqrt(3))
            const upX = 0.422649 * (cX - mX);
            const upY = 0.422649 * (cY - mY);
            gen += 1;
            const cenX = mX + 0.5 * (upX + rightX);
            const cenY = mY + 0.5 * (upY + rightY);
            square(gen, mX, mY, cenX, cenY);
            const bcX = 0.5 * (bX + cX);
            const bcY = 0.5 * (bY + cY);
            const mcX = cX - upX;
            const mcY = cY - upY;
            triangleA(gen, mX + 0.5 * upX, mY + 0.5 * upY, cenX, cenY, mcX, mcY);
            square(gen, bcX, bcY, cenX, cenY);
            square(gen, bcX, bcY, mcX, mcY);
            // 0.433012=sqrt(3)/4
            triangleB(gen, mcX, mcY, cX + 0.433012 * rightX - 0.75 * upX, cY + 0.433012 * rightY - 0.75 * upY, cX, cY);
            // free triangles
            tiling.freeTriangleA(gen, mX + 0.5 * rightX, mY + 0.5 * rightY, cenX, cenY, bX, bY);
            tiling.freeTriangleA(gen, bX - 0.433012 * rightX + 0.75 * upX, bY - 0.433012 * rightY + 0.75 * upY, cenX, cenY, bX, bY);
            if (tiling.drawBorders && tiling.hyperBorder && (gen === tiling.maxGen)) {
                canvasContext.strokeStyle = tiling.hyperBorderColor;
                output.setLineWidth(tiling.hyperBorderWidth);
                output.makePath(mX, mY, bX, bY, cX, cY);
                canvasContext.closePath();
                canvasContext.stroke();
            }
        }
    }
}

function triangleB(gen, mX, mY, bX, bY, cX, cY) {
    if (output.isInCanvas(mX, mY, bX, bY, cX, cY)) {
        if (gen >= tiling.maxGen) {
            if (tiling.drawBorders) {
                if (tiling.border) {
                    canvasContext.strokeStyle = tiling.borderColor;
                    output.setLineWidth(tiling.borderWidth);
                    output.makePath(mX, mY, bX, bY, cX, cY);
                    canvasContext.closePath();
                    canvasContext.stroke();
                }
            } else {
                canvasContext.fillStyle = tiling.triangleBColor;
                output.makePath(mX, mY, bX, bY, cX, cY);
                canvasContext.fill();
            }
        } else {
            // make directions
            // attention: mirror images
            // 0.732050808 = 2 / (1 + rt3);
            const rightX = 0.732050808 * (bX - mX);
            const rightY = 0.732050808 * (bY - mY);
            // 0.422649=2/(3+sqrt(3))
            const upX = 0.422649 * (cX - mX);
            const upY = 0.422649 * (cY - mY);
            gen += 1;
            const cenX = mX + 0.5 * (upX + rightX);
            const cenY = mY + 0.5 * (upY + rightY);
            square(gen, mX, mY, cenX, cenY);
            rhomb(gen, cX, cY, cenX, cenY);
            const mcX = cX - upX;
            const mcY = cY - upY;
            const bcX = bX - 0.433012 * rightX + 0.75 * upX;
            const bcY = bY - 0.433012 * rightY + 0.75 * upY;
            triangleC(gen, mX + 0.5 * upX, mY + 0.5 * upY, cenX, cenY, mcX, mcY);
            triangleC(gen, bcX, bcY, cenX, cenY, cenX + upX, cenY + upY);
            // free triangles
            tiling.freeTriangleB(gen, mX + 0.5 * rightX, mY + 0.5 * rightY, cenX, cenY, bX, bY);
            tiling.freeTriangleB(gen, bcX, bcY, cenX, cenY, bX, bY);
            if (tiling.drawBorders && tiling.hyperBorder && (gen === tiling.maxGen)) {
                canvasContext.strokeStyle = tiling.hyperBorderColor;
                output.setLineWidth(tiling.hyperBorderWidth);
                output.makePath(mX, mY, bX, bY, cX, cY);
                canvasContext.closePath();
                canvasContext.stroke();
            }
        }
    }
}

function triangleC(gen, mX, mY, bX, bY, cX, cY) {
    if (output.isInCanvas(mX, mY, bX, bY, cX, cY)) {
        if (gen >= tiling.maxGen) {
            if (tiling.drawBorders) {
                if (tiling.border) {
                    canvasContext.strokeStyle = tiling.borderColor;
                    output.setLineWidth(tiling.borderWidth);
                    output.makePath(mX, mY, bX, bY, cX, cY);
                    canvasContext.closePath();
                    canvasContext.stroke();
                }
            } else {
                canvasContext.fillStyle = tiling.triangleCColor;
                output.makePath(mX, mY, bX, bY, cX, cY);
                canvasContext.fill();
            }
        } else {
            // make directions
            // attention: mirror images
            // 0.732050808 = 2 / (1 + rt3);
            const rightX = 0.732050808 * (bX - mX);
            const rightY = 0.732050808 * (bY - mY);
            // 0.422649=2/(3+sqrt(3))
            const upX = 0.422649 * (cX - mX);
            const upY = 0.422649 * (cY - mY);
            gen += 1;
            const cenX = mX + 0.5 * (upX + rightX);
            const cenY = mY + 0.5 * (upY + rightY);
            square(gen, mX, mY, cenX, cenY);
            const mcX = cX - upX;
            const mcY = cY - upY;
            // 0.433012=sqrt(3)/4
            const bcX = cX + 0.433012 * rightX - 0.75 * upX;
            const bcY = cY + 0.433012 * rightY - 0.75 * upY;
            rhomb(gen, bX, bY, mcX, mcY);
            triangleB(gen, bcX, bcY, mcX, mcY, cX, cY);
            triangleC(gen, bcX, bcY, mcX, mcY, cX + rt32 * rightX - 1.5 * upX, cY + rt32 * rightY - 1.5 * upY);
            triangleB(gen, mX + 0.5 * upX, mY + 0.5 * upY, cenX, cenY, mcX, mcY);
            triangleB(gen, mX + 0.5 * rightX, mY + 0.5 * rightY, cenX, cenY, bX, bY);
            if (tiling.drawBorders && tiling.hyperBorder && (gen === tiling.maxGen)) {
                canvasContext.strokeStyle = tiling.hyperBorderColor;
                output.setLineWidth(tiling.hyperBorderWidth);
                output.makePath(mX, mY, bX, bY, cX, cY);
                canvasContext.closePath();
                canvasContext.stroke();
            }
        }
    }
}

function initial() {

    square(0, -100, 0, 100, 100);
    //    rhomb(0, -200, -50, 200, 100);
    //   triangleA(0, 0, 0, 100, 0, 0, 100 * rt3);
    //  triangleX(0, 0, 0, 0, 100, 100 * rt3, 0);
    //  triangleC(0,- 100/4, +100*rt32/2, 0, 0,- 100 , 0);
}

function draw() {
    output.lineRound();
    output.fillCanvasBackgroundColor();
    output.correctYAxis();
    // either draw borders or some tile-design
    tiling.drawBorders = false;
    initial();
    if (tiling.hyperBorder||tiling.border){
    tiling.drawBorders = true;
    initial();        
    }
    output.drawGrid();
}

output.setDrawMethods(draw);
output.backgroundColorController.setValue('#eeeeee');

draw();