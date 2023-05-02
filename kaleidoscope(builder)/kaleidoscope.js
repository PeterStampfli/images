/* jshint esversion:6 */



export const kaleidoscope = {};

kaleidoscope.k = 5;
kaleidoscope.m = 4;


kaleidoscope.setup = function(gui) {
    gui.addParagraph('kaleidoscope');
    gui.add({
        type: 'number',
        params: kaleidoscope,
        property: 'k',
        min: 1,
        step: 1,
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: kaleidoscope,
        property: 'm',
        min: 1,
        step: 1,
        onChange: julia.drawNewStructure
    });
    kaleidoscope.type = kaleidoscope.regular;
    gui.add({
        type: 'selection',
        params: kaleidoscope,
        property: 'type',
        options: {
            regular: kaleidoscope.regular,
            rectified: kaleidoscope.rectified,
            'uniform truncated': kaleidoscope.uniformTruncated
        },
        onChange: julia.drawNewStructure
    });

};

kaleidoscope.regular = function(k, m) {};