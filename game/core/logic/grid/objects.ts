import {cameraContainer, globalContainer} from "@/game/core/global";
import {Tree} from "@/game/core/logic/dynamicObjects/Tree";
import {
    CELL_STATUSES,
    GridCell,
    gridContainer, ISOMETRIC_CAMERA_SCALE_Y,
    ObjectPayload, objectsContainer,
    StaticObjectDef
} from "@/game/core/logic/grid/initialize";
import {getCellById, getSquareCellsCenter, setCells} from "@/game/core/logic/grid/utils";
import {getTexture} from "@/game/core/utils/resources";
import {Sprite, Texture} from "pixi.js";


const OBJECT_TYPES = {
    'tree_1': Tree,
    'plant_1': Tree,
}

// ======================================================
// =================== PUBLIC ===========================
// ======================================================

/**
 * Draws static objects (decorations/buildings) defined in the objects map.
 *
 * @param {StaticObjectDef[]} map - Array of object definitions.
 */
export function drawObjects(map: StaticObjectDef[]): void {

    // TODO move bg =======================
    const bg = getTexture('bg', 'bg_0')
    const bgS = new Sprite(bg)
    // bgS.anchor.set(0.5, 1)
    bgS.position.x = -400 + 40
    bgS.position.y = -1010 - 40
    bgS.scale.set(0.5, 0.5)
    bgS._zIndex = -1
    cameraContainer.addChild(bgS)


    map.forEach((o) => {
        const cellsBuffer: GridCell[] = [];
        o.cells.forEach((c) => cellsBuffer.push(getCellById(c.i, c.j)));

        setCells(cellsBuffer, o.type);

        const payload: ObjectPayload = {
            atlas: o.atlas,
            textureKey: o.textureKey,
            meta: o.meta
        }

        if (o.type === CELL_STATUSES.DYNAMIC) {
            _createCellDynamicObject(cellsBuffer, payload)
        }
        if (o.type === CELL_STATUSES.STATIC) {
            _createCellStaticObject(cellsBuffer, payload);
        }
    });
}

// ======================================================
// =================== PRIVATE ==========================
// ======================================================

function _createCellDynamicObject(cells: GridCell[], payload) {
    const sprite = _preloadObject(cells, payload)

    new OBJECT_TYPES[payload.meta.type](sprite)
}

/**
 * Spawns a decoration/static object centered over multiple grid cells.
 *
 * @param {GridCell[]} cells - Cells used to determine object placement.
 * @param {ObjectPayload[]} payload - Object payload for initializing new instance of Dynamic object.
 */
function _createCellStaticObject(cells: GridCell[], payload: ObjectPayload): void {
    _preloadObject(cells, payload)
}

function _preloadObject(cells: GridCell[], payload: ObjectPayload): Sprite {
    const centerPoint = getSquareCellsCenter(
        cells.map((cell) => ({x: cell.x, y: cell.y}))
    );

    if (!centerPoint) return;

    const {atlas, textureKey} = payload
    const texture: Texture = getTexture(atlas, textureKey);


    const {meta} = texture
    const {anchor = 0.5, scale = 1, offset = {x: 0, y: 0}} = meta

    const sprite = new Sprite(texture);


    const anchorX = Array.isArray(anchor) ? anchor[0] : anchor
    const anchorY = Array.isArray(anchor) ? anchor[1] : anchor

    const scaleX = Array.isArray(scale) ? scale[0] : scale
    const scaleY = Array.isArray(scale) ? scale[1] : scale

    sprite.anchor.set(anchorX, anchorY);

    sprite.position.set(centerPoint.x + offset.x, centerPoint.y * ISOMETRIC_CAMERA_SCALE_Y + offset.y);
    sprite.scale.set(scaleX, scaleY);

    sprite._zIndex = sprite.y;

    objectsContainer.addChild(sprite)

    return sprite
}

