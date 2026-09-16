'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

type Lookup = { id: string; name: string };

function AdminNovoItemContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(!!editId);
  const [niches, setNiches] = useState<Lookup[]>([]);
  const [tools, setTools] = useState<Lookup[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    type: 'image',
    niche_id: '',
    tool_id: '',
    media_url: '',
    prompt_text: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        // Load dropdowns
        const { data: nData } = await supabase.from('niches').select('*').order('name');
        if (nData) setNiches(nData);

        const { data: tData } = await supabase.from('tools').select('*').order('name');
        if (tData) setTools(tData);

        if (nData?.length && !formData.niche_id) setFormData(f => ({...f, niche_id: nData[0].id}));
        if (tData?.length && !formData.tool_id) setFormData(f => ({...f, tool_id: tData[0].id}));

        // If editing, load item
        if (editId) {
          const { data: itemData } = await supabase.from('items').select('*').eq('id', editId).single();
          if (itemData) {
            setFormData({
              title: itemData.title,
              type: itemData.type,
              niche_id: itemData.niche_id,
              tool_id: itemData.tool_id,
              media_url: itemData.media_url,
              prompt_text: itemData.prompt_text,
            });
          }
        }
      } catch (error) {
        console.error('Falha ao carregar dados do formulário:', error);
      }
      setInitialLoad(false);
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = editId
        ? await supabase.from('items').update(formData).eq('id', editId)
        : await supabase.from('items').insert([formData]);

      if (error) throw error;
      router.push('/admin');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar item.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNiche = async () => {
    const name = prompt('Novo Nicho:');
    if (!name) return;
    const { data, error } = await supabase.from('niches').insert([{ name }]).select().single();
    if (error) {
      alert('Erro ao criar nicho: ' + error.message);
      return;
    }
    if (data) {
      setNiches([...niches, data]);
      setFormData({...formData, niche_id: data.id});
    }
  };

  const handleCreateTool = async () => {
    const name = prompt('Nova Ferramenta:');
    if (!name) return;
    const { data, error } = await supabase.from('tools').insert([{ name }]).select().single();
    if (error) {
      alert('Erro ao criar ferramenta: ' + error.message);
      return;
    }
    if (data) {
      setTools([...tools, data]);
      setFormData({...formData, tool_id: data.id});
    }
  };

  if (initialLoad) return <div className="p-8 text-on-surface-variant">Carregando...</div>;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/admin" className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-on-surface">{editId ? 'Editar Item' : 'Adicionar Novo Item'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 rounded-xl bg-surface-container-low border border-surface-container-highest/30 shadow-sm">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-outline uppercase tracking-wider">Título do Prompt</label>
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="px-4 py-2.5 bg-surface-container text-on-surface rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Ex: Macro Shot Perfumaria"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-outline uppercase tracking-wider">Tipo de Asset</label>
            <select 
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="px-4 py-2.5 bg-surface-container text-on-surface rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="image">Imagem</option>
              <option value="video">Vídeo</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono text-outline uppercase tracking-wider">Nicho Estratégico</label>
              <button type="button" onClick={handleCreateNiche} className="text-[10px] font-mono text-primary flex items-center gap-1 hover:underline">
                <Plus size={12}/> Novo
              </button>
            </div>
            <select 
              value={formData.niche_id}
              onChange={(e) => setFormData({...formData, niche_id: e.target.value})}
              required
              className="px-4 py-2.5 bg-surface-container text-on-surface rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Selecione...</option>
              {niches.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
             <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono text-outline uppercase tracking-wider">Ferramenta / Motor</label>
              <button type="button" onClick={handleCreateTool} className="text-[10px] font-mono text-secondary flex items-center gap-1 hover:underline">
                <Plus size={12}/> Novo
              </button>
            </div>
            <select 
              value={formData.tool_id}
              onChange={(e) => setFormData({...formData, tool_id: e.target.value})}
              required
              className="px-4 py-2.5 bg-surface-container text-on-surface rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Selecione...</option>
              {tools.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono text-outline uppercase tracking-wider">URL da Mídia (YouTube URL ou Imagem)</label>
          <input 
            type="text" 
            required
            value={formData.media_url}
            onChange={(e) => setFormData({...formData, media_url: e.target.value})}
            className="px-4 py-2.5 bg-surface-container text-on-surface rounded-lg font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="https://..."
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono text-outline uppercase tracking-wider">Sintaxe Canônica do Prompt</label>
          <textarea 
            required
            rows={5}
            value={formData.prompt_text}
            onChange={(e) => setFormData({...formData, prompt_text: e.target.value})}
            className="px-4 py-3 bg-surface-container-lowest text-on-surface rounded-lg font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
            placeholder="Insira os tokens e parâmetros..."
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-surface-container-high/50">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-semibold transition-all shadow-md disabled:opacity-50"
          >
            <Save size={18} />
            <span>Salvar no Vault</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AdminNovoItemPage() {
  return (
    <Suspense fallback={<div className="p-8 text-on-surface-variant">Carregando formulário...</div>}>
      <AdminNovoItemContent />
    </Suspense>
  );
}
