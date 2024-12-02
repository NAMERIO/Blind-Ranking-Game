const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

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

app.post('/api/suggest-category', (req, res) => {
  const suggestion = req.body;
  const filePath = path.join(__dirname, '../data/suggestion.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
      let suggestions = [];
      if (!err && data) {
          try {
              suggestions = JSON.parse(data);
          } catch (parseError) {
              console.error('Error parsing existing suggestions:', parseError);
          }
      }
      suggestions.push(suggestion);
      fs.writeFile(filePath, JSON.stringify(suggestions, null, 2), 'utf8', (writeErr) => {
          if (writeErr) {
              console.error('Error saving suggestion:', writeErr);
              return res.status(500).json({ error: 'Failed to save suggestion' });
          }
          res.status(200).json({ message: 'Suggestion saved successfully' });
      });
  });
});

app.use((req, res) => {
  res.status(404).send('404: Resource not found.');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
