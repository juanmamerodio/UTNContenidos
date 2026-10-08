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
    <div className="apuntes-layout">
      {/* Formulario de Ingesta */}
      <section className="apuntes-panel glass-panel">
        <h2 className="apuntes-panel-title">
          <Plus size={20} />
          <span>Nuevo Apunte</span>
        </h2>

        <div className="apuntes-tipo-selector">
          <button
            type="button"
            className={`btn-secondary ${tipo === 'url' ? 'btn-primary' : ''}`}
            onClick={() => setTipo('url')}
          >
            <LinkIcon size={16} />
            <span>Desde URL</span>
          </button>
          <button
            type="button"
            className={`btn-secondary ${tipo === 'texto' ? 'btn-primary' : ''}`}
            onClick={() => setTipo('texto')}
          >
            <FileText size={16} />
            <span>Pegar Texto</span>
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
              <small className="form-help-text">
                <Info size={13} />
                <span>La página debe ser pública y no requerir login.</span>
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
                className="apuntes-textarea"
                placeholder="Pegá el texto acá... (hasta 100.000 caracteres)"
                maxLength={100000}
              />
            </div>
          )}

          {(state as any)?.error && (
            <div className="alert error" role="alert">
              {(state as any).error}
            </div>
          )}

          {(state as any)?.success && (
            <div className="alert success" role="status">
              Apunte agregado correctamente e indexado para la IA.
            </div>
          )}

          <button type="submit" className="btn-primary apuntes-submit-btn" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 size={18} className="spin" />
                <span>Procesando e indexando...</span>
              </>
            ) : (
              'Guardar e Indexar Apunte'
            )}
          </button>
        </form>
      </section>

      {/* Lista de Apuntes Existentes */}
      <section className="apuntes-panel glass-panel">
        <h2 className="apuntes-panel-title">
          <FileText size={20} />
          <span>Apuntes Indexados ({apuntesAgrupados.length})</span>
        </h2>

        {apuntesAgrupados.length === 0 ? (
          <div className="apuntes-empty">
            <FileText size={48} />
            <p>No hay apuntes cargados para esta materia.</p>
            <p>Agregá uno desde el panel izquierdo.</p>
          </div>
        ) : (
          <div className="apuntes-lista">
            {apuntesAgrupados.map((a) => (
              <div key={a.titulo} className="apunte-item">
                <div>
                  <h3 className="apunte-item-title">{a.titulo}</h3>
                  <p className="apunte-item-desc">
                    {a.fragmentos} {a.fragmentos === 1 ? 'fragmento' : 'fragmentos'} ({Math.round(a.bytes / 1024)} KB)
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-secondary apunte-delete-btn"
                  onClick={() => handleBorrar(a.titulo)}
                  disabled={borrando === a.titulo}
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
