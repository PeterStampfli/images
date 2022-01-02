/*==========================================================
 * generalized Bulatov band transform
 * Input: the map has for each pixel (h,k):
 * map(h,k,0) = x, map(h,k,1) = y, map(h,k,2) = 0 (number of inversions)
 *
 * additional input parameter:
 *  k, m, n  for the geometry
 *  repetitions - how many periods appear in the ring/order of the dihedral group
 * modifies the map, returns nothing if used as a procedure
 * transform(map, ...);
 * does not change the map and returns a modified map if used as  a function
 * newMap = transform(map, ....);
 *
 *========================================================*/

#include "mex.h"
#include <math.h>
#include <complex.h>
#include <tgmath.h>
#include <stdbool.h>
#define PI 3.14159f
#define PRINTI(n) printf(#n " = %d\n", n)
#define PRINTF(n) printf(#n " = %f\n", n)
#define INVALID -1000

void mexFunction( int nlhs, mxArray *plhs[],
        int nrhs, const mxArray *prhs[])
{
    const mwSize *dims;
    int k, m, n, repeats;
    int nX, nY, nXnY, nXnY2, index;
    float inverted;
    float complex z;
    float *inMap, *outMap, a, piA2, iTanPiA4, exp2x, base;
    bool returnsMap = false;
    /* check for proper number of arguments (else crash)*/
    /* checking for presence of a map*/
    if(nrhs < 5) {
        mexErrMsgIdAndTxt("bulatovRingMap:nrhs","A map input required, k, m, n for geometry, and number of repeats.");
    }
    /* check number of dimensions of the map*/
    if(mxGetNumberOfDimensions(prhs[0]) !=3 ) {
        mexErrMsgIdAndTxt("bulatovRingMap:mapDims","The map has to have three dimensions.");
    }
    dims = mxGetDimensions(prhs[0]);
    if(dims[2] != 3) {
        mexErrMsgIdAndTxt("bulatovRingMap:map3rdDimension","The map's third dimension has to be three.");
    }
    /* check that no or one output is expected*/
    if (nlhs > 1) {
        mexErrMsgIdAndTxt("bulatovRingMap:nlhs","Has zero or one return parameter.");
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
    // get other parameters
   /* get geometry parameters*/
    k = (int) mxGetScalar(prhs[1]);
    m = (int) mxGetScalar(prhs[2]);
    n = (int) mxGetScalar(prhs[3]);   
    // repetitions
    repeats = (int) mxGetScalar(prhs[4]); 
    if (n!=2){
    mexErrMsgIdAndTxt("bulatovRingMap:n","Geometry parameter n has to be equal to zero.");
    }
    if (repeats<=0){
    mexErrMsgIdAndTxt("bulatovRingMap:repeats","repeats has to be a positive integer.");
    }
    // determine period of bulatov band   

        
    piA2 = PI * a / 2;
    iTanPiA4 = 1.0f / tanf(PI * a / 4);
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
        z = piA2 * inMap[index]+ piA2 * inMap[index + nXnY] * I;
        z = iTanPiA4 * tanh(z);
        outMap[index] = crealf(z);
        outMap[index + nXnY] = cimagf(z);
        outMap[index + nXnY2] = inverted;
    }
}