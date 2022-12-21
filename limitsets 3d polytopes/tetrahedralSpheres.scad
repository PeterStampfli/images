    rSphere = 20*sqrt(2 / 3);
    rt32 = sqrt(3) / 2;
    r3 = 2 / 3 * sqrt(2);
  
    corners = 20*[
        [0,0,-1],
        [r3, 0, 1 / 3],
        [-r3 / 2, rt32 * r3, 1 / 3],
        [-r3 / 2, -rt32 * r3, 1 / 3]
    ];

module touchingSpheres(){
    for (i=[0:len(corners)-1]){
    translate(corners[i]){
        difference(){
        sphere(rSphere); 
        sphere(0.9*rSphere);}
    }
    }
}

    rHyp=sqrt(corners[1]*corners[1]-rSphere*rSphere);
    echo(rHyp);
    color("brown")sphere(rHyp);
intersection(){
    touchingSpheres();
    sphere(1.1*rHyp);
    }


    $fn=60;

