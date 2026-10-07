/**
 * lib/generador-fase.ts — Máquina de estados del wizard de generación.
 * Fases mutuamente excluyentes: config → procesando → resultado.
 * procesando → config en error/cancelación. La configuración vive fuera (se conserva).
 */
export type Fase = 'config' | 'procesando' | 'resultado';

export interface EstadoFase<C = any> {
  fase: Fase;
  error: string;
  clase: C | null;
}

export type AccionFase<C = any> =
  | { tipo: 'iniciar' }
  | { tipo: 'exito'; clase: C }
  | { tipo: 'fallo'; error: string }
  | { tipo: 'cancelar' }
  | { tipo: 'reiniciar' }
  | { tipo: 'actualizar'; clase: C };

export const faseInicial: EstadoFase = { fase: 'config', error: '', clase: null };

export function faseReducer<C = any>(estado: EstadoFase<C>, accion: AccionFase<C>): EstadoFase<C> {
  switch (accion.tipo) {
    case 'iniciar':
      if (estado.fase !== 'config') return estado;
      return { fase: 'procesando', error: '', clase: null };
    case 'exito':
      if (estado.fase !== 'procesando') return estado;
      return { fase: 'resultado', error: '', clase: accion.clase };
    case 'fallo':
      if (estado.fase !== 'procesando') return estado;
      return { fase: 'config', error: accion.error, clase: null };
    case 'cancelar':
      if (estado.fase !== 'procesando') return estado;
      return { fase: 'config', error: '', clase: null };
    case 'reiniciar':
      if (estado.fase !== 'resultado') return estado;
      return { fase: 'config', error: '', clase: null };
    case 'actualizar':
      if (estado.fase !== 'resultado') return estado;
      return { ...estado, clase: accion.clase };
  }
}

export function pasoDeFase(fase: Fase): 1 | 2 | 3 {
  return fase === 'config' ? 1 : fase === 'procesando' ? 2 : 3;
}
