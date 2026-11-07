import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  UserCheck,
  UserX,
  X,
  PlusCircle,
  Volume2,
  Music,
  Sparkles,
} from 'lucide-react';
import { Cantiga, Orixa, TipoCantiga, Verso } from '../types';
import { uploadAudioFile } from '../lib/firebase';

export const AdminDashboardView: React.FC = () => {
  const {
    cantigas,
    users,
    orixas,
    tipos,
    salvarCantiga,
    excluirCantiga,
    toggleRevisaoCantiga,
    aprovarMembro,
    rejeitarMembro,
    salvarOrixa,
    salvarTipo,
    openCantigaDetail,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'cantigas' | 'membros' | 'orixas' | 'tipos'>('cantigas');

  // Modal states
  const [editingCantiga, setEditingCantiga] = useState<Cantiga | null>(null);
  const [isCantigaModalOpen, setIsCantigaModalOpen] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [audioUploadProgress, setAudioUploadProgress] = useState(0);

  // Orixa modal
  const [editingOrixa, setEditingOrixa] = useState<Orixa | null>(null);
  const [isOrixaModalOpen, setIsOrixaModalOpen] = useState(false);

  // Tipo modal
  const [editingTipo, setEditingTipo] = useState<TipoCantiga | null>(null);
  const [isTipoModalOpen, setIsTipoModalOpen] = useState(false);

  const pendingUsers = users.filter((u) => !u.aprovado);

  // Handlers for Cantiga Form
  const handleOpenNewCantiga = () => {
    const newCantiga: Cantiga = {
      id: `cantiga-${Date.now()}`,
      titulo: '',
      orixaId: orixas[0]?.id || 'ogum',
      tipoId: tipos[0]?.id || 'xire',
      toqueAtabaque: 'Ijexá',
      versos: [
        {
          id: `v-${Date.now()}-1`,
          ordem: 1,
          ioruba: '',
          pronuncia: '',
          traducao: '',
        },
      ],
      quandoCantada: '',
      observacoes: '',
      revisada: false, // Default in review until checked
      ehExemplo: false,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };
    setEditingCantiga(newCantiga);
    setIsCantigaModalOpen(true);
  };

  const handleEditCantiga = (c: Cantiga) => {
    setEditingCantiga({ ...c, versos: [...c.versos.map((v) => ({ ...v }))] });
    setIsCantigaModalOpen(true);
  };

  const handleAddVerse = () => {
    if (!editingCantiga) return;
    const newOrder = editingCantiga.versos.length + 1;
    const newVerse: Verso = {
      id: `v-${Date.now()}-${newOrder}`,
      ordem: newOrder,
      ioruba: '',
      pronuncia: '',
      traducao: '',
    };
    setEditingCantiga({
      ...editingCantiga,
      versos: [...editingCantiga.versos, newVerse],
    });
  };

  const handleRemoveVerse = (id: string) => {
    if (!editingCantiga) return;
    if (editingCantiga.versos.length <= 1) return;
    setEditingCantiga({
      ...editingCantiga,
      versos: editingCantiga.versos.filter((v) => v.id !== id),
    });
  };

  const handleVerseChange = (id: string, field: 'ioruba' | 'pronuncia' | 'traducao', val: string) => {
    if (!editingCantiga) return;
    setEditingCantiga({
      ...editingCantiga,
      versos: editingCantiga.versos.map((v) => (v.id === id ? { ...v, [field]: val } : v)),
    });
  };

  const handleSaveCantigaForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCantiga) return;
    if (!editingCantiga.titulo.trim()) return;

    salvarCantiga(editingCantiga);
    setIsCantigaModalOpen(false);
    setEditingCantiga(null);
  };

  // Real Audio upload to Firebase Storage
  const handleAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingCantiga) {
      setIsUploadingAudio(true);
      setAudioUploadProgress(0);
      try {
        const downloadUrl = await uploadAudioFile(file, 'cantigas-audio', (percent) => {
          setAudioUploadProgress(percent);
        });
        setEditingCantiga({
          ...editingCantiga,
          audioUrl: downloadUrl,
        });
        showToast('Áudio salvo com sucesso no Firebase Storage!', 'success');
      } catch (err) {
        console.warn('Fallback para pré-visualização local:', err);
        const url = URL.createObjectURL(file);
        setEditingCantiga({
          ...editingCantiga,
          audioUrl: url,
        });
        showToast('Áudio anexado para teste local.', 'info');
      } finally {
        setIsUploadingAudio(false);
      }
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#1C1917] rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg border border-[#E6D5AC]/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37]">
            <Shield className="w-4 h-4 text-[#D4AF37]" />
            <span className="uppercase tracking-wider">Painel de Jenifer de Ogun · Iyá Tèbíèse</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            Gestão & Fundamentos da Casa
          </h1>
          <p className="text-xs sm:text-sm text-gray-300">
            Cadastre cantigas, revise letras e áudios, aprove novos membros e gerencie o xirê de Ketu.
          </p>
        </div>

        {pendingUsers.length > 0 && (
          <div className="bg-[#9A3412] px-4 py-2.5 rounded-2xl flex items-center gap-2 self-start sm:self-auto text-xs font-bold text-white shadow-md">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-ping" />
            <span>{pendingUsers.length} membro(s) aguardando aprovação</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E6D5AC] pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('cantigas')}
          className={`px-4 py-2 text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'cantigas'
              ? 'border-[#9A3412] text-[#9A3412]'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Cantigas da Casa ({cantigas.length})
        </button>
        <button
          onClick={() => setActiveTab('membros')}
          className={`px-4 py-2 text-xs font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'membros'
              ? 'border-[#9A3412] text-[#9A3412]'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <span>Aprovação de Membros</span>
          {pendingUsers.length > 0 && (
            <span className="bg-[#9A3412] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {pendingUsers.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('orixas')}
          className={`px-4 py-2 text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'orixas'
              ? 'border-[#9A3412] text-[#9A3412]'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Orixás ({orixas.length})
        </button>
        <button
          onClick={() => setActiveTab('tipos')}
          className={`px-4 py-2 text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'tipos'
              ? 'border-[#9A3412] text-[#9A3412]'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Tipos de Cantiga ({tipos.length})
        </button>
      </div>

      {/* Tab Content 1: Cantigas */}
      {activeTab === 'cantigas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-600">
              Cantigas em revisão ficam <strong>ocultas</strong> para os membros até serem aprovadas pela responsável.
            </p>
            <button
              onClick={handleOpenNewCantiga}
              className="px-4 py-2.5 bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Nova Cantiga</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-[#E6D5AC] overflow-hidden shadow-xs divide-y divide-gray-100">
            {cantigas.map((c) => {
              const orixa = orixas.find((o) => o.id === c.orixaId);
              const tipo = tipos.find((t) => t.id === c.tipoId);

              return (
                <div
                  key={c.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF8F5] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-[#2C1810] flex items-center gap-1">
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ backgroundColor: orixa?.corPrimaria }}
                        />
                        {orixa?.nome}
                      </span>
                      <span aria-hidden="true" className="text-gray-300">·</span>
                      <span className="text-gray-500">{tipo?.nome}</span>
                      <span aria-hidden="true" className="text-gray-300">·</span>
                      <span className="text-gray-500">Toque {c.toqueAtabaque}</span>
                      {c.ehExemplo && (
                        <span className="bg-[#FAF8F5] border border-[#E6D5AC] text-[10px] text-[#78350F] px-1.5 rounded">
                          Exemplo
                        </span>
                      )}
                    </div>

                    <h3 className="font-display font-bold text-base sm:text-lg text-[#2C1810]">
                      {c.titulo}
                    </h3>

                    <p className="text-xs text-gray-500 line-clamp-1">
                      {c.versos.length} versos · "{c.versos[0]?.ioruba}"
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                    {/* Status Revision Toggle */}
                    <button
                      onClick={() => toggleRevisaoCantiga(c.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        c.revisada
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-50 text-amber-800 border border-amber-300'
                      }`}
                      title="Clique para alternar o status de revisão"
                    >
                      {c.revisada ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Revisada</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Em Revisão</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => openCantigaDetail(c.id)}
                      className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F5EBE1] text-[#59260B] border border-[#E6D5AC] rounded-xl text-xs font-semibold"
                    >
                      Ver
                    </button>

                    <button
                      onClick={() => handleEditCantiga(c)}
                      className="p-2 text-gray-600 hover:text-[#9A3412] hover:bg-gray-100 rounded-xl"
                      aria-label="Editar cantiga"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja excluir a cantiga "${c.titulo}"?`)) {
                          excluirCantiga(c.id);
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                      aria-label="Excluir cantiga"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content 2: Aprovação de Membros */}
      {activeTab === 'membros' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-display font-bold text-[#2C1810]">
              Solicitações de Acesso Pendentes
            </h2>
            <p className="text-xs text-gray-500">
              Para preservar os preceitos do terreiro, novos usuários só acessam as cantigas após aprovação da Iyá Tèbíèse.
            </p>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-[#E6D5AC] space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
              <h3 className="font-display font-bold text-base text-[#2C1810]">
                Nenhuma solicitação pendente no momento
              </h3>
              <p className="text-xs text-gray-500">
                Todos os membros cadastrados estão com seus acessos devidamente autorizados.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6D5AC] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-base text-[#2C1810]">
                        {user.nome}
                      </span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                        Pendente
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    {user.orixaGuia && (
                      <span className="text-[11px] text-[#78350F] italic">
                        Orixá Guia indicado: {user.orixaGuia}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => aprovarMembro(user.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Aprovar Membro</span>
                    </button>
                    <button
                      onClick={() => rejeitarMembro(user.id)}
                      className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <UserX className="w-4 h-4" />
                      <span>Recusar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List of already approved members */}
          <div className="pt-6">
            <h3 className="font-display font-bold text-sm text-[#2C1810] mb-3">
              Membros Ativos com Acesso Liberado ({users.filter((u) => u.aprovado).length})
            </h3>
            <div className="bg-white rounded-2xl border border-[#E6D5AC] divide-y divide-gray-100">
              {users
                .filter((u) => u.aprovado)
                .map((u) => (
                  <div
                    key={u.id}
                    className="p-3.5 px-4 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-[#2C1810] block">{u.nome}</span>
                      <span className="text-[#78350F]/70 text-[11px] font-medium">
                        {u.perfil === 'administradora' ? 'Iyá Tèbíèse' : u.email}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#92400E] bg-[#FEF3C7] px-2 py-0.5 rounded font-bold capitalize">
                      {u.perfil === 'administradora' ? 'Iyá Tèbíèse' : 'Membro'}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Orixás */}
      {activeTab === 'orixas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Cadastre ou ajuste as cores tradicionais e saudações sagradas dos orixás da casa.
            </p>
            <button
              onClick={() => {
                setEditingOrixa({
                  id: `orixa-${Date.now()}`,
                  nome: '',
                  corPrimaria: '#9A3412',
                  corSecundaria: '#7C2D12',
                  saudacao: '',
                  descricaoCurta: '',
                });
                setIsOrixaModalOpen(true);
              }}
              className="px-3.5 py-2 bg-[#9A3412] text-white rounded-xl text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Orixá</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {orixas.map((o) => (
              <div
                key={o.id}
                className="bg-white rounded-2xl p-4 border border-[#E6D5AC] flex items-start justify-between gap-3 relative overflow-hidden"
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5"
                  style={{ backgroundColor: o.corPrimaria }}
                />
                <div className="pl-2 space-y-1">
                  <h4 className="font-display font-bold text-sm text-[#2C1810]">{o.nome}</h4>
                  <p className="text-xs text-[#78350F] italic">"{o.saudacao}"</p>
                  <p className="text-[11px] text-gray-500 line-clamp-2">{o.descricaoCurta}</p>
                </div>
                <button
                  onClick={() => {
                    setEditingOrixa(o);
                    setIsOrixaModalOpen(true);
                  }}
                  className="text-gray-400 hover:text-[#9A3412] p-1"
                  aria-label={`Editar ${o.nome}`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 4: Tipos de Cantiga */}
      {activeTab === 'tipos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Categorias litúrgicas de cantigas (Reza, Xirê, Chamada, Saudação, etc.).
            </p>
            <button
              onClick={() => {
                setEditingTipo({
                  id: `tipo-${Date.now()}`,
                  nome: '',
                  descricao: '',
                });
                setIsTipoModalOpen(true);
              }}
              className="px-3.5 py-2 bg-[#9A3412] text-white rounded-xl text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Tipo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {tipos.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-2xl p-4 border border-[#E6D5AC] flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-sm text-[#2C1810]">{t.nome}</h4>
                  <p className="text-xs text-gray-600">{t.descricao}</p>
                </div>
                <button
                  onClick={() => {
                    setEditingTipo(t);
                    setIsTipoModalOpen(true);
                  }}
                  className="text-gray-400 hover:text-[#9A3412] p-1"
                  aria-label={`Editar ${t.nome}`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Cadastrar / Editar Cantiga */}
      {isCantigaModalOpen && editingCantiga && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl my-8 p-6 sm:p-8 border border-[#E6D5AC] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-[#2C1810]">
                  {editingCantiga.titulo ? 'Editar Cantiga' : 'Cadastrar Nova Cantiga'}
                </h3>
                <p className="text-xs text-gray-500">
                  Preencha letra em iorubá, pronúncia fonética e fundamento litúrgico
                </p>
              </div>
              <button
                onClick={() => setIsCantigaModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCantigaForm} className="space-y-5">
              {/* Basic Info: Title, Orixá, Tipo, Toque */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#78350F] mb-1">
                    Título da Cantiga *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCantiga.titulo}
                    onChange={(e) =>
                      setEditingCantiga({ ...editingCantiga, titulo: e.target.value })
                    }
                    placeholder="Ex: Ogum Nitá Ewé"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E6D5AC] rounded-xl text-xs text-[#2C1810] focus:ring-2 focus:ring-[#9A3412] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#78350F] mb-1">
                    Orixá Louvado *
                  </label>
                  <select
                    value={editingCantiga.orixaId}
                    onChange={(e) =>
                      setEditingCantiga({ ...editingCantiga, orixaId: e.target.value })
                    }
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E6D5AC] rounded-xl text-xs text-[#2C1810] focus:ring-2 focus:ring-[#9A3412]"
                  >
                    {orixas.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#78350F] mb-1">
                    Tipo de Cantiga *
                  </label>
                  <select
                    value={editingCantiga.tipoId}
                    onChange={(e) =>
                      setEditingCantiga({ ...editingCantiga, tipoId: e.target.value })
                    }
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E6D5AC] rounded-xl text-xs text-[#2C1810] focus:ring-2 focus:ring-[#9A3412]"
                  >
                    {tipos.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#78350F] mb-1">
                    Toque de Atabaque
                  </label>
                  <select
                    value={editingCantiga.toqueAtabaque}
                    onChange={(e) =>
                      setEditingCantiga({
                        ...editingCantiga,
                        toqueAtabaque: e.target.value as any,
                      })
                    }
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E6D5AC] rounded-xl text-xs text-[#2C1810] focus:ring-2 focus:ring-[#9A3412]"
                  >
                    <option value="Ijexá">Ijexá</option>
                    <option value="Bravum">Bravum</option>
                    <option value="Ilú">Ilú</option>
                    <option value="Alujá">Alujá</option>
                    <option value="Adarrum">Adarrum</option>
                    <option value="Hamunha">Hamunha</option>
                    <option value="Oloyá">Oloyá</option>
                    <option value="Vassi">Vassi</option>
                  </select>
                </div>
              </div>

              {/* Verses Editor */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-display font-bold text-sm text-[#2C1810]">
                      Letra em Iorubá, Pronúncia e Tradução Verso a Verso
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Adicione quantos versos compõem a cantiga litúrgica
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVerse}
                    className="text-xs font-bold text-[#9A3412] hover:text-[#7C2D12] flex items-center gap-1"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Adicionar Verso</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {editingCantiga.versos.map((verso, idx) => (
                    <div
                      key={verso.id}
                      className="p-3.5 bg-[#FAF8F5] border border-[#E6D5AC] rounded-2xl space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#78350F] uppercase">
                          Verso {idx + 1}
                        </span>
                        {editingCantiga.versos.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveVerse(verso.id)}
                            className="text-[11px] text-red-500 hover:text-red-700"
                          >
                            Remover verso
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">
                            Texto em Iorubá *
                          </label>
                          <input
                            type="text"
                            required
                            value={verso.ioruba}
                            onChange={(e) =>
                              handleVerseChange(verso.id, 'ioruba', e.target.value)
                            }
                            placeholder="Ex: Ògún onirê, onirê Ògún"
                            className="w-full p-2 bg-white border border-[#E6D5AC] rounded-xl text-xs text-[#2C1810]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">
                            Guia de Pronúncia (fonética em português) *
                          </label>
                          <input
                            type="text"
                            required
                            value={verso.pronuncia}
                            onChange={(e) =>
                              handleVerseChange(verso.id, 'pronuncia', e.target.value)
                            }
                            placeholder="Ex: Ogum onirê, onirê Ogum"
                            className="w-full p-2 bg-white border border-[#E6D5AC] rounded-xl text-xs text-[#2C1810]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">
                            Tradução em Português *
                          </label>
                          <input
                            type="text"
                            required
                            value={verso.traducao}
                            onChange={(e) =>
                              handleVerseChange(verso.id, 'traducao', e.target.value)
                            }
                            placeholder="Ex: Ogum, senhor da cidade de Irê"
                            className="w-full p-2 bg-white border border-[#E6D5AC] rounded-xl text-xs text-[#2C1810]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ritual & House Notes */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-[#78350F] mb-1">
                    Quando é cantada (Momento Ritual)
                  </label>
                  <textarea
                    rows={2}
                    value={editingCantiga.quandoCantada}
                    onChange={(e) =>
                      setEditingCantiga({
                        ...editingCantiga,
                        quandoCantada: e.target.value,
                      })
                    }
                    placeholder="Ex: Cantada durante a abertura do Xirê de Ogum no barracão..."
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E6D5AC] rounded-xl text-xs text-[#2C1810] focus:ring-2 focus:ring-[#9A3412]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#78350F] mb-1">
                    Observações e Recomendações da Casa
                  </label>
                  <textarea
                    rows={2}
                    value={editingCantiga.observacoes}
                    onChange={(e) =>
                      setEditingCantiga({
                        ...editingCantiga,
                        observacoes: e.target.value,
                      })
                    }
                    placeholder="Ex: Postura com a mão no solo, repique do Rum..."
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E6D5AC] rounded-xl text-xs text-[#2C1810] focus:ring-2 focus:ring-[#9A3412]"
                  />
                </div>

                {/* Audio Upload Option */}
                <div>
                  <label className="block text-xs font-bold text-[#78350F] mb-1">
                    Upload de Áudio Gravado na Casa (opcional)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="audio/*"
                      disabled={isUploadingAudio}
                      onChange={handleAudioFileChange}
                      className="text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#F5EBE1] file:text-[#9A3412] hover:file:bg-[#E6D5AC]"
                    />
                    {isUploadingAudio ? (
                      <span className="text-xs text-[#9A3412] font-semibold animate-pulse">
                        Enviando... {audioUploadProgress}%
                      </span>
                    ) : editingCantiga.audioUrl ? (
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Áudio anexado
                      </span>
                    ) : null}
                  </div>
                  {isUploadingAudio && (
                    <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-[#9A3412] h-full transition-all duration-200"
                        style={{ width: `${audioUploadProgress}%` }}
                      />
                    </div>
                  )}
                  <p className="text-[10px] text-gray-400 mt-1">
                    Se nenhum áudio for enviado, o sistema usará o motor rítmico tradicional com atabaques e pronúncia em voz.
                  </p>
                </div>

                {/* Status Toggle */}
                <div className="pt-2 flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingCantiga.revisada}
                      onChange={(e) =>
                        setEditingCantiga({
                          ...editingCantiga,
                          revisada: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-[#9A3412] rounded border-[#E6D5AC] focus:ring-[#9A3412]"
                    />
                    <span className="text-xs font-bold text-[#2C1810]">
                      Marcar como "Revisada" (tornar visível imediatamente para todos os membros)
                    </span>
                  </label>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCantigaModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#9A3412] hover:bg-[#7C2D12] text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Salvar Cantiga no Acervo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Cadastrar / Editar Orixá */}
      {isOrixaModalOpen && editingOrixa && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 border border-[#E6D5AC] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-display font-bold text-base text-[#2C1810]">
                Configuração do Orixá
              </h3>
              <button
                onClick={() => setIsOrixaModalOpen(false)}
                className="text-gray-400 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nome do Orixá
                </label>
                <input
                  type="text"
                  value={editingOrixa.nome}
                  onChange={(e) =>
                    setEditingOrixa({ ...editingOrixa, nome: e.target.value })
                  }
                  className="w-full p-2 bg-[#FAF8F5] border border-[#E6D5AC] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Cor Tradicional de Destaque
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={editingOrixa.corPrimaria}
                    onChange={(e) =>
                      setEditingOrixa({ ...editingOrixa, corPrimaria: e.target.value })
                    }
                    className="w-10 h-8 rounded-lg cursor-pointer border border-[#E6D5AC]"
                  />
                  <span className="text-xs font-mono">{editingOrixa.corPrimaria}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Saudação Tradicional
                </label>
                <input
                  type="text"
                  value={editingOrixa.saudacao}
                  onChange={(e) =>
                    setEditingOrixa({ ...editingOrixa, saudacao: e.target.value })
                  }
                  placeholder="Ex: Ògún Yè!"
                  className="w-full p-2 bg-[#FAF8F5] border border-[#E6D5AC] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Descrição Curta
                </label>
                <textarea
                  rows={2}
                  value={editingOrixa.descricaoCurta}
                  onChange={(e) =>
                    setEditingOrixa({ ...editingOrixa, descricaoCurta: e.target.value })
                  }
                  className="w-full p-2 bg-[#FAF8F5] border border-[#E6D5AC] rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setIsOrixaModalOpen(false)}
                className="px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  salvarOrixa(editingOrixa);
                  setIsOrixaModalOpen(false);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#9A3412] rounded-xl"
              >
                Salvar Orixá
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Cadastrar / Editar Tipo */}
      {isTipoModalOpen && editingTipo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 border border-[#E6D5AC] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-display font-bold text-base text-[#2C1810]">
                Tipo de Cantiga
              </h3>
              <button
                onClick={() => setIsTipoModalOpen(false)}
                className="text-gray-400 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nome do Tipo
                </label>
                <input
                  type="text"
                  value={editingTipo.nome}
                  onChange={(e) =>
                    setEditingTipo({ ...editingTipo, nome: e.target.value })
                  }
                  placeholder="Ex: Reza, Xirê, Chamada..."
                  className="w-full p-2 bg-[#FAF8F5] border border-[#E6D5AC] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  rows={2}
                  value={editingTipo.descricao}
                  onChange={(e) =>
                    setEditingTipo({ ...editingTipo, descricao: e.target.value })
                  }
                  className="w-full p-2 bg-[#FAF8F5] border border-[#E6D5AC] rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setIsTipoModalOpen(false)}
                className="px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  salvarTipo(editingTipo);
                  setIsTipoModalOpen(false);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#9A3412] rounded-xl"
              >
                Salvar Tipo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
