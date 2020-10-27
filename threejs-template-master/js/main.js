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
    ShaderMaterial

} from './lib/three.module.js';

import Utilities from './lib/Utilities.js';
import MouseLookController from './controls/MouseLookController.js';

import TextureSplattingMaterial from './entities/terrain/TextureSplattingMaterial.js';
import TerrainBufferGeometry from './entities/terrain/TerrainBufferGeometry.js';
import { GLTFLoader } from './lib/loaders/GLTFLoader.js';
import { SimplexNoise } from './lib/SimplexNoise.js';
//import skyMaterial from "./materials/skyMaterial.js";
import StarrySkyShader from "./entities/sky/StarrySkyShader.js";
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
    //renderer.outputEncoding = sRGBEncoding;


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
    const directionalLight = new DirectionalLight(0xffffff);
    directionalLight.position.set(300, 400, 300);

    directionalLight.castShadow = true;

    //Set up shadow properties for the light
    directionalLight.shadow.mapSize.width = 512;
    directionalLight.shadow.mapSize.height = 512;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 2000;

    scene.add(directionalLight);

    // Set direction
    directionalLight.target.position.set(0, -10, 0);
    scene.add(directionalLight.target);

    camera.position.z = 30;
    camera.position.y = 5;
    camera.rotation.x -= Math.PI * 0.25;

    let helper = new CameraHelper( directionalLight.shadow.camera );
    scene.add( helper );

    /*  let geometry = new SphereGeometry(25000, 60, 60);
      let skyTexture = new TextureLoader().load('resources/textures/sky.jpg');
      let skyMat = new skyMaterial(skyTexture);

      let skydome = new Mesh(geometry, skyMat);
      skydome.scale.set(-1, 1, 1);
      skydome.renderDepth = 100.0;
      scene.add(skydome);*/

    var skyDomeRadius = 500.01;
    var sphereMaterial = new ShaderMaterial({
        uniforms: {
            skyRadius: { value: skyDomeRadius },
            env_c1: { value: new Color("#0d1a2f") },//#0d1a2f
            env_c2: { value: new Color("#0f8682") },//#0f8682
            noiseOffset: { value: new Vector3(100.01, 100.01, 100.01) },
            starSize: { value: 0.01 },
            starDensity: { value: 0.09 },
            clusterStrength: { value: 0.2 },
            clusterSize: { value: 0.2 },
        },
        vertexShader: StarrySkyShader.vertexShader,
        fragmentShader: StarrySkyShader.fragmentShader,
        side: DoubleSide,
    })
    var sphereGeometry = new SphereGeometry(skyDomeRadius, 20, 20);
    var skyDome = new Mesh(sphereGeometry, sphereMaterial);
    scene.add(skyDome);

    /**
     * Add terrain:
     *
     * We have to wait for the image file to be loaded by the browser.
     * There are many ways to handle asynchronous flow in your application.
     * We are using the async/await language constructs of Javascript:
     *  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
     */
    const heightmapImage = await Utilities.loadImage('js/entities/terrain/images/heightmap.png');
    const width = 100;

    const simplex = new SimplexNoise();
    const terrainGeometry = new TerrainBufferGeometry({
        width,
        heightmapImage,
        // noiseFn: simplex.noise.bind(simplex),
        numberOfSubdivisions: 128,
        height: 20
    });

    const grassTexture = new TextureLoader().load('js/entities/terrain/textures/grass_02.png');
    grassTexture.wrapS = RepeatWrapping;
    grassTexture.wrapT = RepeatWrapping;
    grassTexture.repeat.set(5000 / width, 5000 / width);

    const snowyRockTexture = new TextureLoader().load('js/entities/terrain/textures/snowy_rock_01.png');
    snowyRockTexture.wrapS = RepeatWrapping;
    snowyRockTexture.wrapT = RepeatWrapping;
    snowyRockTexture.repeat.set(1500 / width, 1500 / width);


    const splatMap = new TextureLoader().load('js/entities/terrain/images/splatmap_01.png');

    const terrainMaterial = new TextureSplattingMaterial({
        color: 0xffffff,
        shininess: 0,
        textures: [snowyRockTexture, grassTexture],
        splatMaps: [splatMap]
    });

    const terrain = new Mesh(terrainGeometry, terrainMaterial);

    terrain.castShadow = true;
    terrain.receiveShadow = true;

    scene.add(terrain);

    /**
     * Add trees
     */

        // instantiate a GLTFLoader:
    const loader = new GLTFLoader();

    /*loader.load(
        'resources/models/banana.glb', function(gltf) {
            var model = gltf.scene;
            model.position.y = 20;


            model.traverse( function (object ) {
                if(object.isMesh) {
                    object.material.color.set( 0xffffff );
                    object.castShadow = true;
                    object.recieveShadow = true;
                    object.material.metalness = 0;

                }

            });
            scene.add(model);
        }


    );
    */
    loader.load(
        // resource URL
        'js/entities/sakura/kenney_nature_kit/tree_thin.glb',
        //'resources/models/banana.glb',
        // called when resource is loaded
        (object) => {
            for (let x = -50; x < 50; x += 8) {
                for (let z = -50; z < 50; z += 8) {

                    const px = x + 1 + (6 * Math.random()) - 3;
                    const pz = z + 1 + (6 * Math.random()) - 3;

                    const height = terrainGeometry.getHeightAt(px, pz);

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

                        tree.scale.multiplyScalar(1.5 + Math.random() * 1);
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

    /**
     * Set up camera controller:
     */

    const mouseLookController = new MouseLookController(camera);

    // We attach a click lister to the canvas-element so that we can request a pointer lock.
    // https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
    const canvas = renderer.domElement;

    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
    });

    let yaw = 0;
    let pitch = 0;
    const mouseSensitivity = 0.001;

    function updateCamRotation(event) {
        yaw += event.movementX * mouseSensitivity;
        pitch += event.movementY * mouseSensitivity;
    }

    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === canvas) {
            canvas.addEventListener('mousemove', updateCamRotation, false);
        } else {
            canvas.removeEventListener('mousemove', updateCamRotation, false);
        }
    });

    let move = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        speed: 0.01
    };

    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyW') {
            move.forward = true;
            e.preventDefault();
        } else if (e.code === 'KeyS') {
            move.backward = true;
            e.preventDefault();
        } else if (e.code === 'KeyA') {
            move.left = true;
            e.preventDefault();
        } else if (e.code === 'KeyD') {
            move.right = true;
            e.preventDefault();
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'KeyW') {
            move.forward = false;
            e.preventDefault();
        } else if (e.code === 'KeyS') {
            move.backward = false;
            e.preventDefault();
        } else if (e.code === 'KeyA') {
            move.left = false;
            e.preventDefault();
        } else if (e.code === 'KeyD') {
            move.right = false;
            e.preventDefault();
        }
    });

    const velocity = new Vector3(0.0, 0.0, 0.0);

    let then = performance.now();
    function loop(now) {

        const delta = now - then;
        then = now;

        const moveSpeed = move.speed * delta;

        velocity.set(0.0, 0.0, 0.0);

        if (move.left) {
            velocity.x -= moveSpeed;
        }

        if (move.right) {
            velocity.x += moveSpeed;
        }

        if (move.forward) {
            let above = terrainGeometry.getHeightAt(camera.position.x, camera.position.z) <= camera.position.y-1;
            let below = terrainGeometry.getHeightAt(camera.position.x, camera.position.z) >= camera.position.y-1;

            if(above && below){
                velocity.z -= moveSpeed;
            }
            else if(above && !below){
                velocity.z -= moveSpeed;
                velocity.y -= 0.1;
            }
            else if(!above && below){
                velocity.z -= moveSpeed;
                velocity.y += 0.2;
            }

            /*if(terrainGeometry.getHeightAt(camera.position.x, camera.position.z) <= camera.position.y-1 &&
                terrainGeometry.getHeightAt(camera.position.x, camera.position.z) >= camera.position.y-1) {
                velocity.z -= moveSpeed;
            }
            else if(terrainGeometry.getHeightAt(camera.position.x, camera.position.z) <= camera.position.y-1) {
                velocity.y += 0.1;
            }
            else {
                velocity.y -= 0.1;
            }
            if(terrainGeometry.getHeightAt(camera.position.x, camera.position.z) >= camera.position.y+5) {
                velocity.z -= moveSpeed;
            }
            else{
                velocity.y -= 0.1;
            }*/

        }

        if (move.backward) {
            velocity.z += moveSpeed;
        }

        // update controller rotation.
        mouseLookController.update(pitch, yaw);
        yaw = 0;
        pitch = 0;

        // apply rotation to velocity vector, and translate moveNode with it.
        velocity.applyQuaternion(camera.quaternion);
        camera.position.add(velocity);
        // render scene:
        renderer.render(scene, camera);

        requestAnimationFrame(loop);

    }

    loop(performance.now());

}

main(); // Start application