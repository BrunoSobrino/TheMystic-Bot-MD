import whisper
import sys
import os
#import subprocess (Descomentar para Linux y mas abajo)
#import win32api, win32process, win32con (Descomentar para Winsdows y mas abajo)

def transcribe_audio(file_path):
    model = whisper.load_model("tiny") # Hay Diferentes Niveles de procesamiento, cada uno tiene mas parametros que el anterior, aunque usa mas ram y tarda mas tiempo, pero puede ser mas preciso. "tiny" y "base" son las mas pequeñas y usan alrededor de 1GB de RAM. "small" 2GB "medium" 5GB y "large" 10GB, tambien necesita descargar esa cantidad del ejecutor. Mas informacion en la documentacion de openai/whisper en github.
    result = model.transcribe(file_path, language='es')
    return result['text']

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python transcribe.py <ruta_al_archivo_de_audio>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    if not os.path.isfile(file_path):
        print(f"El archivo {file_path} no existe.")
        sys.exit(1)
    
   # Windows: Prioridad mínima para evitar que sature el sistema (no se si funciona, debes descomentarlo) Requiere pywin32 que se instala con 
   # pid = os.getpid()
   # handle = win32api.OpenProcess(win32con.PROCESS_ALL_ACCESS, False, pid)
   # win32process.SetPriorityClass(handle, win32process.IDLE_PRIORITY_CLASS)
   
   # Linux: Prioridad mínima para evitar que sature el sistema (debes comentarlo al activar el de windows) 
   # subprocess.run(['nice', '-n', '19', 'python3', 'transcribe.py', file_path])
    
    text = transcribe_audio(file_path)
    print(text)
