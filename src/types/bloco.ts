export interface PontoPercurso {
  lat: number;
  lng: number;
  endereco?: string;
  rua?: string;
}

export interface Camera {
  id: string;
  lat: number;
  lng: number;
  nome: string;
  codigo: string;
}

export interface Bloco {
  id: number;
  nome: string;
  data: string;
  dataRelativa: string;
  bairro: string;
  subprefeitura: string;
  regiao: string; // Zona: ZONA SUL, ZONA NORTE, ZONA OESTE, CENTRO, etc.
  publicoEstimado: number;
  localConcentracao: string;
  horaConcentracao: string;
  horaInicio: string;
  horaTermino: string;
  percursoDetalhado: string;
  localDispersao: string;
  formaApresentacao: 'COM DESLOCAMENTO' | 'PARADO';
  estrutura: string;
  situacao: string;
  lat: number;
  lng: number;
  temPercurso: boolean;
  percurso: PontoPercurso[];
}

export interface Filtros {
  data: string;
  zona: string;
  subprefeitura: string;
  tipo: 'todos' | 'deslocamento' | 'parado';
  busca: string;
}

export interface Estatisticas {
  totalBlocos: number;
  publicoTotal: number;
  comDeslocamento: number;
  parados: number;
}

export type Subprefeitura =
  | 'CENTRO'
  | 'ZONA SUL'
  | 'GRANDE TIJUCA'
  | 'ZONA NORTE'
  | 'ILHAS'
  | 'ZONA OESTE 1'
  | 'ZONA OESTE 2'
  | 'ZONA OESTE 3'
  | 'BARRA, RECREIO E VARGENS'
  | 'JACAREPAGUÁ';
