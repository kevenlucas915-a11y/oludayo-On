import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType, testFirestoreConnection } from '../lib/firebase';
import {
  Cantiga,
  Medalha,
  Orixa,
  ProgressoUsuario,
  TipoCantiga,
  Usuario,
} from '../types';
import {
  MEDALHAS_DEFINIDAS,
  SEED_CANTIGAS,
  SEED_ORIXAS,
  SEED_PROGRESSOS,
  SEED_TIPOS,
  SEED_USUARIOS,
} from '../data/seedData';
import {
  calculateLessonXP,
  calculateStreak,
  checkMedalUnlocks,
} from '../utils/lessonGenerator';

interface AppContextType {
  currentUser: Usuario | null;
  users: Usuario[];
  cantigas: Cantiga[];
  orixas: Orixa[];
  tipos: TipoCantiga[];
  medalhas: Medalha[];
  progresso: ProgressoUsuario;
  allProgressos: Record<string, ProgressoUsuario>;
  currentView: 'inicio' | 'cantigas' | 'cantiga-detalhe' | 'licao' | 'progresso' | 'ranking' | 'admin' | 'glossario';
  selectedCantigaId: string | null;
  selectedOrixaFilter: string | null;
  selectedTipoFilter: string | null;
  isAuthModalOpen: boolean;
  activeToast: { message: string; type: 'success' | 'info' | 'error' } | null;
  isFirestoreConnected: boolean;

  // Actions
  setCurrentView: (view: 'inicio' | 'cantigas' | 'cantiga-detalhe' | 'licao' | 'progresso' | 'ranking' | 'admin' | 'glossario') => void;
  openCantigaDetail: (id: string) => void;
  openGlossario: () => void;
  startLesson: (id: string) => void;
  setSelectedOrixaFilter: (id: string | null) => void;
  setSelectedTipoFilter: (id: string | null) => void;
  setIsAuthModalOpen: (open: boolean) => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  solicitarCadastro: (nome: string, email: string, password?: string, orixaGuia?: string) => Promise<{ success: boolean; message: string }>;
  aprovarMembro: (userId: string) => Promise<void>;
  rejeitarMembro: (userId: string) => Promise<void>;
  switchUser: (userId: string) => void;
  salvarCantiga: (cantiga: Cantiga) => Promise<void>;
  excluirCantiga: (cantigaId: string) => Promise<void>;
  toggleRevisaoCantiga: (cantigaId: string) => Promise<void>;
  salvarOrixa: (orixa: Orixa) => Promise<void>;
  salvarTipo: (tipo: TipoCantiga) => Promise<void>;
  completarLicao: (cantigaId: string, acertos: number, total: number) => Promise<{ xpGanho: number; novasMedalhas: string[]; cantigaAprendida: boolean }>;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<Usuario[]>(SEED_USUARIOS);
  const [currentUserId, setCurrentUserId] = useState<string>('user-admin-jenifer');
  const [cantigas, setCantigas] = useState<Cantiga[]>(SEED_CANTIGAS);
  const [orixas, setOrixas] = useState<Orixa[]>(SEED_ORIXAS);
  const [tipos, setTipos] = useState<TipoCantiga[]>(SEED_TIPOS);
  const [allProgressos, setAllProgressos] = useState<Record<string, ProgressoUsuario>>(SEED_PROGRESSOS);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(false);

  const [currentView, setCurrentView] = useState<'inicio' | 'cantigas' | 'cantiga-detalhe' | 'licao' | 'progresso' | 'ranking' | 'admin' | 'glossario'>('inicio');
  const [selectedCantigaId, setSelectedCantigaId] = useState<string | null>(null);
  const [selectedOrixaFilter, setSelectedOrixaFilter] = useState<string | null>(null);
  const [selectedTipoFilter, setSelectedTipoFilter] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setActiveToast({ message, type });
    setTimeout(() => {
      setActiveToast((curr) => (curr?.message === message ? null : curr));
    }, 3500);
  };

  // Test connection & seed initial data if collections are empty
  useEffect(() => {
    async function initFirestore() {
      const ok = await testFirestoreConnection();
      setIsFirestoreConnected(ok);
    }
    initFirestore();
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const matched = users.find(
          (u) => u.id === fbUser.uid || u.email.toLowerCase() === fbUser.email?.toLowerCase()
        );
        if (matched) {
          setCurrentUserId(matched.id);
        }
      }
    });
    return () => unsub();
  }, [users]);

  // Real-time Firestore sync for Orixás
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'orixas'),
      (snap) => {
        if (!snap.empty) {
          const list: Orixa[] = [];
          snap.forEach((docSnap) => list.push(docSnap.data() as Orixa));
          setOrixas(list);
        } else {
          // Seed Orixas
          const batch = writeBatch(db);
          SEED_ORIXAS.forEach((o) => {
            batch.set(doc(db, 'orixas', o.id), o);
          });
          batch.commit().catch(() => {});
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'orixas');
      }
    );
    return () => unsub();
  }, []);

  // Real-time Firestore sync for Tipos de Cantiga
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'tipos'),
      (snap) => {
        if (!snap.empty) {
          const list: TipoCantiga[] = [];
          snap.forEach((docSnap) => list.push(docSnap.data() as TipoCantiga));
          setTipos(list);
        } else {
          // Seed Tipos
          const batch = writeBatch(db);
          SEED_TIPOS.forEach((t) => {
            batch.set(doc(db, 'tipos', t.id), t);
          });
          batch.commit().catch(() => {});
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'tipos');
      }
    );
    return () => unsub();
  }, []);

  // Real-time Firestore sync for Cantigas
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'cantigas'),
      (snap) => {
        if (!snap.empty) {
          const list: Cantiga[] = [];
          snap.forEach((docSnap) => list.push(docSnap.data() as Cantiga));
          setCantigas(list);
        } else {
          // Seed initial cantigas into Firestore
          const batch = writeBatch(db);
          SEED_CANTIGAS.forEach((c) => {
            batch.set(doc(db, 'cantigas', c.id), c);
          });
          batch.commit().catch(() => {});
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'cantigas');
      }
    );
    return () => unsub();
  }, []);

  // Real-time Firestore sync for Usuários
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'usuarios'),
      (snap) => {
        if (!snap.empty) {
          const list: Usuario[] = [];
          snap.forEach((docSnap) => {
            list.push(docSnap.data() as Usuario);
          });
          setUsers(list);
        } else {
          // Initialize Jenifer as sole initial admin if collection is empty
          const jenifer = SEED_USUARIOS[0];
          setDoc(doc(db, 'usuarios', jenifer.id), jenifer).catch(() => {});
          setDoc(doc(db, 'progressos', jenifer.id), SEED_PROGRESSOS[jenifer.id]).catch(() => {});
          setUsers([jenifer]);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'usuarios');
      }
    );
    return () => unsub();
  }, []);

  // Real-time Firestore sync for Progressos e Ranking
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'progressos'),
      (snap) => {
        const dict: Record<string, ProgressoUsuario> = {};
        snap.forEach((docSnap) => {
          const data = docSnap.data() as ProgressoUsuario;
          dict[data.usuarioId] = data;
        });

        if (!dict['user-admin-jenifer'] && SEED_PROGRESSOS['user-admin-jenifer']) {
          dict['user-admin-jenifer'] = SEED_PROGRESSOS['user-admin-jenifer'];
        }

        setAllProgressos(dict);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'progressos');
      }
    );
    return () => unsub();
  }, []);

  const currentUser = users.find((u) => u.id === currentUserId) || users[0] || null;

  const currentProgresso: ProgressoUsuario = (currentUserId && allProgressos[currentUserId]) || {
    usuarioId: currentUserId || 'guest',
    cantigasAprendidas: [],
    pontos: 0,
    sequenciaDias: 0,
    ultimaAtividadeData: new Date().toISOString(),
    licoesFeitas: 0,
    medalhasDesbloqueadas: [],
  };

  const openCantigaDetail = (id: string) => {
    setSelectedCantigaId(id);
    setCurrentView('cantiga-detalhe');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openGlossario = () => {
    setCurrentView('glossario');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startLesson = (id: string) => {
    setSelectedCantigaId(id);
    setCurrentView('licao');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const login = async (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find((u) => u.email.trim().toLowerCase() === cleanEmail);
    if (!found) {
      return { success: false, message: 'E-mail não encontrado na casa. Solicite autorização à Iyá Tèbíèse (Jenifer de Ogun).' };
    }
    if (!found.aprovado) {
      return {
        success: false,
        message: 'Acesso restrito: seu cadastro ainda aguarda aprovação da Iyá Tèbíèse.',
      };
    }

    if (password && password.trim().length > 0) {
      try {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      } catch (authErr: unknown) {
        const err = authErr as { code?: string };
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          try {
            await createUserWithEmailAndPassword(auth, cleanEmail, password);
          } catch {
            // Proceed with user document matching
          }
        }
      }
    }

    setCurrentUserId(found.id);
    setIsAuthModalOpen(false);
    showToast(`Mojubá, ${found.nome}! Bem-vindo(a) de volta.`, 'success');
    return { success: true, message: 'Login realizado com sucesso.' };
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {}
    setCurrentUserId('');
    showToast('Sessão encerrada com respeito.', 'info');
  };

  const solicitarCadastro = async (nome: string, email: string, password?: string, orixaGuia?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const exists = users.find((u) => u.email.trim().toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, message: 'Este e-mail já está cadastrado na casa.' };
    }

    let uid = `user-${Date.now()}`;
    if (password && password.length >= 6) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        uid = cred.user.uid;
      } catch (authErr: unknown) {
        const err = authErr as { code?: string };
        if (err.code !== 'auth/email-already-in-use') {
          console.warn('Firebase Auth sign up notice:', authErr);
        }
      }
    }

    const newUser: Usuario = {
      id: uid,
      nome: nome.trim(),
      email: cleanEmail,
      perfil: 'membro',
      aprovado: false, // Requer aprovação da Iyá Tèbíèse
      orixaGuia: orixaGuia || '',
      criadoEm: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'usuarios', newUser.id), newUser);
      return {
        success: true,
        message: 'Solicitação gravada no Firebase! Aguarde a aprovação da Iyá Tèbíèse.',
      };
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `usuarios/${newUser.id}`);
      return {
        success: false,
        message: 'Falha ao registrar solicitação. Verifique a conexão com o Firebase.',
      };
    }
  };

  const aprovarMembro = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'usuarios', userId), { aprovado: true });
      // Initialize progression document if not present
      const progDoc = doc(db, 'progressos', userId);
      await setDoc(
        progDoc,
        {
          usuarioId: userId,
          cantigasAprendidas: [],
          pontos: 0,
          sequenciaDias: 0,
          ultimaAtividadeData: new Date().toISOString(),
          licoesFeitas: 0,
          medalhasDesbloqueadas: [],
        },
        { merge: true }
      );
      showToast('Membro aprovado com sucesso! Acesso liberado no Firebase.', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `usuarios/${userId}`);
    }
  };

  const rejeitarMembro = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'usuarios', userId));
      await deleteDoc(doc(db, 'progressos', userId)).catch(() => {});
      showToast('Solicitação removida do Firebase.', 'info');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `usuarios/${userId}`);
    }
  };

  const switchUser = (userId: string) => {
    const u = users.find((item) => item.id === userId);
    if (u) {
      setCurrentUserId(userId);
      showToast(`Conectado como ${u.nome} (${u.perfil === 'administradora' ? 'Iyá Tèbíèse' : 'Membro'})`, 'info');
    }
  };

  const salvarCantiga = async (cantiga: Cantiga) => {
    try {
      await setDoc(doc(db, 'cantigas', cantiga.id), {
        ...cantiga,
        atualizadoEm: new Date().toISOString(),
      });
      showToast('Cantiga salva com persistência real no Firestore!', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `cantigas/${cantiga.id}`);
    }
  };

  const excluirCantiga = async (cantigaId: string) => {
    try {
      await deleteDoc(doc(db, 'cantigas', cantigaId));
      showToast('Cantiga excluída do Firebase.', 'info');
      if (selectedCantigaId === cantigaId) {
        setSelectedCantigaId(null);
        setCurrentView('cantigas');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `cantigas/${cantigaId}`);
    }
  };

  const toggleRevisaoCantiga = async (cantigaId: string) => {
    const target = cantigas.find((c) => c.id === cantigaId);
    if (!target) return;
    const novoStatus = !target.revisada;
    try {
      await updateDoc(doc(db, 'cantigas', cantigaId), {
        revisada: novoStatus,
        atualizadoEm: new Date().toISOString(),
      });
      showToast(
        novoStatus
          ? 'Cantiga REVISADA: sincronizada na nuvem e liberada para os membros!'
          : 'Cantiga EM REVISÃO: ocultada dos membros na nuvem.',
        novoStatus ? 'success' : 'info'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `cantigas/${cantigaId}`);
    }
  };

  const salvarOrixa = async (orixa: Orixa) => {
    try {
      await setDoc(doc(db, 'orixas', orixa.id), orixa);
      showToast(`Orixá ${orixa.nome} salvo no Firebase!`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `orixas/${orixa.id}`);
    }
  };

  const salvarTipo = async (tipo: TipoCantiga) => {
    try {
      await setDoc(doc(db, 'tipos', tipo.id), tipo);
      showToast(`Tipo de cantiga "${tipo.nome}" salvo no Firebase!`, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `tipos/${tipo.id}`);
    }
  };

  const completarLicao = async (cantigaId: string, acertos: number, total: number) => {
    if (!currentUser) return { xpGanho: 0, novasMedalhas: [], cantigaAprendida: false };

    const xpGanho = calculateLessonXP(acertos, total);
    const accuracy = total > 0 ? acertos / total : 0;
    const isMastered = accuracy >= 0.7;

    const prevProg = currentProgresso;
    const newLearned =
      isMastered && !prevProg.cantigasAprendidas.includes(cantigaId)
        ? [...prevProg.cantigasAprendidas, cantigaId]
        : prevProg.cantigasAprendidas;

    const newStreak = calculateStreak(prevProg.sequenciaDias, prevProg.ultimaAtividadeData);

    const updatedProg: ProgressoUsuario = {
      ...prevProg,
      usuarioId: currentUser.id,
      cantigasAprendidas: newLearned,
      pontos: prevProg.pontos + xpGanho,
      sequenciaDias: newStreak,
      licoesFeitas: prevProg.licoesFeitas + 1,
      ultimaAtividadeData: new Date().toISOString(),
    };

    const newMedalIds = checkMedalUnlocks(updatedProg, cantigas, accuracy);
    if (newMedalIds.length > 0) {
      updatedProg.medalhasDesbloqueadas = Array.from(
        new Set([...updatedProg.medalhasDesbloqueadas, ...newMedalIds])
      );
    }

    try {
      await setDoc(doc(db, 'progressos', currentUser.id), updatedProg, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `progressos/${currentUser.id}`);
    }

    return {
      xpGanho,
      novasMedalhas: newMedalIds,
      cantigaAprendida: isMastered && !prevProg.cantigasAprendidas.includes(cantigaId),
    };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        cantigas,
        orixas,
        tipos,
        medalhas: MEDALHAS_DEFINIDAS,
        progresso: currentProgresso,
        allProgressos,
        currentView,
        selectedCantigaId,
        selectedOrixaFilter,
        selectedTipoFilter,
        isAuthModalOpen,
        activeToast,
        isFirestoreConnected,
        setCurrentView,
        openCantigaDetail,
        openGlossario,
        startLesson,
        setSelectedOrixaFilter,
        setSelectedTipoFilter,
        setIsAuthModalOpen,
        login,
        logout,
        solicitarCadastro,
        aprovarMembro,
        rejeitarMembro,
        switchUser,
        salvarCantiga,
        excluirCantiga,
        toggleRevisaoCantiga,
        salvarOrixa,
        salvarTipo,
        completarLicao,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
