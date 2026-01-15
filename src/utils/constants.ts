// Constantes do projeto

// Centro ajustado para mostrar toda a região metropolitana do Rio
export const RIO_CENTER: [number, number] = [-22.92, -43.40];
export const DEFAULT_ZOOM = 11;

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
