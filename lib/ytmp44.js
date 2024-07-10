/*
Licencia MIT

Derechos de autor (c) 2023 Arom

Se concede permiso, sin cargo, a cualquier persona que obtenga una copia
de este software y los archivos de documentación asociados (el "Software"),
para usar, copiar, modificar, fusionar, publicar, distribuir, sublicenciar
y/o vender copias del Software, y permitir a las personas a quienes se les 
proporcione el Software a hacerlo, sujeto a las siguientes condiciones:

El aviso de derechos de autor y esta nota de permiso deben incluirse en todas
las copias o partes sustanciales del Software.

EL SOFTWARE SE PROPORCIONA "TAL CUAL", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O 
IMPLÍCITA, INCLUYENDO PERO NO LIMITADO A GARANTÍAS DE COMERCIALIZACIÓN,
IDONEIDAD PARA UN PROPÓSITO PARTICULAR E INFRACCIÓN. EN NINGÚN CASO LOS AUTORES 
O TITULARES DEL COPYRIGHT SERÁN RESPONSABLES DE NINGUNA RECLAMACIÓN, DAÑO U 
OTRA RESPONSABILIDAD, YA SEA EN UNA ACCIÓN DE CONTRATO, AGRAVIO O DE OTRO TIPO,
DERIVADA DE, FUERA O EN CONEXIÓN CON EL SOFTWARE O SU USO U OTROS TRATOS EN EL 
SOFTWARE.

Créditos:
- Código original: https://github.com/ruhend2001/ruhend-ytmp4
- Editado por: https://github.com/BrunoSobrino
*/

import axios from 'axios';
import { stringify } from 'querystring';
import cheerio from 'cheerio';

const ytmp44 = async (url) => {
  const parameters = {
    'url': url,
    'format': 'mp4',
    'lang': 'en'
  };

  try {
    const conversionResponse = await axios.post('https://s64.notube.net/recover_weight.php', stringify(parameters));
    if (!conversionResponse.data.token) {
      throw new Error('No se recibió un token de la respuesta de conversión.');
    }
    const token = conversionResponse.data.token;
    const downloadPageResponse = await axios.get('https://notube.net/en/download?token=' + token);

    if (downloadPageResponse.status !== 200) {
      throw new Error('No se pudo recuperar la página de descarga.');
    }

    const $ = cheerio.load(downloadPageResponse.data);
    const result = {
      'titulo': $('#breadcrumbs-section h2').text(),
      'descargar': $('#breadcrumbs-section #downloadButton').attr('href')
    };

    return { status: true, resultados: result };
  } catch (error) {
    console.error('Error al convertir el video de YouTube:', error);
    return { status: false, error: error.message };
  }
};

export default ytmp44;
