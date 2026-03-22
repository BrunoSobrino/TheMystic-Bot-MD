import json
import logging
import subprocess
import os
import sys
from pathlib import Path

# Configuración de logging para monitorear el proceso en Termux
logger = logging.getLogger(__name__)

class VideoProcessor:
    @staticmethod
    def _escape_path(path):
        """Escapa rutas para evitar errores con caracteres especiales en los filtros."""
        p = str(path).replace('\\', '/').replace(':', '\\:').replace("'", r"\'")
        return f"'{p}'"

    @staticmethod
    def probe_media(input_path):
        """Analiza el archivo para identificar pistas de audio y subtítulos."""
        try:
            cmd = ['ffprobe', '-v', 'quiet', '-print_format', 'json', '-show_streams', '-show_format', str(input_path)]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            data = json.loads(result.stdout)
            info = {'audio': [], 'subtitle': []}
            sub_count = 0 
            for stream in data.get('streams', []):
                s_index, s_type = stream.get('index'), stream.get('codec_type')
                tags = stream.get('tags', {})
                lang_code = tags.get('language', 'UND').upper()
                if s_type == 'audio':
                    info['audio'].append({'index': s_index, 'label': f"{lang_code}"})
                elif s_type == 'subtitle':
                    info['subtitle'].append({'index': sub_count, 'label': f"{lang_code}"})
                    sub_count += 1
            return info
        except:
            return None

    @staticmethod
    def compress_video_resolution(input_path, output_path, scale='640:360'):
        """
        COMPRESIÓN ULTRA-LIGERA (Rango 25MB - 60MB para 30 min).
        Optimizado para máxima velocidad y mínimo peso en Termux.
        """
        logger.info(f"🚀 Iniciando compresión extrema: {os.path.basename(input_path)}")
        
        # -q 32: Calidad agresiva para forzar bajo peso.
        # -b 350: Límite de bitrate de video.
        # -B 40 --mixdown mono: Audio reducido al mínimo indispensable.
        cmd = [
            'HandBrakeCLI', '-i', str(input_path), '-o', str(output_path),
            '--format', 'av_mp4',
            '-e', 'x264',
            '-q', '32', 
            '-b', '350',
            '-x', 'preset=ultrafast:threads=auto:vbv-maxrate=450:vbv-bufsize=800:ref=1:me=dia:subme=0',
            '-w', '640', '-l', '360',
            '--keep-display-aspect',
            '-a', '1', '-E', 'av_aac', '-B', '40',
            '--mixdown', 'mono', '--optimize'
        ]

        try:
            process = subprocess.Popen(
                cmd, 
                stdout=subprocess.PIPE, 
                stderr=subprocess.STDOUT, 
                text=True, 
                bufsize=1, 
                universal_newlines=True
            )

            # Muestra el progreso real en la terminal del bot
            for line in process.stdout:
                if "Encoding: task" in line:
                    sys.stdout.write(f"\r⏳ {line.strip()}")
                    sys.stdout.flush()
            
            process.wait()
            print("\n")
            
            return os.path.exists(output_path) and os.path.getsize(output_path) > 0
        except Exception as e:
            logger.error(f"❌ Error en compresión: {e}")
            return False

    @staticmethod
    def burn_subtitles(video_path, output_path, audio_idx=None, sub_idx=None, is_external=False, external_sub_path=None):
        """
        QUEMADO DE SUBTÍTULOS + MARCA DE AGUA CID.
        Mantiene el peso bajo (350k bitrate) y proceso rápido.
        """
        logger.info(f"📝 Procesando video con Marca de Agua (CID) y Subtítulos...")
        
        if is_external and external_sub_path:
            sub_filter = f"subtitles={VideoProcessor._escape_path(external_sub_path)}"
        else:
            sub_filter = f"subtitles={VideoProcessor._escape_path(video_path)}:si={sub_idx}"

        # Marca de agua fija de 45px por 8 segundos (visible pero no estorba)
        watermark = "drawtext=text='CID':x=30:y=30:font='sans':fontsize=45:fontcolor=white@0.9:bordercolor=black@0.8:borderw=3:enable='lt(t,8)'"
        
        # Estilo de subtítulos (Tamaño 24 con borde para que se lean bien en 360p)
        sub_style = "force_style='FontSize=24,Bold=1,OutlineColour=&H000000,Outline=2'"
        
        full_vf = f"{watermark},{sub_filter}:{sub_style}"
        audio_map = ["-map", f"0:{audio_idx}"] if audio_idx is not None else ["-map", "0:a:0"]

        cmd = [
            'ffmpeg', '-y', '-i', str(video_path), 
            '-map', '0:v:0', *audio_map, 
            '-vf', full_vf, 
            '-c:v', 'libx264', 
            '-b:v', '350k', '-maxrate', '450k', '-bufsize', '800k', # Techo de bitrate para no inflar el peso
            '-preset', 'ultrafast', 
            '-c:a', 'aac', '-b:a', '40k', '-ac', '1', # Audio Mono para ahorrar hasta 15MB extras
            '-movflags', '+faststart', str(output_path)
        ]

        try:
            # Ejecuta FFmpeg de forma silenciosa pero efectiva
            subprocess.run(cmd, check=True, capture_output=True)
            return os.path.exists(output_path)
        except Exception as e:
            logger.error(f"❌ Error en FFmpeg: {e}")
            return False

    @staticmethod
    def extract_audio(video_path, output_path):
        """Extrae el audio en MP3 ligero (96kbps)."""
        cmd = ['ffmpeg', '-y', '-i', str(video_path), '-vn', '-acodec', 'libmp3lame', '-b:a', '96k', str(output_path)]
        try:
            subprocess.run(cmd, check=True, capture_output=True)
            return os.path.exists(output_path)
        except:
            return False

