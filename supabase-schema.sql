-- Execute este script no painel SQL do Supabase

-- Habilitar a extensão pgcrypto para UUIDs se ainda não estiver habilitada
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela: niches (Nichos)
CREATE TABLE IF NOT EXISTS public.niches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: tools (Ferramentas)
CREATE TABLE IF NOT EXISTS public.tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela: items (Prompts de Imagem e Vídeo)
CREATE TABLE IF NOT EXISTS public.items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  niche_id UUID REFERENCES public.niches(id) ON DELETE RESTRICT,
  tool_id UUID REFERENCES public.tools(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  media_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir dados iniciais de exemplo (Nichos)
INSERT INTO public.niches (name) VALUES 
('Criador UGC'), 
('POV'), 
('POV com Produto'), 
('POV com Roupa'),
('Cinematográfico'),
('Editorial Moda')
ON CONFLICT (name) DO NOTHING;

-- Inserir dados iniciais de exemplo (Ferramentas)
INSERT INTO public.tools (name) VALUES 
('Midjourney v6.1'), 
('Magnific AI'), 
('FLUX.1 Pro'), 
('DALL-E 3'), 
('VO3 Video'), 
('Runway Gen-3')
ON CONFLICT (name) DO NOTHING;

-- Políticas de Segurança (Row Level Security - RLS)
ALTER TABLE public.niches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública (alunos podem ver)
CREATE POLICY "Leitura pública de nichos" ON public.niches FOR SELECT USING (true);
CREATE POLICY "Leitura pública de ferramentas" ON public.tools FOR SELECT USING (true);
CREATE POLICY "Leitura pública de itens" ON public.items FOR SELECT USING (true);

-- Permitir escrita apenas para administradores autenticados via Supabase Auth
CREATE POLICY "Escrita autenticada em nichos" ON public.niches FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Escrita autenticada em ferramentas" ON public.tools FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Escrita autenticada em itens" ON public.items FOR ALL USING (auth.role() = 'authenticated');
