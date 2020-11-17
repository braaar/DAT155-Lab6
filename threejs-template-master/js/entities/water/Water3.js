import {
    DepthTexture,
    ImageUtils,
    NearestFilter, PlaneGeometry,
    RepeatWrapping,
    RGBFormat, ShaderMaterial,
    UnsignedShortType, Vector4,
    WebGLRenderTarget
} from "../../lib/three.module.js";
import {Mesh} from "../../lib/three.module.js";

const vertShader = `
    uniform float uTime;
	varying vec2 vUV;
	varying vec3 WorldPosition;
	void main() {
	    vec3 pos = position;
	    pos.z += cos(pos.x*5.0+uTime) * 0.1 * sin(pos.y * 5.0 + uTime);
		WorldPosition = pos;
		vUV = uv;
		//gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
		gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
	}`;

const fragShader = `
    #include <packing>
	varying vec2 vUV;
	varying vec3 WorldPosition;
    uniform sampler2D uSurfaceTexture;
    uniform sampler2D uDepthMap;
    uniform sampler2D uDepthMap2;
    uniform float uTime;
    uniform float cameraNear;
    uniform float cameraFar;
    uniform vec4 uScreenSize;
    uniform bool isMask;
    float readDepth (sampler2D depthSampler, vec2 coord) {
        float fragCoordZ = texture2D(depthSampler, coord).x;
        float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
        return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
    }
    float getLinearDepth(vec3 pos) {
        return -(viewMatrix * vec4(pos, 1.0)).z;
    }
    float getLinearScreenDepth(sampler2D map) {
        vec2 uv = gl_FragCoord.xy * uScreenSize.zw;
        return readDepth(map,uv);
    }
    void main(){
        vec4 color = vec4(1.0,0.0,1.0,0.3);
        vec2 pos = vUV * 2.0;
        pos.y -= uTime * 0.002;
        vec4 WaterLines = texture2D(uSurfaceTexture,pos);
        color.rgba += WaterLines.r * 0.1;
        //float worldDepth = getLinearDepth(WorldPosition);
        float worldDepth = getLinearScreenDepth(uDepthMap2);
        float screenDepth = getLinearScreenDepth(uDepthMap);
        float foamLine = clamp((screenDepth - worldDepth),0.0,1.0) ;
        if(foamLine < 0.001){
            color.rgba += 0.2;
        }
        if(isMask){
            color = vec4(1.0);
        }
        gl_FragColor = color;
    }`;

export default class Water3 {
    constructor(scene,camera) {

        // Set up depth buffer
        var depthTarget = new WebGLRenderTarget( window.innerWidth, window.innerHeight );
        depthTarget.texture.format = RGBFormat;
        depthTarget.texture.minFilter = NearestFilter;
        depthTarget.texture.magFilter = NearestFilter;
        depthTarget.texture.generateMipmaps = false;
        depthTarget.stencilBuffer = false;
        depthTarget.depthBuffer = true;
        depthTarget.depthTexture = new DepthTexture();
        depthTarget.depthTexture.type = UnsignedShortType;

        // This is used as a hack to get the depth of the pixels at the water surface by redrawing the scene with the water in the depth buffer
        var depthTarget2 = new WebGLRenderTarget( window.innerWidth, window.innerHeight );
        depthTarget2.texture.format = RGBFormat;
        depthTarget2.texture.minFilter = NearestFilter;
        depthTarget2.texture.magFilter = NearestFilter;
        depthTarget2.texture.generateMipmaps = false;
        depthTarget2.stencilBuffer = false;
        depthTarget2.depthBuffer = true;
        depthTarget2.depthTexture = new DepthTexture();
        depthTarget2.depthTexture.type = UnsignedShortType;

        var waterLinesTexture = ImageUtils.loadTexture( './js/entities/water/WaterTexture.png' );
        waterLinesTexture.wrapS = RepeatWrapping;
        waterLinesTexture.wrapT = RepeatWrapping;

        var uniforms = {
            uTime: { value: 0.0 },
            uSurfaceTexture: {type: "t", value:waterLinesTexture },
            cameraNear: { value: camera.near },
            cameraFar:  { value: camera.far },
            uDepthMap:  { value: depthTarget.depthTexture },
            uDepthMap2:  { value: depthTarget2.depthTexture },
            isMask: { value: false },
            uScreenSize: {value: new Vector4(window.innerWidth,window.innerHeight,1/window.innerWidth,1/window.innerHeight)}
        };


        var water_geometry = new PlaneGeometry( 50, 50, 50, 50 );
        var water_material = new ShaderMaterial( {
            uniforms: uniforms,
            vertexShader: vertShader,
            fragmentShader: fragShader,
            transparent:true,
            depthWrite:true
        } );
        var water = new Mesh( water_geometry, water_material );
        water.rotation.x = -Math.PI/2;
        water.position.y = -1;

        water.uniforms = uniforms;
        water.material = water_material;

        this.water = water;
        water.position.setY(8);
        scene.add(water)
        console.log(water);

    }
    update () {
        this.water.uniforms.uTime.value += 0.03;

    }
}