/* jshint esversion: 6 */

/*
the html page calls this module
it sets up everthing, injecting code into the main object
and calls main.setup
*/

import {
    main,
    Lines,
    Areas,
    tiles
}
from "./modules.js";

const areas = new Areas({
    color: '#ff0000',
    lineWidth: 2,
    overprinting: false
});

/**
 * setting up the tiling user interface
 * @method main.setupTilingUI
 */
main.setupTilingUI = function() {
    console.log('tiling.js setup UI');
    tiles.makeUI();
    areas.makeUI('test', true);
    areas.hideUI();
    areas.showUI();
};

/**
 * making the tiling
 * @method main.makeTiling
 */
main.makeTiling = function() {
    console.log('tiling.js make tiling');
};


/**
 * drawing the tiling
 * @method main.drawTiling
 */
main.drawTiling = function() {
    Lines.initDrawing();
    areas.draw();
    tiles.draw();
};

main.setup();


areas.add(-1, 0, 0.5, 0.2, 1, 0.9);

tiles.clear();

//tiles.partRegularPolygon(true,true,-1,0,0,0,0,1,-1,1,-0.5,0.5);
tiles.rhomb60(true, true, -1, 0, 0, -Math.tan(Math.PI / 6), 1, 0, 0, Math.tan(Math.PI / 6));

main.drawMapChanged();