export enum AssetSector {
    FINANCEIRO = 'Financeiro',
    TECNOLOGIA = 'Tecnologia',
    SAUDE = 'Saúde',
    INDUSTRIA = 'Indústria',
    CONSUMO_CICLICO = 'Consumo Cíclico',
    CONSUMO_NAO_CICLICO = 'Consumo Não Cíclico',
    MATERIAIS_BASICOS = 'Materiais Básicos',
    PETROLEO_GAS_BIOCOMBUSTIVEIS = 'Petróleo, Gás e Biocombustíveis',
    UTILIDADE_PUBLICA = 'Utilidade Pública',
    IMOBILIARIO = 'Imobiliário',
    COMUNICACOES = 'Comunicações',
    OUTROS = 'Outros'
}

export const ASSET_SECTORS = Object.values(AssetSector);
