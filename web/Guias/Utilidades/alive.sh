#!/bin/bash

# Carpeta de scripts
carpeta="$HOME/script/"

matar_script() {
    # Antes: pkill -f "$1" y pkill -f "${1%.*}" coincidían con cualquier
    # proceso cuya línea de comandos contuviera ese texto (p. ej. "mystic"
    # mataba procesos por ruta). Ahora solo coincide con el script exacto
    # lanzado como `bash <nombre>.sh`.
    pkill -f "^bash ${1//./\.}$"
    echo "Procesos $1 terminados."
}

iniciar_script() {
    bash "$1" & 
    echo "$1 iniciado."
}

reiniciar_script() {
    matar_script "$1"  
    sleep 10  # 10 segundos antes de reiniciar
    iniciar_script "$1"
}

main() {
    cd "$carpeta" || exit 1  
    for script in *.sh; do
        reiniciar_script "$script"
    done

    while true; do
        for script in *.sh; do
            if ! pgrep -f "^bash ${script//./\.}$" >/dev/null; then  
                echo "$script se detuvo. Reiniciando..."
                reiniciar_script "$script"
            fi
        done
        sleep 30  # Espera 30 segundos para la detección
    done
}

main

