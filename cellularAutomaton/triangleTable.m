% sawtooth:  going from o to nstates-1, n-2, n-3 ... 0, 1 repeating
% triangle
function table = triangleTable(nStates, weights)
%make a transition table
%sawtooth shape
%depending on number of states and weights (vector of 6 or greater 1)
maxSum = nStates * (4 * sum(weights) - 3 * weights(1));
table = [0:maxSum];
period = 2 * nStates - 2;
for k = 1:maxSum+1
    t = mod(k-1, period);
    if (t >= nStates)
            t = period - t;
    end
        table(k) = t;
end
