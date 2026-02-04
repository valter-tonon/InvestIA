#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}>>> Iniciando Configuração do Servidor Oracle Free Tier (1GB RAM)...${NC}"

# 1. Configurar SWAP (CRÍTICO para máquinas de 1GB)
if [ ! -f /swapfile ]; then
    echo ">> Criando Swap de 4GB para evitar Crash de Memória..."
    sudo fallocate -l 4G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo -e "${GREEN}Swap criado com sucesso!${NC}"
else
    echo "Swap já existe."
fi

# 2. Ajustar Swappiness (Usar swap apenas quando necessário)
sudo sysctl vm.swappiness=10
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf

# 3. Limpar Docker antigo (opcional, para liberar espaço)
# echo ">> Limpando imagens antigas..."
# docker system prune -af

# 4. Deploy da Aplicação
echo -e "${GREEN}>>> Iniciando Deploy dos Containers...${NC}"

# Nota: O build do Next.js pode consumir muita memória. 
# Se falhar, recomendável buildar localmente e subir apenas a imagem.
docker-compose -f docker-compose.prod.yml up -d --build

echo -e "${GREEN}>>> Deploy Finalizado!${NC}"
echo "Monitore o uso de memória com: htop"
