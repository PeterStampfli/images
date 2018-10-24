// eight fold rotational symmetry with kites

/* jshint esversion:6 */

var triangles12 = {};

(function() {
    "use strict";
    const tanPI12 = Math.tan(Math.PI / 12);
    const rt3 = Math.sqrt(3);

    // more general mapping
    let triangles = [];
    let gamma = new Vector2();



    triangles12.start = function() {
        const side = iterateTiling.initialSpaceLimit / 1.3;

        const zero = new Vector2(0, 0);
        const middle = new Vector2(side * (1 + rt3 * 0.5), 0);
        const top = new Vector2(side * (1 + rt3 * 0.5), side * 0.5);
        const bottom = new Vector2(side * (1 + rt3 * 0.5), -side * 0.5);
        for (var i = 0; i < 12; i++) {
            triangles12.longTriangleLeft(0, zero, top.clone(), middle.clone());
            triangles12.longTriangleRight(0, zero, bottom.clone(), middle.clone());

            top.rotate30();
            middle.rotate30();
            bottom.rotate30();
        }
    };


    triangles12.longTriangleLeft = function(ite, a, b, c) {
        iterateTiling.structure[ite].push(new PolyPoint(c, b, a));
        const ab = Vector2.middle(a, b);
        if (ite < iterateTiling.maxIterations) {
            const ac = Vector2.lerp(a, 1 / (1 + rt3 * 0.5), c);

            triangles12.longTriangleLeft(ite + 1, b, ac, ab);
            triangles12.longTriangleRight(ite + 1, a, ac, ab);
            triangles12.equiTriangleLeft(ite + 1, ac, b, c);


        } else {
            const ac = Vector2.lerp(c, 0.333333, a);

            triangles.length = 0;

            triangles.push(new Polygon(c, b, ac).addBaseline(b, c));
            triangles.push(new Polygon(b, ab, ac).addBaseline(b, ab));
            triangles.push(new Polygon(ab, a, ac).addBaseline(a, ab));
            imageTiles.calculateGamma(gamma, ac, triangles);
            Polygon.setCenter(ac);
            Polygon.setGamma(gamma);
            imageTiles.adjustTriangleMapping(triangles);
            imageTiles.addPolygons(triangles);

        }
    };

    triangles12.longTriangleRight = function(ite, a, b, c) {
        iterateTiling.structure[ite].push(new PolyPoint(a, b, c));
        const ab = Vector2.middle(a, b);
        if (ite < iterateTiling.maxIterations) {
            const ac = Vector2.lerp(a, 1 / (1 + rt3 * 0.5), c);

            triangles12.longTriangleRight(ite + 1, b, ac, ab);

            triangles12.longTriangleLeft(ite + 1, a, ac, ab);
            triangles12.equiTriangleRight(ite + 1, ac, b, c);

        } else {
            const ac = Vector2.lerp(c, 0.333333, a);


            triangles.length = 0;

            triangles.push(new Polygon(b, c, ac).addBaseline(b, c));
            triangles.push(new Polygon(ab, b, ac).addBaseline(b, ab));
            triangles.push(new Polygon(a, ab, ac).addBaseline(a, ab));
            imageTiles.calculateGamma(gamma, ac, triangles);
            Polygon.setCenter(ac);
            Polygon.setGamma(gamma);
            imageTiles.adjustTriangleMapping(triangles);
            imageTiles.addPolygons(triangles);


        }
    };


    triangles12.equiTriangleLeft = function(ite, a, b, c) {
        iterateTiling.structure[ite].push(new PolyPoint(c, b, a));
        if (ite < iterateTiling.maxIterations) {
            const ca = Vector2.lerp(c, tanPI12 / rt3, a);
            const ac = Vector2.lerp(a, 1 / rt3, c);
            const center = Vector2.lerp(c, tanPI12, b).add(ac).sub(c);
            const centerMid = Vector2.middle(center, ca);
            const ab = Vector2.middle(a, b);


            triangles12.longTriangleRight(ite + 1, b, ca, c);
            triangles12.longTriangleLeft(ite + 1, b, ca, center);
            triangles12.longTriangleRight(ite + 1, b, center, centerMid);
            triangles12.longTriangleLeft(ite + 1, b, center, ab);


            triangles12.longTriangleRight(ite + 1, a, center, ab);


            triangles12.longTriangleLeft(ite + 1, a, center, ac);
            triangles12.equiTriangleRight(ite + 1, ca, center, ac);

        } else {
            const center = Vector2.lerp(c, 0.3333333, a);
            const ab = Vector2.middle(a, b);

            imageTiles.polygons.push(new Polygon(c, b, center).addBaseline(b, c));
            imageTiles.polygons.push(new Polygon(b, ab, center).addBaseline(b, ab));
            imageTiles.polygons.push(new Polygon(ab, a, center).addBaseline(a, ab));

        }

    };



    triangles12.equiTriangleRight = function(ite, a, b, c) {
        iterateTiling.structure[ite].push(new PolyPoint(a, b, c));
        if (ite < iterateTiling.maxIterations) {
            const ca = Vector2.lerp(c, tanPI12 / rt3, a);
            const ac = Vector2.lerp(a, 1 / rt3, c);
            const center = Vector2.lerp(c, tanPI12, b).add(ac).sub(c);
            const centerMid = Vector2.middle(center, ca);
            const ab = Vector2.middle(a, b);


            triangles12.longTriangleLeft(ite + 1, b, ca, c);
            triangles12.longTriangleRight(ite + 1, b, ca, center);
            triangles12.longTriangleLeft(ite + 1, b, center, centerMid);
            triangles12.longTriangleRight(ite + 1, b, center, ab);


            triangles12.longTriangleLeft(ite + 1, a, center, ab);


            triangles12.longTriangleRight(ite + 1, a, center, ac);
            triangles12.equiTriangleLeft(ite + 1, ca, center, ac);

        } else {
            const center = Vector2.lerp(c, 0.3333333, a);
            const ab = Vector2.middle(a, b);

            imageTiles.polygons.push(new Polygon(b, c, center).addBaseline(b, c));
            imageTiles.polygons.push(new Polygon(ab, b, center).addBaseline(b, ab));
            imageTiles.polygons.push(new Polygon(a, ab, center).addBaseline(a, ab));

        }
    };


}());
