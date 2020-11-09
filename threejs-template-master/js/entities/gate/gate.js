import {Mesh} from "../../lib/three.module.js";

export default class Gate {
    constructor(loader,scene) {
        this.loader = loader;
        this.loader.load(
             'js/entities/gate/scene.gltf',
             function (gltf)  {
                 let model = gltf.scene;
                 model.scale.multiplyScalar(0.1);

                 model.traverse( function (object ) {
                     if (object.isMesh) {
                         object.material.color.set(0xffffff);
                         object.castShadow = true;
                         object.recieveShadow = true;
                         object.material.metalness = 0;
                     }else{
                         console.log("object is not a mesh");
                     }
                 });
                 scene.add(model);
             }
         );
    }
}