# Farm Game Template

Шаблон изометрической фермерской игры на базе **Next.js** + **Pixi.js**.

## Стек

| Слой | Технология |
|------|-----------|
| Фреймворк | Next.js 16, React 19 |
| Рендеринг | Pixi.js v8 (WebGL / WebGPU) |
| Анимации | GSAP + PixiPlugin |
| Шейдеры | GLSL (фильтры Pixi.js) |
| UI компоненты (React) | shadcn/ui, Radix UI, Tailwind CSS v4 |
| Язык | TypeScript |

## Структура проекта

```
farm-game-template/
├── app/                        # Next.js App Router
├── components/
│   ├── game-canvas.tsx         # Точка монтирования Pixi-канваса
│   └── resize-wrapper.tsx
├── game/
│   └── core/
│       ├── global.ts           # Глобальное состояние (app, контейнеры, константы)
│       ├── types.ts
│       ├── assets/
│       │   └── assets-loader.ts
│       ├── logic/
│       │   ├── initialize.ts   # Инициализация Pixi-приложения и камеры
│       │   ├── grid/
│       │   │   ├── initialize.ts  # Сетка, типы ячеек, загрузка карты
│       │   │   ├── objects.ts     # Размещение объектов на сетке
│       │   │   └── utils.ts       # Утилиты сетки: setCells, drawSpriteGrid и др.
│       │   ├── dynamicObjects/
│       │   │   ├── base.ts        # Базовый класс DynamicObject
│       │   │   └── Tree.ts        # Пример: дерево с hover-анимацией
│       │   └── ui/basicUI/        # UI-система поверх Pixi.js
│       └── utils/              # text, time, resources, log
└── public/
    ├── assets/                 # Спрайты и атласы (tiles, environments, ui, bg)
    └── maps/                   # JSON-карты (map-test.json)
```

## Быстрый старт

```bash
# Установка зависимостей
npm install
# или
pnpm install

# Режим разработки
npm run dev

# Сборка
npm run build

# Запуск production-сервера
npm start
```

Откройте [http://localhost:3000](http://localhost:3000).

## Основные возможности

### Изометрическая сетка
- Тайловая сетка загружается из JSON-файла в `/public/maps/`.
- Каждая ячейка имеет статус: `EMPTY`, `STATIC`, `SELECTED`, `DYNAMIC`.
- При наведении подсвечивается область выбора (настраивается через `TMP_CELLS_SELECT_AREA_W/H`).
- Нажатие фиксирует ячейку как `STATIC`.

### Камера
- Перемещение — стрелками на клавиатуре.
- Зум — колёсико мыши (масштаб привязан к позиции курсора).
- Диапазон масштаба: `0.74 – 10`.

### Динамические объекты
Класс `DynamicObject` — базовый для игровых объектов на сетке. Пример `Tree` демонстрирует hover-анимацию через GSAP.

### Шейдер снега
Многослойный процедурный GLSL-шейдер снегопада применяется как Pixi-фильтр поверх всей сцены.

### UI-система
Набор классов (`UIManager`, `UIContainer`, `Button`, `Modal`, `ScrollArea`, `Select`, `Text`) для построения игрового интерфейса средствами Pixi.js.

### Отладка
- Клавиша `G` — переключение wireframe-оверлея сетки.
- В левом верхнем углу отображаются версия игры и FPS.

## Добавление новой карты

1. Создайте файл `/public/maps/my-map.json` по образцу `map-test.json`.
2. В `game/core/logic/grid/initialize.ts` замените `'map-test'` на `'my-map'`.

## Добавление нового объекта

1. Создайте класс, наследующий `DynamicObject` в `game/core/logic/dynamicObjects/`.
2. Зарегистрируйте его в `game/core/logic/grid/objects.ts`.
3. Добавьте запись объекта в JSON-карту.