module drawOctahedron(a, b, c, d,e,f, iter) {
    if (iter == 0) {
         polyhedron([a, b, c, d,e, f], faces = [[0,1,4],
        [0,2,1],[0,3,2],[0,4,3],[5,1,2],[5,2,3],[5,3,4],[5,4,1]
]);
    } else {
        ab = 0.5 * (a + b);
        ac = 0.5 * (a + c);
        ad = 0.5 * (a + d);
        ae = 0.5 * (a + e);
        af = 0.5 * (a + f);
        bc = 0.5 * (b + c);
        bd = 0.5 * (b + d);
        be = 0.5 * (b + e);
        bf = 0.5 * (b + f);
        cd = 0.5 * (c + d);
        ce = 0.5 * (c + e);
        cf = 0.5 * (c + f);
                de = 0.5 * (d+e);
                df = 0.5 * (d+f);
                ef = 0.5 * (e+f);
    drawOctahedron(a,ab,ac,ad,ae,af, iter-1) ;  
    drawOctahedron(ab,b,bc,bd,be,bf, iter-1) ;  
    drawOctahedron(ac,c,cd,ce,bc,cf, iter-1) ;  
    drawOctahedron(ad,d,de,bd,cd,df, iter-1) ;  
    drawOctahedron(ae,e,be,ce,de,ef, iter-1) ;  
    drawOctahedron(af,bf,cf,df,ef,f, iter-1) ;  

    }
}


s=20;
a=s*[0,0,-1];
b=s*[1,0,0];
c=s*[0,1,0];
d=s*[-1,0,0];
e=s*[0,-1,0];
f=s*[0,0,1];
ex = 0.2;

//minkowski() {
    drawOctahedron(a, b, c, d,e,f, 3) ;  
//    sphere(r = ex);
//}
