// Coordenadas aproximadas dos bairros do Rio de Janeiro
export const coordenadasBairros: Record<string, [number, number]> = {
  // Centro e adjacências
  'CENTRO': [-22.9068, -43.1729],
  'LAPA': [-22.9142, -43.1815],
  'SANTA TERESA': [-22.9178, -43.1898],
  'SAUDE': [-22.8981, -43.1872],
  'GAMBOA': [-22.8948, -43.1912],
  'SANTO CRISTO': [-22.8965, -43.1962],
  'CAJU': [-22.8821, -43.2172],
  'CIDADE NOVA': [-22.9088, -43.2012],
  'CATUMBI': [-22.9156, -43.1989],
  'RIO COMPRIDO': [-22.9178, -43.2089],
  'ESTACIO': [-22.9198, -43.2098],

  // Zona Sul
  'COPACABANA': [-22.9711, -43.1822],
  'IPANEMA': [-22.9838, -43.1986],
  'LEBLON': [-22.9848, -43.2244],
  'LEME': [-22.9639, -43.1711],
  'BOTAFOGO': [-22.9489, -43.1825],
  'FLAMENGO': [-22.9328, -43.1767],
  'LARANJEIRAS': [-22.9378, -43.1879],
  'CATETE': [-22.9268, -43.1768],
  'GLORIA': [-22.9228, -43.1738],
  'HUMAITA': [-22.9568, -43.1989],
  'URCA': [-22.9488, -43.1639],
  'LAGOA': [-22.9668, -43.2089],
  'GAVEA': [-22.9798, -43.2328],
  'JARDIM BOTANICO': [-22.9678, -43.2189],
  'SAO CONRADO': [-23.0018, -43.2589],
  'VIDIGAL': [-22.9898, -43.2328],
  'ROCINHA': [-22.9878, -43.2428],
  'COSME VELHO': [-22.9418, -43.1878],

  // Grande Tijuca
  'TIJUCA': [-22.9268, -43.2328],
  'ALTO DA BOA VISTA': [-22.9478, -43.2728],
  'PRACA DA BANDEIRA': [-22.9148, -43.2228],
  'MARACANA': [-22.9118, -43.2328],
  'ANDARAI': [-22.9228, -43.2428],
  'GRAJAU': [-22.9218, -43.2628],
  'VILA ISABEL': [-22.9128, -43.2428],
  'USINA': [-22.9378, -43.2528],

  // Zona Norte
  'MEIER': [-22.9028, -43.2828],
  'ENGENHO DE DENTRO': [-22.8928, -43.2928],
  'CACHAMBI': [-22.8878, -43.2728],
  'TODOS OS SANTOS': [-22.8928, -43.2778],
  'ENGENHO NOVO': [-22.9028, -43.2678],
  'RIACHUELO': [-22.9088, -43.2578],
  'SAMPAIO': [-22.9008, -43.2578],
  'ROCHA': [-22.8988, -43.2578],
  'SAO FRANCISCO XAVIER': [-22.9028, -43.2418],
  'PILARES': [-22.8768, -43.2998],
  'ABOLIÇÃO': [-22.8858, -43.2928],
  'AGUA SANTA': [-22.9028, -43.3028],
  'PIEDADE': [-22.8888, -43.3028],
  'QUINTINO BOCAIUVA': [-22.8808, -43.3028],
  'CASCADURA': [-22.8778, -43.3228],
  'MADUREIRA': [-22.8728, -43.3428],
  'CAMPINHO': [-22.8618, -43.3428],
  'PENHA': [-22.8448, -43.2728],
  'PENHA CIRCULAR': [-22.8378, -43.2778],
  'OLARIA': [-22.8428, -43.2628],
  'RAMOS': [-22.8388, -43.2528],
  'BONSUCESSO': [-22.8508, -43.2478],
  'MANGUINHOS': [-22.8648, -43.2478],
  'BENFICA': [-22.8878, -43.2378],
  'SAO CRISTOVAO': [-22.8978, -43.2228],
  'VASCO DA GAMA': [-22.8928, -43.2078],
  'MANGUEIRA': [-22.9028, -43.2278],
  'COMPLEXO DO ALEMAO': [-22.8578, -43.2628],
  'MARE': [-22.8528, -43.2428],
  'VIGARIO GERAL': [-22.8278, -43.2928],
  'BRAS DE PINA': [-22.8348, -43.2978],
  'CORDOVIL': [-22.8198, -43.3028],
  'PARADA DE LUCAS': [-22.8168, -43.2928],
  'IRAJÁ': [-22.8268, -43.3328],
  'COLÉGIO': [-22.8328, -43.3178],
  'VICENTE DE CARVALHO': [-22.8468, -43.3078],
  'VILA DA PENHA': [-22.8408, -43.3178],
  'VISTA ALEGRE': [-22.8368, -43.3078],
  'PAVUNA': [-22.8088, -43.3628],
  'ANCHIETA': [-22.8178, -43.4028],
  'GUADALUPE': [-22.8188, -43.3728],
  'HONORIO GURGEL': [-22.8398, -43.3628],
  'ROCHA MIRANDA': [-22.8518, -43.3528],
  'TURIAÇU': [-22.8538, -43.3428],
  'OSVALDO CRUZ': [-22.8658, -43.3428],
  'BENTO RIBEIRO': [-22.8548, -43.3678],
  'DEL CASTILHO': [-22.8698, -43.2998],
  'INHAUMA': [-22.8678, -43.2778],
  'TOMAS COELHO': [-22.8618, -43.3098],
  'ENGENHEIRO LEAL': [-22.8498, -43.3278],
  'CAVALCANTI': [-22.8418, -43.3398],
  'ENGENHO DA RAINHA': [-22.8588, -43.2778],
  'JARDIM AMERICA': [-22.8528, -43.3298],
  'COELHO NETO': [-22.8228, -43.3478],
  'ACARI': [-22.8088, -43.3398],
  'BARROS FILHO': [-22.8148, -43.3538],
  'COSTA BARROS': [-22.8118, -43.3628],
  'RICARDO DE ALBUQUERQUE': [-22.8588, -43.4028],
  'MARECHAL HERMES': [-22.8538, -43.3778],

  // Ilhas
  'ILHA DO GOVERNADOR': [-22.8078, -43.2128],
  'CIDADE UNIVERSITARIA': [-22.8578, -43.2328],
  'COCOTA': [-22.7998, -43.1878],
  'PRAIA DA BANDEIRA': [-22.7918, -43.1928],
  'FREGUESIA': [-22.8118, -43.1928],
  'PORTUGUESA': [-22.8208, -43.1978],
  'BANCARIOS': [-22.8268, -43.2178],
  'PITANGUEIRAS': [-22.8078, -43.2028],
  'JARDIM GUANABARA': [-22.7948, -43.2028],
  'RIBEIRA': [-22.7958, -43.2128],
  'ZUMBI': [-22.8078, -43.1878],
  'TAUA': [-22.7908, -43.2078],
  'MONERÓ': [-22.7918, -43.2178],
  'JARDIM CARIOCA': [-22.8068, -43.2228],
  'GALEÃO': [-22.8138, -43.2378],
  'CACUIA': [-22.7998, -43.2048],
  'PAQUETA': [-22.7618, -43.1068],

  // Zona Oeste 1
  'BANGU': [-22.8718, -43.4628],
  'SENADOR CAMARA': [-22.8688, -43.4778],
  'PADRE MIGUEL': [-22.8738, -43.4378],
  'REALENGO': [-22.8698, -43.4178],
  'DEODORO': [-22.8568, -43.3878],
  'VILA MILITAR': [-22.8578, -43.4028],
  'MAGALHAES BASTOS': [-22.8648, -43.4128],
  'JARDIM SULACAP': [-22.8808, -43.3978],
  'SENADOR VASCONCELOS': [-22.8618, -43.5028],
  'SANTISSIMO': [-22.8718, -43.5278],

  // Zona Oeste 2
  'CAMPO GRANDE': [-22.9028, -43.5578],
  'COSMOS': [-22.9168, -43.6078],
  'INHOAIBA': [-22.9028, -43.5828],
  'SANTA CRUZ': [-22.9228, -43.6778],
  'PACIENCIA': [-22.9178, -43.6328],
  'SEPETIBA': [-22.9728, -43.7128],
  'GUARATIBA': [-23.0428, -43.6278],
  'PEDRA DE GUARATIBA': [-23.0478, -43.6078],

  // Zona Oeste 3
  'BARRA DE GUARATIBA': [-23.0578, -43.5778],

  // Barra, Recreio e Vargens
  'BARRA DA TIJUCA': [-23.0028, -43.3678],
  'RECREIO DOS BANDEIRANTES': [-23.0178, -43.4678],
  'JOATINGA': [-23.0078, -43.2978],
  'ITANHANGA': [-22.9928, -43.3078],
  'GRUMARI': [-23.0478, -43.5078],
  'VARGEM PEQUENA': [-22.9828, -43.4378],
  'VARGEM GRANDE': [-22.9878, -43.4728],
  'CAMORIM': [-22.9878, -43.4178],

  // Jacarepaguá
  'JACAREPAGUA': [-22.9428, -43.3578],
  'TAQUARA': [-22.9228, -43.3728],
  'TANQUE': [-22.9178, -43.3578],
  'PRACA SECA': [-22.9028, -43.3478],
  'VILA VALQUEIRE': [-22.8878, -43.3678],
  'FREGUESIA DE JACAREPAGUA': [-22.9378, -43.3478],
  'PECHINCHA': [-22.9328, -43.3578],
  'ANIL': [-22.9278, -43.3478],
  'GARDENIA AZUL': [-22.9278, -43.3678],
  'CURICICA': [-22.9478, -43.3778],
  'CIDADE DE DEUS': [-22.9478, -43.3628],
  'RIO DAS PEDRAS': [-22.9678, -43.3978],
};

// Coordenadas centrais das subprefeituras
export const coordenadasSubprefeituras: Record<string, [number, number]> = {
  'CENTRO': [-22.9068, -43.1729],
  'ZONA SUL': [-22.9600, -43.1900],
  'GRANDE TIJUCA': [-22.9200, -43.2400],
  'ZONA NORTE': [-22.8600, -43.2900],
  'ILHAS': [-22.8078, -43.2128],
  'ZONA OESTE 1': [-22.8700, -43.4500],
  'ZONA OESTE 2': [-22.9200, -43.6000],
  'ZONA OESTE 3': [-23.0400, -43.5600],
  'BARRA, RECREIO E VARGENS': [-23.0000, -43.4000],
  'JACAREPAGUÁ': [-22.9300, -43.3600],
};

// Cores por subprefeitura
export const coresSubprefeitura: Record<string, string> = {
  'CENTRO': '#FF6B35',
  'ZONA SUL': '#00D4AA',
  'GRANDE TIJUCA': '#7B68EE',
  'ZONA NORTE': '#FFD93D',
  'ILHAS': '#6BCB77',
  'ZONA OESTE 1': '#FF8FA3',
  'ZONA OESTE 2': '#C9B1FF',
  'ZONA OESTE 3': '#98D8C8',
  'BARRA, RECREIO E VARGENS': '#F7DC6F',
  'JACAREPAGUÁ': '#85C1E9',
};

export function getCoordenadasBairro(bairro: string): [number, number] {
  const bairroNormalizado = bairro.toUpperCase().trim();
  return coordenadasBairros[bairroNormalizado] || [-22.9068, -43.1729];
}

export function getCoordenadasSubprefeitura(subprefeitura: string): [number, number] {
  return coordenadasSubprefeituras[subprefeitura] || [-22.9068, -43.1729];
}

export function getCorSubprefeitura(subprefeitura: string): string {
  return coresSubprefeitura[subprefeitura] || '#FFFFFF';
}
