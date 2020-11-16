import {
    PerspectiveCamera,
    WebGLRenderer,
    PCFSoftShadowMap,
    Scene,
    Mesh,
    TextureLoader,
    RepeatWrapping,
    DirectionalLight,
    Vector3,
    AxesHelper,
    CameraHelper,
    sRGBEncoding,
    SphereGeometry,
    Color,
    DoubleSide,
    ShaderMaterial,
    BoxBufferGeometry,
    MeshBasicMaterial,
    PlaneBufferGeometry

} from './lib/three.module.js';

import Utilities from './lib/Utilities.js';
import MouseLookController from './controls/MouseLookController.js';

import TextureSplattingMaterial from './entities/terrain/TextureSplattingMaterial.js';
import TerrainBufferGeometry from './entities/terrain/TerrainBufferGeometry.js';
import { GLTFLoader } from './lib/loaders/GLTFLoader.js';
import { SimplexNoise } from './lib/SimplexNoise.js';
//import skyMaterial from "./materials/skyMaterial.js";
import StarrySkyShader from "./entities/sky/StarrySkyShader.js";
import Terrain from "./entities/terrain/Terrain.js";
//import { Water } from "./entities/water/Water.js";
import Movement from "./controls/Movement.js";
import {EffectComposer} from "./postprocessing/EffectComposer.js";
import {RenderPass} from "./postprocessing/RenderPass.js"
import {HalftonePass} from "./postprocessing/HalftonePass.js";
import {ShaderPass} from "./postprocessing/ShaderPass.js";
import {SobelOperatorShader} from "./postprocessing/SobelOperatorShader.js";
import Gate from "./entities/gate/gate.js";
import Bridge from "./entities/bridge/bridge.js";
import SkyBox from "./entities/sky/skybox.js";
import Cloud from "./entities/sky/cloud.js";
import Rain from "./entities/sky/rain.js";
import {PointLight} from "./lib/three.module.js";
import {PointLightHelper} from "./lib/three.module.js";
import {Fog} from "./lib/three.module.js";
import {FogExp2} from "./lib/three.module.js";
import Bush from "./entities/bush/bush.js";
import Sakura from "./entities/sakura/sakura.js";
//import {sRGBEncoding} from "./lib/three.module";


async function main() {

    const scene = new Scene();

    const axesHelper = new AxesHelper(15);
    scene.add(axesHelper);

    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setClearColor(0xffffff);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    renderer.outputEncoding = sRGBEncoding;

    /**
     * Handle window resize:
     *  - update aspect ratio.
     *  - update projection matrix
     *  - update renderer size
     */
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);

    /**
     * Add canvas element to DOM.
     */
    document.body.appendChild(renderer.domElement);

    /**
     * Add light
     */
    //const directionalLight = new DirectionalLight(0xffffff);
    const directionalLight = new PointLight(0xad331a, 1.0, 100);
    //directionalLight.position.set(300, 400, 300);
    directionalLight.position.y = 35;

    directionalLight.castShadow = true;

    //Set up shadow properties for the light
    directionalLight.shadow.mapSize.width = 512;
    directionalLight.shadow.mapSize.height = 512;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 2000;


    // Set direction
   // directionalLight.target.position.set(0, -10, 0);
    //scene.add(directionalLight.target);
    scene.add(directionalLight);


    camera.position.z = 30;
    camera.position.y = 5;
    camera.rotation.x -= Math.PI * 0.25;

    let helper = new CameraHelper( directionalLight.shadow.camera );
    scene.add( helper );
    const pointLightHelper = new PointLightHelper( directionalLight, 1 );
    scene.add( pointLightHelper );






    const heightmapImage =  await Utilities.loadImage('js/entities/terrain/images/heightmap2.png');
    const terrain = new Terrain(heightmapImage, 100);
    scene.add(terrain.mesh);

    let skybox = new SkyBox(scene,0);
    scene.fog = new FogExp2(0x33322f, 0.1);


    // add water
    /**
    let waterTexture = new TextureLoader().load('js/entities/water/vann2.jpg');
    let waterGeo = new PlaneBufferGeometry( 5, 20, 32 );
    let waterMaterial = new MeshBasicMaterial( {
        map: waterTexture
    } );
    let plane = new Mesh( waterGeo, waterMaterial );
    plane.position.y = 50;
    scene.add(plane);
     */


    /**
     * Add trees
     *
     *
     */
    /*
     loader.load(
            // resource URL
            'js/entities/sakura/kenney_nature_kit/tree_thin.glb',
            // called when resource is loaded
            (object) => {
                for (let x = -50; x < 50; x += 8) {
                    for (let z = -50; z < 50; z += 8) {

                        const px = x + 1 + (6 * Math.random()) - 3;
                        const pz = z + 1 + (6 * Math.random()) - 3;

                        const height = terrain.terrainGeometry.getHeightAt(px, pz);

                        if (height < 5) {
                            const tree = object.scene.children[0].clone();

                            tree.traverse((child) => {
                                if (child.isMesh) {
                                    child.castShadow = true;
                                    child.receiveShadow = true;
                                }
                            });

                            tree.position.x = px;
                            tree.position.y = height + 0.3;
                            tree.position.z = pz;

                            tree.rotation.y = Math.random() * (2 * Math.PI);

                            tree.scale.multiplyScalar(1.5 + Math.random());
                            //tree.scale.multiplyScalar(0.5);

                            scene.add(tree);
                        }

                    }
                }
            },
            (xhr) => {
                console.log(((xhr.loaded / xhr.total) * 100) + '% loaded');
            },
            (error) => {
                console.error('Error loading model.', error);
            }
        );
     */

    // instantiate a GLTFLoader:
    const loader = new GLTFLoader();
    new Gate(loader, terrain.mesh);

    new Bridge(loader,scene);
    new Bush(scene,terrain);
    new Sakura(scene,terrain);


    // post-processing, lagt til av brage fredag 30. oktober

    let composer = new EffectComposer( renderer );
    const renderPass = new RenderPass( scene, camera );
    composer.addPass( renderPass );

    let effectSobel = new ShaderPass( SobelOperatorShader );
    effectSobel.uniforms[ 'resolution' ].value.x = window.innerWidth * window.devicePixelRatio;
    effectSobel.uniforms[ 'resolution' ].value.y = window.innerHeight * window.devicePixelRatio;

    //uncomment denne for Sobel kantlinjer
    //composer.addPass( effectSobel );

    const params = {
        shape: 3,
        radius: 5,
        rotateR: Math.PI / 12,
        rotateB: Math.PI / 12 * 2,
        rotateG: Math.PI / 12 * 3,
        scatter: 0,
        blending: 1,
        blendingMode: 1,
        greyscale: false,
        disable: false
    };

    const halftonePass = new HalftonePass( window.innerWidth, window.innerHeight, params );
    //composer.addPass( renderPass );

    //uncomment denne for halftone effekt
    //composer.addPass( halftonePass );

    window.onresize = function () {

        // resize composer
        renderer.setSize( window.innerWidth, window.innerHeight );
        composer.setSize( window.innerWidth, window.innerHeight );
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

    };

    let player = new Movement(camera, renderer, terrain);
    //let rain = new Rain(scene);

    let then = performance.now();
    function loop(now) {

        const frametime = now - then;
        then = now; //get with the times, old man!

        //rain.animate();
        player.doMove(frametime);

        // render scene:
        //renderer.render(scene, camera);
        composer.render();

        requestAnimationFrame(loop);
    }

    loop(performance.now());

}

main(); // Start application
