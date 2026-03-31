import {
    app,
    CAMERA_SPEED, cameraContainer,
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    setApp, setCameraContainer,
    setGlobalContainer, VERSION, wheelUsing
} from "@/game/core/global";
import {text} from "@/game/core/utils/text";
import {
    Application,
    ApplicationOptions,
    Container, defaultFilterVert, Filter,
    GlProgram, Graphics,
} from "pixi.js";
import {gsap} from "gsap";
import {PixiPlugin} from "gsap/PixiPlugin";
import * as PIXI from "pixi.js";

PixiPlugin.registerPIXI(PIXI);
gsap.registerPlugin(PixiPlugin);

// =================================

function isWebGPUSupported(): boolean {
    return typeof navigator !== "undefined" && "gpu" in navigator;
}

export const initializeApp = async (setCanvas: (canvas: Element) => void) => {
    const app = new Application();

    if (isWebGPUSupported()) {
        console.log("WebGPU is supported");
    } else {
        console.log("WebGPU is NOT supported");
    }

    await app.init({
        background: "#1c1c1c",
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        preference: "webgl",
    } as Partial<ApplicationOptions>);

    const div = document.getElementById("game");
    if (!div) {
        throw new Error('#game container not found in DOM');
    }

    app.canvas.setAttribute("style", "border: 2px solid red");
    div.appendChild(app.canvas);
    setApp(app);

    const globalContainer = new Container();
    setGlobalContainer(globalContainer);


    const cameraContainer = new Container();
    globalContainer.addChild(cameraContainer);
    setCameraContainer(cameraContainer);
    app.stage.addChild(globalContainer);

    setCanvas(app.canvas);
    _debugShader()

    _debugInfo();

};

export function _debugShader() {
    const fragment = `#version 300 es
    precision mediump float;
    
    uniform float uTime;
    uniform vec2 uResolution;
    uniform sampler2D uTexture;
    
    in vec2 vTextureCoord;
    out vec4 fragColor;
    
    float hash(vec2 p) {
        p = fract(p * vec2(123.34, 345.45));
        p += dot(p, p + 34.23);
        return fract(p.x * p.y);
    }
    
    float snowLayer(
        vec2 uv,
        float scale,
        float minSpeed,
        float maxSpeed,
        float minSize,
        float maxSize,
        vec2 wind
    ) {
        float baseT = uTime * 0.8;
    
        vec2 suv = uv * scale;
        vec2 cell = floor(suv);
    
        float h  = hash(cell);
        float h2 = hash(cell + 7.0);
        float h3 = hash(cell + 13.0);
        float h4 = hash(cell + 19.0);
    
        float fallSpeed = mix(minSpeed, maxSpeed, h2);
    
        float t = baseT + h * 12.0;
    
        // ===== direction =====
        suv += wind * t * fallSpeed;
    
        // ===== shifting =====
        suv.x += sin(t * mix(0.5, 1.5, h3) + h * 6.2831) * 0.15;
        suv.y += sin(t * mix(0.3, 1.2, h4)) * 0.05;
    
        vec2 p = fract(suv) - 0.5;
        float d = length(p);
    
        float size = mix(minSize, maxSize, h);
    
        float core = smoothstep(size, 0.0, d);
        core = pow(core, 1.6);
    
        float cutoff = smoothstep(0.1, 0.6, core);
        float flake = core * cutoff;
    
        float brightness = 1.2 + hash(cell + 23.0);
    
        float life = fract(baseT * 0.04 + h2);
        float fadeIn  = smoothstep(0.0, 0.05, life);
        float fadeOut = 1.0 - smoothstep(0.85, 1.0, life);
    
        return flake * brightness * fadeIn * fadeOut;
    }
    
    void main() {
        vec4 base = texture(uTexture, vTextureCoord);
        vec2 uv = gl_FragCoord.xy / uResolution;
    
        vec2 wind = normalize(vec2(-1.0, 2.2)); // ↙ из правого верхнего угла
    
        float s = 0.0;
    
        // ===== snow layers =====
        s += snowLayer(uv,  8.0, 0.8, 1.4, 0.06, 0.10, wind);
        s += snowLayer(uv, 12.0, 1.0, 1.8, 0.04, 0.08, wind);
        s += snowLayer(uv, 18.0, 1.2, 2.2, 0.025, 0.05, wind);
        s += snowLayer(uv, 26.0, 1.5, 2.8, 0.018, 0.035, wind);
        s += snowLayer(uv, 36.0, 1.8, 3.4, 0.012, 0.025, wind);
        s += snowLayer(uv, 50.0, 2.2, 4.0, 0.008, 0.018, wind);
        s += snowLayer(uv, 70.0, 2.6, 4.8, 0.006, 0.014, wind);
        s += snowLayer(uv, 95.0, 3.0, 5.6, 0.004, 0.010, wind);
    
        s = clamp(s, 0.0, 12.0);
    
        float snowAlpha = smoothstep(0.2, 5.5, s);
    
        vec3 snowRGB = vec3(snowAlpha);
        vec4 snow = vec4(snowRGB, snowAlpha);
    
        vec3 outRGB = snow.rgb + base.rgb * (1.0 - snow.a);
        float outA = snow.a + base.a * (1.0 - snow.a);
    
        fragColor = vec4(outRGB, outA);
}
`;
    const shaderContainer = new Container()
    app.stage.addChild(shaderContainer)

    const snowFilter = new Filter({
        glProgram: new GlProgram({
            vertex: defaultFilterVert,
            fragment,
        }),
        resources: {
            snowUniforms: {
                uTime: {value: 0, type: 'f32'},
                uResolution: {value: [app.renderer.width, app.renderer.height], type: 'vec2<f32>'},
            },
        },
    });

    const fullscreenRect = new Graphics();
    fullscreenRect
        .rect(0, 0, app.renderer.width, app.renderer.height)
        .fill(0xffffff, 0); // цвет не важен, всё перекроет шейдер
    shaderContainer.addChild(fullscreenRect);
    shaderContainer.filters = [snowFilter];
    const uniforms = snowFilter.resources.snowUniforms.uniforms;

    const start = performance.now();
    app.ticker.add(() => {
        const now = performance.now();
        uniforms.uTime = (now - start) / 1000;
        uniforms.uResolution = [app.renderer.width, app.renderer.height];
    });
}

let zoom = 0.74;

export const initializeCamera = async () => {
    const keys: Record<string, boolean> = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false
    };

    window.addEventListener("keydown", (e) => {
        if (keys[e.key] !== undefined) {
            keys[e.key] = true;
        }
    });

    window.addEventListener("keyup", (e) => {
        if (keys[e.key] !== undefined) {
            keys[e.key] = false;
        }
    });

    app.ticker.add(() => {
        // двигаем камеру как раньше
        if (keys.ArrowUp) {
            cameraContainer.y += CAMERA_SPEED;
        }
        if (keys.ArrowDown) {
            cameraContainer.y -= CAMERA_SPEED;
        }
        if (keys.ArrowLeft) {
            cameraContainer.x += CAMERA_SPEED;
        }
        if (keys.ArrowRight) {
            cameraContainer.x -= CAMERA_SPEED;
        }

        // check camera movement via zoom
        clampCameraToWorld();
    });

    _worldZoom();
};

/* =================== PRIVATE =================== */

const getCameraLimits = () => {
    const minX = 250;
    const maxX = 300;

    const minY = 400;
    const maxY = 700;

    return { minX, maxX, minY, maxY };
};

const clampCameraToWorld = () => {
    const { minX, maxX, minY, maxY } = getCameraLimits();

    if (cameraContainer.x < minX) cameraContainer.x = minX;
    if (cameraContainer.x > maxX) cameraContainer.x = maxX;

    if (cameraContainer.y < minY) cameraContainer.y = minY;
    if (cameraContainer.y > maxY) cameraContainer.y = maxY;
};

const _worldZoom = () => {
    const minZoom = 0.74;
    const maxZoom = 10;
    const zoomSpeed = 0.0005;

    cameraContainer.scale.set(zoom);

    app.canvas.addEventListener("wheel", (event) => {
        if (wheelUsing) return;

        const worldPosBefore = cameraContainer.toLocal({
            x: event.clientX,
            y: event.clientY
        });

        if (event.ctrlKey) event.preventDefault();

        zoom -= event.deltaY * zoomSpeed;
        zoom = Math.max(minZoom, Math.min(maxZoom, zoom));

        cameraContainer.scale.set(zoom);

        const worldPosAfter = cameraContainer.toLocal({
            x: event.clientX,
            y: event.clientY
        });

        cameraContainer.x += (worldPosAfter.x - worldPosBefore.x) * cameraContainer.scale.x ;
        cameraContainer.y += (worldPosAfter.y - worldPosBefore.y) * cameraContainer.scale.y ;

        clampCameraToWorld();
    });
};


const _debugInfo = () => {
    text(`The Farm Game (v${VERSION})`, 10, 10, {
        fontSize: 22,
    })

    _fpsText()
}
export const _fpsText = () => {
    let lastUpdate = 0;
    const updateInterval = 150;

    const fpsText = text("FPS: -", 10, 40, {
        fontSize: 16
    })

    app.ticker.add(() => {
        lastUpdate += app.ticker.elapsedMS;

        if (lastUpdate > updateInterval) {
            fpsText.text = 'FPS: ' + app.ticker.FPS.toFixed(1);
            lastUpdate = 0;
        }
    });
}