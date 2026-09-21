import imageCompression from 'browser-image-compression';

const CLOUD_NAME = 'bzokhwff';
const UPLOAD_PRESET = 'noticias_radio';

/**
 * Comprime una imagen en el navegador y la sube a Cloudinary.
 * Retorna la URL optimizada.
 */
export async function uploadAndCompressImage(file) {
  // 1. Configuración de compresión (máximo 1200px de ancho y 1MB)
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
  };

  try {
    // Comprimir en el cliente
    const compressedFile = await imageCompression(file, options);
    console.log(`Original: ${file.size / 1024 / 1024} MB, Comprimido: ${compressedFile.size / 1024 / 1024} MB`);

    // 2. Preparar el FormData para Cloudinary
    const formData = new FormData();
    formData.append('file', compressedFile);
    formData.append('upload_preset', UPLOAD_PRESET);

    // 3. Subir a la API de Cloudinary
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error al subir imagen a Cloudinary');
    }

    const data = await response.json();
    
    // 4. Agregar optimizaciones automáticas a la URL (f_auto, q_auto)
    // data.secure_url se ve así: https://res.cloudinary.com/bzokhwff/image/upload/v1234/xyz.jpg
    // Lo transformamos a: https://res.cloudinary.com/bzokhwff/image/upload/f_auto,q_auto/v1234/xyz.jpg
    const optimizedUrl = data.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');
    
    return optimizedUrl;
  } catch (error) {
    console.error('Error procesando la imagen:', error);
    throw error;
  }
}

