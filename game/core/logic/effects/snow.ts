import {app} from "@/game/core/global";
import {
    Container, defaultFilterVert, Filter,
    GlProgram, Graphics,
} from "pixi.js";

export function drawBlizzard() {
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