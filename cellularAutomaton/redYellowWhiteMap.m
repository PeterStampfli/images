function map = redYellowWhiteMap(nStates)
% make a grey-scale color map
% as nStates,3 matrix of rgb-doubles in [0,1]
map = zeros(nStates, 3);
% set values, for real non-trivial colors need for-loop
first = floor(nStates*0.33);
second = floor(nStates*0.66);
for index = 1:nStates
    if (index < first)
        map(index, 1) = (index - 1) / (first - 2);
        map(index, 2) = 0;
        map(index, 3) = 0;
    elseif (index < second)
        map(index, 1) = 1;
        map(index, 2) = (index - first + 1) / (second - first);
        map(index, 3) = 0;
    else
        map(index, 1) = 1;
        map(index, 2) = 1;
        map(index, 3) = (index - second+1) / (nStates - second+1);
    end
end
end
