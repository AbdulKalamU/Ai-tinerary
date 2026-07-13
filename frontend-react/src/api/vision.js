import api from './axios';

/**
 * Helper to compress and convert an image file to Base64
 */
export const imageToBase64 = (file, maxWidth = 1200) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG with 0.7 quality to save bandwidth
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const analyzePassport = async (base64Image, mimeType = 'image/jpeg') => {
  const response = await api.post('/vision/passport', { base64Image, mimeType });
  return JSON.parse(response.data);
};

export const analyzeLuggage = async (base64Image, destinationContext, mimeType = 'image/jpeg') => {
  const response = await api.post('/vision/luggage', { base64Image, mimeType, destinationContext });
  return JSON.parse(response.data);
};

export const analyzeReceipt = async (base64Image, mimeType = 'image/jpeg') => {
  const response = await api.post('/vision/receipt', { base64Image, mimeType });
  return JSON.parse(response.data);
};
