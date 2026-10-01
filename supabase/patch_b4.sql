-- PATCH B4: RAG semántico con pgvector
-- Ejecutar en Supabase SQL Editor (idempotente)

-- 1. Columna de embeddings en apuntes (gemini-embedding-2 = 3072 dims)
alter table public.apuntes
  add column if not exists embedding vector(3072);

-- 2. Índice HNSW para búsqueda veloz (opcional pero recomendado)
create index if not exists apuntes_embedding_idx
  on public.apuntes using hnsw (embedding vector_cosine_ops);

-- 3. Función de búsqueda semántica por materia
create or replace function public.match_apuntes(
  p_materia_id text,
  p_consulta vector(3072),
  p_limite int default 3
) returns table (
  id uuid, materia_id text, titulo text, contenido text, similitud float8
) language plpgsql security definer as $$
begin
  return query
    select a.id, a.materia_id, a.titulo, a.contenido,
           1 - (a.embedding <=> p_consulta) as similitud
    from public.apuntes a
    where a.materia_id = p_materia_id
      and a.embedding is not null
    order by a.embedding <=> p_consulta
    limit p_limite;
end;
$$;