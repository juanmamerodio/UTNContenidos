import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Design System v2 (S2) - Tokens & Accessibility & Responsive Invariants", () => {
  const cssPath = path.resolve(process.cwd(), "app/globals.css");
  const cssContent = fs.readFileSync(cssPath, "utf-8");

  it("garantiza tipografía base >= 17px para docentes 50+", () => {
    // Buscar la regla html font-size
    const htmlFontSizeMatch = cssContent.match(/html\s*{[^}]*font-size:\s*([^;]+);/s);
    expect(htmlFontSizeMatch).not.toBeNull();
    const fontSizeRule = htmlFontSizeMatch![1];
    
    // No debe arrancar en 15px (que a 360px daba 15.6px)
    expect(fontSizeRule).not.toContain("15px");
    // Debe arrancar como mínimo en 17px
    expect(fontSizeRule).toMatch(/17px|18px|1\.1rem|1\.125rem/);
  });

  it("define breakpoints responsivos mobile-first en globals.css (400px, 640px, 768px, 1024px)", () => {
    expect(cssContent).toMatch(/@media\s*\([^)]*400px/);
    expect(cssContent).toMatch(/@media\s*\([^)]*640px/);
    expect(cssContent).toMatch(/@media\s*\([^)]*768px/);
    expect(cssContent).toMatch(/@media\s*\([^)]*1024px/);
  });

  it("cumple contraste accesible WCAG AA (>= 4.5:1) en botones primarios", () => {
    // Función de luminancia relativa según WCAG 2.1
    function getLuminance(r: number, g: number, b: number): number {
      const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }

    function getContrast(hex1: string, hex2: string): number {
      const rgb1 = hexToRgb(hex1);
      const rgb2 = hexToRgb(hex2);
      const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
      const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    }

    function hexToRgb(hex: string) {
      const clean = hex.replace("#", "");
      return {
        r: parseInt(clean.substring(0, 2), 16),
        g: parseInt(clean.substring(2, 4), 16),
        b: parseInt(clean.substring(4, 6), 16),
      };
    }

    // Extraer tokens de color institucional oscuro usados en botones primarios
    const primaryDarkMatch = cssContent.match(/--utn-green-dark:\s*(#[0-9a-fA-F]{6});/);
    expect(primaryDarkMatch).not.toBeNull();
    const primaryDarkHex = primaryDarkMatch![1];

    // Texto blanco (#ffffff) sobre verde oscuro institucional
    const contrastDark = getContrast("#ffffff", primaryDarkHex);
    expect(contrastDark).toBeGreaterThanOrEqual(4.5);

    // Texto blanco (#ffffff) sobre verde primario institucional
    const primaryMatch = cssContent.match(/--utn-green-primary:\s*(#[0-9a-fA-F]{6});/);
    expect(primaryMatch).not.toBeNull();
    const primaryHex = primaryMatch![1];
    const contrastPrimary = getContrast("#ffffff", primaryHex);
    expect(contrastPrimary).toBeGreaterThanOrEqual(4.5);
  });

  it("no utiliza blur(120px) continuo no optimizado en el fondo ambiental", () => {
    expect(cssContent).not.toContain("filter: blur(120px)");
  });

  it("incluye clases para barra de navegación móvil o header colapsable sin overflow", () => {
    expect(cssContent).toMatch(/\.mobile-nav|\.bottom-nav|\.header-mobile/);
  });

  it("garantiza que MateriaCardPro y AppHeader hayan eliminado estilos inline no deseados", () => {
    const headerPath = path.resolve(process.cwd(), "components/layout/AppHeader.tsx");
    const headerContent = fs.readFileSync(headerPath, "utf-8");
    expect(headerContent).not.toContain("style={{");

    const materiaCardPath = path.resolve(process.cwd(), "components/dashboard/MateriaCardPro.tsx");
    const materiaCardContent = fs.readFileSync(materiaCardPath, "utf-8");
    expect(materiaCardContent).not.toContain("style={{");
  });
});
