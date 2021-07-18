const express = require('express');
const app = express();
const path = require('path');
const fetch = require('node-fetch');

require('dotenv').config();
const port = 3000;

const apiKey = process.env.API_KEY;
const mapboxToken = process.env.MAPBOX_TOKEN;
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/getweather', async (req, res) => {
    const q = req.query.q;
    const response = await fetch(`https://weatherapi-com.p.rapidapi.com/forecast.json?q=${q}`, {
        "method": "GET",
        "headers": {
            "x-rapidapi-key": apiKey,
            "x-rapidapi-host": "weatherapi-com.p.rapidapi.com"
        }
    });
    const data = await response.json();
    data.mapToken = mapboxToken;
    res.json(data);
});

app.listen(port, () => {
    console.log(`App running on port: ${port}`);
})