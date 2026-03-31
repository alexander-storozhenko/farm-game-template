import {UIElement, UIElementOptions} from "@/game/core/logic/ui/basicUI/Element";
import * as PIXI from 'pixi.js';

export interface UITextOptions extends UIElementOptions {
    text: string;
    style?: PIXI.TextStyle | PIXI.ITextStyle;
}

export class UIText extends UIElement<PIXI.Text> {
    constructor(options: UITextOptions) {
        const text = new PIXI.Text({text: options.text, style: options.style});
        super(text, options);

        if (!options.width) this._width = text.width;
        if (!options.height) this._height = text.height;
    }

    get text(): string {
        return this.root.text;
    }

    set text(v: string) {
        this.root.text = v;
        this._width = this.root.width;
        this._height = this.root.height;
    }
}
