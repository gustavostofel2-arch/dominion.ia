-- Execute este script no painel SQL do Supabase.
-- É seguro rodar de novo em cima do projeto que já rodou a versão anterior:
-- toda operação usa IF NOT EXISTS / DROP ... IF EXISTS antes de recriar.

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

-- ============================================================================
-- Controle de administradores
-- ============================================================================
-- IMPORTANTE: "auth.role() = 'authenticated'" (usado na versão anterior deste
-- script) libera escrita para QUALQUER usuário logado, não só para admins.
-- Como a anon key fica no bundle do client e o Supabase permite cadastro
-- público por padrão, qualquer visitante que se cadastre via
-- supabase.auth.signUp() ganharia acesso de escrita. A tabela abaixo resolve
-- isso: só usuários cujo id estiver em public.admins podem escrever.
CREATE TABLE IF NOT EXISTS public.admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Ninguém acessa a tabela admins diretamente pelo client (nem leitura) — só a
-- função is_admin() abaixo, que roda com privilégios de owner (SECURITY DEFINER).
DROP POLICY IF EXISTS "Bloquear acesso direto a admins" ON public.admins;
CREATE POLICY "Bloquear acesso direto a admins" ON public.admins FOR ALL USING (false);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  );
$$;

-- Depois de rodar este script, promova sua própria conta a admin (troque o
-- e-mail pelo do usuário que você já criou em Authentication > Users):
--
-- INSERT INTO public.admins (user_id)
-- SELECT id FROM auth.users WHERE email = 'seu-email-admin@exemplo.com'
-- ON CONFLICT DO NOTHING;

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================
ALTER TABLE public.niches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública (alunos podem ver)
DROP POLICY IF EXISTS "Leitura pública de nichos" ON public.niches;
CREATE POLICY "Leitura pública de nichos" ON public.niches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Leitura pública de ferramentas" ON public.tools;
CREATE POLICY "Leitura pública de ferramentas" ON public.tools FOR SELECT USING (true);

DROP POLICY IF EXISTS "Leitura pública de itens" ON public.items;
CREATE POLICY "Leitura pública de itens" ON public.items FOR SELECT USING (true);

-- Escrita restrita a administradores (public.admins), não a "qualquer autenticado"
DROP POLICY IF EXISTS "Escrita autenticada em nichos" ON public.niches;
DROP POLICY IF EXISTS "Escrita admin em nichos" ON public.niches;
CREATE POLICY "Escrita admin em nichos" ON public.niches FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Escrita autenticada em ferramentas" ON public.tools;
DROP POLICY IF EXISTS "Escrita admin em ferramentas" ON public.tools;
CREATE POLICY "Escrita admin em ferramentas" ON public.tools FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Escrita autenticada em itens" ON public.items;
DROP POLICY IF EXISTS "Escrita admin em itens" ON public.items;
CREATE POLICY "Escrita admin em itens" ON public.items FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
