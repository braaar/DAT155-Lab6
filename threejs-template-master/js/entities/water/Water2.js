import {
    Mesh,
    MeshBasicMaterial,
    NormalBlending,
    PlaneBufferGeometry, RepeatWrapping,
    TextureLoader,
    Vector2,
    ShaderMaterial,
    PlaneGeometry, ImageUtils, MeshPhongMaterial
} from "../../lib/three.module.js";

const vertexShader = [
    "float wave(int i, float x, float y) {",
    "float frequency = 2.0*pi/wavelength[i];",
    "float phase = speed[i] * frequency;",
    "float theta = dot(direction[i], vec2(x, y));",
    "return amplitude[i] * sin(theta * frequency + time * phase);",
"}",
    "float waveHeight(float x, float y) {",
    "float height = 0.0,",
    "for (int i = 0; i < numWaves; ++i)",
    "return height;",
"}",

"float dWavedx(int i, float x, float y) {",
    "float frequency = 2.0*pi/wavelength[i];",
    "float phase = speed[i] * frequency;",
    "float theta = dot(direction[i], vec2(x, y));",
    "float A = amplitude[i] * direction[i].x * frequency;",
    "return A * cos(theta * frequency + time * phase);",
"}",

"float dWavedy(int i, float x, float y) {",
    "float frequency = 2.0*pi/wavelength[i];",
    "float phase = speed[i] * frequency;",
    "float theta = dot(direction[i], vec2(x, y));",
    "float A = amplitude[i] * direction[i].x * frequency;",
    "return A * cos(theta * frequency + time * phase);",
    "}",
"vec3 waveNormal(float x, float y) {",
    "float dx = 0.0;",
    "float dy = 0.0;",
    "for (int i = 0; i < numWaves; ++i) {",
    "dx += dWavedx(i, x, y);",
    "dy += dWavedy(i, x, y);",
    "}",
    "vec3 n = vec3(-dx, -dy, 1.0);",
    "return normalize(n);",    
"}",

"void main() {",
    "vUv = vec2(3.0, 1.0) * uv;",
    "vec4 pos = vec4 (position, 1.0);",
    "pos.z = waterHeight * waveHeight(pos.x, pos.y);",
    "vPosition = pos.xyz /pos.w;",
    "worldNormal = waveNormal(pos.x, pos.y);",
    "eyeNormal = normalMatrix * worldNormal;",
    "vec4 mvPosition = modelViewMatrix * pos;",
    "gl_Position = projectionMatrix * mvPosition;",
"}"
   ].join("\n");

const fragmentShaders = [
    "varying vec2 vUv;",
    "uniform sampler2D texture2;",
    "uniform float time2;",

    "void main() {",
            "vec2 position = -1.0 + 2.0 * vUv;",
            "vec4 noise = texture2D( texture2, vUv );",
            "vec2 T = vUv + vec2( -2.5, 10.0 ) * time2 * 0.01;",

            "T.x -= noise.y * 0.2;",
            "T.y += noise.z * 0.2;",

            "vec4 color = texture2D( texture2, T * 1.5);",
            "gl_FragColor = color;",
            "}"
    ].join("\n");

let uniforms = {};
uniforms.time = { type: "f", value: 0.1 };
//uniforms.envMap = { type: "t", value: 1, texture: textureCube};

let waterTexture = new TextureLoader().load('./js/entities/water/vann2.jpg');
uniforms.texture2 = { type: "t", value: waterTexture};
uniforms.texture2.value.wrapS = uniforms.texture2.value.wrapT = RepeatWrapping;
uniforms.texture2.value.repeat.set(25, 25);

uniforms.eyePos = { type: "f", value: 0.1 };
uniforms.waterHeight = { type: "fv1", value: 0.1};
uniforms.amplitude = { type: "fv1", value: [0.5, 0.25, 0.17, 0.125, 0.1, 0.083, 0.714, 0.063] };
uniforms.wavelength = {type: "fv1", value: [25.133, 12.566, 8.378, 6.283, 5.027, 4.189, 3.590, 3.142]};
uniforms.speed = { type: "fv1", value: [1.2, 2.0, 2.8, 3.6, 4.4, 5.2, 6.0, 6.8]};

let angle = [];
for (let i = 0; i < 8; i++) {
    let a = Math.random() * (2.0942) + (-1.0471);
    angle[i] = new Vector2(Math.cos(a), Math.sin(a));
}
uniforms.direction = { type: "v2v", value: angle};

export default class Water2 {
    constructor() {

        let material = new ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShaders: fragmentShaders,
            blending: NormalBlending
        });

        let material2 = new MeshPhongMaterial( {
            color: 0xffffff
        });

        let waterGeo = new PlaneGeometry( 5, 20, 32, 5 );

        let wPlane = new Mesh (waterGeo, material);
        wPlane.doubleSide = true;
        wPlane.rotation.x = -1.570796;
        wPlane.position.y = 10;

    }
}