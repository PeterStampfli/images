/*==========================================================
 * zerosPolynomSingularTransformMap: Transforms a map using a complex polynom
 * the real and (optional) imaginary components of its zeros are given
 * and an amplitude factor
 * with additional singularity at origin of given order
 *
 * zerosPolynomSingularTransformMap(map, amplitude, realPartZeros, imaginaryPartZeros,order);
 *
 * Input:
 * first the map. 
 *     It has for each pixel (h,k):
 *     map(h,k,0) = x, map(h,k,1) = y
 *     map(h,k,2) = 0, 1 for image pixels, parity, number of inversions % 2
 *     map(h,k,2) < 0 for invalid pixels, not part of the image
 *
 * float amplitude
 *
 * and a real and imaginary part of the zeros of the polynom (in default double precision)
 *
 * and integer order
 *
 * real amplitude, and a real and (optional) imaginary part of complex polynom zeros a (in default double precision)
 * calculates amplitude * (z-a_1) * (z- a_2)* *(z-a_n) / n^order, matlab indexing, n<=9
 *
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
#define PRINTI(n) printf(#n " = %d\n", n)
#define PRINTF(n) printf(#n " = %f\n", n)
#define INVALID -1000

void mexFunction( int nlhs, mxArray *plhs[],
        int nrhs, const mxArray *prhs[])
{
    const mwSize *dims,*aDims;
    int nX, nY, nXnY, nXnY2, index;
    float inverted;
    float complex z, w, denom;
    int power, repower, impower, order, i;
    double *realA, *imA;
    float complex a[10];
    float reC, imC, amplitude;
    float *inMap, *outMap;
    bool returnsMap = false;
    /* check for proper number of arguments (else crash)*/
    /* checking for presence of a map*/
    if(nrhs < 5) {
        mexErrMsgIdAndTxt("zerosPolynomSingularTransformMap:nrhs","A map input required, an amplitude and real and imaginary part arrays of zeros, and order of singularity.");
    }
    /* check number of dimensions of the map*/
    if(mxGetNumberOfDimensions(prhs[0]) !=3 ) {
        mexErrMsgIdAndTxt("zerosPolynomSingularTransformMap:mapDims","The map has to have three dimensions.");
    }
    dims = mxGetDimensions(prhs[0]);
    if(dims[2] != 3) {   
        mexErrMsgIdAndTxt("zerosPolynomSingularTransformMap:map3rdDimension","The map's third dimension has to be three.");
    }
    for (i=0;i<10;i++){
        a[i]=0;
    }
    amplitude = (float) mxGetScalar(prhs[1]);
    
    aDims = mxGetDimensions(prhs[2]);
    if((mxGetNumberOfDimensions(prhs[2]) !=2)||(aDims[0]!=1)) {
          mexErrMsgIdAndTxt("zerosPolynomSingularTransformMap:dims","The array for real components of zeros has to have 1 dimension.");
    }
    repower=aDims[1];
    if (repower>10){
         mexErrMsgIdAndTxt("zerosPolynomSingularTransformMap: length","The array for real components of zeros may not have more than 10 values.");       
    }
    if (repower==0){
         mexErrMsgIdAndTxt("zerosPolynomSingularTransformMap: length","The array for real components of zeros may not be empty.");       
    }
    #if MX_HAS_INTERLEAVED_COMPLEX
        realA = mxGetDoubles(prhs[2]);
    #else
        realA = (double *) mxGetPr(prhs[2]);
    #endif
    for (i=0;i<repower;i++){
        a[i]= (float) realA[i];
    }
    aDims = mxGetDimensions(prhs[3]);
    if ((mxGetNumberOfDimensions(prhs[3]) !=2)||(aDims[0]!=1)){
       mexErrMsgIdAndTxt("zerosPolynomSingularTransformMap:dims","The array for imaginary components of zeros has to have 1 dimension.");
    }
    impower=aDims[1];
    if (impower>10){
        mexErrMsgIdAndTxt("zerosPolynomSingularTransformMap: length","The array for imaginary components of zeros may not have more than 10 values.");       
    }
#if MX_HAS_INTERLEAVED_COMPLEX
    imA = mxGetDoubles(prhs[3]);
#else
    imA = (double *) mxGetPr(prhs[3]);
#endif
    for (i=0;i<impower;i++){
        a[i] += I * (float) imA[i];
    }     
    power = repower;
    if (impower > repower){
        power = impower;
    }   
    order = (int) mxGetScalar(prhs[4]);

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
        /* calculate polynom w=p(z) with zeros a and amplitude factor*/
        w = amplitude;
        for (i = power - 1; i >= 0; i--){
            w = w * (z - a[i]);
        }
        denom = 1;
        for (i = 1; i <= order; i++){
            denom *= z;
        }
        w /= denom;
        outMap[index] = crealf(w);
        outMap[index + nXnY] = cimagf(w);
        outMap[index + nXnY2] = inverted;
    }
}
