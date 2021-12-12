/*==========================================================
 * make center of cell array
 *
 * Input:
 * first the cell array, square int32 array, odd size
 *  int type in c is mxINT32_CLASS in Matlab
 *
 * values row vector with up to 6 double values (integers)
 * matlab indexing
 *
 *       6 4 5
 *     5 3 2 3 6
 *     4 2 1 2 4
 *     6 3 2 3 5
 *       5 4 6
 *
 * missing values default to 0
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
    const mxDouble *values;
    int size, center, *cells;
    int nValues, v1, v2, v3, v4, v5, v6;
    int index;
    if(nrhs < 2) {
        mexErrMsgIdAndTxt("makeCenter:nrhs","A cell array and a values vector input required.");
    }
    /* check number of dimensions of the map (array)*/
    if(mxGetNumberOfDimensions(prhs[0]) != 2 ) {
        mexErrMsgIdAndTxt("makeCenter:dims","The cell array has to have two dimensions.");
    }
    dims = mxGetDimensions(prhs[0]);
    size = dims[0];
    dims = mxGetDimensions(prhs[1]);
    /* attention to matlab row first order*/
    nValues = dims[1];
    /* get the cell array and the values vector*/
#if MX_HAS_INTERLEAVED_COMPLEX
    cells = mxGetInt32s(prhs[0]);
    values = mxGetDoubles(prhs[1]);
#else
    cells = (int *) mxGetPr(prhs[0]);
    values = (mxDouble *) mxGetPr(prhs[1]);
#endif
    v1 = (nValues >= 1)? values[0] : 0;
    v2 = (nValues >= 2)? values[1] : 0;
    v3 = (nValues >= 3)? values[2] : 0;
    v4 = (nValues >= 4)? values[3] : 0;
    v5 = (nValues >= 5)? values[4] : 0;
    v6 = (nValues >= 6)? values[5] : 0;
    center = (size - 1) / 2;
    center = center + center * size;
    cells[center] = v1;
    cells[center + 1] = v2;
    cells[center - 1] = v2;
    cells[center + size] = v2;
    cells[center - size] = v2;
    cells[center + 1 + size] = v3;
    cells[center + 1 - size] = v3;
    cells[center - 1 + size] = v3;
    cells[center - 1 - size] = v3;
    cells[center + 2] = v4;
    cells[center - 2] = v4;
    cells[center + 2 * size] = v4;
    cells[center - 2 * size] = v4;
    cells[center + 2 * size - 1] = v5;
    cells[center - 2 * size + 1] = v5;
    cells[center + 2 + size] = v5;
    cells[center - 2 - size] = v5;
    cells[center + 2 * size + 1] = v6;
    cells[center - 2 * size - 1] = v6;
    cells[center + 2 - size] = v6;
    cells[center - 2 + size] = v6;
}