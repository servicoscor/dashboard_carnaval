import JSZip from 'jszip';
import { kml } from '@tmcw/togeojson';
import type { FeatureCollection, Feature, LineString, MultiLineString, Point, Position } from 'geojson';

export interface PontoPercurso {
  lat: number;
  lng: number;
  rua?: string;
}

export interface PercursoBlocoKMZ {
  nomeOriginal: string;
  nomeNormalizado: string;
  percurso: PontoPercurso[];
  pontoConcentracao?: PontoPercurso;
  distanciaMetros: number;
}

export interface ResultadoCarregamentoKMZ {
  percursos: Map<string, PercursoBlocoKMZ>;
  totalBlocos: number;
  blocosComPercurso: number;
  blocosComPontoConcentracao: number;
}

/**
 * Normaliza nome do bloco para comparação
 * Remove acentos, converte para maiúsculas, trata caracteres especiais
 */
export function normalizarNomeBloco(nome: string): string {
  return nome
    .replace(/&amp;/gi, '&')           // Entidade HTML &amp; -> &
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // Remove acentos
    .replace(/&/g, 'E')                 // & -> E
    .replace(/[.,!?()'"]/g, '')         // Remove pontuação
    .replace(/-/g, ' ')                 // Hífen -> espaço
    .replace(/\s+/g, ' ')               // Múltiplos espaços -> um
    .trim();
}

/**
 * Extrai o conteúdo KML de um arquivo KMZ
 */
export async function extrairKMLdeKMZ(kmzData: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(kmzData);

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
 * Extrai coordenadas de uma Feature GeoJSON
 * Retorna array de [lat, lng]
 */
function extrairCoordenadasDeFeature(feature: Feature): [number, number][] {
  const coords: [number, number][] = [];

  if (!feature.geometry) return coords;

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
function calcularDistanciaHaversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
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
    total += calcularDistanciaHaversine(
      coordenadas[i - 1][0],
      coordenadas[i - 1][1],
      coordenadas[i][0],
      coordenadas[i][1]
    );
  }
  return Math.round(total);
}

/**
 * Processa o KMZ único contendo todos os blocos
 * Retorna um Map com nome normalizado -> dados do percurso
 */
export async function carregarPercursosDoKMZ(url: string): Promise<ResultadoCarregamentoKMZ> {
  const percursos = new Map<string, PercursoBlocoKMZ>();

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro ao carregar KMZ: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const kmlContent = await extrairKMLdeKMZ(arrayBuffer);
    const geojson = kmlParaGeoJSON(kmlContent);

    // Agrupar features por nome do bloco
    const featuresPorBloco = new Map<string, Feature[]>();

    for (const feature of geojson.features) {
      const nome = feature.properties?.name || '';
      if (!nome) continue;

      if (!featuresPorBloco.has(nome)) {
        featuresPorBloco.set(nome, []);
      }
      featuresPorBloco.get(nome)!.push(feature);
    }

    // Processar cada bloco
    for (const [nomeOriginal, features] of featuresPorBloco.entries()) {
      const nomeNormalizado = normalizarNomeBloco(nomeOriginal);

      let percursoCoords: [number, number][] = [];
      let pontoConcentracao: PontoPercurso | undefined;

      for (const feature of features) {
        if (!feature.geometry) continue;

        if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
          // É o percurso (linha)
          const coords = extrairCoordenadasDeFeature(feature);
          if (coords.length > percursoCoords.length) {
            percursoCoords = coords;
          }
        } else if (feature.geometry.type === 'Point') {
          // É o ponto de concentração
          const coords = extrairCoordenadasDeFeature(feature);
          if (coords.length > 0) {
            pontoConcentracao = { lat: coords[0][0], lng: coords[0][1] };
          }
        }
      }

      // Só adicionar se tiver percurso válido
      if (percursoCoords.length >= 2) {
        const percurso: PontoPercurso[] = percursoCoords.map((coord, index) => ({
          lat: coord[0],
          lng: coord[1],
          rua: index === 0 ? 'Início' : index === percursoCoords.length - 1 ? 'Fim' : undefined
        }));

        percursos.set(nomeNormalizado, {
          nomeOriginal,
          nomeNormalizado,
          percurso,
          pontoConcentracao,
          distanciaMetros: calcularDistanciaTotal(percursoCoords)
        });
      }
    }

    console.log(`KMZ carregado: ${percursos.size} percursos extraídos de ${featuresPorBloco.size} blocos`);

    return {
      percursos,
      totalBlocos: featuresPorBloco.size,
      blocosComPercurso: percursos.size,
      blocosComPontoConcentracao: Array.from(percursos.values()).filter(p => p.pontoConcentracao).length
    };
  } catch (error) {
    console.error('Erro ao carregar percursos do KMZ:', error);
    return {
      percursos,
      totalBlocos: 0,
      blocosComPercurso: 0,
      blocosComPontoConcentracao: 0
    };
  }
}

/**
 * Simplifica um array de coordenadas usando Douglas-Peucker
 */
export function simplificarCoordenadas(
  coordenadas: [number, number][],
  tolerancia: number = 0.0001
): [number, number][] {
  if (coordenadas.length <= 2) return coordenadas;

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
