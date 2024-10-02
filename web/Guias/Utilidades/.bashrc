termux-wake-lock

# Colores mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # Sin color

echo -e "${YELLOW}Presiona una Tecla para Evitar el Inicio Automatico...${NC}"

timeout=5  

while [ $timeout -gt 0 ]; do
    echo -ne "${YELLOW}Iniciando en $timeout segundos...\r${NC}"
    
    read -t 1 -n 1 keypress
    
    if [ $? -eq 0 ]; then
        echo -e "\n${RED}Inicio Automatico Cancelado.${NC}"
        
        echo -e "${GREEN}Puedes ajustar lo que necesites. Recuerda, que el Bot esta en un Contenedor ArchLinux.${NC}"
        echo -e "${GREEN}Para Ingresar Ahi Debes usar el Comando:${NC} ${YELLOW}proot-distro login archlinux${NC} ${GREEN}y luego hacer las Modificaciones al Bot.${NC}"
        
        return 0  
    fi
    
    timeout=$((timeout - 1))
done

echo -e "\n${GREEN}Iniciando Bot...${NC}"

proot-distro login archlinux -- /bin/bash -c ./update.sh
