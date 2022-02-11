/* jshint esversion: 6 */

import {
    utils,
    colors,
    main
} from "./modules.js";

export const setups={};

setups.reset=function(){

setups.hexagon();

};

//=========
setups.neumann = function() {
    const size = 100;
    const nColors = 4;
    const nStates = 8;
    const average = false;
    const maxAverage = 20;
    const minView = 4;
    const maxView = 50;
    const initConfig = utils.center(1);
    utils.setSize(size);
    utils.setNStates(nStates);
    colors.random(nColors);
    utils.transitionTable = utils.sawToothTable;
    utils.transition = utils.irreversibleTransition;
    utils.image = utils.linearImage;
    utils.weights.push(utils.neumann(1, 1));
    utils.setViewLimits(minView, maxView);
    utils.squareLattice(average);
    utils.initialState(initConfig);
};

setups.hexagon = function() {
    const size = 100;
    const nColors = 3;
    const nStates = 3;
    const average = false;
    const maxAverage = 20;
    const minView = 4;
    const maxView = 150;
    const initConfig = utils.center(1);
    utils.setSize(size);
    utils.setNStates(nStates);
    colors.random(nColors);
    utils.transitionTable = utils.sawToothTable;
    utils.transition = utils.reversibleTransitionAdditive;
    utils.image = utils.cubicImage;
    utils.weights.push(utils.hexagon(2, 1));
    utils.setViewLimits(minView, maxView);
    utils.hexagonLattice(average);
    utils.initialState(initConfig);
};