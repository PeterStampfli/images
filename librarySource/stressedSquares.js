// distorted squares as kaleidoscope
/* jshint esversion:6 */


distortedSquares = {};

(function() {
    "use strict";
    
    // coloring mode
    distortedSquares.twoColor=true;
    // use initially for output image
    // going from -size to +size
    distortedSquares.size = 10;
    distortedSquares.side = 1;

    // the distortion function
    // move a point inside a square around its position
    // maximum displacement =side/2 in x,y directions
    distortedSquares.distortion = function(position) {};


    // the squares
    distortedSquares.structure = []; 
    /**
 * draw the polygon structure 
 * @method distortedSquares.drawStructure
 */
distortedSquares.drawStructure = function() {
    Draw.array(distortedSquares.structure);
};

    distortedSquares.generate = function() {

        const nSides = 2*Math.round(distortedSquares.size / distortedSquares.side) + 2;
        const width=nSides;
        const length=width+width;
        const positions = new Array(length);
        const position = new Vector2();
        var i, j, jWidth, y, index;
        // setting up the lattice
        for (j = 0; j < nSides; j++) {
            jWidth = j * width;
            y = (j - 0.5) * distortedSquares.side-distortedSquares.size;
            for (i = 0; i < nSides; i++) {
                index = i + jWidth;
                position.setComponents((i - 0.5) * distortedSquares.side-distortedSquares.size, y);
                distortedSquares.distortion(position);
                position.log();
                positions[index] = position.clone();
            }

        }




        // clear polygons and empty bins
        imageTiles.reset();
// drawing
        
       for (j = 0; j < nSides-1; j++) {
            jWidth = j * width;
            for (i = 0; i < nSides-1; i++) {
                index = i + jWidth;
                const a=positions[index];
                const b=positions[index+1];
                const c=positions[index+width+1];
                const d=positions[index+width];
                
                
                distortedSquares.structure. push(new PolyPoint(a,b,c,d));
                if (distortedSquares.twoColor){
                                        imageTiles.addTwoColorPolygon(a,b,c,d,(i+j)&1);

                }
                else {
                    imageTiles.addSingleColorPolygon(a,b,c,d);
                }
            }

        }




        // put polygons into bins
        imageTiles.bins.addObjects(imageTiles.polygons);

    };


}());
