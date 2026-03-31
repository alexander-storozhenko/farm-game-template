// ui/components/UIScrollArea.ts
import {setWheelUsing} from "@/game/core/global";
import {UIElement, UIElementOptions} from "@/game/core/logic/ui/basicUI/Element";
import {
    Container,
    Graphics,
    Rectangle,
    FederatedWheelEvent,
    FederatedPointerEvent,
} from 'pixi.js';

export interface UIScrollAreaOptions extends UIElementOptions {
    content?: Container;    // необязательный готовый контейнер с контентом
    scrollSpeed?: number;   // шаг прокрутки в пикселях за один тик колеса
    scrollbarWidth?: number;
    minThumbHeight?: number;
}

export class UIScrollArea extends UIElement<Container> {
    public readonly viewport: Container;
    private maskGraphics: Graphics;

    private scrollSpeed: number;
    private contentHeight = 0;

    // scrollbar
    private track: Graphics;
    private thumb: Graphics;
    private scrollbarWidth: number;
    private minThumbHeight: number;
    private thumbHeight: number = 0;

    // drag state
    private isDraggingThumb = false;
    private dragStartGlobalY = 0;
    private dragStartThumbY = 0;

    constructor(options: UIScrollAreaOptions) {
        const root = new Container();
        super(root, options);

        // шаг скролла — пикселей за один тик колесика
        this.scrollSpeed = options.scrollSpeed ?? 20;
        this.scrollbarWidth = options.scrollbarWidth ?? 8;
        this.minThumbHeight = options.minThumbHeight ?? 20;

        // подстраховка, если width/height не задали снаружи
        if (!this._width) this._width = 100;
        if (!this._height) this._height = 100;

        this.viewport = options.content ?? new Container();
        this.maskGraphics = new Graphics();
        this.track = new Graphics();
        this.thumb = new Graphics();

        this.root.addChild(this.viewport);
        this.root.addChild(this.maskGraphics);
        this.root.addChild(this.track);
        this.root.addChild(this.thumb);

        // Pixi v8: система событий
        this.root.eventMode = 'static';
        this.root.cursor = 'default';

        // область, принимающая события (локальные координаты root)
        this.root.hitArea = new Rectangle(0, 0, this._width, this._height);

        // wheel-событие
        this.root.on('wheel', this.onWheel as any);

        // drag thumb
        this.thumb.eventMode = 'static';
        this.thumb.cursor = 'pointer';
        this.thumb.on('pointerdown', this.onThumbDown as any);

        // клик по треку
        this.track.eventMode = 'static';
        this.track.cursor = 'pointer';
        this.track.on('pointerdown', this.onTrackDown as any);

        this.applyMask();
        this.recalculateContentSize();
        this.clampScroll();
    }

    // ---------- Публичные методы ----------

    setContentDisplayObject(display: any /* DisplayObject */) {
        this.viewport.removeChildren();
        this.viewport.addChild(display);

        this.recalculateContentSize();
        this.clampScroll();
    }

    /**
     * Вызови recalculateContentSize(), если после setContentDisplayObject
     * ты добавляешь/удаляешь детей внутри viewport.
     */
    recalculateContentSize() {
        // простой способ: проходим по детям и берём максимальное "дно"
        let maxBottom = 0;

        for (const child of this.viewport.children) {
            const anyChild = child as any;
            const h: number =
                typeof anyChild.height === 'number' ? anyChild.height : 0;

            const bottom = child.y + h;
            if (bottom > maxBottom) {
                maxBottom = bottom;
            }
        }

        this.contentHeight = maxBottom;

        if (!Number.isFinite(this.contentHeight)) {
            this.contentHeight = 0;
        }
    }

    /**
     * direction: -1 (скролл вверх), 1 (скролл вниз)
     */
    scrollBy(direction: number) {
        this.viewport.y -= direction * this.scrollSpeed;
        this.clampScroll();
    }

    // ---------- Внутреннее: wheel ----------

    private _wheelUsingTimeout
    private onWheel = (event: FederatedWheelEvent) => {
        setWheelUsing(true)
        // делаем ступенчатый скролл: только знак, без учёта величины deltaY
        const direction = Math.sign(event.deltaY); // -1, 0, 1
        if (direction !== 0) {
            this.scrollBy(direction);
        }

        if (this._wheelUsingTimeout) {
            clearTimeout(this._wheelUsingTimeout)
        }

        this._wheelUsingTimeout = setTimeout(() => {
            setWheelUsing(false)
        }, 100)

        // чтобы не скроллилась страница под канвасом
        // event.preventDefault();
        event.stopPropagation();
    };

    // ---------- Внутреннее: drag thumb ----------

    private onThumbDown = (event: FederatedPointerEvent) => {
        this.isDraggingThumb = true;
        this.dragStartGlobalY = event.globalY;
        this.dragStartThumbY = this.thumb.y;

        this.root.on('pointermove', this.onThumbMove as any);
        this.root.on('pointerup', this.onThumbUp as any);
        this.root.on('pointerupoutside', this.onThumbUp as any);

        event.stopPropagation();
        event.preventDefault();
    };

    private onThumbMove = (event: FederatedPointerEvent) => {
        if (!this.isDraggingThumb) return;

        const delta = event.globalY - this.dragStartGlobalY;
        const trackTop = 0;
        const trackBottom = this._height - this.thumbHeight; // по y в локальных координатах root

        let newThumbY = this.dragStartThumbY + delta;
        if (newThumbY < trackTop) newThumbY = trackTop;
        if (newThumbY > trackBottom) newThumbY = trackBottom;

        this.thumb.y = newThumbY;

        const scrollRange = trackBottom - trackTop;
        const t = scrollRange > 0 ? (newThumbY - trackTop) / scrollRange : 0; // 0..1
        const contentRange = this.contentHeight - this._height;

        this.viewport.y = -t * contentRange;
        this.clampScroll(); // заодно обновит thumb через updateScrollbar

        event.stopPropagation();
        event.preventDefault();
    };

    private onThumbUp = (event: FederatedPointerEvent) => {
        this.isDraggingThumb = false;

        this.root.off('pointermove', this.onThumbMove as any);
        this.root.off('pointerup', this.onThumbUp as any);
        this.root.off('pointerupoutside', this.onThumbUp as any);

        event.stopPropagation();
        event.preventDefault();
    };

    // ---------- Внутреннее: click track ----------

    private onTrackDown = (event: FederatedPointerEvent) => {
        if (this.contentHeight <= this._height) return;

        const local = event.getLocalPosition(this.root);
        const trackTop = 0;
        const trackBottom = this._height - this.thumbHeight;

        let newThumbY = local.y - this.thumbHeight / 2;
        if (newThumbY < trackTop) newThumbY = trackTop;
        if (newThumbY > trackBottom) newThumbY = trackBottom;

        const scrollRange = trackBottom - trackTop;
        const t = scrollRange > 0 ? (newThumbY - trackTop) / scrollRange : 0;
        const contentRange = this.contentHeight - this._height;

        this.viewport.y = -t * contentRange;
        this.clampScroll();

        event.stopPropagation();
        event.preventDefault();
    };

    // ---------- Scroll bounds + scrollbar ----------

    private clampScroll() {
        // верхняя граница: контент "прилип" к верху окна
        const maxOffset = 0;

        // если контент ниже окна — скролла нет
        if (this.contentHeight <= this._height) {
            this.viewport.y = 0;
            this.updateScrollbar();
            return;
        }

        // нижняя граница: низ контента совпал с низом окна
        const minOffset = this._height - this.contentHeight; // отрицательное

        if (this.viewport.y > maxOffset) this.viewport.y = maxOffset;
        if (this.viewport.y < minOffset) this.viewport.y = minOffset;

        this.updateScrollbar();
    }

    private updateScrollbar() {
        // если контент не требует скролла — скроем полосу
        if (this.contentHeight <= this._height || this._height <= 0) {
            this.track.visible = false;
            this.thumb.visible = false;
            return;
        }

        this.track.visible = true;
        this.thumb.visible = true;

        // позиция трека справа
        this.track.clear();
        this.track.x = this._width - this.scrollbarWidth;
        this.track.y = 0;

        this.track.fill({color: 0x000000, alpha: 0.25});
        this.track.rect(0, 0, this.scrollbarWidth, this._height);
        this.track.endFill();

        // размер ползунка
        const ratio = this._height / this.contentHeight;
        this.thumbHeight = Math.max(this.minThumbHeight, this._height * ratio);

        const scrollRange = this._height - this.thumbHeight;
        const contentRange = this.contentHeight - this._height;

        // нормализуем позицию контента в 0..1
        const t = contentRange > 0 ? (-this.viewport.y) / contentRange : 0;
        const thumbY = scrollRange * t;

        this.thumb.clear();
        this.thumb.x = this._width - this.scrollbarWidth;
        this.thumb.y = thumbY;

        this.thumb.fill({color: 0xffffff, alpha: 0.7});
        this.thumb.roundRect(
            0,
            0,
            this.scrollbarWidth,
            this.thumbHeight,
            this.scrollbarWidth / 2
        );
        this.thumb.endFill();
    }

    private applyMask() {
        this.maskGraphics.clear();
        this.maskGraphics.fill(0x000000);
        this.maskGraphics.rect(0, 0, this._width, this._height);
        this.maskGraphics.endFill();

        this.viewport.mask = this.maskGraphics;
    }

    protected override onResize(): void {
        this.applyMask();
        this.root.hitArea = new Rectangle(0, 0, this._width, this._height);
        this.recalculateContentSize();
        this.clampScroll();
    }
}
