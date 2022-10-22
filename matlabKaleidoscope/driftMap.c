/*==========================================================
 * adding a variable drift to a map
 * metamorphizes a periodic map
 * Input: the map has for each pixel (h,k):
 * map(h,k,0) = x, map(h,k,1) = y, map(h,k,2) = 0 (number of inversions)
 *
 * optional additional parameters in a double precision (standaard matlab numbers) array a[...], max 10 elements
 *
 * driftMap(map,a);
 *
 * adds a variable drift to the map, depending on indices
 * map(i,j) => map(i,j)+a[1]*(x,y) = map(i,j) + drift * width / nColumns * (i,j)
 *
 * a = [drift, width]
 *
 * where width is the range of x-coordinates (xMax-xMin)
 *
 * default values for parameters are 0, as for now, can be changed
 *
 * modifies the map, returns nothing if used as a procedure
 * driftMap(map, a);
 * does not change the map and returns a modified map if used as  a function
 * newMap = driftMap(map, a);
 *
 *========================================================*/

#include "mex.h"
#include <math.h>
#include <complex.h>
#include <tgmath.h>
#include <stdbool.h>
#define PRINTI(n) printf(#n " = %d\n", n)
#define PRINTF(n) printf(#n " = %f\n", n)
#define INVALID -1000

void mexFunction( int nlhs, mxArray *plhs[],
        int nrhs, const mxArray *prhs[])
{
    const mwSize *dims, *aDims;
    float a[10];
    double *doubleA;
    int i, j, nParams;
    int nX, nY, nXnY, nXnY2, index;
    float inverted;
    float drift;
    float *inMap, *outMap;
    /* default value for parameters a is 0 */
    for (i=0;i<10;i++){
        a[i]=0;
    }
    bool returnsMap = false;
    /* check for proper number of arguments (else crash)*/
    /* checking for presence of a map*/
    if(nrhs == 0) {
        mexErrMsgIdAndTxt("driftMap:nrhs","A map input required.");
    }
    /* check number of dimensions of the map*/
    if(mxGetNumberOfDimensions(prhs[0]) !=3 ) {
        mexErrMsgIdAndTxt("transformMap:mapDims","The map has to have three dimensions.");
    }
    dims = mxGetDimensions(prhs[0]);
    if(dims[2] != 3) {
        mexErrMsgIdAndTxt("transformMap:map3rdDimension","The map's third dimension has to be three.");
    }
    /* check that no or one output is expected*/
    if (nlhs > 1) {
        mexErrMsgIdAndTxt("transformMap:nlhs","Has zero or one return parameter.");
    }
    /* get the map*/
#if MX_HAS_INTERLEAVED_COMPLEX
    inMap = mxGetSingles(prhs[0]);
#else
    inMap = (float *) mxGetPr(prhs[0]);
#endif
        /* load the parameters, if present */
    if(nrhs > 1) {
        aDims = mxGetDimensions(prhs[1]);
        if((mxGetNumberOfDimensions(prhs[1]) !=2)||(aDims[0] >1)) {
            mexErrMsgIdAndTxt("logSpiralMap:dims","The array for parameters has to have 1 dimension.");
        }
        if(aDims[1] >10) {
            mexErrMsgIdAndTxt("logSpiralMap:dims","Too many parameters, maximum 10 exceeded.");
        }
        nParams = aDims[1];
        #if MX_HAS_INTERLEAVED_COMPLEX
            doubleA = mxGetDoubles(prhs[1]);
        #else
            doubleA = (double *) mxGetPr(prhs[1]);
        #endif
        for (i=0;i<nParams;i++){
             a[i] = (float) doubleA[i];
        }
    }
    /* set all parameters, even if not present as argument, get default value = 0 */
    /* matlab indexing, begins with 1, c indexing begins with 0 */        
    /* left hand side */
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
    /* do the map*/
    /* row first order*/
    nX = dims[1];
    nY = dims[0];
    drift = a[0] * a[1] / nX;
    nXnY = nX * nY;
    nXnY2 = 2 * nXnY;
    index = 0;
    for (i = 0; i < nX; i++){
        for (j = 0; j < nY; j++){
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
            outMap[index] = inMap[index] + drift * i;
            outMap[index + nXnY] = inMap[index + nXnY] + drift * j;
            outMap[index + nXnY2] = inverted;
            index+=1;
        }
    }
}