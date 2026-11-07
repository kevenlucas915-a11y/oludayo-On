export type PerfilUsuario = 'membro' | 'administradora';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  aprovado: boolean;
  orixaGuia?: string;
  criadoEm: string;
}

export interface Orixa {
  id: string;
  nome: string;
  corPrimaria: string;
  corSecundaria: string;
  saudacao: string;
  descricaoCurta: string;
  elemento?: string;
  toquePrincipal?: string;
}

export interface TermoGlossario {
  id: string;
  termo: string;
  pronunciaFonetica: string;
  traducao: string;
  categoria: 'saudacao' | 'cargo' | 'ritmo' | 'conceito' | 'liturgia' | 'elemento';
  significadoLiturgico: string;
  exemploUsoIoruba: string;
  exemploUsoTraducao: string;
  orixaRelacionadoId?: string;
}

export interface TipoCantiga {
  id: string;
  nome: string;
  descricao: string;
}

export interface Verso {
  id: string;
  ordem: number;
  ioruba: string;
  pronuncia: string;
  traducao: string;
}

export interface Cantiga {
  id: string;
  titulo: string;
  orixaId: string;
  tipoId: string;
  audioUrl?: string; // custom audio or generated rhythm
  toqueAtabaque: 'Ijexá' | 'Bravum' | 'Ilú' | 'Alujá' | 'Adarrum' | 'Hamunha' | 'Oloyá' | 'Vassi';
  versos: Verso[];
  quandoCantada: string; // Momento ritual
  observacoes: string; // Observações da casa
  revisada: boolean; // Só revisadas aparecem para membros
  ehExemplo: boolean; // Marcado como [Exemplo da Casa] para ser substituído
  criadoEm: string;
  atualizadoEm: string;
}

export interface ProgressoUsuario {
  usuarioId: string;
  cantigasAprendidas: string[]; // ids de cantigas
  pontos: number; // Axé XP
  sequenciaDias: number; // Streak
  ultimaAtividadeData: string;
  licoesFeitas: number;
  medalhasDesbloqueadas: string[]; // ids de medalhas
}

export interface Medalha {
  id: string;
  titulo: string;
  descricao: string;
  icone: string;
  criterio: string;
}

export type TipoExercicio =
  | 'ouvir_escolher'
  | 'completar_palavra'
  | 'ligar_traducao'
  | 'ordenar_versos'
  | 'cantar_junto';

export interface ExercicioOuvirEscolher {
  tipo: 'ouvir_escolher';
  id: string;
  pergunta: string;
  versoAlvo: Verso;
  opcoes: string[]; // Letras em ioruba
  respostaCorreta: string;
}

export interface ExercicioCompletarPalavra {
  tipo: 'completar_palavra';
  id: string;
  pergunta: string;
  versoOriginal: Verso;
  textoComLacuna: string;
  palavraOmitida: string;
  opcoes: string[];
}

export interface ParTraducao {
  id: string;
  ioruba: string;
  traducao: string;
}

export interface ExercicioLigarTraducao {
  tipo: 'ligar_traducao';
  id: string;
  pergunta: string;
  pares: ParTraducao[];
}

export interface ExercicioOrdenarVersos {
  tipo: 'ordenar_versos';
  id: string;
  pergunta: string;
  versosEmbaralhados: Verso[];
  ordemCorretaIds: string[];
}

export interface ExercicioCantarJunto {
  tipo: 'cantar_junto';
  id: string;
  pergunta: string;
  versos: Verso[];
  duracaoTotalSegundos: number;
}

export type Exercicio =
  | ExercicioOuvirEscolher
  | ExercicioCompletarPalavra
  | ExercicioLigarTraducao
  | ExercicioOrdenarVersos
  | ExercicioCantarJunto;

export interface Licao {
  cantigaId: string;
  tituloCantiga: string;
  orixaNome: string;
  exercicios: Exercicio[];
}
