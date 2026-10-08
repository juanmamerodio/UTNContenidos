---
name: smooth-ae
description: "Motor de animaciones inmersivas 3D, estilo 'iOS 27', 'Android 17', 'Windows 12' (Minimalista, fluido, basado en físicas) similar a los motion frames de After Effects usando Framer Motion."
---

# Skill: Smooth AE (Animaciones 'iOS 27', 'Android 17', 'Windows 12' y Motion Graphics)

Esta skill define los principios innegociables para diseñar interfaces inmersivas en UTNContenidos, enfocadas en un look 3D 'iOS 27', 'Android 17', 'Windows 12' (Minimalista, fluido, basado en físicas) similar a los motion frames de After Effects.

## 1. Filosofía de Movimiento (Motion Graphics)
- **Cero Linealidad:** Nada se mueve a velocidad constante. Todo tiene aceleración y desaceleración.
- **Físicas sobre Tiempos (Springs):** Usamos "springs" (resortes) en lugar de duraciones rígidas (`duration: 0.3s`) para cualquier movimiento espacial (traslación, escala).
- **Animaciones 3D Sutiles:** Uso de `perspective`, `rotateX` y `rotateY` vinculados a gestos de arrastre o scroll para dar profundidad.
- **Performace Primero:** Solo animamos `transform` (x, y, scale, rotate) y `opacity`. Cero animaciones de `width`, `height` o `margin`.

## 2. Paleta de Curvas (Easings After Effects)
Traducción de las curvas clásicas de AE a `framer-motion`:

- **Smooth Expo (Ease Out extremo - F9 ajustado):**
  Ideal para fade-ins y revelaciones. Empieza súper rápido y aterriza suave.
  `ease: [0.16, 1, 0.3, 1]`

- **Spatial Spring (Físicas iOS):**
  Ideal para abrir modales, mover tarjetas, expandir elementos.
  `type: "spring", stiffness: 350, damping: 30, mass: 1`

- **Bouncy Spring (Feedback táctil):**
  Para botones y pequeños microinteracciones.
  `type: "spring", stiffness: 400, damping: 17`

## 3. Implementación: "El Stack 3D"
Para el caso particular de listas (como el Visor de Resultados) en móviles:

1. **Stagger Children:** Cada slide debe aparecer con un delay en cascada.
2. **Efecto Paralaje / 3D Deck:** A medida que se scrollea, los elementos en el fondo tienen un sutil `scale: 0.95` y bajan su opacidad.
3. **Hero Transitions (Shared Layout):** Cuando el usuario toca "Editar" en una tarjeta, no abrimos un modal genérico. Usamos `layoutId` de Framer Motion para que la tarjeta *se infle* hasta ocupar toda la pantalla, transformándose fluidamente en el editor.

## 4. Snippets Canónicos

### Animación de Entrada de Tarjeta (Stagger + 3D)
```tsx
const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9, rotateX: 15 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: { type: "spring", stiffness: 350, damping: 30 }
  }
};
```

### Microinteracción de Botón (Tap)
```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.95, rotateZ: -1 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
  Generar
</motion.button>
```

## 5. Reglas de Hardware
- **Reducción de Movimiento:** Respetar siempre `useReducedMotion` para accesibilidad. Si está activo, las transiciones complejas se vuelven simples fades.
- **Will-Change:** Aplicar `will-change: transform` a los contenedores pesados para forzar aceleración por GPU, pero removerlo post-animación.
