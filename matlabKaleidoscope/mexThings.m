% root of matlab, and matlab version
matlabroot
% show compiler
% mex -setup lang
mex -setup c
% Copy the file to a writable folder on your path using the following command syntax. filename is the name of the example, and foldername is the subfolder name.

% copyfile(fullfile(matlabroot,'extern','examples','foldername','filename'),'.','f')
% geht ins home directory
% copyfile(fullfile(matlabroot,'extern','examples','mex','arrayProduct.c'),'.','f')

% Call the mex command to build the function.
mex arrayProduct.c -R2018a

% options
% -g debugging, symboliic info
% -h   help
% -R2017b   is default, no interleaved complex
% -outdir <dirname>
% -v verbose

% set current folder
% cd /home/peter/images/matlabKaleidoscope