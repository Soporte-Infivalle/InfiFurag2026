const CONFIG = {
  // URL del Apps Script que recibe y guarda las respuestas en Google Sheets
  // Ver instrucciones en README.md → Paso 3
  WEBHOOK_URL: 'https://script.google.com/macros/s/AKfycbxhSNm9itjpADZq8PHf30NsYsQfLq79dXPtYgnScT6zg3XpQ7gVIsf8bX8S3a3s89V1Rw/exec',
// Directorio base de datos (ruta absoluta desde la raíz del sitio)
  DATA_DIR: '/InfiFurag2026/data',

  // Versión para cache-busting — incrementa al actualizar preguntas
  VERSION: '1',

  // Contraseña del panel admin (cámbiala antes de desplegar)
  ADMIN_PWD: 'furag2025',
};