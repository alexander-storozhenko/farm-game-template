// ui/components/UISelect.ts
import {UIButton} from "@/game/core/logic/ui/basicUI/Button";
import {UIContainer} from "@/game/core/logic/ui/basicUI/Container";
import {UIElement, UIElementOptions} from "@/game/core/logic/ui/basicUI/Element";
import {UIScrollArea} from "@/game/core/logic/ui/basicUI/ScrollArea";
import * as PIXI from 'pixi.js';

export interface UISelectOption {
    label: string;
    value: string | number;
}

export interface UISelectOptions extends UIElementOptions {
    options: UISelectOption[];
    placeholder?: string;
    onChange?: (value: UISelectOption) => void;
    dropdownHeight?: number;
}

export class UISelect extends UIElement<PIXI.Container> {
    private button: UIButton;
    private dropdownContainer: UIContainer;
    private scrollArea: UIScrollArea;
    private isOpen = false;
    private options: UISelectOption[];
    private onChange?: (value: UISelectOption) => void;
    private selected?: UISelectOption;
    private dropdownHeight: number;

    constructor(options: UISelectOptions) {
        const root = new PIXI.Container();
        super(root, options);

        this.options = options.options;
        this.onChange = options.onChange;
        this.dropdownHeight = options.dropdownHeight ?? 120;

        this.button = new UIButton({
            label: options.placeholder ?? 'Select...',
            width: options.width ?? 160,
            height: options.height ?? 32,
            onClick: () => this.toggleDropdown(),
        });

        this._width = this.button.width;
        this._height = this.button.height;

        this.root.addChild(this.button.root);

        this.dropdownContainer = new UIContainer({
            padding: 2,
            gap: 2,
            direction: 'column',
            x: 0,
            y: this._height,
        });

        for (const opt of this.options) {
            const itemButton = new UIButton({
                label: opt.label,
                width: this._width,
                height: this._height,
                onClick: () => this.selectOption(opt),
                backgroundColor: 0x222222,
                hoverColor: 0x444444,
            });
            this.dropdownContainer.addChild(itemButton);
        }

        this.scrollArea = new UIScrollArea({
            x: 0,
            y: this._height,
            width: this._width,
            height: this.dropdownHeight,
        });

        this.scrollArea.setContentDisplayObject(this.dropdownContainer.root);
        this.scrollArea.visible = false;

        this.root.addChild(this.scrollArea.root);
    }

    private toggleDropdown() {
        this.isOpen = !this.isOpen;
        this.scrollArea.visible = this.isOpen;
    }

    private selectOption(opt: UISelectOption) {
        this.selected = opt;
        this.button = this.button; // просто чтобы ясно: мы обновляем label
        this.button['label'].text = opt.label; // костыльный доступ, можно сделать геттер/сеттер
        this.toggleDropdown();
        if (this.onChange) this.onChange(opt);
    }

    get value(): UISelectOption | undefined {
        return this.selected;
    }

    protected override onResize(): void {
        // при желании можно пересчитать размеры dropdown
    }
}
