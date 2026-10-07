import { describe, it, expect } from 'vitest';
import { faseInicial, faseReducer, pasoDeFase } from '@/lib/generador-fase';

const clase = { slides: [] };

describe('generador-fase', () => {
  it('arranca en config sin error ni clase', () => {
    expect(faseInicial).toEqual({ fase: 'config', error: '', clase: null });
  });

  it('config -> procesando limpia el error', () => {
    const s = faseReducer({ fase: 'config', error: 'viejo', clase: null }, { tipo: 'iniciar' });
    expect(s).toEqual({ fase: 'procesando', error: '', clase: null });
  });

  it('procesando -> resultado guarda la clase', () => {
    const s = faseReducer({ ...faseInicial, fase: 'procesando' }, { tipo: 'exito', clase });
    expect(s.fase).toBe('resultado');
    expect(s.clase).toBe(clase);
  });

  it('procesando -> config con error visible', () => {
    const s = faseReducer({ ...faseInicial, fase: 'procesando' }, { tipo: 'fallo', error: 'boom' });
    expect(s).toEqual({ fase: 'config', error: 'boom', clase: null });
  });

  it('cancelar vuelve a config sin error', () => {
    const s = faseReducer({ ...faseInicial, fase: 'procesando' }, { tipo: 'cancelar' });
    expect(s).toEqual({ fase: 'config', error: '', clase: null });
  });

  it('reiniciar desde resultado vuelve a config y descarta la clase', () => {
    const s = faseReducer({ fase: 'resultado', error: '', clase }, { tipo: 'reiniciar' });
    expect(s).toEqual({ fase: 'config', error: '', clase: null });
  });

  it('actualizar clase en resultado mantiene la fase', () => {
    const nueva = { slides: [1] };
    const s = faseReducer({ fase: 'resultado', error: '', clase }, { tipo: 'actualizar', clase: nueva });
    expect(s.fase).toBe('resultado');
    expect(s.clase).toBe(nueva);
  });

  it('ignora eventos inválidos para la fase actual', () => {
    expect(faseReducer(faseInicial, { tipo: 'exito', clase })).toBe(faseInicial);
    expect(faseReducer(faseInicial, { tipo: 'cancelar' })).toBe(faseInicial);
  });

  it('mapea fase a paso del stepper', () => {
    expect(pasoDeFase('config')).toBe(1);
    expect(pasoDeFase('procesando')).toBe(2);
    expect(pasoDeFase('resultado')).toBe(3);
  });
});
