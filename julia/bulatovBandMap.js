/* jshint esversion:6 */
// transformation from band to circle


function bulatovBand() {
    const a = 1; //original transform
    const piA2 = Math.PI * a / 2;
    const iTanPiA4 = 1.0 / Math.tan(Math.PI * a / 4);
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;
    for (let index = 0; index < nPixels; index++) {
        /* do only transform if pixel is valid*/
        if (structureArray[index] < 128) {
            const x = piA2 * xArray[index];
            const y = piA2 * yArray[index];
            const exp2x = Math.exp(x);
            const base = iTanPiA4 / (exp2x + 1.0 / exp2x + 2 * Math.cos(y));
            xArray[index] = (exp2x - 1.0 / exp2x) * base;
            yArray[index] = 2 * Math.sin(y) * base;
        }
    }
}