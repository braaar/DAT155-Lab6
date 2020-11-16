import {CubeTextureLoader} from "../../lib/three.module.js";
import {Mesh, CubeGeometry, DoubleSide, MeshBasicMaterial, MeshFaceMaterial, TextureLoader} from "../../lib/three.module.js";
import {ShaderMaterial, SphereGeometry} from "../../lib/three.module.js";


export default class SkyBox {
    constructor(scene,time) {
        if (time == 0) {
            scene.background = new CubeTextureLoader()
                .setPath('js/entities/sky/skybox1/')
                .load([
                    'right.png',
                    'left.png',
                    'top.png',
                    'bottom.png',
                    'front.png',
                    'back.png'
                ]);
        }
        else {
            scene.background = new CubeTextureLoader()
                .setPath('js/entities/sky/skybox/')
                .load([
                    'right.jpg',
                    'left.jpg',
                    'up.jpg',
                    'down.jpg',
                    'front.jpg',
                    'back.jpg'
                ]);


        }



    }



}






//try nr 2
/*let geometry = new CubeGeometry(1000,1000,1000);
let cubeMaterials = [
    new MeshBasicMaterial( { map: new TextureLoader().load('js/entities/sky/skybox/right.jpg'), side: DoubleSide}),
    new MeshBasicMaterial( { map: new TextureLoader().load('js/entities/sky/skybox/left.jpg'), side: DoubleSide}),
    new MeshBasicMaterial( { map: new TextureLoader().load('js/entities/sky/skybox/up.jpg'), side: DoubleSide}),
    new MeshBasicMaterial( { map: new TextureLoader().load('js/entities/sky/skybox/down.jpg'), side: DoubleSide}),
    new MeshBasicMaterial( { map: new TextureLoader().load('js/entities/sky/skybox/front.jpg'), side: DoubleSide}),
    new MeshBasicMaterial( {map: new TextureLoader().load('js/entities/sky/skybox/back.jpg'), side: DoubleSide})
];

let cube = new Mesh(geometry, cubeMaterials);
this.cube = cube;*/





//So far best alternative
/*scene.background = new CubeTextureLoader()
    .setPath('js/entities/sky/skybox/')
    .load( [
        'right.jpg',
        'left.jpg',
        'up.jpg',
        'down.jpg',
        'front.jpg',
        'back.jpg'

    ]);*/


/* skydome failed
 let geometry = new SphereGeometry(3000,60,40);
        let uniforms = {
            texture: new TextureLoader().load('js/entities/sky/skydome.jpg')
        };

        const vertexShader = `varying vec2 vUV;

                            void main() {
                                 vUV = uv;
                                 vec4 pos = vec4(position, 1.0);
                                 gl_Position = projectionMatrix * modelViewMatrix * pos;
                            }`;
        const fragmentShader = `uniform sampler2D texture;
                                varying vec2 vUV;

                                void main() {
                                    vec4 textureColor = texture2D(texture, vUV);
                                    gl_FragColor = vec4(textureColor.xyz, textureColor.w);
                                }`;

        let materials = new ShaderMaterial( {
            uniforms: uniforms,
            vertexShader: vertexShader ,
            fragmentShader: fragmentShader
        });
        let skyDome = new Mesh(geometry, materials);
        skyDome.scale.set(-1,1,1);
        skyDome.renderDepth = 1000;
        scene.add(skyDome);
 */