/**
 * Recorta la imagen al centro en un cuadrado de `size` px y la devuelve como
 * dataURL JPEG, lista para guardarse en localStorage (~15–25 KB).
 *
 * @param {File} file
 * @param {number} size Lado del cuadrado en px.
 * @returns {Promise<string>}
 */
export async function resizeImageToDataUrl(file, size) {
  if (!file.type.startsWith('image/')) throw new Error('Elige un archivo de imagen (JPG, PNG o WebP).')

  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error('No se pudo leer la imagen. Prueba con otra.')
  })

  const side = Math.min(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  context.imageSmoothingQuality = 'high'
  context.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    size,
    size,
  )
  bitmap.close()
  return canvas.toDataURL('image/jpeg', 0.85)
}
