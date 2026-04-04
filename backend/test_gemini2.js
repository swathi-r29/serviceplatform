require('dotenv').config();
const axios = require('axios');

async function getModels() {
  try {
    const res = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const names = res.data.models.map(m => m.name);
    const fs = require('fs');
    fs.writeFileSync('all_models.txt', names.join('\n'));
    console.log("Successfully wrote all models to all_models.txt");
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
getModels();
