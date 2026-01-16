import type { Coordenada } from '../types/rota';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

export interface GeocodificarResultado {
  coordenadas: Coordenada;
  enderecoCompleto: string;
}

export type GeocodificarErro = 'nao_encontrado' | 'erro_rede' | 'erro_servidor';

export async function geocodificarEndereco(
  endereco: string
): Promise<{ sucesso: true; dados: GeocodificarResultado } | { sucesso: false; erro: GeocodificarErro }> {
  try {
    // Adicionar email de contato conforme política do Nominatim
    const params = new URLSearchParams({
      q: `${endereco}, Rio de Janeiro, Brazil`,
      format: 'json',
      limit: '1',
      addressdetails: '1',
      email: 'carnavalrio2026@example.com' // Identificação para Nominatim
    });

    // Não usar headers customizados para evitar preflight CORS
    const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      method: 'GET'
    });

    if (!response.ok) {
      console.error('Nominatim respondeu com status:', response.status);
      return { sucesso: false, erro: 'erro_servidor' };
    }

    const results: NominatimResult[] = await response.json();

    if (results.length === 0) {
      return { sucesso: false, erro: 'nao_encontrado' };
    }

    return {
      sucesso: true,
      dados: {
        coordenadas: {
          lat: parseFloat(results[0].lat),
          lng: parseFloat(results[0].lon)
        },
        enderecoCompleto: results[0].display_name
      }
    };
  } catch (error) {
    console.error('Erro ao geocodificar:', error);
    // Erro de fetch geralmente é CORS ou rede
    return { sucesso: false, erro: 'erro_rede' };
  }
}
