import {Sprite} from "pixi.js";
import { v4 as uuidv4 } from "uuid";
export abstract class DynamicObject {
    protected readonly id: string
    protected readonly sprite: Sprite
    constructor(sprite: Sprite ) {
        this.id = uuidv4()
        this.sprite = sprite
    }

}