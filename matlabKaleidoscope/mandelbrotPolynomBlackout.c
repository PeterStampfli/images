/*==========================================================
 * mandelbrotPolynomTransformMap: Repeats transform of map by complex polynom
 * the real and (optional) imaginary parts of its coefficients are given
 * further: maximum number of repetitions and a limit for the map points
 * all pixels inside the limit will get a map value lying inside the limit
 * this gives concentric regions approximating the Julia set
 * inside at the border the map points lie at a circle of radius = limit
 *
 * mandelbrotPolynomTransformMap(map, limit, maxIterations, realPartCoefficients, imaginaryPartCoefficients);
 * mandelbrotPolynomTransformMap(map, limit, maxIterations, realPartCoefficients);
 *
 * Input:
 * first the map. 
 *     It has for each pixel (h,k):
 *     map(h,k,0) = x, map(h,k,1) = y
 *     map(h,k,2) = 0, 1 for image pixels, parity, number of inversions % 2
 *     map(h,k,2) < 0 for invalid pixels, not part of the image
 *
 * float limit
 * int maxIterations
 *
 * and a real and (optional) imaginary part of complex polynom coefficients a (in default double precision)
 * calculates p(w)=(((((a_n*w)+a_(n-1))*w + ....+a_2)*w+a_1), matlab indexing, n<=9
 * a_1 = z, is constant term
 *
 * if z > limit makes point invalid
 *
 * starts with z=0
 * w=p(z) if cabsf(w) < limit then z = w and repeat until maxIterations, 
 * else finished and z is inside circle with radius limit
 * map(:,:,2) is then set to (iteration + 1) % 2 to make structure visible
 *
 * modifies the map, returns nothing if used as a procedure
 * transform(map, ...);
 * does not change the map and returns a modified map if used as a function
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
    int iterations, maxIterations;
    float limit, limit2;
    float inverted;
    float complex z, w;
    float absW2, realW, imagW;
    int power, repower, impower,i;
    double *realA, *imA;
    float complex a[10];
    float reC, imC;
    float *inMap, *outMap;
    bool returnsMap = false;
    /* check for proper number of arguments (else crash)*/
    /* checking for presence of a map*/
    if(nrhs <4) {
        mexErrMsgIdAndTxt("mandelbrotPolynomTransformMap:nrhs","A map input required, limit, maxIterations, and real and imaginary part arrays of coefficients.");
    }
    /* check number of dimensions of the map*/
    if(mxGetNumberOfDimensions(prhs[0]) !=3 ) {
        mexErrMsgIdAndTxt("mandelbrotPolynomTransformMap:mapDims","The map has to have three dimensions.");
    }
    dims = mxGetDimensions(prhs[0]);
    if(dims[2] != 3) {   
        mexErrMsgIdAndTxt("mandelbrotPolynomTransformMap:map3rdDimension","The map's third dimension has to be three.");
    }
    /* additional parameters for Julia iterations */
    limit = (float) mxGetScalar(prhs[1]);
    limit2 = limit * limit;
    maxIterations = (int) mxGetScalar(prhs[2]);
    /* the polynom coefficients */ 
    for (i=0;i<10;i++){
        a[i]=0;
    }
    /* the real part*/
    aDims = mxGetDimensions(prhs[3]);
    if((mxGetNumberOfDimensions(prhs[3]) !=2)||(aDims[0]!=1)) {
          mexErrMsgIdAndTxt("mandelbrotPolynomTransformMap:dims","The array for real coefficients has to have 1 dimension.");
    }
    repower=aDims[1];
    if (repower>10){
         mexErrMsgIdAndTxt("mandelbrotPolynomTransformMap: length","The array for real coefficients may not have more than 10 values.");       
    }
    if (repower==0){
         mexErrMsgIdAndTxt("mandelbrotPolynomTransformMap: length","The array for real coefficients may not be empty.");       
    }
    #if MX_HAS_INTERLEAVED_COMPLEX
        realA = mxGetDoubles(prhs[3]);
    #else
        realA = (double *) mxGetPr(prhs[3]);
    #endif
    for (i=0;i<repower;i++){
        a[i]= (float) realA[i];
    }
    /* the optional imaginary part */
    if(nrhs == 5) {
        aDims = mxGetDimensions(prhs[4]);
        if ((mxGetNumberOfDimensions(prhs[4]) !=2)||(aDims[0]!=1)){
          mexErrMsgIdAndTxt("juliaPolynomTransformMap:dims","The array for imaginary coefficients has to have 1 dimension.");
        }
        impower=aDims[1];
        if (impower>10){
            mexErrMsgIdAndTxt("juliaPolynomTransformMap: length","The array for imaginary coefficients may not have more than 10 values.");       
        }
        #if MX_HAS_INTERLEAVED_COMPLEX
            imA = mxGetDoubles(prhs[4]);
        #else
            imA = (double *) mxGetPr(prhs[4]);
        #endif
        for (i=0;i<impower;i++){
            a[i] += I * (float) imA[i];
        }     
    } else {
        impower = 0;
    }
    power = repower;
    if (impower > repower){
        power = impower;
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
                outMap[index + nXnY2] = INVALID;
            }
            continue;
        }
        realW = inMap[index];
        imagW = inMap[index + nXnY];
        z=realW + I * imagW;
        absW2 = realW * realW + imagW * imagW;
        if (absW2 > limit2){
            inverted = INVALID;
        }
       /* the constant term is equal to z*/
        a[1] = z;
        /* initially out of limits what to do?*/
        /* blackout*/
        z = 0;
        iterations = 0;
        /* iterate only if abs(z) small enough */
        while ((iterations < maxIterations) && (absW2 < limit2)){
           /* calculate polynom w=p(z) with coefficients a */
           w =  a[power-1];
           for (i=power-2;i>=0;i--){
               w = w * z +a[i];
           }
           /* check for limit */
           realW = crealf(w);
           imagW = cimag(w);
           absW2 = realW * realW + imagW * imagW;
           if (absW2 < limit2){
               z = w;
           } else {
               inverted = INVALID;
           }
           iterations += 1;
        }
        outMap[index] = crealf(z);
        outMap[index + nXnY] = cimagf(z);
        outMap[index + nXnY2] = inverted;
    }
}
