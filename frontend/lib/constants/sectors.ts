export const ASSET_SECTORS = [
    'Financeiro',
    'Tecnologia',
    'Saúde',
    'Indústria',
    'Consumo Cíclico',
    'Consumo Não Cíclico',
    'Materiais Básicos',
    'Petróleo, Gás e Biocombustíveis',
    'Utilidade Pública',
    'Imobiliário',
    'Comunicações',
    'Outros'
] as const;

export type AssetSector = typeof ASSET_SECTORS[number];
