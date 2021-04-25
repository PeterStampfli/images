/* jshint esversion: 6 */

/*
the html page calls this module
it sets up everthing, injecting code into the main object
and calls main.setup
*/

import {
    main
}
from "./main.js";


/**
* setting up the tiling user interface
* @method main.setupTilingUI
*/
main.setupTilingUI=function(){
	console.log('tiling.js setup UI');
};

/**
* making the tiling
* @method main.makeTiling
*/
main.makeTiling=function(){
console.log('tiling.js make tiling');
}



main.setup();
