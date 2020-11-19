import {GLTFLoader} from "../../lib/loaders/GLTFLoader.js";
import {Color, MeshPhongMaterial, MeshToonMaterial, Sprite, Vector3} from "../../lib/three.module.js";


export default class Sakura {
    constructor(scene,terrain) {
        let loader = new GLTFLoader();

       loader.load('js/entities/sakura/tree_thin.glb',
           function (object) {
            let model = object.scene;



            let leaves = model.children[0].children[0];
            let trunk = model.children[0].children[1];


               let changeMat = function (m){
                   if(m.isMesh){
                       //m.material.displacementScale =
                       m.material = new MeshPhongMaterial();
                       m.castShadow = true;
                       m.receiveShadow = true;

                       //m.metalness = 0.99;
                       //console.log(m.parent);
                   } else {
                       //console.log('is not mesh');
                   }
               }
               //console.log(leaves.material)

               changeMat(leaves);
               console.log(leaves.material)
               changeMat(trunk);

               leaves.material.color = new Color(1,0,1);
               trunk.material.color = new Color(1,0.5,0);
               //console.log(model.children[0].children[0]);
               let treeList = [];

               for(let i=0; i< 15; i++){
                   let mindist = 60;
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
                   tree.scale.multiplyScalar(12);

                   tree.rotateOnWorldAxis(new Vector3(0,1,0),Math.random()*2*Math.PI);

                   if(pos.y <= 9){
                       i--;
                       continue;
                   }
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