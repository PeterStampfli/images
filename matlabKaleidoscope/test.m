function vm = test(t)
    map = createIdentityMap(t*t/1e6);
    disp(['sub(1): map(1,1,1) = ', num2str(map(1,1,1))]);

    basismanip1(map, 2);
    disp(['sub(2): map(1,1,1) = ', num2str(map(1,1,1))]);

    vm = map*3;
    disp(['sub(3): vm(1,1,1)  = ', num2str(vm(1,1,1))]);
end