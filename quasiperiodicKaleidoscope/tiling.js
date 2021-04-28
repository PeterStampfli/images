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

const areas=new Areas({color:'#ff0000',lineWidth:50,overprinting:false});

/**
* setting up the tiling user interface
* @method main.setupTilingUI
*/
main.setupTilingUI=function(){
	console.log('tiling.js setup UI');
	tiles.makeUI(false);
	areas.makeUI('test');
	areas.hideUI();
	areas.showUI()
};

/**
* making the tiling
* @method main.makeTiling
*/
main.makeTiling=function(){
console.log('tiling.js make tiling');
}


main.setup();


areas.add(-1,0,0.5,0.2,1,0.9);
Lines.init();
areas.draw();