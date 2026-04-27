# BLUE-014: Visual Architecture & Motion Primitives

## Overview
This blueprint defines the technical implementation of the "Visual Sovereignty" strategy. It maps the integration of `framer-motion` into the Next.js App Router and the structure of the new "Glass" component library.

## 1. Motion Architecture
### Global Provider (`MotionProvider`)
A client component wrapper around `{children}` in `layout.tsx` to enable `AnimatePresence`.

```tsx
// src/components/providers/MotionProvider.tsx
'use client'
import { AnimatePresence } from 'framer-motion';

export const MotionProvider = ({ children }) => (
    <AnimatePresence mode="wait">
        {children}
    </AnimatePresence>
);
```

### Page Transitions
Higher-Order Component (HOC) or Wrapper for pages to define entry/exit animations.

```tsx
// src/components/ui/PageTransition.tsx
<motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
>
    {children}
</motion.div>
```

## 2. Component Library Updates
We will refactor core UI components to support "Glass" and "Motion":

| Component | New Features | Tech |
| :--- | :--- | :--- |
| **Card** | `glass` variant, hover lift + glow effect. | Tailwind + CSS Modules |
| **Button** | `whileTap={{ scale: 0.95 }}` micro-interaction. | Framer Motion |
| **Sidebar** | Mobile: Slide-over Sheet (Drawer). Desktop: Collapsible Glass. | Radix UI Primitive + Framer |
| **StatCard** | `CountUp` animation for numeric values. | Custom Hook |

## 3. Responsive Breakpoints
| Breakpoint | Behavior | Navigation Mode |
| :--- | :--- | :--- |
| **< 640px (Mobile)** | Single Column, Stacked Cards. | Bottom Tab or Hamburger Sheet |
| **640px - 1024px (Tablet)** | 2-Column Grid. | Collapsed Sidebar (Icon Only) |
| **> 1024px (Desktop)** | Masonry / Dashboard Grid. | Full Expanded Sidebar |

## 4. Visual Tokens (Tailwind Extension)
```js
// tailwind.config.ts
extend: {
    backdropBlur: {
        'xs': '2px',
    },
    colors: {
        glass: {
            100: 'rgba(255, 255, 255, 0.1)',
            200: 'rgba(255, 255, 255, 0.2)',
        }
    },
    animation: {
        'pulse-glow': 'glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    }
}
```
