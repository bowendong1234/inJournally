const dotenv = require('dotenv');
const app = require('./app');

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running at ${process.env.API_URL || `http://localhost:${port}`}`);
});
