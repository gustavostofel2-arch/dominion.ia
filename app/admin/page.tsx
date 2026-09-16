'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash2, Image as ImageIcon, Film, LogOut, Tag, Wrench, ShieldCheck, Cpu } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';

const supabase = createClient();

const PAGE_SIZE = 20;

type Item = {
  id: string;
  type: 'image' | 'video';
  title: string;
  prompt_text: string;
  media_url: string;
  created_at: string;
  tool: { name: string } | null;
  engine: { name: string } | null;
  niche: { name: string } | null;
};

type Lookup = { id: string; name: string };
type AdminUser = { user_id: string; email: string; created_at: string };

export default function AdminDashboardPage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [niches, setNiches] = useState<Lookup[]>([]);
  const [tools, setTools] = useState<Lookup[]>([]);
  const [engines, setEngines] = useState<Lookup[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [adminsError, setAdminsError] = useState<string | null>(null);

  const fetchItems = useCallback(async (pageIndex: number) => {
    setLoading(true);
    const from = pageIndex * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    try {
      const { data, error } = await supabase
        .from('items')
        .select(`
          id, type, title, prompt_text, media_url, created_at,
          tool:tools(name),
          engine:engines(name),
          niche:niches(name)
        `)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (!error && data) {
        const rows = data as unknown as Item[];
        setItems(prev => (pageIndex === 0 ? rows : [...prev, ...rows]));
        setHasMore(rows.length === PAGE_SIZE);
      }
    } catch (error) {
      console.error('Falha ao carregar itens:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLookups = useCallback(async () => {
    try {
      const [{ data: nData }, { data: tData }, { data: eData }] = await Promise.all([
        supabase.from('niches').select('*').order('name'),
        supabase.from('tools').select('*').order('name'),
        supabase.from('engines').select('*').order('name'),
      ]);
      if (nData) setNiches(nData);
      if (tData) setTools(tData);
      if (eData) setEngines(eData);
    } catch (error) {
      console.error('Falha ao carregar nichos/ferramentas:', error);
    }
  }, []);

  const fetchAdmins = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('list_admins');
      if (error) {
        setAdminsError(error.message);
        return;
      }
      setAdminsError(null);
      setAdmins(data || []);
    } catch (error) {
      console.error('Falha ao carregar administradores:', error);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await fetchItems(0);
      await fetchLookups();
      await fetchAdmins();
    })();
  }, [fetchItems, fetchLookups, fetchAdmins]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchItems(nextPage);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Excluir permanentemente o item "${title}"?`)) {
      const { error } = await supabase.from('items').delete().eq('id', id);
      if (error) {
        alert('Erro ao excluir item: ' + error.message);
        return;
      }
      setPage(0);
      fetchItems(0);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const handleRenameNiche = async (niche: Lookup) => {
    const name = prompt('Renomear nicho:', niche.name);
    if (!name || name === niche.name) return;
    const { error } = await supabase.from('niches').update({ name }).eq('id', niche.id);
    if (error) {
      alert('Erro ao renomear nicho: ' + error.message);
      return;
    }
    fetchLookups();
  };

  const handleDeleteNiche = async (niche: Lookup) => {
    if (!confirm(`Excluir o nicho "${niche.name}"? Só é possível se nenhum item o estiver usando.`)) return;
    const { error } = await supabase.from('niches').delete().eq('id', niche.id);
    if (error) {
      alert('Não foi possível excluir: existem itens usando este nicho.');
      return;
    }
    fetchLookups();
  };

  const handleRenameTool = async (tool: Lookup) => {
    const name = prompt('Renomear ferramenta:', tool.name);
    if (!name || name === tool.name) return;
    const { error } = await supabase.from('tools').update({ name }).eq('id', tool.id);
    if (error) {
      alert('Erro ao renomear ferramenta: ' + error.message);
      return;
    }
    fetchLookups();
  };

  const handleDeleteTool = async (tool: Lookup) => {
    if (!confirm(`Excluir a ferramenta "${tool.name}"? Só é possível se nenhum item a estiver usando.`)) return;
    const { error } = await supabase.from('tools').delete().eq('id', tool.id);
    if (error) {
      alert('Não foi possível excluir: existem itens usando esta ferramenta.');
      return;
    }
    fetchLookups();
  };

  const handleRenameEngine = async (engine: Lookup) => {
    const name = prompt('Renomear motor de IA:', engine.name);
    if (!name || name === engine.name) return;
    const { error } = await supabase.from('engines').update({ name }).eq('id', engine.id);
    if (error) {
      alert('Erro ao renomear motor de IA: ' + error.message);
      return;
    }
    fetchLookups();
  };

  const handleDeleteEngine = async (engine: Lookup) => {
    if (!confirm(`Excluir o motor "${engine.name}"? Só é possível se nenhum item o estiver usando.`)) return;
    const { error } = await supabase.from('engines').delete().eq('id', engine.id);
    if (error) {
      alert('Não foi possível excluir: existem itens usando este motor.');
      return;
    }
    fetchLookups();
  };

  const handleCreateEngine = async () => {
    const name = prompt('Novo motor de IA (ex: VEO 3, Kling 2.5):');
    if (!name) return;
    const { error } = await supabase.from('engines').insert([{ name }]);
    if (error) {
      alert('Erro ao criar motor de IA: ' + error.message);
      return;
    }
    fetchLookups();
  };

  const handleCreateNiche = async () => {
    const name = prompt('Novo nicho:');
    if (!name) return;
    const { error } = await supabase.from('niches').insert([{ name }]);
    if (error) {
      alert('Erro ao criar nicho: ' + error.message);
      return;
    }
    fetchLookups();
  };

  const handleCreateTool = async () => {
    const name = prompt('Nova ferramenta:');
    if (!name) return;
    const { error } = await supabase.from('tools').insert([{ name }]);
    if (error) {
      alert('Erro ao criar ferramenta: ' + error.message);
      return;
    }
    fetchLookups();
  };

  const handleAddAdmin = async () => {
    const email = prompt('E-mail do novo administrador (a pessoa precisa já ter uma conta em Authentication > Users):');
    if (!email) return;
    const { error } = await supabase.rpc('add_admin_by_email', { target_email: email });
    if (error) {
      alert('Erro ao promover administrador: ' + error.message);
      return;
    }
    fetchAdmins();
  };

  const handleRemoveAdmin = async (admin: AdminUser) => {
    if (!confirm(`Remover o acesso de administrador de "${admin.email}"?`)) return;
    const { error } = await supabase.rpc('remove_admin_by_email', { target_email: admin.email });
    if (error) {
      alert('Erro ao remover administrador: ' + error.message);
      return;
    }
    fetchAdmins();
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight">Gestão da Biblioteca</h1>
          <p className="text-on-surface-variant text-sm mt-1">Controle de catálogo, nichos e assets generativos.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/novo"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-container text-on-primary-container hover:bg-primary font-semibold rounded-lg transition-all shadow-md"
          >
            <Plus size={18} />
            <span>Novo Item</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            title="Sair"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-container-low hover:bg-error-container/20 hover:text-error text-on-surface-variant font-semibold rounded-lg transition-all border border-surface-container-highest/50"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-xl border border-surface-container-highest/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container text-outline text-[10px] font-mono uppercase tracking-wider">
                <th className="py-3 px-4 w-24">Media</th>
                <th className="py-3 px-4">Título & Prompt</th>
                <th className="py-3 px-4 w-28">Tipo</th>
                <th className="py-3 px-4 w-36">Nicho / Ferramenta / Motor</th>
                <th className="py-3 px-4 w-28">Data</th>
                <th className="py-3 px-4 w-24 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high">
              {loading && items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-on-surface-variant">Carregando itens...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-on-surface-variant">Nenhum item cadastrado no cofre.</td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="hover:bg-surface-container/50 transition-colors group">
                    <td className="py-3 px-4 align-middle">
                      <div className="w-16 h-10 rounded bg-surface-container-high overflow-hidden">
                        {item.type === 'video' ? (
                          <div className="w-full h-full flex items-center justify-center bg-surface-container text-secondary">
                             <Film size={16} />
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.media_url || 'https://picsum.photos/seed/placeholder/200/150'} alt="" loading="lazy" className="w-full h-full object-cover" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 align-middle">
                      <div className="flex flex-col gap-1 max-w-xs">
                        <span className="font-semibold text-on-surface text-sm truncate">{item.title}</span>
                        <span className="font-mono text-[10px] text-on-surface-variant truncate">{item.prompt_text}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 align-middle">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium ${item.type === 'video' ? 'bg-secondary/15 text-secondary' : 'bg-primary/15 text-primary'}`}>
                        {item.type === 'video' ? <Film size={12}/> : <ImageIcon size={12}/>}
                        {item.type === 'video' ? 'Vídeo' : 'Imagem'}
                      </span>
                    </td>
                    <td className="py-3 px-4 align-middle">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-on-surface">{item.niche?.name}</span>
                        <span className="text-[10px] font-mono text-outline">{item.tool?.name}{item.engine?.name ? ` · ${item.engine.name}` : ''}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 align-middle text-xs text-on-surface-variant font-mono">
                      {format(new Date(item.created_at), 'dd/MM/yyyy')}
                    </td>
                    <td className="py-3 px-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/novo?id=${item.id}`} className="p-1.5 rounded text-outline hover:text-primary hover:bg-surface-container transition-colors">
                          <Edit size={16} />
                        </Link>
                        <button onClick={() => handleDelete(item.id, item.title)} className="p-1.5 rounded text-outline hover:text-error hover:bg-surface-container transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {hasMore && items.length > 0 && (
          <div className="flex justify-center py-4 border-t border-surface-container-high/50">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high text-sm font-mono transition-colors disabled:opacity-50"
            >
              {loading ? 'Carregando...' : 'Carregar mais'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="bg-surface-container-low rounded-xl border border-surface-container-highest/30 shadow-sm p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-on-surface flex items-center gap-2">
              <Tag size={16} className="text-primary" /> Nichos
            </h2>
            <button type="button" onClick={handleCreateNiche} className="text-[10px] font-mono text-primary flex items-center gap-1 hover:underline">
              <Plus size={12} /> Novo
            </button>
          </div>
          <div className="flex flex-col divide-y divide-surface-container-high/60">
            {niches.map(niche => (
              <div key={niche.id} className="flex items-center justify-between py-2">
                <span className="text-sm text-on-surface-variant">{niche.name}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleRenameNiche(niche)} className="p-1.5 rounded text-outline hover:text-primary hover:bg-surface-container transition-colors">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDeleteNiche(niche)} className="p-1.5 rounded text-outline hover:text-error hover:bg-surface-container transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {niches.length === 0 && <p className="text-xs text-on-surface-variant py-2">Nenhum nicho cadastrado.</p>}
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl border border-surface-container-highest/30 shadow-sm p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-on-surface flex items-center gap-2">
              <Wrench size={16} className="text-secondary" /> Ferramentas
            </h2>
            <button type="button" onClick={handleCreateTool} className="text-[10px] font-mono text-secondary flex items-center gap-1 hover:underline">
              <Plus size={12} /> Nova
            </button>
          </div>
          <div className="flex flex-col divide-y divide-surface-container-high/60">
            {tools.map(tool => (
              <div key={tool.id} className="flex items-center justify-between py-2">
                <span className="text-sm text-on-surface-variant">{tool.name}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleRenameTool(tool)} className="p-1.5 rounded text-outline hover:text-primary hover:bg-surface-container transition-colors">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDeleteTool(tool)} className="p-1.5 rounded text-outline hover:text-error hover:bg-surface-container transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {tools.length === 0 && <p className="text-xs text-on-surface-variant py-2">Nenhuma ferramenta cadastrada.</p>}
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl border border-surface-container-highest/30 shadow-sm p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-on-surface flex items-center gap-2">
              <Cpu size={16} className="text-tertiary" /> Motores de IA
            </h2>
            <button type="button" onClick={handleCreateEngine} className="text-[10px] font-mono text-tertiary flex items-center gap-1 hover:underline">
              <Plus size={12} /> Novo
            </button>
          </div>
          <div className="flex flex-col divide-y divide-surface-container-high/60">
            {engines.map(engine => (
              <div key={engine.id} className="flex items-center justify-between py-2">
                <span className="text-sm text-on-surface-variant">{engine.name}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleRenameEngine(engine)} className="p-1.5 rounded text-outline hover:text-primary hover:bg-surface-container transition-colors">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDeleteEngine(engine)} className="p-1.5 rounded text-outline hover:text-error hover:bg-surface-container transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {engines.length === 0 && <p className="text-xs text-on-surface-variant py-2">Nenhum motor cadastrado.</p>}
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl border border-surface-container-highest/30 shadow-sm p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-on-surface flex items-center gap-2">
              <ShieldCheck size={16} className="text-secondary" /> Administradores
            </h2>
            <button type="button" onClick={handleAddAdmin} className="text-[10px] font-mono text-secondary flex items-center gap-1 hover:underline">
              <Plus size={12} /> Promover
            </button>
          </div>
          {adminsError ? (
            <p className="text-xs text-on-surface-variant py-2">
              {adminsError.includes('not authorized')
                ? 'Sua conta ainda não está marcada como admin. Rode o INSERT do "primeiro admin" (comentado no topo de supabase-schema.sql) com o e-mail que você usou pra logar.'
                : 'Não foi possível carregar (rode a versão atualizada de supabase-schema.sql no seu projeto Supabase — este recurso precisa das funções list_admins/add_admin_by_email/remove_admin_by_email).'}
              <span className="block mt-1 text-outline">Detalhe: {adminsError}</span>
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-surface-container-high/60">
              {admins.map(admin => (
                <div key={admin.user_id} className="flex items-center justify-between py-2 gap-2">
                  <span className="text-sm text-on-surface-variant truncate">{admin.email}</span>
                  <button onClick={() => handleRemoveAdmin(admin)} className="p-1.5 rounded text-outline hover:text-error hover:bg-surface-container transition-colors shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {admins.length === 0 && <p className="text-xs text-on-surface-variant py-2">Nenhum administrador encontrado.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
