import {UIElement, UIElementOptions} from "@/game/core/logic/ui/basicUI/Element";
import * as PIXI from 'pixi.js';

export type LayoutDirection = 'row' | 'column';

export interface UIContainerOptions extends UIElementOptions {
    padding?: number;
    gap?: number;
    direction?: LayoutDirection;
}

export class UIContainer extends UIElement<PIXI.Container> {
    private padding: number;
    private gap: number;
    private direction: LayoutDirection;

    constructor(options: UIContainerOptions = {}) {
        super(new PIXI.Container(), options);

        this.padding = options.padding ?? 0;
        this.gap = options.gap ?? 4;
        this.direction = options.direction ?? 'column';
    }

    protected layoutChildren() {
        let offset = this.padding;

        for (const child of this.children) {
            if (this.direction === 'column') {
                child.x = this.padding;
                child.y = offset;
                offset += (child.height || 0) + this.gap;
            } else {
                child.x = offset;
                child.y = this.padding;
                offset += (child.width || 0) + this.gap;
            }
        }
    }

    protected override onChildrenChanged(): void {
        this.layoutChildren();
    }

    protected override onResize(): void {
        this.layoutChildren();
    }
}