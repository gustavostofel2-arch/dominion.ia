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
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Ninguém acessa a tabela admins diretamente pelo client (nem leitura) — só a
-- função is_admin() abaixo, que roda com privilégios de owner (SECURITY DEFINER),
-- e as funções list/add/remove_admin abaixo (usadas pela tela Admin > Administradores).
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

-- ============================================================================
-- Gestão de administradores pela UI (Admin > Administradores)
-- ============================================================================
-- Estas funções rodam com privilégio elevado (SECURITY DEFINER, único jeito de
-- ler auth.users e escrever em public.admins, ambos bloqueados para o client
-- comum), mas cada uma primeiro verifica public.is_admin() do usuário logado
-- (auth.uid()) e recusa quem não for admin. Isso permite promover/remover
-- administradores direto pelo painel, sem precisar abrir o SQL Editor de novo
-- — exceto para o primeiro admin do projeto, que precisa do INSERT manual
-- abaixo (ninguém é admin ainda pra autorizar a si mesmo pela função).
--
-- Primeiro admin (rode uma única vez, trocando o e-mail):
--
-- INSERT INTO public.admins (user_id)
-- SELECT id FROM auth.users WHERE email = 'seu-email-admin@exemplo.com'
-- ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.list_admins()
RETURNS TABLE(user_id UUID, email TEXT, created_at TIMESTAMP WITH TIME ZONE)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT a.user_id, u.email::TEXT, a.created_at
  FROM public.admins a
  JOIN auth.users u ON u.id = a.user_id
  ORDER BY a.created_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_admin_by_email(target_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_id UUID;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT id INTO target_id FROM auth.users WHERE email = target_email;
  IF target_id IS NULL THEN
    RAISE EXCEPTION 'Nenhum usuário com esse e-mail. Crie a conta em Authentication > Users antes de promover.';
  END IF;

  INSERT INTO public.admins (user_id) VALUES (target_id)
  ON CONFLICT DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_admin_by_email(target_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_id UUID;
  admin_count INTEGER;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT id INTO target_id FROM auth.users WHERE email = target_email;
  IF target_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado.';
  END IF;

  SELECT count(*) INTO admin_count FROM public.admins;
  IF admin_count <= 1 THEN
    RAISE EXCEPTION 'Não é possível remover o último administrador.';
  END IF;

  DELETE FROM public.admins WHERE user_id = target_id;
END;
$$;

REVOKE ALL ON FUNCTION public.list_admins() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_admins() TO authenticated;

REVOKE ALL ON FUNCTION public.add_admin_by_email(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_admin_by_email(TEXT) TO authenticated;

REVOKE ALL ON FUNCTION public.remove_admin_by_email(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.remove_admin_by_email(TEXT) TO authenticated;

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
