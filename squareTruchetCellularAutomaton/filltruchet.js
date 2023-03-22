
// draw the truchet fill, that means the quarter circles
Cell.prototype.fillTruchet = function(state) {
    if (this.state === state) {
        if (this.scaledCoordinates.length === 8) {
            const radius = 0.5 * main.scale;
            const totalParity = this.positionParity + this.state;
            if (totalParity % 2 === 0) {
                SVG.createArcFill(this.scaledCoordinates[0], this.scaledCoordinates[1], radius, 0, 0.5 * Math.PI);
                SVG.createArcFill(this.scaledCoordinates[4], this.scaledCoordinates[5], radius, Math.PI, 1.5 * Math.PI);
            } else {
                SVG.createArcFill(this.scaledCoordinates[2], this.scaledCoordinates[3], radius, 0.5 * Math.PI, Math.PI);
                SVG.createArcFill(this.scaledCoordinates[6], this.scaledCoordinates[7], radius, 1.5 * Math.PI, 0);
            }
        }
    }
};