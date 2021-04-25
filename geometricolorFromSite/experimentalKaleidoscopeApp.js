// additional things required for experimental app
// may overwrite earlier things

/* jshint esversion:6 */

parameters.initialN = 4;
basicKaleidoscope.maxIterations=3;
basicKaleidoscope.minIterations=1;

Make.rangeController =  NumberButton.createPlusMinus('range');
Make.rangeController.setRange(1, 200);
Make.rangeController.setValue(basicKaleidoscope.maxIterations);

Make.rangeController.onChange = function() {
    basicKaleidoscope.maxIterations = Make.rangeController.getValue();
    Make.updateNewMap();
};


Make.rangeMinController = NumberButton.createPlusMinus('rangeMin');
Make.rangeMinController.setRange(0, 200);
Make.rangeMinController.setValue(basicKaleidoscope.minIterations);

Make.rangeMinController.onChange = function() {
    basicKaleidoscope.minIterations = Make.rangeMinController.getValue();
    Make.updateNewMap();
};

    Make.initializeExtras=function(){
    parameters.tilingSelect.addOption("polygons",
        function() {
             parameters.setNButton.setRange(2, 10000);
            parameters.setKButton.setRange(3, 10000);
            parameters.changeTiling("polygons");
        });
};