#include "mex.h"
#include <math.h>
#define PRINTI(n) printf(#n " = %d\n", n)
#define PRINTF(n) printf(#n " = %f\n", n)

void mexFunction( int nlhs, mxArray *plhs[],
        int nrhs, const mxArray *prhs[])
{
float *map;
float b;
#if MX_HAS_INTERLEAVED_COMPLEX
    map = mxGetSingles(prhs[0]);
#else
    map = (float *) mxGetPr(prhs[0]);
#endif
            b = (float) mxGetScalar(prhs[1]);
PRINTF(map[0]);
map[0]*=b;
PRINTF(map[0]);
    
}