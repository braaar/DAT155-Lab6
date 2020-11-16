import {Geometry, PointsMaterial, Vector3, Points} from "../../lib/three.module.js";


export default class Rain {
    constructor(scene) {
        let rainCount = 3000;
        this.rainGeo = new Geometry();
        for(let i=0; i< rainCount; i++){
            let rainDrop = new Vector3(
                Math.random()*400-200,
                Math.random()*800-250,
                Math.random()*400-200
            );
            rainDrop.velocity = {};
            rainDrop.velocity = 0;
            this.rainGeo.vertices.push(rainDrop);
        }

        let rainMaterial = new PointsMaterial({
            color: 0xaaaaaa,
            size: 0.3,
            transparent: true
        });
         this.rain = new Points(this.rainGeo, rainMaterial);
        scene.add(this.rain);

    }

    animate() {
        this.rainGeo.vertices.forEach(p => {
            p.velocity -= 0.1 + Math.random()*0.1;
            p.y += p.velocity;
            if(p.y <= -200){
                p.y = 200;
                p.velocity = 0;
            }
        });
        this.rainGeo.verticesNeedUpdate = true;
    }


}