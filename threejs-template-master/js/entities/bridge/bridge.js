export default class Bridge {
    constructor(loader,scene) {
        this.loader = loader;
        this.loader.load(
            'js/entities/bridge/scene.gltf',
            function (gltf)  {
                let model = gltf.scene;
                model.scale.multiplyScalar(10);
                model.position.y = 12;
                model.position.z = -5;

                model.traverse( function (object ) {
                    if (object.isMesh) {
                        object.material.color.set(0xffffff);
                        object.castShadow = true;
                        object.recieveShadow = true;
                        object.material.metalness = 0;
                    }
                });
                scene.add(model);
            }
        );
    }
}