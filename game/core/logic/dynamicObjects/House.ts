import {DynamicObject} from "@/game/core/logic/dynamicObjects/base";
import {Sprite} from "pixi.js";
import { gsap } from "gsap";

export class House extends DynamicObject {
    constructor(sprite: Sprite) {
        super(sprite);
        this.initialize()
    }

    private initialize() {
        this.sprite.eventMode = "static";
        this.sprite.cursor = "pointer";
        const initialScale = this.sprite.scale.x

        this.sprite.on("mouseover" as any, () => {
            gsap.to(this.sprite, { pixi: { scale:  initialScale + .02 }, duration: 0.2 });
        });

        this.sprite.on("mouseout" as any, () => {
            gsap.to(this.sprite, { pixi: { scale: initialScale }, duration: 0.2 });
        });

        this.sprite.on("mousedown" as any, () => {
            alert("CLICK ON HOUSE")
        });
    }
}