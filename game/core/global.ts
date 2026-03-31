import {UIManager} from "@/game/core/logic/ui/basicUI/Manager";
import {Application, Assets, Container} from "pixi.js";
import packageJson from '../../package.json';

export const VERSION = packageJson.version

export let app: Application

// mul 2 because of resolution x2
export const CANVAS_WIDTH = 1700
export const CANVAS_HEIGHT = 900

export const CAMERA_SPEED = 25
export const DEFAULT_FONT_FAMILY  = 'Ubuntu'

export const TMP_CELLS_SELECT_AREA_W = 1
export const TMP_CELLS_SELECT_AREA_H = 1

export const setApp = (_app: Application) => app = _app

export let globalContainer: Container<any>
export const setGlobalContainer = (_container: Container<any>  ) => globalContainer = _container

export let cameraContainer: Container<any>
export const setCameraContainer = (_container: Container<any>  ) => cameraContainer = _container

export let uiContainer: Container<any>
export const setUiContainer = (_container: Container<any>  ) => uiContainer = _container

export let uiManager: UIManager
export const setUiManager = (_manager: UIManager ) => uiManager = _manager

export let wheelUsing = false

export const setWheelUsing = (_using: boolean ) => wheelUsing = _using