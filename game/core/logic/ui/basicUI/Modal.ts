// ui/components/UIModal.ts
import {app} from "@/game/core/global";
import {UIButton} from "@/game/core/logic/ui/basicUI/Button";
import {UIElement, UIElementOptions} from "@/game/core/logic/ui/basicUI/Element";
import {UIText} from "@/game/core/logic/ui/basicUI/Text";
import {getTexture} from "@/game/core/utils/resources";
import {Sprite, Container} from "pixi.js";

export interface UIModalOptions extends UIElementOptions {
    title?: string;
    content?: string;
    width?: number;
    height?: number;
    backgroundColor?: number;
    titleStyle?;
    contentStyle?;
    onClose?: () => void;
}

export class UIModal extends UIElement<Container> {
    private bg: Sprite;
    private titleText?: UIText;
    private contentText?: UIText;
    private closeButton?: Sprite;

    private width: number;
    private height: number;
    private backgroundColor: number;
    private onClose?: () => void;

    constructor(options: UIModalOptions) {
        const root = new Container();
        super(root, options);

        this.width = options.width ?? 700;
        this.height = options.height ?? 500;
        this.backgroundColor = options.backgroundColor ?? 0xffffff;
        this.onClose = options.onClose;

        const bgTexture = getTexture('ui', 'ui_11');
        this.bg = new Sprite(bgTexture);
        this.bg.tint = this.backgroundColor;
        this.bg.width = this.width;
        this.bg.height = this.height;
        this.bg.anchor.set(0.5);
        this.bg.scale.set(this.width / this.bg.width * .5, this.height / this.bg.height * .5)
        root.addChild(this.bg);


        if (options.title) {
            this.titleText = new UIText({
                text: options.title,
                style: {
                    fill: 0xffffff,
                    fontSize: 22,
                    fontWeight: 'bold',
                    ...(options.titleStyle ?? {})
                }
            });
            this.titleText.root.anchor.set(0.5, 0);
            this.titleText.root.x = 0;
            this.titleText.root.y = -this.height / 2 + 20;
            root.addChild(this.titleText.root);
        }

        if (options.content) {
            this.contentText = new UIText({
                text: options.content,
                style: {
                    fill: 0xffffff,
                    fontSize: 16,
                    wordWrap: true,
                    wordWrapWidth: this.width - 40,
                    ...(options.contentStyle ?? {})
                }
            });
            this.contentText.root.anchor.set(0.5, 0);
            this.contentText.root.x = 0;
            this.contentText.root.y = -this.height / 2 + 60;
            root.addChild(this.contentText.root);
        }

        // Кнопка закрытия
        const closeButton = new UIButton({
            label: '✕',
            onClick: this.close,
            width: 40,
            height: 60,
        });
        closeButton.x = this.width/2;
        closeButton.y = -this.height/2 - 30;


        // this.closeButton.anchor.set(0.5);
        // this.closeButton.scale.set(.1, .1);
        //
        // this.closeButton.interactive = true;
        // this.closeButton.buttonMode = true;
        // this.closeButton.
        root.addChild(closeButton.root);
    }

    private close = () => {
        if (this.onClose) this.onClose();
        this.root.parent?.removeChild(this.root);
    };

    protected override onResize(): void {
        this.bg.width = this.width;
        this.bg.height = this.height;

        if (this.titleText) {
            this.titleText.root.y = -this.height / 2 + 20;
        }

        if (this.contentText) {
            this.contentText.root.y = -this.height / 2 + 60;
        }

        if (this.closeButton) {
            this.closeButton.x = this.width / 2 - 20 - this.width / 2;
            this.closeButton.y = -this.height / 2 + 20;
        }
    }
}
