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
        
        echo -e "${GREEN}Puedes Utilizar Termux Normalmente.${NC}"
        echo -e "El bot esta en un Contenedor, Utiliza el Comando ${YELLOW}proot-distro login debian${NC} para Ingresar."
        echo -e "${GREEN}Comandos Utiles:${NC}"
        echo -e "${YELLOW}ls${NC} Visor de Archivos. ${YELLOW}cd${NC} NAvegador de Archivos. ${YELLOW}nano${NC} Creador y Editor de Texto. ${YELLOW}mkdir${NC} Creador de Carpetas/Directorios ${YELLOW}rm${NC} Borrar Archivos. Cada uno de estos Comandos se puede usar junto con ${YELLOW}--help para ver sus Funciones"
        echo -e "${GREEN}Ejemplo:${NC}"
        echo -e "Ir a la Carpeta Mystic: ${YELLOW}cd mystic ${NC}"
        echo -e "Editar la Configuracion de Mystic: ${YELLOW}nano config.js ${NC}con Ctrol+O Guardas, Enter y Ctrl+X Salis de NAno."
        echo -e "${GREEN} ¿Necesitas Ayuda? Contacta con Nosotros en bit.ly/MSOS ${NC}"
        return 0  
    fi
    
    timeout=$((timeout - 1))
done

echo -e "\n${GREEN}Iniciando Bot...${NC}"

proot-distro login archlinux -- /bin/bash -c ./update.sh
