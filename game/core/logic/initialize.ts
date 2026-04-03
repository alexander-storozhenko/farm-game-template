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
    Container,
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

    _debugInfo();

};

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