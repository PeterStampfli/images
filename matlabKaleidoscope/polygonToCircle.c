/* PTC_polygonToCircle*/

/*==========================================================
 * transform a map
 * regular polygon with nCorners,
 * the corners are on circle with radius 1, center at origin
 * is mapped to unit circle
 *
 * Input: the map has for each pixel (h,k):
 * map(h,k,0) = x, map(h,k,1) = y, map(h,k,2) = 0 (number of inversions)
 *
 * and number of corners
 *
 * modifies the map, returns nothing if used as a procedure
 * transform(map, ...);
 * does not change the map and returns a modified map if used as  a function
 * newMap = transform(map, ....);
 *
 *========================================================*/

#include "mex.h"
#include <math.h>
#include <stdbool.h>
#define PI 3.14159f
#define PRINTI(n) printf(#n " = %d\n", n)
#define PRINTF(n) printf(#n " = %f\n", n)
#define INVALID -1000

void mexFunction( int nlhs, mxArray *plhs[],
        int nrhs, const mxArray *prhs[])
{
    const mwSize *dims;
    int nX, nY, nXnY, nXnY2, index;
    float inverted, x, y;
    float *inMap, *outMap;
    bool returnsMap = false;
    int nCorners;
    float sines[200],cosines[200];
    float dAngle, piNCorners, i2PINCorners;
    float cosPiNCorners, sinPiNCorners, tanPiNCorners;
    /* check for proper number of arguments (else crash)*/
    /* checking for presence of a map*/
    if(nrhs != 2) {
        mexErrMsgIdAndTxt("polygonToCircle:nrhs","A map input and number of corners required.");
    }
    /* check number of dimensions of the map*/
    if(mxGetNumberOfDimensions(prhs[0]) !=3 ) {
        mexErrMsgIdAndTxt("polygonToCircle:mapDims","The map has to have three dimensions.");
    }
    dims = mxGetDimensions(prhs[0]);
    if(dims[2] != 3) {
        mexErrMsgIdAndTxt("polygonToCircle:map3rdDimension","The map's third dimension has to be three.");
    }
    /* check that no or one output is expected*/
    if (nlhs > 1) {
        mexErrMsgIdAndTxt("polygonToCircle:nlhs","Has zero or one return parameter.");
    }
    /* get the map*/
#if MX_HAS_INTERLEAVED_COMPLEX
    inMap = mxGetSingles(prhs[0]);
#else
    inMap = (float *) mxGetPr(prhs[0]);
#endif
    if (nlhs == 0){
        outMap = inMap;
    } else {
        /* create output map*/
        returnsMap = true;
        plhs[0]=mxCreateNumericArray(3, dims, mxSINGLE_CLASS, mxREAL);
#if MX_HAS_INTERLEAVED_COMPLEX
        outMap = mxGetSingles(plhs[0]);
#else
        outMap = (float *) mxGetPr(plhs[0]);
#endif
    }
    /* prepare things*/
    nCorners = (int) mxGetScalar(prhs[1]);
    if (nCorners < 3){
         mexErrMsgIdAndTxt("polygonToCircle:nCorners","The number of corners has to be larger than 2.");
   }
    piNCorners = PI/nCorners;
    i2PiNCorners = 0.5 / piNCorners;
    cosPiNCorners = cosf(piNCorners);
    sinPiNCorners = sinf(piNCorners);
    tanPiNCorners = tanf(piNCorners);
    /* the rotations of the dihedral group, order k*/
    if (nCorners > 100){
        mexErrMsgIdAndTxt("poincareDiscMapping:nCorners","Initialization, nCorners has to be smaller or equal to 100.");
    }
    /* generate rotation"matrix"*/
    dAngle = 2.0f * PI / nCorners;
    int nCorners2 = 2 * nCorners;
    for (int i = 0; i < nCorners2; i++){
        sines[i] = sinf(i*dAngle);
        cosines[i] = cosf(i*dAngle);
    }
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
                outMap[index + nXnY2] = INVALID;      
            }
            continue;
        }
        x = inMap[index];
        y = inMap[index + nXnY];
/* first find rotation by multiples of 2PI/nCorners such that */
        /* the point is inside a sector at angles of +/- PI/nCorners to the negative y-axis*/
        /* this sector is defined by limiting angles -PI/2-PI/nCorners and -PI/2+PI/nCorners
        /* the angle of point (x,y) to the lower limiting y-axis is atan2(y,x) + PI/2 + PI/nCorners + 2 PI */
        /* with a range of 3PI/2 + PI/nCorners ... 7PI/2 + PI/nCorners */
        /* dividing by 2PI/nCorners gives the index m to the rotation "matrices", rounding down */
        /* m=atan2(y,x)*(nCorners/2PI) + 0.5 +nCorners*(5/4) */
        
        outMap[index] = x;
        outMap[index + nXnY] = y;
        outMap[index + nXnY2] = inverted;
    }
}