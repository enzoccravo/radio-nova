import imageCompression from 'browser-image-compression';

const CLOUD_NAME = 'bzokhwff';
const UPLOAD_PRESET = 'noticias_radio';

export async function uploadAndCompressImage(file) {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    console.log(`Original: ${file.size / 1024 / 1024} MB, Comprimido: ${compressedFile.size / 1024 / 1024} MB`);

    const formData = new FormData();
    formData.append('file', compressedFile);
    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error al subir imagen a Cloudinary');
    }

    const data = await response.json();
    const optimizedUrl = data.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');
    
    return optimizedUrl;
  } catch (error) {
    console.error('Error procesando la imagen:', error);
    throw error;
  }
}

export function isCloudinaryUrl(url) {
  if (!url) return false;
  return url.includes('res.cloudinary.com');
}

export function getCroppedImageUrl(imageUrl, aspectRatio, width, focalX = 0.5, focalY = 0.5) {
  if (!isCloudinaryUrl(imageUrl)) return imageUrl;

  const transformations = `c_fill,ar_${aspectRatio},w_${width},g_xy_center,x_${focalX},y_${focalY}/f_auto,q_auto`;

  if (imageUrl.includes('/upload/f_auto,q_auto/')) {
    return imageUrl.replace('/upload/f_auto,q_auto/', `/upload/${transformations}/`);
  }
  
  return imageUrl.replace('/upload/', `/upload/${transformations}/`);
}

export function getResponsiveImageUrls(imageUrl, focalX = 0.5, focalY = 0.5) {
  if (!isCloudinaryUrl(imageUrl)) {
    return { desktop: imageUrl, tablet: imageUrl, mobile: imageUrl };
  }

  return {
    desktop: getCroppedImageUrl(imageUrl, '16:10', 800, focalX, focalY),
    tablet: getCroppedImageUrl(imageUrl, '3:2', 600, focalX, focalY),
    mobile: getCroppedImageUrl(imageUrl, '4:3', 400, focalX, focalY),
  };
}
