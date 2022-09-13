/* jshint esversion: 6 */

import {
    ParamGui,
    output,
    BooleanButton,
    guiUtils,
    SVG
}
from "../libgui/modules.js";


const gui = new ParamGui({
    closed: false
});

const svgns = 'http://www.w3.org/2000/svg';

SVG.init();

const theSvg = SVG.element;

//svg.setAttribute('width','400');
//svg.setAttribute('height','400');


const rect = document.createElementNS(svgns, 'rect');

guiUtils.setAttributes([rect], {
    width: 500,
    height: 100
});

//rect.setAttribute('width', '500');
//rect.setAttribute('height', '400');
rect.setAttribute('fill', 'blue');
theSvg.appendChild(rect);

console.log(SVG.text);