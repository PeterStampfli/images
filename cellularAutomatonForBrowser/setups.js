/* jshint esversion: 6 */

import {
    utils,
    colors,
    main
} from "./modules.js";

export const setups={};

setups.reset=function(){

setups.neumann();

};

//=========
setups.neumann = function() {
    const size = 100;
    const nColors = 4;
    const nStates = 8;
    const average = true;
    const maxAverage = 20;
    const minView = 4;
    const maxView = 50;
    const initConfig = utils.center(1);
    utils.setSize(size);
    colors.random(nColors);
    utils.transitionTable = utils.sawToothTable;
    utils.transition = utils.irreversibleTransition;
    utils.image = utils.cubicImage;
    utils.weights.push(utils.neumann(1, 1));
    utils.setViewLimits(minView, maxView);
    utils.squareLattice(average);
    utils.initialState(initConfig);
};