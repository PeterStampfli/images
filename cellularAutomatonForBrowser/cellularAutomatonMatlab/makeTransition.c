/*==========================================================
 * make cell array transition
 * the cell values follow from a transition table lookup using the sum array
 *
 * Input:
 * first the sum array, square int32 array, odd size
 *  int type in c is mxINT32_CLASS in Matlab
 *
 * transition table as a vector of int32
 *
 * cell array
 *
 *  cd /home/peter/images/cellularAutomaton
 *========================================================*/

#include "mex.h"
#include <math.h>
#define PRINTI(n) printf(#n " = %d\n", n)
#define PRINTF(n) printf(#n " = %f\n", n)

void mexFunction( int nlhs, mxArray *plhs[],
        int nrhs, const mxArray *prhs[])
{
    const mwSize *dims;
    int size, sizeM2, *cells, *table, *sums;
    int nValues, v1, v2, v3, v4, v5, v6;
    int center, i, j, jSize, sum;
    if(nrhs < 3) {
        mexErrMsgIdAndTxt("makeCenter:nrhs","A sum array, a transition vector, and a cell array input required.");
    }
    /* check number of dimensions of the cell (array)*/
    if(mxGetNumberOfDimensions(prhs[0]) != 2 ) {
        mexErrMsgIdAndTxt("makeCenter:dims","The cell array has to have two dimensions.");
    }
    if(mxGetNumberOfDimensions(prhs[2]) != 2 ) {
        mexErrMsgIdAndTxt("makeCenter:dims","The sum array has to have two dimensions.");
    }
    dims = mxGetDimensions(prhs[0]);
    size = dims[0];
    sizeM2 = size - 2;
    dims = mxGetDimensions(prhs[1]);
    /* attention to matlab row first order*/
    nValues = dims[1];
    /* get the cell array and the values vector and sums array*/
#if MX_HAS_INTERLEAVED_COMPLEX
    sums = mxGetInt32s(prhs[0]);
    table = mxGetInt32s(prhs[1]);
    cells = mxGetInt32s(prhs[2]);
#else
    sums = (int *) mxGetPr(prhs[0]);
    table = (int *) mxGetPr(prhs[1]);
    cells = (int *) mxGetPr(prhs[2]);
#endif
    for (j = 2; j < sizeM2; j++){
        jSize = j * size;
        for (i = 2; i < sizeM2; i++){
            center = i + jSize;
            cells[center] = table[sums[center]];      
        }
    }
}