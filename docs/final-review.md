# Final Review Checklist

Цей файл містить 2 ключові блоки:
1. **Чекліст фінального рев’ю** – щоб пройтись по всіх стилях перед завершенням робіт.
2. **Довідник змінних** – швидкий доступ до всіх токенів (кольори, шрифти, тіні, анімації).

---

## 1. Чекліст фінального рев’ю

### **Кольори**
- [ ] Перевірити всі `background`, `border`, `text` кольори (#HEX / rgba) → замінити на змінні `$color-*` або додати нові.
- [ ] Перевірити градієнти (tooltip, navbar, кнопки) → винести в змінні.

### **Шрифти**
- [ ] Замінити всі кастомні `font-family` на `$font-base` або `$font-secondary`.
- [ ] Уніфікувати розміри шрифтів (створити змінні для заголовків і body).

### **Розміри**
- [ ] Перевірити `border-radius` → замінити на `$radius-*`.
- [ ] Винести повторювані `padding/margin` у `$spacing-*`.

### **Тіні / blur**
- [ ] Замінити всі тіні на `$shadow-*` або додати нові.
- [ ] Перевірити `backdrop-filter: blur()` → замінити на `$blur-*`.

### **Liquid Glass**
- [ ] Уніфікувати всі елементи зі скляним ефектом (navbar, кнопки, тултіпи) через `$liquid-*`.

### **Анімації**
- [ ] Замінити всі `transition`/`animation` на `$transition-*` або `$animation-*`.
- [ ] Використовувати готові keyframes (fade, scale, slide).

### **Кнопки**
- [ ] Переконатися, що всі кнопки використовують `.btn-primary`, `.btn-secondary`, `.btn-success`.
- [ ] Додати класи для нових типів кнопок (outline, danger), якщо з’являться.

### **Компоненти**
- [ ] Tooltip, модалки, форми → замінити стилі на змінні (кольори, тіні, анімації).
- [ ] Portfolio cards, navbar, футер → перевірити консистентність стилів.

---

## 2. Довідник змінних

### **Кольори**
- `$color-primary: #4f46e5;`
- `$color-secondary: #f97316;`
- `$text-black: #333333;`
- `$color-white: #ffffff;`
- `$color-success: #16a34a;`
- `$color-danger: #dc2626;`
- `$color-warning: #facc15;`
- `$color-light: #f5f5f5;`
- `$color-dark: #1f1f1f;`

### **Шрифти**
- `$font-base: 'Lexend', sans-serif;`
- `$font-secondary: 'Playfair-Display', serif;`

### **Border-radius**
- `$radius-sm: 6px;`
- `$radius-md: 10px;`
- `$radius-lg: 20px;`
- `$radius-full: 9999px;`

### **Blur**
- `$blur-glass: 8px;`
- `$blur-heavy: 16px;`

### **Тіні**
- `$shadow-glass: inset 0 1px 2px rgba(255,255,255,0.1), 0 4px 10px rgba(0,0,0,0.15);`
- `$shadow-glass-hover: inset 0 2px 4px rgba(255,255,255,0.15), 0 6px 16px rgba(0,0,0,0.2);`
- `$shadow-deep: 0 8px 24px rgba(0,0,0,0.25);`
- `$shadow-light: 0 2px 6px rgba(0,0,0,0.1);`

### **Градієнти**
- `$gradient-soft: linear-gradient(to bottom right, #fbe6e6, #e6f1ff, #fef9e7);`
- `$gradient-dark: linear-gradient(to bottom right, #333333, #1f1f1f);`

### **Liquid Glass**
- `$liquid-bg: rgba(255, 255, 255, 0.08);`
- `$liquid-border: rgba(255, 255, 255, 0.25);`
- `$liquid-hover-bg: rgba(255, 255, 255, 0.15);`
- `$liquid-hover-border: rgba(255, 255, 255, 0.4);`

### **Транзішени**
- `$transition-fast: 0.2s ease;`
- `$transition-base: 0.3s ease;`
- `$transition-slow: 0.5s ease;`

### **Анімації**
- **Keyframes**: fade-in, fade-out, scale-in, scale-out, slide-up, slide-down.  
- **Швидкості:**  
  - `$animation-fast: 0.2s ease forwards;`
  - `$animation-base: 0.3s ease forwards;`
  - `$animation-slow: 0.5s ease forwards;`

---

> **Нотатка:** Якщо під час розробки зʼявляться нові унікальні значення (кольори, розміри, тіні тощо) → обов’язково додати їх у цей список і в `tailwind.config.js`.