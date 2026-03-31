import {
    cameraContainer,
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    TMP_CELLS_SELECT_AREA_H,
    TMP_CELLS_SELECT_AREA_W
} from "@/game/core/global";
import {
    CELL_STATUSES,
    debugGridContainer, GRID,
    GridCell, gridContainer, ISOMETRIC_CAMERA_SCALE_Y, objectsContainer, SELECTED_CELL_GRAPHICS,
    TILE_H,
    TILE_W
} from "@/game/core/logic/grid/initialize";
import {Point2D} from "@/game/core/types";
import {error} from "@/game/core/utils/log";
import {getTexture} from "@/game/core/utils/resources";
import {Graphics, Polygon, Sprite, Texture} from "pixi.js";


// ======================================================
// ============= PUBLIC =================================
// ======================================================

/**
 * Updates cell statuses (selected, static, empty) and applies tinting.
 * If STATIC is assigned, places decoration object on the selected cells.
 *
 * @param {GridCell[]} cells - Array of affected grid cells.
 * @param {CELL_STATUSES} status - New cell status.
 */
export function setCells(
    cells: GridCell[],
    status: CELL_STATUSES,
): void {
    cells.forEach((cell) => {
        if (status === CELL_STATUSES.SELECTED && cell.status === CELL_STATUSES.STATIC) return;
        cell.tile.alpha = 1;
        if (status === CELL_STATUSES.SELECTED) {
            if(SELECTED_CELL_GRAPHICS) {
                SELECTED_CELL_GRAPHICS?.position.set(cell.tile.x, cell.tile.y)
                SELECTED_CELL_GRAPHICS.alpha = 1
            }

            // cell.tile.tint = 0xcaffca;

        }
        else {
            cell.tile.tint = 0xcaffca;
            if(SELECTED_CELL_GRAPHICS)
            SELECTED_CELL_GRAPHICS.alpha = 0
        }

        if (status !== CELL_STATUSES.SELECTED) {
            cell.status = status;
        }
    });
}

let showGridOverlay = null;

/**
 * Adds a keyboard listener to toggle debug grid display.
 *
 * @param {number[][]} map - Grid map for drawing debug overlay.
 */
export function addGridDebugOverlayListener(map: number[][]): void {
    window.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.key === "g") {
            showGridOverlay = !showGridOverlay;
            _drawDebugGrid(map);
        }
    });
}

/**
 * Calculates the geometric center (in screen coordinates)
 * of multiple grid cells.
 *
 * @param {{x:number, y:number}[]} points - Array of cell center coordinates.
 * @returns {{x:number, y:number} | null} The average center point.
 */
export function getSquareCellsCenter(points: Point2D[]): Point2D | null {
    const count = points.length;
    if (count === 0) return null;

    let sumX = 0;
    let sumY = 0;

    for (const p of points) {
        sumX += p.x;
        sumY += p.y;
    }

    return {x: sumX / count, y: sumY / count};
}

/**
 * Retrieves a grid cell by its integer row/column indices.
 *
 * @param {number} i - Row index.
 * @param {number} j - Column index.
 * @returns {GridCell} The grid cell.
 */
export function getCellById(i: number, j: number): GridCell {
    return GRID[`${i}x${j}`];
}

/**
 * Loads grid and objects JSON from /maps folder.
 * Attaches grid containers to the camera.
 *
 * @param {string} name - The JSON map filename without extension.
 * @returns {Promise<object>} Parsed JSON object containing grid and objects data.
 */
export const loadGridJson = async (name: string): Promise<object> => {
    cameraContainer.addChild(gridContainer);
    cameraContainer.addChild(objectsContainer);
    cameraContainer.addChild(debugGridContainer);

    const result = await fetch(`/maps/${name}.json`);
    const json = await result.json();

    if (!json.grid || !json.objects) {
        error("Grid loading error");
    }

    return json;
};

/**
 * Draws the isometric tile grid using sprites.
 * Initializes GRID cells and sets interaction handlers.
 *
 * @param {number[][]} map - 2D array representing tile layout.
 */
export function drawSpriteGrid(map: number[][]): void {
    _drawGridWrapper(map, (props) => {
        const {i, j, offsetX, offsetY} = props;

        const tileT: Texture = getTexture("tiles", `tile_${map[i][j]}`);

        const x = (i - j) * (TILE_W / 2) + offsetX;
        const y = (i + j) * (TILE_H / 2) + offsetY;

        const sprite = new Sprite(tileT);
        _drawTileSprite(sprite, x, y, TILE_W, TILE_H);
        const w = sprite.texture.width;
        const h = sprite.texture.height;

        sprite.hitArea = new Polygon([
            -w / 2,
            0,
            0,
            h / 2,
            w / 2,
            0,
            0,
            -h / 2,
        ]);

        sprite.eventMode = "static";
        sprite.cursor = "pointer";

        GRID[`${i}x${j}`] = {
            x,
            y,
            tile: sprite,
            status: CELL_STATUSES.EMPTY,
        };

        sprite.on("mouseover" as any, () => {
            const area = _getCellsArea(i, j, TMP_CELLS_SELECT_AREA_W, TMP_CELLS_SELECT_AREA_H);
            if (area) setCells(area, CELL_STATUSES.SELECTED);
        });

        sprite.on("mouseout" as any, () => {
            const area = _getCellsArea(i, j, TMP_CELLS_SELECT_AREA_W, TMP_CELLS_SELECT_AREA_H);
            if (area) setCells(area, CELL_STATUSES.EMPTY);
        });

        sprite.on("mousedown" as any, () => {
            const area = _getCellsArea(i, j, TMP_CELLS_SELECT_AREA_W, TMP_CELLS_SELECT_AREA_H);
            if (area) setCells(area, CELL_STATUSES.STATIC);
        });

        gridContainer.addChild(sprite);
        gridContainer.sortChildren();
    });
}

// ======================================================
// ============= PRIVATE ================================
// ======================================================


let _isDebugGridRendered: boolean = false
/**
 * Draws debug overlay grid (wireframe of tiles).
 * Appears only when showGridOverlay is enabled.
 *
 * @param {number[][]} map - 2D grid for determining tile positions.
 */
function _drawDebugGrid(map: number[][]): void {
    debugGridContainer.alpha = +showGridOverlay

    // only once render
    if(_isDebugGridRendered) return;
    _isDebugGridRendered = true

    debugGridContainer.removeChildren();

    _drawGridWrapper(map, (props) => {
        const {i, j, offsetX, offsetY} = props;
        const g = new Graphics();

        const x = (i - j) * (TILE_W / 2) + offsetX;
        const y = (i + j) * (TILE_H / 2) + offsetY;

        g.beginPath();
        g.moveTo(x, y - TILE_H / 2);
        g.lineTo(x + TILE_W / 2, y);
        g.lineTo(x, y + TILE_H / 2);
        g.lineTo(x - TILE_W / 2, y);
        g.closePath();
        g.stroke({width: 4, color: 0xff0000, alpha: 0.5});

        debugGridContainer.addChild(g);
        debugGridContainer.scale.y = ISOMETRIC_CAMERA_SCALE_Y
    });
}

/**
 * Prepares a tile sprite visually by setting its anchor, scale, and position.
 *
 * @param {Sprite} s - The sprite to configure.
 * @param {number} x - Screen X coordinate.
 * @param {number} y - Screen Y coordinate.
 * @param {number} w - Tile width.
 * @param {number} h - Tile height.
 */
function _drawTileSprite(
    s: Sprite,
    x: number,
    y: number,
    w: number,
    h: number
): void {
    s.anchor.set(0.5);
    s.scale.set(w / s.width + 0.02, h / s.height + 0.02);
    s.position.set(x, y);



    s._zIndex = s.y;
}

/**
 * Finds all grid cells inside a rectangular selection centered
 * on a specific grid coordinate.
 *
 * @param {number} iCenter - Center cell row.
 * @param {number} jCenter - Center cell column.
 * @param {number} w - Width in cells.
 * @param {number} h - Height in cells.
 * @returns {GridCell[] | false} Selected cells or false if blocked.
 */
function _getCellsArea(
    iCenter: number,
    jCenter: number,
    w: number,
    h: number
): GridCell[] | false {
    const cells: GridCell[] = [];

    const startI = iCenter - Math.floor(h / 2);
    const endI = startI + h - 1;

    const startJ = jCenter - Math.floor(w / 2);
    const endJ = startJ + w - 1;

    for (let i = startI; i <= endI; i++) {
        for (let j = startJ; j <= endJ; j++) {
            const cell = GRID[`${i}x${j}`];
            if (!cell || (cell.status !== CELL_STATUSES.EMPTY && cell.status !== CELL_STATUSES.SELECTED)) {
                return false;
            }
            cells.push(cell);
        }
    }
    return cells;
}

/**
 * Iterates through all positions in a grid map and calls iterFunc
 * passing useful computed coordinates.
 *
 * @param {number[][]} map - 2D grid layout.
 * @param {(props: {i:number, j:number, offsetX:number, offsetY:number}) => void} iterFunc
 *        Callback invoked for each cell.
 */
function _drawGridWrapper(
    map: number[][],
    iterFunc: (props: { i: number; j: number; offsetX: number; offsetY: number }) => void
): void {
    const rows = map.length;
    if (!rows) {
        error("Grid width 0");
        return;
    }

    const cols = map[0].length;
    const minX = (0 - (cols - 1)) * (TILE_W / 2);
    const maxX = (rows - 1) * (TILE_W / 2);
    const minY = 0;
    const maxY = ((rows - 1) + (cols - 1)) * (TILE_H / 2);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const offsetX = CANVAS_WIDTH / 2 - centerX;
    const offsetY = CANVAS_HEIGHT / 2 - centerY;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            iterFunc({
                i,
                j,
                offsetX,
                offsetY,
            });
        }
    }
}
