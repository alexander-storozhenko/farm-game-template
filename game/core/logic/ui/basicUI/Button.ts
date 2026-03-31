// ui/components/UIButton.ts
import {UIElement, UIElementOptions} from "@/game/core/logic/ui/basicUI/Element";
import {UIText} from "@/game/core/logic/ui/basicUI/Text";
import {getTexture} from "@/game/core/utils/resources";
import {Sprite} from "pixi.js";
import * as PIXI from 'pixi.js';

export interface UIButtonOptions extends UIElementOptions {
    label: string;
    onClick?: () => void;
    backgroundColor?: number;
    hoverColor?: number;
    pressedColor?: number;
    textStyle?: PIXI.ITextStyle;
    paddingX?: number;
    paddingY?: number;
}

export class UIButton extends UIElement<PIXI.Container> {
    private bg: Sprite;
    private label: UIText;
    private onClick?: () => void;

    private bgColor: number;
    private hoverColor: number;
    private pressedColor: number;
    private paddingX: number;
    private paddingY: number;

    private _isDown = false;
    private _isOver = false;

    constructor(options: UIButtonOptions) {
        const root = new PIXI.Container();
        super(root, options);

        this.bgColor = options.backgroundColor ?? 0xffffff;
        this.hoverColor = options.hoverColor ?? 0xfafafa;
        this.pressedColor = options.pressedColor ?? 0xfafafa;
        this.paddingX = options.paddingX ?? 12;
        this.paddingY = options.paddingY ?? 8;
        this.onClick = options.onClick;

        const bgTexture = getTexture('ui', 'ui_1');
        this.bg = new Sprite(bgTexture);
        this.bg.tint = this.bgColor;
        this.root.addChild(this.bg);

        this.label = new UIText({
            text: options.label,
            style: options.textStyle ?? {
                fill: 0xffffff,
                fontSize: 16,
            },
        });
        this.root.addChild(this.label.root);

        this.root.interactive = true;
        this.root.buttonMode = true;

        this.root.on('pointerdown', this.handleDown);
        this.root.on('pointerup', this.handleUp);
        this.root.on('pointerupoutside', this.handleUpOutside);
        this.root.on('pointerover', this.handleOver);
        this.root.on('pointerout', this.handleOut);

        this.resizeToFit();
    }

    private resizeToFit() {
        const w = (this.label.width || 0) + this.paddingX * 2;
        const h = (this.label.height || 0) + this.paddingY * 2;

        this._width = w;
        this._height = h;

        // масштабируем спрайт под размер кнопки
        this.bg.width = w;
        this.bg.height = h;

        this.label.x = (w - this.label.width) / 2;
        this.label.y = (h - this.label.height) / 2;
    }

    private drawBackground(color?: number) {
        if(!color) return
        this.bg.tint = color ?? this.bgColor;
    }

    private handleDown = () => {
        this._isDown = true;
        this.drawBackground(this.pressedColor);
    };

    private handleUp = () => {
        if (this._isDown && this.onClick) this.onClick();
        this._isDown = false;
        this.drawBackground(this._isOver ? this.hoverColor : this.bgColor);
    };

    private handleUpOutside = () => {
        this._isDown = false;
        this.drawBackground(this._isOver ? this.hoverColor : this.bgColor);
    };

    private handleOver = () => {
        this._isOver = true;
        if (!this._isDown) this.drawBackground(this.hoverColor);
    };

    private handleOut = () => {
        this._isOver = false;
        this.drawBackground(this.bgColor);
    };

    protected override onResize(): void {
        this.resizeToFit();
    }
}
