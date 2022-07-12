/*==========================================================
 * rosette: generates a dihedral group as very simple kaleidoscope
 *
 * rosette(map, k, angle, centerX, centerY);
 *
 * Input:
 * first the map. 
 *     It has for each pixel (h,k):
 *     map(h,k,0) = x, map(h,k,1) = y 
 *     map(h,k,2) = 0, 1 for image pixels, parity, number of inversions % 2
 *     map(h,k,2) < 0 for invalid pixels, not part of the image
 *
 * additional input: 
 *   integer k: order of the group, k-fold rotational symmetry
 *   real angle: rotates the rosette by this angle, in radians
 *        centerX:  x-coordinate of the center
 *        centerY:  y-coordinate of the center
 *
 *
 * returns nothing and modifies the map argument if used as a procedure:
 *   rosette(map, k, angle, centerX, centerY);
 *
 * returns a modified map and does not change the map argument if used as a function:
 *  newMap = rosette(map, k, angle, centerX, centerY);
 *
 *========================================================*/

#include "mex.h"
#include <math.h>
#include <stdbool.h>
#define PI 3.14159f
#define INVALID -10000
#define PRINTI(n) printf(#n " = %d\n", n)
#define PRINTF(n) printf(#n " = %f\n", n)

void mexFunction( int nlhs, mxArray *plhs[],
        int nrhs, const mxArray *prhs[])
{
    const mwSize *dims;
    int nX, nY, nXnY, nXnY2, nXnY3, index, i;
    float inverted, x, y;
    float *inMap, *outMap;
    bool returnsMap, success;
    int k, k2;
    enum geometryType {elliptic, euklidic, hyperbolic};
    enum geometryType geometry;
    float gamma, iGamma2, kPlus05;
    float sines[200], cosines[200], dAngle;
    int rotation;
    float sine, cosine, h;
    float centerX, centerY, angle, sinAngle, cosAngle;
    /* check for proper number of arguments (else crash)*/
    /* checking for presence of a map*/
    if(nrhs < 4) {
        mexErrMsgIdAndTxt("rosette:nrhs","A map input plus 4 geometry params required.");
    }
    /* check number of dimensions of the map (array)*/
    if(mxGetNumberOfDimensions(prhs[0]) !=3 ) {
        mexErrMsgIdAndTxt("rosette:mapDims","The map has to have three dimensions.");
    }
    dims = mxGetDimensions(prhs[0]);
    if(dims[2] != 3) {
        mexErrMsgIdAndTxt("rosette:map3rdDimension","The map's third dimension has to be three.");
    }
    /* check that no or one output is expected*/
    if (nlhs > 1) {
        mexErrMsgIdAndTxt("rosette:nlhs","Has zero or one return parameter.");
    }
    /* get the map*/
#if MX_HAS_INTERLEAVED_COMPLEX
    inMap = mxGetSingles(prhs[0]);
#else
    inMap = (float *) mxGetPr(prhs[0]);
#endif
    if (nlhs == 0){
        returnsMap = false;
        outMap = inMap;
    } else {
        /* create output map*/
        returnsMap = true;
        plhs[0] = mxCreateNumericArray(3, dims, mxSINGLE_CLASS, mxREAL);
#if MX_HAS_INTERLEAVED_COMPLEX
        outMap = mxGetSingles(plhs[0]);
#else
        outMap = (float *) mxGetPr(plhs[0]);
#endif
    }
    /* get geometry parameters*/
    k = (int) mxGetScalar(prhs[1]);
    /* limit k */
    if (k > 50){
        k = 50;
    }    
    /* k<1  identity map*/
    if (k < 1){
        if (returnsMap){
            nXnY3 = 3 * dims[0] * dims[1];
            for (index = 0; index < nXnY3; index++){
                outMap[index] = inMap[index];
            }
        }
        return;
    }
    angle = (float) mxGetScalar(prhs[2]);
    angle = angle - 2 * PI* floorf(0.5 * angle / PI);
    cosAngle = cosf(angle);
    sinAngle = sinf(angle);
    centerX = (float) mxGetScalar(prhs[3]);
    centerY = (float) mxGetScalar(prhs[4]);
    
    /* the rotations of the dihedral group, order k*/
    dAngle = 2.0f * PI / k;
    k2 = 4 * k;
    for (i = 0; i < k2; i++){
        sines[i] = sinf(i*dAngle);
        cosines[i] = cosf(i*dAngle);
    }
    gamma = PI / k;
    iGamma2 = 0.5f / gamma;
    /* included rotation of kaleidoscope */
    kPlus05 = k + 0.5f;

    /* do the map*/
    /* row first order*/
    nX = dims[1];
    nY = dims[0];
    nXnY = nX * nY;
    nXnY2 = 2 * nXnY;
    for (index = 0; index < nXnY; index++){
        inverted = inMap[index + nXnY2];
        /* do only transform if pixel is valid*/
        if (inverted < -0.1f) {
            if (returnsMap){
                /* set element only if new output map*/
                outMap[index] = INVALID;
                outMap[index + nXnY] = INVALID;
                outMap[index + nXnY2] = INVALID;           }
            continue;
        }
        /* shift and rootate */
        x = inMap[index] - centerX;
        y = inMap[index + nXnY] - centerY;
        h = cosAngle * x + sinAngle * y;
        y = -sinAngle * x + cosAngle * y;
        x = h;
        /* make dihedral map to put point in first sector*/
        rotation = (int) floorf(atan2f(y, x) * iGamma2 + kPlus05);
        cosine = cosines[rotation];
        sine = sines[rotation];
        h = cosine * x + sine * y;
        y = -sine * x + cosine * y;
        x = h;
        if (y < 0){
            y = -y;
            inverted = 1 - inverted;
        }
        /* unshift and unrotate */
        h = cosAngle * x - sinAngle * y + centerX;
        y = sinAngle * x + cosAngle * y + centerY;
        x = h;
        outMap[index] = x;
        outMap[index + nXnY] = y;
        outMap[index + nXnY2] = inverted;
    }        
}
