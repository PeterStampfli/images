mappingSpheres.createImagePoints = function() {
    const eps = 0.01;
    clearImagePoints();
    clearMapping();
    mappingSpheres.config();
    mappingLength = mappingRadius.length;
    for (let i = 1; i < mappingLength; i++) {
        const radiusI = mappingRadius[i];
        const centerXI = mappingCenterX[i];
        const centerYI = mappingCenterY[i];
        for (let j = 0; j < i; j++) {
            // check if spheres touch
            const dx = mappingCenterX[j] - centerXI;
            const dy = mappingCenterY[j] - centerYI;
            const d2 = dx * dx + dy * dy;
            const radiusJ = mappingRadius[j];
            if (Math.abs(d2 - (radiusI + radiusJ) * (radiusI + radiusJ)) < eps) {
                const d = Math.sqrt(d2);
                const h = 0.5 * (radiusI + d - radiusJ) / d;
                const pointX = centerXI + h * dx;
                const pointY = centerYI + h * dy;
                imagePointX.push(pointX);
                imagePointY.push(pointY);
                for (let k = 0; k < mappingLength; k++) {
                    if ((i !== k) && (j !== k)) {
                        const centerXK = mappingCenterX[k];
                        const centerYK = mappingCenterY[k];
                        const dx = pointX - centerXK;
                        const dy = pointY - centerYK;
                        const d2 = dx * dx + dy * dy;
                        const radiusK = mappingRadius[k];
                        const factor = radiusK * radiusK / d2;
                        const newPointX = centerXK + factor * dx;
                        const newPointY = centerYK + factor * dy;
                        imagePointX.push(newPointX);
                        imagePointY.push(newPointY);
                        moreImagePoints(imagePoints.gens, k, newPointX, newPointY);
                    }
                }
            }
        }
    }
};

function moreImagePoints(gens, lastMapping, pointX, pointY) {
    gens -= 1;
    mappingLength = mappingRadius.length;
    for (let k = 0; k < mappingLength; k++) {
        if (lastMapping !== k) {
            const centerXK = mappingCenterX[k];
            const centerYK = mappingCenterY[k];
            const dx = pointX - centerXK;
            const dy = pointY - centerYK;
            const d2 = dx * dx + dy * dy;
            const radiusK = mappingRadius[k];
            const factor = radiusK * radiusK / d2;
            const newPointX = centerXK + factor * dx;
            const newPointY = centerYK + factor * dy;
            imagePointX.push(newPointX);
            imagePointY.push(newPointY);
            if (gens > 0) {
                moreImagePoints(gens, k, newPointX, newPointY);
            }
        }
    }
} 