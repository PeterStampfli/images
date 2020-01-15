/**
 * iterating tilings, framework for data, mainly
 * @namespace iterateTiling
 */

/* jshint esversion:6 */

iterateTiling = {};

// use initially for output image
iterateTiling.initialSpaceLimit = 10;

// has polygons for each generation
iterateTiling.structure = []; // of unique polygons

// the polygons for the image are in imageTiles

/**
 * set maximum number of iterations
 * @method iterateTiling.setMaxIterations
 * @param {integer} maxIterations
 */
iterateTiling.setMaxIterations = function(maxIterations) {
    iterateTiling.maxIterations = maxIterations;
};

/*
 * how to do it:
 * 
 * iterateTiling.initialPolygons=theTiling.initial;
 * theTiling.initial=function(){
 *  theTiling.polygon(0,...);
 *  theTiling.polygon(0,...);
 *  ..............
 * }
 * 
 * theTiling.polygon=function(ite, ....){
 *  calculate corners
 *  if (iterateTiling.structure[ite].isNewPolygon(corners)){  // do only something if new, adds polygon to list
 *   if (ite<iterateTiling.maxIterations){            // continue iterative decomposition
 *     theTiling.polygon(ite+1, ....)
 *     theTiling.polygon(ite+1, ....)
 *     theTiling.polygon(ite+1, ....)
 *    ...............................
 *   }
 *   else {                                  // generate image
 *    imageTiles.add....
 *    imageTiles.add....
 *    imageTiles.add....
 *   }
 *  }
 * }
 */

/**
 * tiling dependent: initial polygons, for tests - do nothing grid
 * @method iterateTiling.initialPolygons
 */
iterateTiling.initialPolygons = function() {};

/**
 * test if a polygon (its corners) is out side the initial visible space
 * 
 * 
 */
iterateTiling.isOutside = function(corners) {
    var theCorners;
    if (arguments.length === 1) {
        theCorners = corners;
    } else {
        theCorners = arguments;
    }
    const nCorners = theCorners.length;
    let tooHigh = true;
    let tooLow = true;
    let tooRight = true;
    let tooLeft = true;
    var corner;
    const limit = iterateTiling.initialSpaceLimit + 1;
    for (var i = 0; i < nCorners; i++) {
        corner = theCorners[i];
        tooHigh = tooHigh && (corner.y > limit);
        tooLow = tooLow && (corner.y < -limit);
        tooLeft = tooLeft && (corner.x < -limit);
        tooRight = tooRight && (corner.x > limit);
    }
    return tooHigh || tooLow || tooLeft || tooRight;
};

/**
 * draw the polygon structure of one generation
 * @method iterateTiling.drawStructure
 * @param {integrer} i - number of generation
 */
iterateTiling.drawStructure = function(i) {
    Draw.array(iterateTiling.structure[i]);
};

/**
 * make the tiling 
 * @method iterateTiling.generateStructure
 */
iterateTiling.generateStructure = function() {
    // clear and set up data depending on number of maximum iterations
    iterateTiling.structure.length = 0;
    for (var i = 0; i <= iterateTiling.maxIterations; i++) {
        iterateTiling.structure.push([]); // push empty arrays
    }
    // clear polygons and empty bins
    imageTiles.reset();
    // calling initial polygons -> structure through iterations
    iterateTiling.initialPolygons();
    // put polygons into bins
    imageTiles.bins.addObjects(imageTiles.polygons);
};
