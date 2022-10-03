/*==========================================================
 * using complex numbers transform a map
 * Input: the map has for each pixel (h,k):
 * map(h,k,0) = x, map(h,k,1) = y, map(h,k,2) = 0 (number of inversions)
 *
 * z => (a*z+b)/(c*z+d), where a,b,c,d are complex
 *
 * params=[re a, im a, re b, im b, re c, im c, re d, im d)
 *
 * moebiusTransformMap(map,params);
 *
 * default values for parameters are 0, as for now, can be changed
 *
 * modifies the map, returns nothing if used as a procedure
 * moebiusTransformMap(map,params);
 * does not change the map and returns a modified map if used as  a function
 * newMap = moebiusTransformMap(map,params);
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
    float params[10];
    double *doubleParams;
    int i, nParams;
    int nX, nY, nXnY, nXnY2, index;
    float inverted;
    float complex z, a, b , c , d;
    float *inMap, *outMap;
    /* default value for parameters a is 0 */
    for (i=0;i<10;i++){
        params[i]=0;
    }
    bool returnsMap = false;
    /* check for proper number of arguments (else crash)*/
    /* checking for presence of a map*/
    if(nrhs == 0) {
        mexErrMsgIdAndTxt("moebiusTransformMap:nrhs","A map input required.");
    }
    /* check number of dimensions of the map*/
    if(mxGetNumberOfDimensions(prhs[0]) !=3 ) {
        mexErrMsgIdAndTxt("moebiusTransformMap:mapDims","The map has to have three dimensions.");
    }
    dims = mxGetDimensions(prhs[0]);
    if(dims[2] != 3) {
        mexErrMsgIdAndTxt("moebiusTransformMap:map3rdDimension","The map's third dimension has to be three.");
    }
    /* check that no or one output is expected*/
    if (nlhs > 1) {
        mexErrMsgIdAndTxt("moebiusTransformMap:nlhs","Has zero or one return parameter.");
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
            mexErrMsgIdAndTxt("moebiusTransformMap:dims","The array for parameters has to have 1 dimension.");
        }
        if(aDims[1] >10) {
            mexErrMsgIdAndTxt("moebiusTransformMap:dims","Too many parameters, maximum 10 exceeded.");
        }
        nParams = aDims[1];
        #if MX_HAS_INTERLEAVED_COMPLEX
            doubleParams = mxGetDoubles(prhs[1]);
        #else
            doubleParams = (double *) mxGetPr(prhs[1]);
        #endif
        for (i=0;i<nParams;i++){
             params[i] = (float) doubleParams[i];
        }
    }
    a = params[0] + I * params[1];
    b = params[2] + I * params[3];
    c = params[4] + I * params[5];
    d = params[6] + I * params[7];     
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
        z = inMap[index] + I * inMap[index + nXnY];
        
        z = (a * z + b) / (c * z + d);
        
        outMap[index] = crealf(z);
        outMap[index + nXnY] = cimagf(z);
        outMap[index + nXnY2] = inverted;
    }
}