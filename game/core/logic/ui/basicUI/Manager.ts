// ui/core/UIManager.ts
import {UIContainer} from "@/game/core/logic/ui/basicUI/Container";
import {Container} from "pixi.js";
import * as PIXI from 'pixi.js';

export class UIManager {
    public readonly app: PIXI.Application;
    public readonly root: UIContainer;

    constructor(app: PIXI.Application, rootContainer: Container<any> ) {
        this.app = app;
        this.root = new UIContainer({ x: 0, y: 0, padding: 8, gap: 8, direction: 'column' });
        rootContainer.addChild(this.root.root);

        this.app.ticker.add((delta) => {
            this.root.update(delta);
        });
    }
}
