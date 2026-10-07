'use client';

import { useState, useActionState } from 'react';
import { agregarApunte, borrarApunte } from './actions';
import { Trash2, Link as LinkIcon, FileText, Loader2, Plus, Info } from 'lucide-react';

export default function GestorApuntes({
  materiaId,
  apuntesAgrupados
}: {
  materiaId: string;
  apuntesAgrupados: { titulo: string; fragmentos: number; bytes: number }[];
}) {
  const [tipo, setTipo] = useState<'url' | 'texto'>('url');
  const [borrando, setBorrando] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      formData.append('materiaId', materiaId);
      formData.append('tipo', tipo);
      const res = await agregarApunte(prevState, formData);
      if (res?.success) {
        // success reset
        return { success: true, key: Date.now() }; 
      }
      return res;
    },
    null
  );

  const handleBorrar = async (titulo: string) => {
    if (!confirm(`¿Seguro que querés borrar el apunte "${titulo}"?`)) return;
    setBorrando(titulo);
    await borrarApunte(materiaId, titulo);
    setBorrando(null);
  };

  return (
    <div className="grid-2col" style={{ gap: '2rem', marginTop: '2rem' }}>
      {/* Formulario de Ingesta */}
      <section className="glass-panel">
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={20} /> Nuevo Apunte
        </h2>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            type="button"
            className={`btn-secondary ${tipo === 'url' ? 'btn-primary' : ''}`}
            onClick={() => setTipo('url')}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <LinkIcon size={16} /> Desde URL
          </button>
          <button
            type="button"
            className={`btn-secondary ${tipo === 'texto' ? 'btn-primary' : ''}`}
            onClick={() => setTipo('texto')}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <FileText size={16} /> Pegar Texto
          </button>
        </div>

        <form action={formAction} key={(state as any)?.key || 'form'}>
          <div className="form-group">
            <label htmlFor="titulo">Título descriptivo</label>
            <input type="text" id="titulo" name="titulo" required placeholder="Ej: Unidad 1 - Introducción" />
          </div>

          {tipo === 'url' ? (
            <div className="form-group">
              <label htmlFor="url">URL de la página o artículo</label>
              <input type="url" id="url" name="url" required placeholder="https://..." />
              <small style={{ color: 'var(--utn-text-muted)', display: 'block', marginTop: '0.5rem' }}>
                <Info size={12} style={{ display: 'inline', marginRight: '4px' }} />
                La página debe ser pública y no requerir login.
              </small>
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="texto">Contenido del texto</label>
              <textarea
                id="texto"
                name="texto"
                required
                rows={8}
                placeholder="Pegá el texto acá... (hasta 100.000 caracteres)"
                maxLength={100000}
              />
            </div>
          )}

          {(state as any)?.error && (
            <div className="alert error" style={{ padding: '1rem', background: '#ffebeb', color: '#c92a2a', borderRadius: '8px', marginBottom: '1rem' }}>
              {(state as any).error}
            </div>
          )}

          {(state as any)?.success && (
            <div className="alert success" style={{ padding: '1rem', background: '#e6fcf5', color: '#099268', borderRadius: '8px', marginBottom: '1rem' }}>
              Apunte agregado correctamente e indexado para la IA.
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={isPending} style={{ width: '100%', justifyContent: 'center' }}>
            {isPending ? <><Loader2 size={16} className="spin" /> Procesando e indexando...</> : 'Guardar e Indexar Apunte'}
          </button>
        </form>
      </section>

      {/* Lista de Apuntes Existentes */}
      <section className="glass-panel">
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={20} /> Apuntes Indexados ({apuntesAgrupados.length})
        </h2>
        
        {apuntesAgrupados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--utn-text-muted)' }}>
            <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No hay apuntes cargados para esta materia.</p>
            <p>Agregá uno desde el panel izquierdo.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {apuntesAgrupados.map((a) => (
              <div key={a.titulo} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--utn-bg-alt)', borderRadius: '8px' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', margin: '0 0 0.25rem' }}>{a.titulo}</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--utn-text-muted)' }}>
                    {a.fragmentos} {a.fragmentos === 1 ? 'fragmento' : 'fragmentos'} ({Math.round(a.bytes / 1024)} KB)
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => handleBorrar(a.titulo)}
                  disabled={borrando === a.titulo}
                  style={{ color: '#c92a2a', borderColor: '#ffc9c9', padding: '0.5rem' }}
                  title="Borrar apunte"
                >
                  {borrando === a.titulo ? <Loader2 size={16} className="spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
