import type { Coordenada } from '../types/rota';

const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY || '5b3ce3597851110001cf6248a1234567890abcdef';
const ORS_BASE_URL = 'https://api.openrouteservice.org/v2/directions/driving-car';

interface ORSResponse {
  features: [{
    properties: {
      summary: {
        distance: number; // metros
        duration: number; // segundos
      };
      segments: [{
        steps: [{
          instruction: string;
          distance: number;
          type: number;
        }];
      }];
    };
    geometry: {
      coordinates: [number, number][]; // [lng, lat]
    };
  }];
}

export async function calcularRota(
  origem: Coordenada,
  destino: Coordenada
): Promise<{
  distanciaKm: number;
  duracaoMinutos: number;
  polyline: Coordenada[];
  instrucoes: { texto: string; distancia: number; tipo: string }[];
}> {
  const url = `${ORS_BASE_URL}?api_key=${ORS_API_KEY}&start=${origem.lng},${origem.lat}&end=${destino.lng},${destino.lat}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erro ao calcular rota: ${response.status}`);
  }

  const data: ORSResponse = await response.json();
  const feature = data.features[0];

  const polyline = feature.geometry.coordinates.map(([lng, lat]) => ({
    lat,
    lng
  }));

  const instrucoes = feature.properties.segments[0]?.steps.map(step => ({
    texto: step.instruction,
    distancia: step.distance,
    tipo: String(step.type)
  })) || [];

  return {
    distanciaKm: feature.properties.summary.distance / 1000,
    duracaoMinutos: feature.properties.summary.duration / 60,
    polyline,
    instrucoes
  };
}
