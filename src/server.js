const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/:category', (req, res) => {
  const category = req.params.category;
  const filePath = path.join(__dirname, `../data/${category}.json`);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file: ${filePath}`, err);
      res.status(404).json({ error: `Category "${category}" not found.` });
    } else {
      try {
        const jsonData = JSON.parse(data);
        res.json(jsonData);
      } catch (parseError) {
        console.error(`Error parsing JSON from file: ${filePath}`, parseError);
        res.status(500).json({ error: 'Failed to parse category data.' });
      }
    }
  });
});

app.use((req, res) => {
  res.status(404).send('404: Resource not found.');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
