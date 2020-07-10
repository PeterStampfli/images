/* jshint esversion: 6 */

const insideOut='inside-out';
const outsideIn='outside-in';

/**
 * a circle as a building block for kaleidoscopes
 * gets its own gui
 * @constructor Circle
 * @param{ParamGui} gui 
 */
export function Circle(gui) {
    this.radius = 1;
    this.centerX = 0;
    this.centerY = 0;
    this.isOutsideInMap = true;
    this.mapDirection=outsideIn;
    const circle=this;
    this.radiusController = gui.add({
        type: 'number',
        params: this,
        property: 'radius',
        min: 0,
        onChange: function() {
            console.log('radius changed');
        }
    });
    this.centerXController = gui.add({
        type: 'number',
        params: this,
        property: 'centerX',
        labelText: 'center: x',
        onChange: function() {
            console.log('centerX changed');
        }
    });
    this.centerYController = this.centerXController.add({
        type: 'number',
        params: this,
        property: 'centerY',
        labelText: ' y',
        onChange: function() {
            console.log('centerY changed');
        }
    });
    this.mapDirectionController = gui.add({
        type: 'selection',
        params: this,
        property: 'mapDirection',
        options:[outsideIn,insideOut],
        onChange: function() {
        	circle.isOutsideInMap=(circle.mapDirection===outsideIn);
            console.log('mapDirection changed',circle.isOutsideInMap);
        }
    });
}