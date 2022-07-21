unten mein Standard bei gegebenem img mit [hi, wi, di] = size(img),
mit Normierung auf Koordinatenwerte bin ich auf der sicheren Seite, könnte aber auch ohne gehen
erzeugt Output der Größe von vm
interp_method = 'linear';

1) erzeuge vm mit [hv, wv, ~] = size(vm); normiert in nicht-Koordinatenwerten z.B. [-1 1] entspricht Output von basicKaleido

2) normiere auf Koordinatenwerte (Integer); vm hat danach 2 Layer xo,yo bei gleicher hv x wv; siehe Anh.; sicher nicht die einzige/beste Möglichkeit der Normierung
[vm, xo, yo] = vm2NaNNorm2(vm, [hi wi]);

3) erzeuge In-Grid für img
[xi, yi] = meshgrid(linspace(0, wi-1, wi), linspace(0, hi-1, hi));

4) initialisiere Out-Image
out = zeros(hv, wv, di, 'uint8');

5) Interpolation
for k = 1:di; out(:,:,k)  = uint8(interp2(xi, yi, double(img(:,:,k)), xo, yo, interp_method); end                       oder
for k = 1:di; out(:,:,k)  = uint8(interp2(xi, yi, double(img(:,:,k)), vm(:,:,1), vm(:,:,2), interp_method); end

