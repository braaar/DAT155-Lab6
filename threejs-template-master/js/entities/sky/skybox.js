import {CubeTextureLoader} from "../../lib/three.module.js";
import {Mesh, CubeGeometry, DoubleSide, MeshBasicMaterial, MeshFaceMaterial, TextureLoader} from "../../lib/three.module.js";


export default class SkyBox {
    constructor() {
        let geometry = new CubeGeometry(1000,1000,1000);
        let cubeMaterials = [
            new MeshBasicMaterial( { map: new TextureLoader().load('js/entities/sky/skybox/right.jpg'), side: DoubleSide}),
            new MeshBasicMaterial( { map: new TextureLoader().load('js/entities/sky/skybox/left.jpg'), side: DoubleSide}),
            new MeshBasicMaterial( { map: new TextureLoader().load('js/entities/sky/skybox/up.jpg'), side: DoubleSide}),
            new MeshBasicMaterial( { map: new TextureLoader().load('js/entities/sky/skybox/down.jpg'), side: DoubleSide}),
            new MeshBasicMaterial( { map: new TextureLoader().load('js/entities/sky/skybox/front.jpg'), side: DoubleSide}),
            new MeshBasicMaterial( {map: new TextureLoader().load('js/entities/sky/skybox/back.jpg'), side: DoubleSide})
        ];

        let cube = new Mesh(geometry, cubeMaterials);
        this.cube = cube;

    }
}











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