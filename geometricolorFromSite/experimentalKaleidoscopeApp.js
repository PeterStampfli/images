// additional things required for experimental app
// may overwrite earlier things

/* jshint esversion:6 */

parameters.initialN = 4;
basicKaleidoscope.maxIterations=3;
basicKaleidoscope.minIterations=1;
basicKaleidoscope.hasLens=true;
basicKaleidoscope.lensAbs=0;
basicKaleidoscope.lensPositive=false;
basicKaleidoscope.lensNorm=2;

Make.lensController=new NumberButton('lens');
Make.lensController.setRange(-1,1);
Make.lensController.setStep(0.001);
Make.lensController.setValue(0);
Make.lensController.onChange=function(){
    const lensValue=Make.lensController.getValue();
    basicKaleidoscope.lensAbs=Math.abs(lensValue);
    basicKaleidoscope.lensPositive=(lensValue>0);
    basicKaleidoscope.lensNorm=1+Math.sqrt(1-basicKaleidoscope.lensAbs);
    Make.updateNewMap();
};


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