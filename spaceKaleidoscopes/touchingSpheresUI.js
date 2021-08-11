/* jshint esversion: 6 */

import {
    mappingSpheres,
    imageSpheres,
    imagePoints
} from "./touchingSpheres.js";



//threeMappingSpheres();
mappingSpheres.idealTriangle();

//setProjection(0.5, 1, 1, 1, 1);

//add4dTo3dMappingSphere(0.5, 1, 1, 1, 1);
//add4dTo3dMappingSphere(0.5, 1, 1, 1, -1);
//add4dTo3dMappingSphere(0.5, 2, 0, 0, 0);

mappingSpheres.log();

mappingSpheres.minimumRadius=0.1

mappingSpheres.createImages();


imageSpheres.log();
imagePoints.log();