'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Image as ImageIcon, Film } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

export default function AdminDashboardPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('items')
      .select(`
        id, type, title, prompt_text, media_url, created_at,
        tool:tools(name),
        niche:niches(name)
      `)
      .order('created_at', { ascending: false });
    
    if (data) setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    // Only call on mount
    const load = async () => {
      await fetchItems();
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Excluir permanentemente o item "${title}"?`)) {
      await supabase.from('items').delete().eq('id', id);
      fetchItems();
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight">Gestão da Biblioteca</h1>
          <p className="text-on-surface-variant text-sm mt-1">Controle de catálogo, nichos e assets generativos.</p>
        </div>
        <Link 
          href="/admin/novo"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-container text-on-primary-container hover:bg-primary font-semibold rounded-lg transition-all shadow-md"
        >
          <Plus size={18} />
          <span>Novo Item</span>
        </Link>
      </div>

      <div className="bg-surface-container-low rounded-xl border border-surface-container-highest/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container text-outline text-[10px] font-mono uppercase tracking-wider">
                <th className="py-3 px-4 w-24">Media</th>
                <th className="py-3 px-4">Título & Prompt</th>
                <th className="py-3 px-4 w-28">Tipo</th>
                <th className="py-3 px-4 w-36">Nicho / Motor</th>
                <th className="py-3 px-4 w-28">Data</th>
                <th className="py-3 px-4 w-24 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high">
              {loading ? (
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
                          <img src={item.media_url || 'https://picsum.photos/seed/placeholder/200/150'} alt="" className="w-full h-full object-cover" />
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
                        <span className="text-[10px] font-mono text-outline">{item.tool?.name}</span>
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
      </div>
    </div>
  );
}
