import { useState, useEffect, useMemo } from 'react';
import type { Camera, Bloco } from '../types/bloco';

const CAMERAS_API = 'https://aplicativo.cocr.com.br/cameras_api';
const RAIO_PROXIMIDADE_METROS = 300; // Aumentado para 300m para melhor cobertura

// Função para calcular distância entre dois pontos em metros (Haversine)
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

// Verifica se a câmera está próxima de um ponto
function cameraProximaDePonto(camera: Camera, lat: number, lng: number, raio: number): boolean {
  return calcularDistancia(camera.lat, camera.lng, lat, lng) <= raio;
}

// Parser da API de câmeras
function parseCamerasCSV(csv: string): Camera[] {
  const cameras: Camera[] = [];
  const linhas = csv.trim().split('\n');

  for (const linha of linhas) {
    const partes = linha.split(';');
    if (partes.length >= 4) {
      const lat = parseFloat(partes[0]);
      const lng = parseFloat(partes[1]);
      const nome = partes[2] || '';
      const codigo = partes[3] || '';

      // Ignorar câmeras com coordenadas inválidas
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0 &&
          lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 &&
          // Filtrar para região do Rio de Janeiro (ampliado para cobrir toda a cidade)
          lat >= -23.1 && lat <= -22.7 && lng >= -43.8 && lng <= -43.1) {
        cameras.push({
          id: codigo,
          lat,
          lng,
          nome,
          codigo
        });
      }
    }
  }

  return cameras;
}

export function useCameras() {
  const [todasCameras, setTodasCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function carregarCameras() {
      try {
        const response = await fetch(CAMERAS_API);
        if (!response.ok) {
          throw new Error('Falha ao carregar câmeras');
        }
        const csv = await response.text();
        const cameras = parseCamerasCSV(csv);
        setTodasCameras(cameras);
        console.log(`Câmeras carregadas: ${cameras.length}`);
      } catch (err) {
        console.error('Erro ao carregar câmeras:', err);
        setError('Não foi possível carregar as câmeras');
      } finally {
        setLoading(false);
      }
    }

    carregarCameras();
  }, []);

  return { todasCameras, loading, error };
}

// Hook para filtrar câmeras próximas a um bloco selecionado
export function useCamerasProximas(
  todasCameras: Camera[],
  blocoSelecionado: Bloco | null,
  raioMetros: number = RAIO_PROXIMIDADE_METROS
): Camera[] {
  return useMemo(() => {
    if (!blocoSelecionado || todasCameras.length === 0) {
      return [];
    }

    const camerasProximas: Camera[] = [];
    const idsAdicionados = new Set<string>();

    // Coletar todos os pontos relevantes do bloco
    const pontosDoBloco: { lat: number; lng: number }[] = [];

    // 1. Ponto central do bloco (sempre presente)
    pontosDoBloco.push({ lat: blocoSelecionado.lat, lng: blocoSelecionado.lng });

    // 2. Pontos do percurso (se existir)
    if (blocoSelecionado.percurso && blocoSelecionado.percurso.length > 0) {
      for (const ponto of blocoSelecionado.percurso) {
        pontosDoBloco.push({ lat: ponto.lat, lng: ponto.lng });
      }
    }

    // Verificar cada câmera contra todos os pontos do bloco
    for (const camera of todasCameras) {
      // Evitar duplicatas
      if (idsAdicionados.has(camera.id)) continue;

      // Verificar se está próxima de algum ponto do bloco
      for (const ponto of pontosDoBloco) {
        if (cameraProximaDePonto(camera, ponto.lat, ponto.lng, raioMetros)) {
          camerasProximas.push(camera);
          idsAdicionados.add(camera.id);
          break;
        }
      }
    }

    console.log(`Câmeras próximas de "${blocoSelecionado.nome}": ${camerasProximas.length} (raio: ${raioMetros}m, pontos verificados: ${pontosDoBloco.length})`);
    return camerasProximas;
  }, [todasCameras, blocoSelecionado, raioMetros]);
}
