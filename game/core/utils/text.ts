import {DEFAULT_FONT_FAMILY, globalContainer} from "@/game/core/global";
import {Font} from "@/game/core/types";
import {Container, Text} from "pixi.js";

interface TextOptions {
    container?: Container<any>,
    fontFamily?: Font,
    fontSize?: number,
    fill?: string | number
}

const _text = (message: string, x: number, y: number, options: TextOptions): Text => {
    const {fontFamily, fontSize, fill} = options

    const txt = new Text({
        text: message,
        style: {
            fontFamily: fontFamily ?? DEFAULT_FONT_FAMILY,
            fontSize: fontSize ?? 32,
            fill: fill ?? 'white'
        }
    });

    txt.x = x;
    txt.y = y;

    return txt
}

export const text = (message: string, x: number, y: number, options: TextOptions) => {
    const {container} = options
    const txt = _text(message, x, y, options)

    if (container) container.addChild(txt)
    else globalContainer.addChild(txt)

    return txt
}

