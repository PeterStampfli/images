// distorted squares as kaleidoscope
/* jshint esversion:6 */


distortedSquares = {};

(function() {
    "use strict";
    // use initially for output image
    distortedSquares.size = 10;
    distortedSquares.side = 1;

    // the distortion function
    distortedSquares.distortion = function(position) {};


    // the squares
    distortedSquares.structure = []; // of unique polygons

    distortedSquares.generate = function() {

        const nSides = Math.round(distortedSquares.size / distortedSquares.side) + 2;
        const positionX = new Array(nSides * nSides);
        const positionY = new Array(nSides * nSides);
        const position = new Vector2();
        var i, j, jWidth, y, index;
        // setting up the lattice
        for (j = 0; j < nSides; j++) {
            jWidth = j * nSides;
            y = (j - 0.5) * distortedSquares.side;
            for (i = 0; i < nSides; i++) {
                index = i + jWidth;
                position.setComponents((i - 0.5) * distortedSquares.side, y);
                distortedSquares.distortion(position);
                positionX[index] = position.x;
                positionY[index] = position.y;
            }

        }




        // clear polygons and empty bins
        imageTiles.reset();





        // put polygons into bins
        imageTiles.bins.addObjects(imageTiles.polygons);

    };


}());
