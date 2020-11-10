
import {
    AdditiveBlending,
    BufferGeometry, Color,
    Float32BufferAttribute, Points,
    ShaderMaterial,
    TextureLoader, Vector3
} from "../../lib/three.module";

const _VS = `
uniform float pointMultiplier;
attribute float size;
attribute float angle;
attribute vec4 colour;
varying vec4 vColour;
varying vec2 vAngle;
void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = size * pointMultiplier / gl_Position.w;
  vAngle = vec2(cos(angle), sin(angle));
  vColour = colour;
}`;

const _FS = `
uniform sampler2D diffuseTexture;
varying vec4 vColour;
varying vec2 vAngle;
void main() {
  vec2 coords = (gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;
  gl_FragColor = texture2D(diffuseTexture, coords) * vColour;
}`;

/////////////////////////////////////////////////////////////////////
class LinearSpline {
    constructor(lerp) {
        this._points = [];
        this._lerp = lerp;
    }

    AddPoint(t, d) {
        this._points.push([t, d]);
    }

    Get(t) {
        let p1 = 0;

        for (let i = 0; i < this._points.length; i++) {
            if (this._points[i][0] >= t) {
                break;
            }
            p1 = i;
        }

        const p2 = Math.min(this._points.length - 1, p1 + 1);

        if (p1 == p2) {
            return this._points[p1][1];
        }

        return this._lerp(
            (t - this._points[p1][0]) / (
            this._points[p2][0] - this._points[p1][0]),
            this._points[p1][1], this._points[p2][1]);
    }
}
/////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////
class ParticleSystem {
    constructor(params) {
        const uniforms = {
            diffuseTexture: {
                value: new TextureLoader().load('./particle.jpg')
            },
            pointMultiplier: {
                value: window.innerHeight / (2.0 * Math.tan(0.5 * 60.0 * Math.PI / 180.0))
            }
        };

        this._material = new ShaderMaterial({
            uniforms: uniforms,
            vertexShader: _VS,
            fragmentShader: _FS,
            blending: AdditiveBlending,
            depthTest: true,
            depthWrite: false,
            transparent: true,
            vertexColors: true
        });


        this._geometry = new BufferGeometry();
        this._geometry.setAttribute('position', new Float32BufferAttribute([], 3));
        this._geometry.setAttribute('size', new Float32BufferAttribute([], 1));
        this._geometry.setAttribute('colour', new Float32BufferAttribute([], 4));
        this._geometry.setAttribute('angle', new Float32BufferAttribute([], 1));

        this._points = new Points(this._geometry, this._material);

        params.parent.add(this._points);

        this._AddParticles();
        this._UpdateGeometry();
    }

    _AddParticles(timeElapsed) {

        if (!this.gdfsghk) {
            this.gdfsghk = 0.0;
        }
        this.gdfsghk += timeElapsed;
        const n = Math.floor(this.gdfsghk * 75.0);
        this.gdfsghk -= n / 75.0;

        for (let i = 0; i < 10; i++) {
            const life = (Math.random() * 0.75 + 0.25) * 10.0;
            this._particles.push({
                position: new Vector3(
                    (Math.random() * 2 - 1) * 1.0,
                    (Math.random() * 2 - 1) * 1.0,
                    (Math.random() * 2 - 1) * 1.0),
                size: (Math.random() * 0.5 + 0.5) * 4.0,
                colour: new Color(),
                alpha: 1.0,
                life: life,
                maxLife: life,
                rotation: Math.random() * 2.0 * Math.PI,
                velocity: new Vector3(0, -15, 0),
            });
        }
    }

    _UpdateGeometry() {
        const positions = [];
        const sizes = [];
        const colours = [];
        const angles = [];

        for (let p of this._particles) {
            positions.push(p.position.x, p.position.y, p.position.z);
            colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha);
            sizes.push(p.currentSize);
            angles.push(p.rotation);
        }

        this._geometry.setAttribute(
            'position', new Float32BufferAttribute(positions, 3));
        this._geometry.setAttribute(
            'size', new Float32BufferAttribute(sizes, 1));
        this._geometry.setAttribute(
            'colour', new Float32BufferAttribute(colours, 4));
        this._geometry.setAttribute(
            'angle', new Float32BufferAttribute(angles, 1));

        this._geometry.attributes.position.needsUpdate = true;
        this._geometry.attributes.size.needsUpdate = true;
        this._geometry.attributes.colour.needsUpdate = true;
        this._geometry.attributes.angle.needsUpdate = true;
    }

    _UpdateParticles(timeElapsed) {
        for (let p of this._particles) {
            p.life -= timeElapsed;
        }

        this._particles = this._particles.filter(p => {
            return p.life > 0.0;
        });

        for (let p of this._particles) {
            const t = 1.0 - p.life / p.maxLife;

            p.rotation += timeElapsed * 0.5;
            p.alpha = this._alphaSpline.Get(t);
            p.currentSize = p.size * this._sizeSpline.Get(t);
            p.colour.copy(this._colourSpline.Get(t));

        }

        this._particles.sort((a, b) => {
            const d1 = this.camera.position.distanceTo(a.position);
            const d2 = this.camera.position.distanceTo(b.position);

            if (d1 > d2) {
                return -1;
            }

            if (d1 < d2) {
                return 1;
            }

            return 0;
        });
    }

    Step(timeElapsed) {
        this._AddParticles(timeElapsed);
        this._UpdateParticles(timeElapsed);
        this._UpdateGeometry();
    }


}
/////////////////////////////////////////////////////////////////////