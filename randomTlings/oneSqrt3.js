/* jshint esversion: 6 */

import {
    ParamGui,
    output
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
const truchet = {};
truchet.rhomb = '#ff0000';
truchet.square = '#00ff00';
truchet.triangle = '#ffff00';
truchet.lineColor = '#000000';
truchet.lineWidth = 3;

truchet.maxGen = 1;

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
    min: 0.1,
    onChange: function() {
        draw();
    }
};

gui.add(colorController, {
    property: 'rhomb'
});

gui.add(colorController, {
    property: 'square'
});

gui.add(colorController, {
    property: 'triangle'
});


gui.add(widthController, {
    property: 'lineWidth'
});

gui.add(colorController, {
    property: 'lineColor'
});

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
        canvasContext.strokeStyle = 'blue';
        output.makePath(blX, blY, brX, brY, trX, trY, tlX, tlY);
        canvasContext.closePath();
        canvasContext.stroke();
        if (gen >= truchet.maxGen) {
            canvasContext.fillStyle = truchet.square;
            output.makePath(blX, blY, brX, brY, trX, trY, tlX, tlY);
            canvasContext.fill();
            canvasContext.strokeStyle = truchet.lineColor;
            output.makePath(brX, brY, trX, trY, tlX, tlY);
            canvasContext.stroke();
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
            triangleA(gen, brX + 0.5 * upX, brY + 0.5 * upY, cX, cY, trX, trY);
            triangleA(gen, brX - 0.5 * rightX, brY - 0.5 * rightY, cX, cY, blX, blY);
            cX = tlX - 0.5 * (upX - rightX);
            cY = tlY - 0.5 * (upY - rightY);
            square(gen, tlX, tlY, cX, cY);
            triangleA(gen, tlX + 0.5 * rightX, tlY + 0.5 * rightY, cX, cY, trX, trY);
            triangleA(gen, tlX - 0.5 * upX, tlY - 0.5 * upY, cX, cY, blX, blY);
            rhomb(gen, blX, blY, trX, trY);
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
        canvasContext.strokeStyle = 'blue';
        output.makePath(bX, bY, rX, rY, tX, tY, lX, lY);
        canvasContext.closePath();
        canvasContext.stroke();
        if (gen >= truchet.maxGen) {
            canvasContext.fillStyle = truchet.rhomb;
            canvasContext.strokeStyle = truchet.lineColor;
            output.makePath(bX, bY, rX, rY, tX, tY, lX, lY);
            canvasContext.closePath();
            canvasContext.fill();
            canvasContext.stroke();
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
            triangleA(gen, x, y, tcX, tcY, cX + 0.25881 * rightX + 1.67303 * upX, cY + 0.25881 * rightY + 1.67303 * upY);
            x = cX - 0.48296 * rightX + 0.83652 * upX;
            y = cY - 0.48296 * rightY + 0.83652 * upY;
            triangleA(gen, x, y, tcX, tcY, lX, lY);
            triangleA(gen, x, y, tcX, tcY, cX - 0.25881 * rightX + 1.67303 * upX, cY - 0.25881 * rightY + 1.67303 * upY);
            x = cX + 0.48296 * rightX - 0.83652 * upX;
            y = cY + 0.48296 * rightY - 0.83652 * upY;
            triangleA(gen, x, y, bcX, bcY, rX, rY);
            triangleA(gen, x, y, bcX, bcY, cX + 0.25881 * rightX - 1.67303 * upX, cY + 0.25881 * rightY - 1.67303 * upY);
            x = cX - 0.48296 * rightX - 0.83652 * upX;
            y = cY - 0.48296 * rightY - 0.83652 * upY;
            triangleA(gen, x, y, bcX, bcY, lX, lY);
            triangleA(gen, x, y, bcX, bcY, cX - 0.25881 * rightX - 1.67303 * upX, cY - 0.25881 * rightY - 1.67303 * upY);
        }
    }
}

// halves of triangles, asymmetric!
// (mX,mY) is midpoint of base of full triangle. Has 90 degree angle corner
// (bX,bY) is other point at base. 60 degree angle corner
// (cX,cY) is top, 30 degree angle corner
function triangle(gen, mX, mY, bX, bY, cX, cY) {
    if (output.isInCanvas(mX, mY, bX, bY, cX, cY)) {
        canvasContext.strokeStyle = 'blue';
        output.makePath(mX, mY, bX, bY, cX, cY);
        canvasContext.stroke();
        if (gen >= truchet.maxGen) {
            canvasContext.fillStyle = truchet.triangle;
            canvasContext.strokeStyle = truchet.lineColor;
            output.makePath(mX, mY, bX, bY, cX, cY);
            canvasContext.fill();
            canvasContext.stroke();
        } else {
            // make directions
            // 0.732050808 = 2 / (1 + rt3);
            const rightX = 0.732050808 * (bX - mX);
            const rightY = 0.732050808 * (bY - mY);
            const upX = -rightY;
            const upY = rightX;
            gen+=1;
            const cenX=mX+0.5*(upX+rightX);
            const cenY=mY+0.5*(upY+rightY)
            square(gen,mX,mY,cenX,cenY);
const mcX=cX-upX;
const mcY=cY-upY;
triangleA(gen,mX+0.5*upX,mY+0.5*upY,cenX,cenY,mcX,mcY);

// free triangles
triangleA(gen,mX+0.5*rightX,mY+0.5*rightY,cenX,cenY,bX,bY);
triangleA(gen,bX-0.433012*rightX+0.75*upX,bY-0.433012*rightY+0.75*upY,cenX,cenY,bX,bY);

        }
    }
}

function triangleA(gen, mX, mY, bX, bY, cX, cY) {
    if (output.isInCanvas(mX, mY, bX, bY, cX, cY)) {
        canvasContext.strokeStyle = 'blue';
        output.makePath(mX, mY, bX, bY, cX, cY);
        canvasContext.stroke();
        if (gen >= truchet.maxGen) {
            canvasContext.fillStyle = truchet.triangle;
            canvasContext.strokeStyle = truchet.lineColor;
            output.makePath(mX, mY, bX, bY, cX, cY);
            canvasContext.fill();
            canvasContext.stroke();
        } else {
            // make directions
            // 0.732050808 = 2 / (1 + rt3);
            const rightX = 0.732050808 * (bX - mX);
            const rightY = 0.732050808 * (bY - mY);
            const upX = -rightY;
            const upY = rightX;
            gen+=1;
            const cenX=mX+0.5*(upX+rightX);
            const cenY=mY+0.5*(upY+rightY)
            square(gen,mX,mY,cenX,cenY);
const bcX=0.5*(bX+cX);
const bcY=0.5*(bY+cY);
const mcX=cX-upX;
const mcY=cY-upY;
triangleA(gen,mX+0.5*upX,mY+0.5*upY,cenX,cenY,mcX,mcY);
square(gen,bcX,bcY,cenX,cenY);
square(gen,bcX,bcY,mcX,mcY);
// 0.433012=sqrt(3)/4
triangleA(gen,mcX,mcY,cX+0.433012*rightX-0.75*upX,cY+0.433012*rightY-0.75*upY,cX,cY);
// free triangles
triangleA(gen,mX+0.5*rightX,mY+0.5*rightY,cenX,cenY,bX,bY);
triangleA(gen,bX-0.433012*rightX+0.75*upX,bY-0.433012*rightY+0.75*upY,cenX,cenY,bX,bY);
        }
    }
}

function triangleB(gen, mX, mY, bX, bY, cX, cY) {
    if (output.isInCanvas(mX, mY, bX, bY, cX, cY)) {
        canvasContext.strokeStyle = 'blue';
        output.makePath(mX, mY, bX, bY, cX, cY);
        canvasContext.stroke();
        if (gen >= truchet.maxGen) {
            canvasContext.fillStyle = truchet.triangle;
            canvasContext.strokeStyle = truchet.lineColor;
            output.makePath(mX, mY, bX, bY, cX, cY);
            canvasContext.fill();
            canvasContext.stroke();
        } else {
            // make directions
            // 0.732050808 = 2 / (1 + rt3);
            const rightX = 0.732050808 * (bX - mX);
            const rightY = 0.732050808 * (bY - mY);
            const upX = -rightY;
            const upY = rightX;
            gen+=1;
            const cenX=mX+0.5*(upX+rightX);
            const cenY=mY+0.5*(upY+rightY)
            square(gen,mX,mY,cenX,cenY);
const mcX=cX-upX;
const mcY=cY-upY;
triangleA(gen,mX+0.5*upX,mY+0.5*upY,cenX,cenY,mcX,mcY);

// free triangles
triangleA(gen,mX+0.5*rightX,mY+0.5*rightY,cenX,cenY,bX,bY);
triangleA(gen,bX-0.433012*rightX+0.75*upX,bY-0.433012*rightY+0.75*upY,cenX,cenY,bX,bY);

        }
    }
}

function triangleC(gen, mX, mY, bX, bY, cX, cY) {
    if (output.isInCanvas(mX, mY, bX, bY, cX, cY)) {
        canvasContext.strokeStyle = 'blue';
        output.makePath(mX, mY, bX, bY, cX, cY);
        canvasContext.stroke();
        if (gen >= truchet.maxGen) {
            canvasContext.fillStyle = truchet.triangle;
            canvasContext.strokeStyle = truchet.lineColor;
            output.makePath(mX, mY, bX, bY, cX, cY);
            canvasContext.fill();
            canvasContext.stroke();
        } else {
            // make directions
            // 0.732050808 = 2 / (1 + rt3);
            const rightX = 0.732050808 * (bX - mX);
            const rightY = 0.732050808 * (bY - mY);
            const upX = -rightY;
            const upY = rightX;
            gen+=1;
            const cenX=mX+0.5*(upX+rightX);
            const cenY=mY+0.5*(upY+rightY)
            square(gen,mX,mY,cenX,cenY);
const mcX=cX-upX;
const mcY=cY-upY;
triangleA(gen,mX+0.5*upX,mY+0.5*upY,cenX,cenY,mcX,mcY);

// free triangles
triangleA(gen,mX+0.5*rightX,mY+0.5*rightY,cenX,cenY,bX,bY);
triangleA(gen,bX-0.433012*rightX+0.75*upX,bY-0.433012*rightY+0.75*upY,cenX,cenY,bX,bY);

        }
    }
}
function draw() {
    output.lineRound();
    output.fillCanvasBackgroundColor();
      output.correctYAxis();

    //  square(0, -100, 0, 100, 100);
    //   rhomb(0, -200, -50, 200, 100);
    triangleB(0, 0, 0, 100, 0, 0, 100 * rt3);
    output.drawGrid();
}

output.setDrawMethods(draw);
output.backgroundColorController.setValue('#ccccff');

draw();