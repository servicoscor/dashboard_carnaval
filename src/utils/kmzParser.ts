import JSZip from 'jszip';
import { kml } from '@tmcw/togeojson';
import type { FeatureCollection, Feature, LineString, MultiLineString, Point, Position } from 'geojson';

export interface PercursoKMZ {
  id: string;
  nome: string;
  coordenadas: [number, number][]; // [lat, lng]
  pontoInicio: [number, number];
  pontoFim: [number, number];
  distanciaMetros: number;
  cor?: string;
}

export interface IndicePercursos {
  blocos: {
    id: number;
    nome: string;
    arquivo: string;
  }[];
  ultimaAtualizacao: string;
}

/**
 * Extrai o conteúdo KML de um arquivo KMZ
 */
export async function extrairKMLdeKMZ(kmzData: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(kmzData);

  // KMZ geralmente contém um arquivo doc.kml ou outro .kml
  const kmlFile = Object.keys(zip.files).find(name =>
    name.endsWith('.kml') && !name.startsWith('__MACOSX')
  );

  if (!kmlFile) {
    throw new Error('Arquivo KML não encontrado dentro do KMZ');
  }

  const kmlContent = await zip.file(kmlFile)?.async('string');
  if (!kmlContent) {
    throw new Error('Não foi possível ler o conteúdo do KML');
  }

  return kmlContent;
}

/**
 * Converte KML para GeoJSON
 */
export function kmlParaGeoJSON(kmlString: string): FeatureCollection {
  const parser = new DOMParser();
  const kmlDoc = parser.parseFromString(kmlString, 'text/xml');
  return kml(kmlDoc) as FeatureCollection;
}

/**
 * Extrai coordenadas de uma Feature GeoJSON (LineString ou MultiLineString)
 */
function extrairCoordenadasDeFeature(feature: Feature): [number, number][] {
  const coords: [number, number][] = [];

  if (feature.geometry.type === 'LineString') {
    const geom = feature.geometry as LineString;
    // GeoJSON usa [lng, lat], convertemos para [lat, lng]
    geom.coordinates.forEach((coord: Position) => {
      coords.push([coord[1], coord[0]]);
    });
  } else if (feature.geometry.type === 'MultiLineString') {
    const geom = feature.geometry as MultiLineString;
    geom.coordinates.forEach((line: Position[]) => {
      line.forEach((coord: Position) => {
        coords.push([coord[1], coord[0]]);
      });
    });
  } else if (feature.geometry.type === 'Point') {
    const geom = feature.geometry as Point;
    coords.push([geom.coordinates[1], geom.coordinates[0]]);
  }

  return coords;
}

/**
 * Calcula a distância em metros entre duas coordenadas usando a fórmula de Haversine
 */
function calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Raio da Terra em metros
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calcula a distância total de um percurso
 */
function calcularDistanciaTotal(coordenadas: [number, number][]): number {
  let total = 0;
  for (let i = 1; i < coordenadas.length; i++) {
    total += calcularDistancia(
      coordenadas[i - 1][0],
      coordenadas[i - 1][1],
      coordenadas[i][0],
      coordenadas[i][1]
    );
  }
  return Math.round(total);
}

/**
 * Processa um arquivo KMZ e retorna os dados do percurso
 */
export async function processarKMZ(
  kmzData: ArrayBuffer,
  id: string,
  nome: string
): Promise<PercursoKMZ | null> {
  try {
    const kmlContent = await extrairKMLdeKMZ(kmzData);
    const geojson = kmlParaGeoJSON(kmlContent);

    // Extrair todas as coordenadas de todas as features
    const todasCoordenadas: [number, number][] = [];
    let cor: string | undefined;

    for (const feature of geojson.features) {
      const coords = extrairCoordenadasDeFeature(feature);
      todasCoordenadas.push(...coords);

      // Tentar extrair cor do estilo se disponível
      if (feature.properties?.stroke) {
        cor = feature.properties.stroke;
      }
    }

    if (todasCoordenadas.length < 2) {
      console.warn(`KMZ "${nome}" não contém coordenadas suficientes`);
      return null;
    }

    return {
      id,
      nome,
      coordenadas: todasCoordenadas,
      pontoInicio: todasCoordenadas[0],
      pontoFim: todasCoordenadas[todasCoordenadas.length - 1],
      distanciaMetros: calcularDistanciaTotal(todasCoordenadas),
      cor,
    };
  } catch (error) {
    console.error(`Erro ao processar KMZ "${nome}":`, error);
    return null;
  }
}

/**
 * Carrega e processa um arquivo KMZ de uma URL
 */
export async function carregarKMZ(url: string, id: string, nome: string): Promise<PercursoKMZ | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro ao carregar KMZ: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return processarKMZ(arrayBuffer, id, nome);
  } catch (error) {
    console.error(`Erro ao carregar KMZ de ${url}:`, error);
    return null;
  }
}

/**
 * Carrega o índice de percursos disponíveis
 */
export async function carregarIndicePercursos(url: string = '/data/percursos/index.json'): Promise<IndicePercursos | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch (error) {
    console.error('Erro ao carregar índice de percursos:', error);
    return null;
  }
}

/**
 * Simplifica um array de coordenadas reduzindo o número de pontos
 * usando o algoritmo de Douglas-Peucker simplificado
 */
export function simplificarCoordenadas(
  coordenadas: [number, number][],
  tolerancia: number = 0.0001
): [number, number][] {
  if (coordenadas.length <= 2) return coordenadas;

  // Encontrar o ponto mais distante da linha entre o primeiro e último ponto
  let maxDist = 0;
  let maxIndex = 0;

  const [startLat, startLng] = coordenadas[0];
  const [endLat, endLng] = coordenadas[coordenadas.length - 1];

  for (let i = 1; i < coordenadas.length - 1; i++) {
    const [lat, lng] = coordenadas[i];
    const dist = distanciaPontoLinha(lat, lng, startLat, startLng, endLat, endLng);
    if (dist > maxDist) {
      maxDist = dist;
      maxIndex = i;
    }
  }

  // Se a distância máxima é maior que a tolerância, recursivamente simplificar
  if (maxDist > tolerancia) {
    const left = simplificarCoordenadas(coordenadas.slice(0, maxIndex + 1), tolerancia);
    const right = simplificarCoordenadas(coordenadas.slice(maxIndex), tolerancia);
    return [...left.slice(0, -1), ...right];
  }

  return [coordenadas[0], coordenadas[coordenadas.length - 1]];
}

function distanciaPontoLinha(
  px: number, py: number,
  x1: number, y1: number,
  x2: number, y2: number
): number {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;

  return Math.sqrt(dx * dx + dy * dy);
}
