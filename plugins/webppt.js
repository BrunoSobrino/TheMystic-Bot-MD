import os
import asyncio
import time
import json
from pathlib import Path
from urllib.parse import urlparse
import urllib.request
from playwright.async_api import async_playwright
import tempfile
import shutil

class WebDownloader:
    def __init__(self):
        self.config = {
            'temp_dir': os.getenv('TEMP_DOWNLOAD_DIR', os.path.join(os.getcwd(), 'src/tmp/PPT')),
            'max_image_size': int(os.getenv('MAX_IMAGE_SIZE', '11240')),
            'max_images': int(os.getenv('MAX_IMAGES', '10')),
            'browser_timeout': int(os.getenv('BROWSER_TIMEOUT', '99000')),
            'browser_wait_time': int(os.getenv('BROWSER_WAIT_TIME', '9000')),
            'user_agent': os.getenv('USER_AGENT', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'),
            'chromium_path': os.getenv('CHROMIUM_PATH', ''),
            'scroll_pages': int(os.getenv('SCROLL_PAGES', '5')),
            'user_data_dir': os.getenv('USER_DATA_DIR', '/root/.config/chromium/Bot')
        }
        
        self.browser_instance = None
        self.persistent_context = None
        self.active_requests = 0
        self.max_downloads = 2
        self.queue = []

    def generate_safe_filename(self, original_name):
        ext = Path(original_name).suffix
        timestamp = int(time.time() * 1000)
        return f"web_{timestamp}{ext}"

    async def ensure_directories(self, session_id):
        session_dir = Path(self.config['temp_dir']) / session_id
        session_dir.mkdir(parents=True, exist_ok=True)
        return session_dir

    async def init_browser(self):
        if not self.browser_instance and not self.persistent_context:
            playwright = await async_playwright().start()
            
            launch_options = {
                'headless': True,
                'args': [
                    '--disable-blink-features=AutomationControlled',
                    '--disable-web-security',
                    '--disable-features=IsolateOrigins',
                    '--disable-site-isolation-trials',
                    '--disable-features=BlockInsecurePrivateNetworkRequests',
                    '--proxy-server=direct://',
                    '--proxy-bypass-list=*',
                    '--headless',
                    '--hide-scrollbars',
                    '--mute-audio',
                    '--disable-logging',
                    '--disable-infobars',
                    '--disable-breakpad',
                    '--disable-gl-drawing-for-tests',
                    '--disable-canvas-aa',
                    '--disable-2d-canvas-clip-aa',
                    '--no-sandbox',
                    '--blink-settings=imagesEnabled=true',
                    '--run-all-compositor-stages-before-draw',
                    '--disable-lazy-loading'
                ]
            }

            if self.config['chromium_path']:
                launch_options['executable_path'] = self.config['chromium_path']

            try:
                if self.config['user_data_dir']:
                    Path(self.config['user_data_dir']).mkdir(parents=True, exist_ok=True)
                    
                    self.persistent_context = await playwright.chromium.launch_persistent_context(
                        self.config['user_data_dir'],
                        **launch_options,
                        user_agent=self.config['user_agent'],
                        bypass_csp=True
                    )
                    return self.persistent_context
                else:
                    self.browser_instance = await playwright.chromium.launch(**launch_options)
            except Exception as error:
                raise Exception(f"Browser initialization failed: {str(error)}")
        
        return self.browser_instance or self.persistent_context

    async def close_browser_if_idle(self):
        if self.active_requests == 0:
            if self.persistent_context:
                try:
                    await self.persistent_context.close()
                except:
                    pass
                self.persistent_context = None
            elif self.browser_instance:
                try:
                    await self.browser_instance.close()
                except:
                    pass
                self.browser_instance = None

    async def process_downloaded_file(self, conn, m, file_path, file_type):
        safe_filename = self.generate_safe_filename(f"web.{file_type}")
        mime_types = {
            'pdf': 'application/pdf',
            'mhtml': 'text/html',
            'jpg': 'image/jpeg',
            'png': 'image/png'
        }

        try:
            await conn.sendFile(m.chat, str(file_path), safe_filename, '❤️', m)
        finally:
            try:
                file_path.unlink()
            except:
                pass

    async def scroll_page_down(self, page, scroll_count=5):
        try:
            viewport_height = await page.evaluate("() => window.innerHeight")
            
            for i in range(scroll_count):
                await page.evaluate(f"window.scrollBy(0, {viewport_height})")
                await page.wait_for_timeout(1500)
                await self.force_lazy_load(page)
            
            await page.evaluate("window.scrollTo(0, 0)")
            await page.wait_for_timeout(1000)
        except Exception as error:
            print(f'Error durante el scroll: {error}')

    async def force_lazy_load(self, page):
        await page.evaluate("""
            () => {
                const lazyImages = document.querySelectorAll('img[loading="lazy"], img[data-src], img[data-srcset], img[data-original], img[data-lazy-src]');
                
                lazyImages.forEach(img => {
                    if (img.getAttribute('data-src')) {
                        img.setAttribute('src', img.getAttribute('data-src'));
                    }
                    if (img.getAttribute('data-srcset')) {
                        img.setAttribute('srcset', img.getAttribute('data-srcset'));
                    }
                    if (img.getAttribute('data-original')) {
                        img.setAttribute('src', img.getAttribute('data-original'));
                    }
                    if (img.getAttribute('data-lazy-src')) {
                        img.setAttribute('src', img.getAttribute('data-lazy-src'));
                    }
                    
                    img.loading = 'eager';
                    
                    if (img.dataset) {
                        img.dataset.wasProcessed = 'true';
                    }
                });
                
                const scrollEvent = new Event('scroll');
                window.dispatchEvent(scrollEvent);
            }
        """)

    async def download_as_mhtml(self, conn, m, url):
        self.active_requests += 1
        session_id = f"web_{int(time.time() * 1000)}"
        output_dir = await self.ensure_directories(session_id)

        try:
            browser_or_context = await self.init_browser()
            
            if self.persistent_context:
                page = await self.persistent_context.new_page()
            else:
                context = await browser_or_context.new_context(
                    user_agent=self.config['user_agent'],
                    bypass_csp=True
                )
                page = await context.new_page()
            
            page.set_default_timeout(self.config['browser_timeout'])
            
            try:
                await page.goto(url, timeout=self.config['browser_timeout'], wait_until='load')
            except Exception as navigation_error:
                print(f"Advertencia de navegación: {navigation_error}")
            
            await page.wait_for_timeout(5000)
            await self.scroll_page_down(page, self.config['scroll_pages'])
            await self.force_lazy_load(page)
            await page.wait_for_timeout(self.config['browser_wait_time'])

            cdp_session = await page.context.new_cdp_session(page)
            mhtml_data = await cdp_session.send('Page.captureSnapshot', {'format': 'mhtml'})
            
            file_path = output_dir / self.generate_safe_filename('web.mhtml')
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(mhtml_data['data'])
            
            await self.process_downloaded_file(conn, m, file_path, 'mhtml')
            
            await page.close()
            
            if not self.persistent_context and hasattr(page, 'context'):
                await page.context.close()
                
        except Exception as error:
            await conn.reply(m.chat, f"❌ Error al capturar MHTML: {str(error)}", m)
        finally:
            self.active_requests -= 1
            await self.close_browser_if_idle()
            try:
                shutil.rmtree(output_dir)
            except:
                pass

    async def download_as_pdf(self, conn, m, url):
        self.active_requests += 1
        session_id = f"web_{int(time.time() * 1000)}"
        output_dir = await self.ensure_directories(session_id)

        try:
            browser_or_context = await self.init_browser()
            
            if self.persistent_context:
                page = await self.persistent_context.new_page()
            else:
                context = await browser_or_context.new_context(
                    user_agent=self.config['user_agent'],
                    bypass_csp=True
                )
                page = await context.new_page()
            
            page.set_default_timeout(self.config['browser_timeout'])
            
            try:
                await page.goto(url, timeout=self.config['browser_timeout'], wait_until='load')
            except Exception as navigation_error:
                print(f"Advertencia de navegación: {navigation_error}")
            
            await page.wait_for_timeout(5000)
            await self.scroll_page_down(page, self.config['scroll_pages'])
            await self.force_lazy_load(page)
            await page.wait_for_timeout(self.config['browser_wait_time'])

            file_path = output_dir / self.generate_safe_filename('web.pdf')
            await page.pdf(path=str(file_path), format='A4', print_background=True)

            await self.process_downloaded_file(conn, m, file_path, 'pdf')

            await page.close()
            
            if not self.persistent_context and hasattr(page, 'context'):
                await page.context.close()
                
        except Exception as error:
            await conn.reply(m.chat, f"❌ Error al generar PDF: {str(error)}", m)
        finally:
            self.active_requests -= 1
            await self.close_browser_if_idle()
            try:
                shutil.rmtree(output_dir)
            except:
                pass

    async def download_images(self, conn, m, url):
        self.active_requests += 1
        session_id = f"web_{int(time.time() * 1000)}"
        output_dir = await self.ensure_directories(session_id)
        
        try:
            browser_or_context = await self.init_browser()
            
            if self.persistent_context:
                page = await self.persistent_context.new_page()
            else:
                context = await browser_or_context.new_context(
                    user_agent=self.config['user_agent'],
                    bypass_csp=True
                )
                page = await context.new_page()
            
            page.set_default_timeout(self.config['browser_timeout'])
            
            try:
                await page.goto(url, timeout=self.config['browser_timeout'], wait_until='load')
            except Exception as navigation_error:
                print(f"Advertencia de navegación: {navigation_error}")
            
            await page.wait_for_timeout(5000)
            await self.scroll_page_down(page, self.config['scroll_pages'])
            await self.force_lazy_load(page)
            await page.wait_for_timeout(self.config['browser_wait_time'])

            images = await page.evaluate("""
                () => {
                    const imgElements = Array.from(document.images);
                    return imgElements.map(img => ({
                        src: img.src,
                        size: img.naturalWidth * img.naturalHeight,
                        width: img.naturalWidth,
                        height: img.naturalHeight
                    })).filter(img => img.src && img.src.startsWith('http'));
                }
            """)

            valid_images = [
                img['src'] for img in images 
                if img['width'] > 100 and img['height'] > 100 and img['size'] > self.config['max_image_size']
            ][:self.config['max_images']]

            if len(valid_images) == 0:
                await conn.reply(m.chat, '❌ No se encontraron imágenes mayores a 10KB', m)
                return

            for image_url in valid_images:
                try:
                    response = await page.context.request.get(image_url)
                    if response.status != 200:
                        continue

                    buffer = await response.body()
                    file_path = output_dir / self.generate_safe_filename('image.jpg')
                    
                    with open(file_path, 'wb') as f:
                        f.write(buffer)
                    
                    await self.process_downloaded_file(conn, m, file_path, 'jpg')
                except Exception as error:
                    print(f"Error downloading image {image_url}: {error}")

            await page.close()
            
            if not self.persistent_context and hasattr(page, 'context'):
                await page.context.close()
                
        except Exception as error:
            await conn.reply(m.chat, f"❌ Error al descargar imágenes: {str(error)}", m)
        finally:
            self.active_requests -= 1
            await self.close_browser_if_idle()
            try:
                shutil.rmtree(output_dir)
            except:
                pass

    async def process_queue(self):
        if len(self.queue) == 0 and self.active_requests == 0:
            await self.close_browser_if_idle()
            return

        if len(self.queue) > 0 and self.active_requests < self.max_downloads:
            request = self.queue.pop(0)
            url, conn, m, req_type = request['url'], request['conn'], request['m'], request['type']
            
            if req_type == 'img':
                await self.download_images(conn, m, url)
            elif req_type == 'pdf':
                await self.download_as_pdf(conn, m, url)
            else:
                await self.download_as_mhtml(conn, m, url)
            
            await self.process_queue()

web_downloader = WebDownloader()

async def handler(m, conn, text):
    if not text:
        await conn.reply(m.chat, '❌ URL?.', m)
        return

    args = text.strip().split()
    url = next((arg for arg in args if arg.startswith('http')), None)

    if not url:
        await conn.reply(m.chat, '❌ URL', m)
        return

    command = args[0].lower() if args else ''
    req_type = 'mhtml'

    if command == 'pdf':
        req_type = 'pdf'
        await conn.reply(m.chat, '💾 Generando PDF...', m)
    elif command == 'img':
        req_type = 'img'
        await conn.reply(m.chat, '💾 Descargando Imagenes...', m)
    else:
        await conn.reply(m.chat, '💾 Descargando...', m)

    web_downloader.queue.append({
        'url': url,
        'conn': conn,
        'm': m,
        'type': req_type
    })
    
    await web_downloader.process_queue()

def get_handler():
    return {
        'help': ['web', 'web pdf', 'web img'],
        'tags': ['tools'],
        'command': r'^(web)$',
        'owner': False,
        'handler': handler
    }
