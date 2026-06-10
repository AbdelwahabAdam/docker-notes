const express = require('express');
const mongoose = require('mongoose');
const { createClient } = require('redis');

async function start() {
    const client = createClient({ url: 'redis://redis:6379' });
    client.on('error', (err) => console.log('Redis Client Error', err));
    await client.connect();
    console.log('Connected to Redis');

    const PORT = process.env.PORT || 4000;
    const app = express();

    const DB_USERNAME = 'root';
    const DB_PASSWORD = 'password';
    const DB_HOST = 'mongo_db';
    const DB_PORT = '27017';
    const uri = `mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/`;

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    app.get('/', async (req, res) => {
        await client.set('greeting', 'Hello, World! hi from Docker - Redis');
        res.send('Hello, World! hi from Docker');
    });


    app.get('/data', async (req, res) => {
        try {
            const value = await client.get('greeting');
            res.send(value ?? 'No greeting found');
        } catch (err) {
            console.error('Error fetching from Redis:', err);
            res.status(500).send('Error fetching data');
        }
    });



    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

start().catch((err) => console.error(err));