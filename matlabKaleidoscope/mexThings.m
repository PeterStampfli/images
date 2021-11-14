% root of matlab, and matlab version
matlabroot
% show compiler
% mex -setup lang
mex -setup c
% Copy the file to a writable folder on your path using the following command syntax. filename is the name of the example, and foldername is the subfolder name.

% copyfile(fullfile(matlabroot,'extern','examples','foldername','filename'),'.','f')
% geht ins home directory
% copyfile(fullfile(matlabroot,'extern','examples','mex','arrayProduct.c'),'.','f')

#if MX_HAS_INTERLEAVED_COMPLEX
    output = mxGetDoubles(plhs[0]);
    #else
    output = mxGetPr(plhs[0]);
    #endif
end

% mxGetDoubles(array) - pointer to first data element of pointer to mxArray
% and check if array is array of doubles
% beautify

% create mxArray and return pointer to the array
    plhs[0]=mxCreateNumericMatrix(1,3,mxDOUBLE_CLASS,mxREAL);

https://codebeautify.org/c-formatter-beautifier

https://formatter.org/cpp-beautifier

% Call the mex command to build the function.
mex arrayProduct.c -R2018a

% options
% -g debugging, symboliic info
% -h   help
% -R2017b   is default, no interleaved complex
% -outdir <dirname>
% -v verbose 
% -Wall   warnings ,lint

% set current folder
% cd /home/peter/images/matlabKaleidoscope