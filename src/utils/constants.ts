// Constantes do projeto

// Centro ajustado para mostrar toda a região metropolitana do Rio
export const RIO_CENTER: [number, number] = [-22.92, -43.40];
export const DEFAULT_ZOOM = 11;
export const DEFAULT_ZOOM_MOBILE = 9;

export const ZONAS = [
  'ZONA SUL',
  'ZONA NORTE',
  'ZONA OESTE',
  'CENTRO',
] as const;

export const SUBPREFEITURAS = [
  'CENTRO',
  'ZONA SUL',
  'GRANDE TIJUCA',
  'ZONA NORTE',
  'ILHAS',
  'ZONA OESTE 1',
  'ZONA OESTE 2',
  'ZONA OESTE 3',
  'BARRA, RECREIO E VARGENS',
  'JACAREPAGUÁ',
] as const;

export const TIPOS_APRESENTACAO = {
  todos: 'Todos',
  deslocamento: 'Com Deslocamento',
  parado: 'Parado',
} as const;

// Faixas de público conforme padrão da Prefeitura
export const FAIXAS_PUBLICO = {
  todos: { label: 'Todos', min: 0, max: Infinity },
  ate_2000: { label: 'Até 2.000', min: 0, max: 2000 },
  de_2001_a_10000: { label: 'De 2.001 a 10.000', min: 2001, max: 10000 },
  de_10001_a_50000: { label: 'De 10.001 a 50.000', min: 10001, max: 50000 },
  de_50001_a_100000: { label: 'De 50.001 a 100.000', min: 50001, max: 100000 },
  acima_100000: { label: 'Acima de 100.000', min: 100001, max: Infinity },
} as const;

export type FaixaPublico = keyof typeof FAIXAS_PUBLICO;

// Cores de estágio baseadas no público (padrão Prefeitura do Rio)
export const CORES_ESTAGIO = {
  estagio1: { cor: '#22C55E', label: 'Estágio 1', min: 0, max: 2000 },         // Verde
  estagio2: { cor: '#EAB308', label: 'Estágio 2', min: 2001, max: 10000 },     // Amarelo
  estagio3: { cor: '#F97316', label: 'Estágio 3', min: 10001, max: 50000 },    // Laranja
  estagio4: { cor: '#EF4444', label: 'Estágio 4', min: 50001, max: 100000 },   // Vermelho
  estagio5: { cor: '#8B5CF6', label: 'Estágio 5', min: 100001, max: Infinity }, // Roxo
} as const;

// Função para obter cor do estágio baseado no público estimado
export function getCorEstagio(publicoEstimado: number): { cor: string; estagio: number; label: string } {
  if (publicoEstimado <= 2000) {
    return { cor: CORES_ESTAGIO.estagio1.cor, estagio: 1, label: CORES_ESTAGIO.estagio1.label };
  }
  if (publicoEstimado <= 10000) {
    return { cor: CORES_ESTAGIO.estagio2.cor, estagio: 2, label: CORES_ESTAGIO.estagio2.label };
  }
  if (publicoEstimado <= 50000) {
    return { cor: CORES_ESTAGIO.estagio3.cor, estagio: 3, label: CORES_ESTAGIO.estagio3.label };
  }
  if (publicoEstimado <= 100000) {
    return { cor: CORES_ESTAGIO.estagio4.cor, estagio: 4, label: CORES_ESTAGIO.estagio4.label };
  }
  return { cor: CORES_ESTAGIO.estagio5.cor, estagio: 5, label: CORES_ESTAGIO.estagio5.label };
}

export const TILE_LAYERS = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  voyager: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', // Estilo Google Maps
  osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
};

export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

// Tamanhos de marcador baseado no público
export function getMarkerRadius(publico: number): number {
  if (publico >= 500000) return 20;
  if (publico >= 100000) return 16;
  if (publico >= 50000) return 12;
  if (publico >= 10000) return 10;
  if (publico >= 5000) return 8;
  return 6;
}

// Datas relativas do carnaval 2026
export const DATAS_CARNAVAL = {
  '2026-02-14': 'SÁBADO DE CARNAVAL',
  '2026-02-15': 'DOMINGO DE CARNAVAL',
  '2026-02-16': 'SEGUNDA DE CARNAVAL',
  '2026-02-17': 'TERÇA DE CARNAVAL',
  '2026-02-18': 'QUARTA DE CINZAS',
} as const;
