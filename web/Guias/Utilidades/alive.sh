#!/bin/bash

# Carpeta de scripts
carpeta="$HOME/script/"

matar_script() {
    pkill -f "$1"  
    pkill -f "${1%.*}"  
    echo "Procesos $1 Asesina2."
}

iniciar_script() {
    bash "$1" & 
    echo "$1 iniciado."
}

reiniciar_script() {
    matar_script "$1"  
    sleep 10  # 3 segundos antes de reiniciar
    iniciar_script "$1"
}

main() {
    cd "$carpeta" || exit 1  
    for script in *.sh; do
        reiniciar_script "$script"
    done

    while true; do
        for script in *.sh; do
            if ! pgrep -f "${script%.*}" >/dev/null; then  
                echo "$script se detuvo. Reiniciando..."
                reiniciar_script "$script"
            fi
        done
        sleep 30  # Espera 5M para la Deteccion
    done
}

main

