import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/game/core/global";
import React, { useEffect, useRef } from "react";

const ResizeWrapper = ({ canvas }: { canvas: HTMLCanvasElement }) => {
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!canvas) return;

        const handleResize = () => {
            if (!wrapperRef.current) return;

            const dpr = window.devicePixelRatio || 1;
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            const scaleX = windowWidth / CANVAS_WIDTH;
            const scaleY = windowHeight / CANVAS_HEIGHT;
            const newScale = Math.min(scaleX, scaleY, 1);

            canvas.width = CANVAS_WIDTH * dpr;
            canvas.height = CANVAS_HEIGHT * dpr;

            canvas.style.width = CANVAS_WIDTH + "px";
            canvas.style.height = CANVAS_HEIGHT + "px";

            canvas.style.transform = `scale(${newScale})`;
            canvas.style.transformOrigin = "center";

            canvas.style.imageRendering = "pixelated";
            canvas.style.borderRadius = "10px";
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [canvas]);

    return (
        <div
            ref={wrapperRef as React.Ref<any>}
            id="game"
            className="flex items-center justify-center overflow-hidden"
            style={{ width: "100vw", height: "100vh" }}
        >
        </div>
    );
};

export default ResizeWrapper;
