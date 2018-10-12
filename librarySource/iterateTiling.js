/**
 * iterating tilings, framework for data, mainly
 * @namespace iterateTiling
 */

/* jshint esversion:6 */

iterateTiling = {};

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
 * tiling dependent: initial polygons
 * @method iterateTiling.initialPolygons
 */
iterateTiling.initialPolygons = function() {};

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
    imageTiles.reset();
    // calling initial polygons -> structure through iterations
    iterateTiling.initialPolygons();
    // put polygons into bins
    imageTiles.bins.addObjects(imageTiles.polygons);
};
