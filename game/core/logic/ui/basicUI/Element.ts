// ui/core/UIElement.ts
import * as PIXI from 'pixi.js';

export interface UIElementOptions {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    visible?: boolean;
}

export abstract class UIElement<T extends PIXI.Container = PIXI.Container> {
    public readonly root: T;
    protected _width: number;
    protected _height: number;
    protected _children: UIElement[] = [];

    constructor(root: T, options: UIElementOptions = {}) {
        this.root = root;

        this._width = options.width ?? 0;
        this._height = options.height ?? 0;

        this.root.x = options.x ?? 0;
        this.root.y = options.y ?? 0;
        this.root.visible = options.visible ?? true;
    }

    get x() { return this.root.x; }
    set x(v: number) { this.root.x = v; }

    get y() { return this.root.y; }
    set y(v: number) { this.root.y = v; }

    get width() { return this._width; }
    set width(v: number) {
        this._width = v;
        this.onResize();
    }

    get height() { return this._height; }
    set height(v: number) {
        this._height = v;
        this.onResize();
    }

    get visible() { return this.root.visible; }
    set visible(v: boolean) { this.root.visible = v; }

    addChild(child: UIElement) {
        this._children.push(child);
        this.root.addChild(child.root);
        this.onChildrenChanged();
    }

    removeChild(child: UIElement) {
        const idx = this._children.indexOf(child);
        if (idx >= 0) {
            this._children.splice(idx, 1);
            this.root.removeChild(child.root);
            this.onChildrenChanged();
        }
    }

    get children(): readonly UIElement[] {
        return this._children;
    }

    /** Хук для пересчёта layout при изменении размера */
    protected onResize() {}

    /** Хук при изменении списка children */
    protected onChildrenChanged() {}

    /** Вызывай это каждый кадр при необходимости */
    update(delta: number) {
        for (const c of this._children) {
            c.update(delta);
        }
    }
}
