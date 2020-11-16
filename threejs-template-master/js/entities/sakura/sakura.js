import {GLTFLoader} from "../../lib/loaders/GLTFLoader.js";
import {Sprite, Vector3} from "../../lib/three.module.js";


export default class Sakura {
    constructor(scene,terrain) {
        let loader = new GLTFLoader();

       loader.load('js/entities/sakura/tree_thin.glb',
           function (object) {
            let model = object.scene;

               model.traverse((child) => {
                   if (child.isMesh) {
                       child.castShadow = true;
                       child.receiveShadow = true;
                   }
               });
               let treeList = [];

               for(let i=0; i< 20; i++){
                   let mindist = 20;
                   let r1 = Math.random(); //random point between 0 and 1
                   let r2 = Math.random();
                   let r3 = Math.random();
                   //random radius between mindist and 2* mindist
                   let  radius = mindist * (r1 + 1);
                   //random angle
                   let  angle1 = 2 * Math.PI * r2;
                   let  angle2 = 2 * Math.PI * r3;
                   //the new point is generated around the point (x, y, z)
                   let point = new Vector3()
                   let  newX = point.x + radius * Math.cos(angle1) * Math.sin(angle2);
                   let  newY = point.y + radius * Math.sin(angle1) * Math.sin(angle2);
                   let  newZ = point.z + radius * Math.cos(angle2);
                   let pos = new Vector3(newX, terrain.terrainGeometry.getHeightAt(newX, newZ),newZ );
                   let ran = Math.random();
                   let tree = object.scene.children[0].clone();
                   tree.scale.multiplyScalar(3);


                   //grass.scale.multiplyScalar(3);
                   tree.position.x = pos.x;
                   tree.position.y = pos.y;
                   tree.position.z = pos.z;
                   treeList[i] = tree;

               }
               treeList.forEach(g => {
                   terrain.mesh.add(g);
               });




           });
    }


}