import {DynamicObject} from "@/game/core/logic/dynamicObjects/base";
import {drawObjects} from "@/game/core/logic/grid/objects";
import {addGridDebugOverlayListener, drawSpriteGrid, loadGridJson} from "@/game/core/logic/grid/utils";
import {Container, Graphics, Sprite} from "pixi.js";

// ============= TYPES ================================

export enum CELL_STATUSES {
    EMPTY,
    STATIC,
    SELECTED,
    DYNAMIC
}

export interface ObjectPayload {
    atlas: string;
    textureKey: string;
    meta?: any
}

export interface GridCell {
    x: number;
    y: number;
    status: CELL_STATUSES;
    tile: Sprite | Graphics;
    payload?: ObjectPayload | {};
}

export interface Grid {
    [key: string]: GridCell;
}

export interface StaticObjectDef {
    type: CELL_STATUSES;
    atlas: string;
    textureKey: string;
    cells: { i: number; j: number }[];
    meta: object
}

// ============= CONST ================================

export const GRID: Grid = {};

export const TILE_W = 184;
export const TILE_H = 140;

export const ISOMETRIC_CAMERA_SCALE_Y = 0.5

export const gridContainer: Container<any> = new Container();
export const objectsContainer: Container<any> = new Container();
export const debugGridContainer: Container<any> = new Container();
export let SELECTED_CELL_GRAPHICS: Graphics


// ============= PUBLIC ================================

export const initializeGrid = async () => {
    const json = await loadGridJson('map-test')

    gridContainer.scale.y = ISOMETRIC_CAMERA_SCALE_Y
    // gridContainer.position.x -= 40
    // gridContainer.position.y += 40

    drawSpriteGrid(json.grid)
    drawObjects(json.objects)

    const diamond = new Graphics();

    diamond
        .moveTo(0, -TILE_H / 2)           // top
        .lineTo(TILE_W / 2, 0)            // right
        .lineTo(0, TILE_H / 2)            // bottom
        .lineTo(-TILE_W / 2, 0)            // left
        .closePath()
        .fill({color: 0x00ff00, alpha: 0.2})
        .stroke({ width: 6, color: 0x00ff00, alpha: 0.6 });

    diamond.position.set(0, 0);
    diamond.alpha = 0
    diamond._zIndex= 9999

    gridContainer.addChild(diamond)
    SELECTED_CELL_GRAPHICS = diamond

    addGridDebugOverlayListener(json.grid)
};