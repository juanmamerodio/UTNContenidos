import { describe, it, expect } from 'vitest';
import { resolverNombreMateria } from '@/lib/materia';

type Row = Record<string, unknown>;

/** Cliente falso mínimo: from().select().eq()...maybeSingle() */
function fakeClient(tablas: Record<string, Row[]>) {
  return {
    from(tabla: string) {
      const filtros: Array<[string, unknown]> = [];
      const q: any = {
        select: () => q,
        eq: (c: string, v: unknown) => {
          filtros.push([c, v]);
          return q;
        },
        maybeSingle: async () => {
          const fila = (tablas[tabla] || []).find((r) => filtros.every(([c, v]) => r[c] === v));
          return { data: fila ?? null, error: null };
        }
      };
      return q;
    }
  } as any;
}

const base = {
  docentes: [{ id: 'd1', email: 'a@utn.edu.ar' }],
  asignaciones: [{ docente_id: 'd1', materia_id: 'm1' }],
  materias: [
    { id: 'm1', nombre: 'Algoritmos', activa: true },
    { id: 'm2', nombre: 'Física', activa: true }
  ]
};

describe('resolverNombreMateria', () => {
  it('devuelve el nombre si la materia pertenece al docente', async () => {
    const sb = fakeClient(base);
    expect(await resolverNombreMateria(sb, 'a@utn.edu.ar', 'm1')).toBe('Algoritmos');
  });

  it('devuelve null si la materia existe pero no es del docente', async () => {
    const sb = fakeClient(base);
    expect(await resolverNombreMateria(sb, 'a@utn.edu.ar', 'm2')).toBeNull();
  });

  it('devuelve null si el docente no existe', async () => {
    const sb = fakeClient(base);
    expect(await resolverNombreMateria(sb, 'x@utn.edu.ar', 'm1')).toBeNull();
  });

  it('devuelve null si la materia está inactiva o no existe', async () => {
    const sb = fakeClient({
      ...base,
      asignaciones: [{ docente_id: 'd1', materia_id: 'm3' }],
      materias: [{ id: 'm3', nombre: 'Vieja', activa: false }]
    });
    expect(await resolverNombreMateria(sb, 'a@utn.edu.ar', 'm3')).toBeNull();
    expect(await resolverNombreMateria(sb, 'a@utn.edu.ar', '')).toBeNull();
  });
});
