import {app, globalContainer, setUiContainer, setUiManager, uiManager} from "@/game/core/global";
import {UIButton} from "@/game/core/logic/ui/basicUI/Button";
import {UIContainer} from "@/game/core/logic/ui/basicUI/Container";
import {UIManager} from "@/game/core/logic/ui/basicUI/Manager";
import {UIModal} from "@/game/core/logic/ui/basicUI/Modal";
import {UIScrollArea} from "@/game/core/logic/ui/basicUI/ScrollArea";
import {UISelect} from "@/game/core/logic/ui/basicUI/Select";
import {UIText} from "@/game/core/logic/ui/basicUI/Text";
import {Container} from "pixi.js";

export const initializeUI = () => {
    const globalUIContainer = new Container()
    const manager = new UIManager(app, globalUIContainer);

    globalContainer.addChild(globalUIContainer)

    globalUIContainer.interactive = true
    globalUIContainer._zIndex = 9999

    setUiContainer(globalUIContainer)
    setUiManager(manager)

    _debugUi()
}

function _debugUi() {
    const title = new UIText({
        text: 'Demo UI Engine (Pixi + TS)',
        style: { fill: 0xffffff, fontSize: 24 },
    });

    const button = new UIButton({
        label: 'Click me',
        onClick: () => {
            console.log('Button clicked!');
            title.text = 'Button clicked!';
        },
        width: 200,
        height: 40,
    });

    const select = new UISelect({
        width: 200,
        height: 32,
        placeholder: 'Choose option',
        options: [
            { label: 'Option 1', value: 1 },
            { label: 'Option 2', value: 2 },
            { label: 'Option 3', value: 3 },
            { label: 'Option 4', value: 4 },
            { label: 'Option 5', value: 5 },
        ],
        onChange: (opt) => {
            console.log('Selected:', opt);
        },
    });

    // пример большой области, которую скроллим
    const listContainer = new UIContainer({
        direction: 'column',
        padding: 4,
        gap: 4,
    });

    for (let i = 0; i < 20; i++) {
        const item =new UIButton({
            label: `Click me ${i}`,
            onClick: () => {
                console.log(`Button ${i} clicked!`);
                title.text = 'Button clicked!';
            },
            width: 100,
            height: 40,
        });
        listContainer.addChild(item);
    }

    const scrollArea = new UIScrollArea({
        width: 110,
        height: 350,
        scrollSpeed: 20
    });
    scrollArea.setContentDisplayObject(listContainer.root);


    const uiModal = new UIModal({
        title: 'Инвентарь'
    })

    uiManager.root.addChild(title);
    uiManager.root.addChild(button);
    uiManager.root.addChild(select);
    uiManager.root.addChild(scrollArea);
    uiManager.root.addChild(uiModal);

    // Лёгкий manual layout
    title.x = 20;
    title.y = 20;

    button.x = 20;
    button.y = 70;

    select.x = 20;
    select.y = 120;

    scrollArea.x = 20;
    scrollArea.y = 170;

    uiModal.x = app.renderer.width / 2;
    uiModal.y = app.renderer.height / 2;


}