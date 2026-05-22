/**
 * Utilidades para procesamiento de imágenes del lado del cliente.
 * Usa la API nativa de Canvas para evitar dependencias pesadas en el servidor.
 */

export const convertToWebP = async (file: File, maxWidth = 800, quality = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        
        // Calcular nuevas dimensiones manteniendo la relación de aspecto
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo inicializar el Canvas."));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir el canvas a un Blob en formato WebP
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Error al convertir la imagen a WebP."));
              return;
            }
            
            // Reemplazar la extensión original por .webp
            const fileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const webpFile = new File([blob], fileName, { type: "image/webp" });
            resolve(webpFile);
          },
          "image/webp",
          quality
        );
      };
      img.onerror = () => reject(new Error("No se pudo cargar la imagen original."));
    };
    reader.onerror = () => reject(new Error("Error leyendo el archivo."));
  });
};
