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
    PlaneBufferGeometry,
    WebGLRenderTarget,
    RGBFormat,
    DepthTexture,
    UnsignedShortType,
    NearestFilter,
    DepthStencilFormat,
    NormalBlending, ImageUtils, CubeRefractionMapping, AmbientLight, PointLight, PointLightHelper, FogExp2, Fog

} from './lib/three.module.js';

import Utilities from './lib/Utilities.js';
import MouseLookController from './controls/MouseLookController.js';
import ParticleSystem from "./entities/particles/Particles.js";
import TextureSplattingMaterial from './entities/terrain/TextureSplattingMaterial.js';
import TerrainBufferGeometry from './entities/terrain/TerrainBufferGeometry.js';
import { GLTFLoader } from './lib/loaders/GLTFLoader.js';
import { SimplexNoise } from './lib/SimplexNoise.js';
//import skyMaterial from "./materials/skyMaterial.js";
import StarrySkyShader from "./entities/sky/StarrySkyShader.js";
import Terrain from "./entities/terrain/Terrain.js";
import Movement from "./controls/Movement.js";
import {EffectComposer} from "./postprocessing/EffectComposer.js";
import {RenderPass} from "./postprocessing/RenderPass.js"
import {HalftonePass} from "./postprocessing/HalftonePass.js";
import {ShaderPass} from "./postprocessing/ShaderPass.js";
import {SobelOperatorShader} from "./postprocessing/SobelOperatorShader.js";
import Gate from "./entities/gate/gate.js";
import Bridge from "./entities/bridge/bridge.js";
import {FogShader} from "./postprocessing/FogShader.js";
import SkyBox from "./entities/sky/skybox.js";
import Cloud from "./entities/sky/cloud.js";
import Rain from "./entities/sky/rain.js";
import Bush from "./entities/bush/bush.js";
import Sakura from "./entities/sakura/sakura.js";
import BumpedCrate from "./entities/BumpedCrate/bumpedCrate.js";
import Water2 from "./entities/water/Water2.js";
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
     *  - update composer size
     *  - update renderDepth-renderTarget
     */
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
        // resize composer
        composer.setSize( window.innerWidth, window.innerHeight );
        //resize redenderdepth-renderTarget (used for fog post processing)
        const dpr = renderer.getPixelRatio();
        depthRender.setSize( window.innerWidth * dpr, window.innerHeight * dpr );
    }, false);

    /**
     * Add canvas element to DOM.
     */
    document.body.appendChild(renderer.domElement);

    /**
     * Add light
     */
    //ambient
    let ambientLight = new AmbientLight(0x1a1a00,0.5);
    scene.add(ambientLight);
    //const directionalLight = new DirectionalLight(0xffffff);
    const directionalLight = new PointLight(0xffffff, 1.0, 100);
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
    camera.position.y = 13;
    camera.rotation.x -= Math.PI * 0.25;

    let helper = new CameraHelper( directionalLight.shadow.camera );
    //scene.add( helper );
    const pointLightHelper = new PointLightHelper( directionalLight, 1 );
    //scene.add( pointLightHelper );

    const heightmapImage =  await Utilities.loadImage('js/entities/terrain/images/heightmap2.png');
    const terrain = new Terrain(heightmapImage, 100);
    scene.add(terrain.mesh);

    let skybox = new SkyBox(scene,0);
    //scene.fog = new FogExp2(0x1a001a, 0.07);


    //add box
    let myCrate = new BumpedCrate(scene);
    myCrate.position.set(15,14,22);
    // add water
    let water = new Water2({
        parent: scene
    });

    // add light particles
    let lightParticle = new ParticleSystem({
            parent: scene,
            camera: camera
        });

    // instantiate a GLTFLoader:
    const loader = new GLTFLoader();
    new Gate(loader, terrain.mesh);

    new Bridge(loader,scene);
    new Bush(scene,terrain);
    new Sakura(scene,terrain);


    // post-processing
    /**
     * rendrer scenen til et renderTarget
     * brukes for å skaffe dybdedata til fod-effect
     */
    let render = function(renderTarget)
    {
        renderer.setRenderTarget(renderTarget);
        renderer.render(scene, camera );
        //renderer.setRenderTarget( null );
    };

    //set up sobel effect
    let effectSobel = new ShaderPass( SobelOperatorShader );
    effectSobel.uniforms[ 'resolution' ].value.x = window.innerWidth * window.devicePixelRatio;
    effectSobel.uniforms[ 'resolution' ].value.y = window.innerHeight * window.devicePixelRatio;

    //set up halftone effect
    const params = {
        shape: 2,
        radius: 2,
        rotateR: Math.PI / 12,
        rotateB: Math.PI / 12 * 2,
        rotateG: Math.PI / 12 * 3,
        scatter: 0,
        blending: 0.4,
        blendingMode: 1,
        greyscale: false,
        disable: false
    };

    const halftonePass = new HalftonePass( window.innerWidth, window.innerHeight, params );

    //set up depthRenderTarget and fog effect
    let depthRender = new WebGLRenderTarget(window.innerWidth, window.innerHeight);
    depthRender.texture.format = RGBFormat;
    depthRender.texture.minFilter = NearestFilter;
    depthRender.texture.magFilter = NearestFilter;
    depthRender.texture.generateMipmaps = false;
    depthRender.stencilBuffer = false;
    depthRender.depthBuffer = true;
    depthRender.depthTexture = new DepthTexture();
    depthRender.depthTexture.type = UnsignedShortType;

    const fogPass = new ShaderPass(FogShader);
    fogPass.uniforms.cameraNear.value = camera.near;
    fogPass.uniforms.cameraFar.value = camera.far;
    fogPass.uniforms.tDepth.value = depthRender.depthTexture;
    fogPass.uniforms.fogColor.value = (0.502, 0.0, 0.125);
    fogPass.uniforms.fogCap.value = 0.6;
    fogPass.uniforms.minFogThreshhold.value = 0.05;
    fogPass.uniforms.maxFogThreshhold.value = 4.0;

    //set up composer
    let composer = new EffectComposer( renderer );
    const renderPass = new RenderPass( scene, camera );

    //add renderpass of the main screen
    composer.addPass( renderPass );

    //add fog
    composer.addPass(fogPass);
    //add halftone effect
    composer.addPass( halftonePass );

    let player = new Movement(camera, renderer, terrain);
    //let rain = new Rain(scene);

    let then = performance.now();

    function loop(now) {

        const frametime = now - then;
        then = now; //get with the times, old man!
        water.update(now/10000);
        //rain.animate();
        lightParticle.Step(frametime);

        player.doMove(frametime);

        // render scene:
        //renderer.render(scene, camera);
        render(depthRender)
        composer.render();

        requestAnimationFrame(loop);
    }

    loop(performance.now());

}

main(); // Start application
