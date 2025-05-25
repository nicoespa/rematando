const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Asegurarse de que el directorio public existe
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Crear un ícono simple con el texto "RA"
async function createIcon(size, outputPath) {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#4f46e5"/>
      <text x="50%" y="50%" font-family="Arial" font-size="${size/2}px" fill="white" text-anchor="middle" dominant-baseline="middle">RA</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);
}

// Generar todos los iconos necesarios
async function generateIcons() {
  try {
    // Icono principal 192x192
    await createIcon(192, path.join(publicDir, 'icon-192x192.png'));
    console.log('✓ Generado icon-192x192.png');

    // Icono principal 512x512
    await createIcon(512, path.join(publicDir, 'icon-512x512.png'));
    console.log('✓ Generado icon-512x512.png');

    // Badge para notificaciones
    await createIcon(72, path.join(publicDir, 'badge-72x72.png'));
    console.log('✓ Generado badge-72x72.png');

    // Favicon
    await createIcon(32, path.join(publicDir, 'favicon.ico'));
    console.log('✓ Generado favicon.ico');

    console.log('\n¡Todos los iconos han sido generados exitosamente!');
  } catch (error) {
    console.error('Error generando los iconos:', error);
  }
}

generateIcons(); 