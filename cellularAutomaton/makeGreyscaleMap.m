function map = makeGreyscaleMap(nStates)
% make a grey-scale color map
% as nStates,3 matrix of rgb-doubles in [0,1]
map = zeros(nStates, 3);
% set values, for real non-trivial colors need for-loop
for index = 1:nStates
    grey = (index - 1) / (nStates - 1);
    map(index, 1) = grey;
    map(index, 2) = grey;
    map(index, 3) = grey;
end
end
