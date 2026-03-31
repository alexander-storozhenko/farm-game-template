import {ResourcesError} from "@/game/core/utils/errrors";
import {debug, info} from "@/game/core/utils/log";
import {Assets, Texture,} from "pixi.js";

let isBundlesLoaded = false

export const loadAssets = async () => {
    Assets.addBundle("game", {
        tiles: "/assets/tiles/tiles_frozen.json",
        objects: "/assets/environments/env-1.json",
        plants: "/assets/environments/plants-1.json",
        bg: "/assets/bg/bg.json",
        ui: "/assets/ui/ui.json",
    });

    await Assets.loadBundle("game", (progress) => {
        const percent = Math.round(progress * 100);
        debug("Resource loading:", percent + "%");
    });

    isBundlesLoaded = true
}


export const getTexture = (atlasName: string, key: string): Texture => {
    if (!isBundlesLoaded) throw new ResourcesError(`Can not get Texture "${atlasName}:${key}" (Resources is not loaded)`)

    const atlas = Assets.cache.get(atlasName)
    if (!atlas) throw new ResourcesError(`Can not get Texture "${atlasName}:${key}" (Atlas not exists)`)

    const {meta = {}} = atlas.data?.frames?.[key];

    const texture = atlas.textures?.[key];
    texture.meta = meta

    if (!texture) throw new ResourcesError(`Can not get Texture "${atlasName}:${key}" (Texture not exists)`)

    return texture
}


