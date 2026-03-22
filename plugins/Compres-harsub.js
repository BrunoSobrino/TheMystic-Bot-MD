import json
import logging
import subprocess
import os
import sys
from pathlib import Path

logger = logging.getLogger(__name__)

class VideoProcessor:
    @staticmethod
    def _escape_path(path):
        p = str(path).replace('\\', '/').replace(':', '\\:').replace("'", r"\'")
        return f"'{p}'"

    @staticmethod
    def probe_media(input_path):
        flags = {
            'SPA': '🇪🇸', 'ESP': '🇪🇸', 'JPN': '🇯🇵', 'JAP': '🇯🇵',
            'ENG': '🇺🇸', 'ENU': '🇺🇸', 'FRA': '🇫🇷', 'FRE': '🇫🇷',
            'GER': '🇩🇪', 'DEU': '🇩🇪', 'POR': '🇧🇷', 'ITA': '🇮🇹',
            'KOR': '🇰🇷', 'CHI': '🇨🇳', 'ZHO': '🇨🇳', 'RUS': '🇷🇺', 'UND': '🏳️'
        }
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
                flag = flags.get(lang_code, '🏳️')
                title = tags.get('title', 'Pista')
                is_forced = stream.get('disposition', {}).get('forced', 0) == 1
                if s_type == 'audio':
                    info['audio'].append({'index': s_index, 'label': f"{flag} {lang_code} - {title}"})
                elif s_type == 'subtitle':
                    info['subtitle'].append({'index': sub_count, 'label': f"{flag} [{sub_count}] {lang_code}{' (FORZADO)' if is_forced else ''}"})
                    sub_count += 1
            return info
        except: return None

    @staticmethod
    def compress_video_resolution(input_path, output_path, scale='640:360', crf='28', preset='ultrafast'):
        """
        Optimizado para Termux: Muy rápido (ultrafast) y ligero (CRF 28).
        """
        logger.info(f"⚡ Compresión ultra-rápida 360p: {os.path.basename(input_path)}")
        try:
            width, height = scale.split(':')
            height = '360' if height == '-1' else height
        except:
            width, height = '640', '360'

        cmd = [
            'HandBrakeCLI', '-i', str(input_path), '-o', str(output_path),
            '--format', 'av_mp4',
            '-e', 'x264',
            '-q', str(crf), # CRF 28 = Menos peso, calidad balanceada
            '-x', f'preset={preset}:threads=auto:ref=1:me=dia', # Ajustes para velocidad extrema
            '-w', width, '-l', height,
            '--keep-display-aspect',
            '-a', '1', '-E', 'av_aac', '-B', '96', # Audio a 96k para ahorrar más espacio
            '--mixdown', 'stereo', '--optimize'
        ]

        try:
            process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1, universal_newlines=True)
            for line in process.stdout:
                if "Encoding: task" in line:
                    sys.stdout.write(f"\r⏳ {line.strip()}")
                    sys.stdout.flush()
            process.wait()
            print("\n")
            return os.path.exists(output_path) and os.path.getsize(output_path) > 0
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            return False

    @staticmethod
    def burn_subtitles(video_path, output_path, audio_idx=None, sub_idx=None, is_external=False, external_sub_path=None):
        """Quema subtítulos y aplica la marca de agua CID de 45px por 8s."""
        if is_external and external_sub_path:
            sub_p = VideoProcessor._escape_path(external_sub_path)
            sub_filter = f"subtitles={sub_p}"
        else:
            vid_p = VideoProcessor._escape_path(video_path)
            sub_filter = f"subtitles={vid_p}:si={sub_idx}"

        sub_style = "force_style='Fontname=sans,FontSize=24,Bold=1,PrimaryColour=&HFFFFFF,OutlineColour=&HAABB00,BorderStyle=1,Outline=2.0,Shadow=1.0,MarginV=25'"
        
        # Marca de agua de 45px fija por 8 segundos
        watermark = "drawtext=text='CID':x=30:y=30:font='sans':fontsize=45:fontcolor=white@0.9:bordercolor=black@0.8:borderw=3:enable='lt(t,8)'"

        full_vf = f"{watermark},{sub_filter}:{sub_style}"
        audio_map = ["-map", f"0:{audio_idx}"] if audio_idx is not None else ["-map", "0:a:0"]

        # Usamos preset 'ultrafast' también en FFmpeg para máxima velocidad
        cmd = [
            'ffmpeg', '-y', '-i', str(video_path), 
            '-map', '0:v:0', *audio_map, 
            '-vf', full_vf, 
            '-c:v', 'libx264', '-crf', '28', '-preset', 'ultrafast', 
            '-c:a', 'aac', '-b:a', '96k', 
            '-movflags', '+faststart', str(output_path)
        ]

        try:
            subprocess.run(cmd, check=True, capture_output=True)
            return os.path.exists(output_path)
        except: return False

    @staticmethod
    def extract_audio(video_path, output_path):
        cmd = ['ffmpeg', '-y', '-i', str(video_path), '-vn', '-acodec', 'libmp3lame', '-b:a', '128k', str(output_path)]
        try:
            subprocess.run(cmd, check=True, capture_output=True)
            return os.path.exists(output_path)
        except: return False
