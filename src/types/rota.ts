import type { Bloco } from './bloco';
import type { WazeAlert } from './waze';

export interface Coordenada {
  lat: number;
  lng: number;
}

export interface RotaInfo {
  origem: Coordenada;
  destino: Coordenada;
  blocoDestino: Bloco;
  distanciaKm: number;
  duracaoMinutos: number;
  polyline: Coordenada[];
  instrucoes?: InstrucaoRota[];
  alertasNaRota: WazeAlert[];
}

export interface InstrucaoRota {
  texto: string;
  distancia: number;
  tipo: string;
}

export interface OrigemUsuario {
  tipo: 'gps' | 'endereco';
  coordenadas: Coordenada;
  endereco?: string;
}
