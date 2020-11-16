import {Mesh,MeshLambertMaterial, PlaneBufferGeometry, TextureLoader} from "../../lib/three.module.js";
import {Sprite, SpriteMaterial} from "../../lib/three.module.js";


export default class Cloud {
    constructor(scene) {

        let loader = new TextureLoader();
        loader.load('js/entities/sky/smoke.png', function (texture) {

            let geometry = new PlaneBufferGeometry(500,500);
            let cloudMaterial = new SpriteMaterial({
                map: texture,
                transparent: true
            });

            for(let i=0; i<25; i++){
                let cloud = new Sprite(cloudMaterial);
                cloud.position.set(
                    Math.random()*800 - 400,
                    800,
                    Math.random()*500 - 450
                );
                cloud.scale.multiplyScalar(1000);
                cloud.material.opacity = 1.0;
                scene.add(cloud);
            }

        });
    }
}