"use client"

import ResizeWrapper from "@/components/resize-wrapper";
import {initializeGrid} from "@/game/core/logic/grid/initialize";
import {initializeApp, initializeCamera} from "@/game/core/logic/initialize";
import {initializeUI} from "@/game/core/logic/ui/basicUI/initialize";

import {error, info} from "@/game/core/utils/log";
import {loadAssets} from "@/game/core/utils/resources";
import {cn} from "@/lib/utils";
import {useEffect, useState} from "react"

export function GameCanvas() {
    const [canvas, setCanvas] = useState<Element | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const initializeAll = async () => {
            setIsLoading(true)

                await initializeApp(setCanvas)
                info('Application initialized')

                await loadAssets()

                // await initializeUI()
                // info('UI initialized')

                await initializeGrid()
                info('Grid initialized')

                await initializeCamera()
                info('Camera initialized')

                setTimeout(() => {
                    setIsLoading(false)
                }, 1400)

        }

        initializeAll()

    }, [])

    return (
        <>
            {
                <div
                    className={cn("fixed z-99999 left-0 top-0 bg-[#1c1c1c] text-xl w-screen h-screen flex justify-center items-center text-white")}
                    style={{
                        transition: 'all 300ms ease',
                        opacity: !isLoading ? 0 : 100,
                        pointerEvents: 'none'
                    }}
                >
                    Loading...
                </div>
            }

            <ResizeWrapper canvas={canvas as HTMLCanvasElement}/>
        </>
    )
}
