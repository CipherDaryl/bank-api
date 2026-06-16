const dotenv = require('dotenv');
dotenv.config();

const app = require('./src/app.js');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 Serveur démarré avec succès !`);
  console.log(`=================================`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api/v1`);
  console.log(`=================================`);
});