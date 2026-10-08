import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Mobile-First UX Refactor (M1 - M4)", () => {
  const cssPath = path.resolve(process.cwd(), "app/globals.css");
  const cssContent = fs.readFileSync(cssPath, "utf-8");

  describe("M1 — Dashboard & Tarjetas 3D", () => {
    it("MateriaCardPro tiene físicas spring en hover y tap sin estilos inline", () => {
      const cardPath = path.resolve(process.cwd(), "components/dashboard/MateriaCardPro.tsx");
      const cardContent = fs.readFileSync(cardPath, "utf-8");
      expect(cardContent).not.toContain("style={{");
      expect(cardContent).toContain("whileTap");
      expect(cardContent).toMatch(/stiffness:\s*(350|400)/);
    });

    it("globals.css fuerza grid de 1 columna para el dashboard en pantallas móviles (< 768px)", () => {
      expect(cssContent).toMatch(/@media[^{]*max-width:\s*767px[^{]*\{[\s\S]*?\.dash-materias\s*\{[^}]*grid-template-columns:\s*1fr/);
    });
  });

  describe("M2 — CRUD de Apuntes Responsive", () => {
    it("globals.css define .apuntes-layout con adaptación mobile y textarea scrolleable", () => {
      expect(cssContent).toContain(".apuntes-layout");
      expect(cssContent).toContain(".apuntes-textarea");
      expect(cssContent).toMatch(/\.apuntes-textarea\s*\{[^}]*overflow-y:\s*auto/s);
    });

    it("GestorApuntes usa las clases semánticas .apuntes-layout y .apuntes-textarea", () => {
      const gestorPath = path.resolve(process.cwd(), "app/materias/[id]/apuntes/GestorApuntes.tsx");
      const gestorContent = fs.readFileSync(gestorPath, "utf-8");
      expect(gestorContent).toContain("apuntes-layout");
      expect(gestorContent).toContain("apuntes-textarea");
    });
  });

  describe("M3 — Generador (Formulario y Stepper)", () => {
    it("StepperDidactico incluye clase .step-label para colapso elegante en pantallas estrechas", () => {
      const stepperPath = path.resolve(process.cwd(), "components/ui/StepperDidactico.tsx");
      const stepperContent = fs.readFileSync(stepperPath, "utf-8");
      expect(stepperContent).toContain("step-label");
    });

    it("globals.css asegura botones y selects de configuración con altura táctil >= 48px", () => {
      expect(cssContent).toMatch(/\.gen-pill[^{]*\{[^}]*min-height:\s*(48px|52px)/s);
    });
  });

  describe("M4 — Visor de Resultados Inmersivo & Bottom Sheets", () => {
    it("globals.css define clases de Bottom Sheet (overlay, container, handle)", () => {
      expect(cssContent).toContain(".bottom-sheet-overlay");
      expect(cssContent).toContain(".bottom-sheet-container");
      expect(cssContent).toContain(".bottom-sheet-handle");
    });

    it("ModalEditarSlide utiliza Framer Motion con físicas de resorte para el Bottom Sheet", () => {
      const editModalPath = path.resolve(process.cwd(), "components/generador/ModalEditarSlide.tsx");
      const editModalContent = fs.readFileSync(editModalPath, "utf-8");
      expect(editModalContent).toContain("framer-motion");
      expect(editModalContent).toContain("bottom-sheet-handle");
      expect(editModalContent).toMatch(/type:\s*['"]spring['"]/);
    });

    it("ModalReformular utiliza Framer Motion con físicas de resorte para el Bottom Sheet", () => {
      const reformModalPath = path.resolve(process.cwd(), "components/generador/ModalReformular.tsx");
      const reformModalContent = fs.readFileSync(reformModalPath, "utf-8");
      expect(reformModalContent).toContain("framer-motion");
      expect(reformModalContent).toContain("bottom-sheet-handle");
      expect(reformModalContent).toMatch(/type:\s*['"]spring['"]/);
    });

    it("SeccionesPedagogicas implementa animación de stagger o motion cards en slides", () => {
      const secPath = path.resolve(process.cwd(), "components/generador/SeccionesPedagogicas.tsx");
      const secContent = fs.readFileSync(secPath, "utf-8");
      expect(secContent).toContain("framer-motion");
      expect(secContent).toMatch(/motion\.(div|article)/);
    });
  });
});
