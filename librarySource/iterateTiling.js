/**
 * iterating tilings, framework for data, mainly
 * @namespace iterateTiling
 */

/* jshint esversion:6 */

iterateTiling = {};

// has polygons for each generation
iterateTiling.structure = []; // of unique polygons

// the polygons for the image are in imageTiles

//maximum number of iterations
iterateTiling.maxIterations = 0;

/**
 * clear and set up data depending on number of maximum iterations
 * @method iterateTiling.start
 * @param {integer} maxIterations
 */
iterateTiling.start = function(maxIterations) {
    iterateTiling.maxIterations = maxIterations;
    iterateTiling.structure.length = 0;
    for (var i = 0; i < maxIterations; i++) {
        iterateTiling.structure.push(new UniquePolygons());
    }
    imageTiles.reset();
};

/*
 * how to do it:
 * 
 * function generateTiling(...){
 *  iterateTiling.start(maxIterations);
 *  tilingPolygon(0,...);
 *  tilingPolygon(0,...);
 *  ..............
 * }
 * 
 * function tilingPolygon(ite, ....){
 *  calculate corners
 *  if (iterateTiling.structure[ite].isNewPolygon(corners)){  // do only something if new, add polygon to list
 * 
 * 
 * }
 */
