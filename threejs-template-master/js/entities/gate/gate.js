
export default class Gate {
    constructor(loader){
        this.loader = loader;
        
        loader.load(
            'js/entities/gate/scene.gltf', function(gltf) {
                this.model = gltf.scene;

                //model.position.y = 100;
                this.model.position.x = 50;
                this.model.position.y = 8;
                this.model.scale.multiplyScalar(0.05,0.05,0.05);


                this.model.traverse( function (object ) {
                    if(object.isMesh) {
                        object.material.color.set( 0xffffff );
                        object.castShadow = true;
                        object.recieveShadow = true;
                        object.material.metalness = 0;

                    }

                });
            }
        )
    }
}
