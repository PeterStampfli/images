// doing the ammann beenker tiling using iteration methods ..

ammannBeenker = {};


// initialization

ammannBeenker.bins = new Bins();
ammannBeenker.bins.setup(-10, 10, -10, 10, 0.5);

ammannBeenker.imageTriangles=new UniquePolygons();


/** 
 * create an image parallelogram (or square) from given four corners,
 * consists of four triangles
 * type abab
 * @method ammannBeenker.createABABParallelogram
 * @param {Vector2} a - corner counter clockwise
 * @param {Vector2} b  
 * @param {Vector2} c  
 * @param {Vector2} d 
 */