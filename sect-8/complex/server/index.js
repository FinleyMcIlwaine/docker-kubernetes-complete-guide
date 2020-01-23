const keys = require('./keys.js');

// Express app setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL client setup
const { Pool } = require('pg');
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});

pgClient.on('error', () => { console.error('Lost PG connection!') });

pgClient
  .query('CREATE TABLE IF NOT EXISTS values (number INT')
  .catch((err) => { console.error(err); });

// Redis client setup
const redis = require('redis');
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});

// "Watch" connections cannot be used for other things, so we create a dedicated on
const redisPublisher = redisClient.duplicate();

// Express routes
app.get('/', (req,res) => {
  res.send('Hi');
});

app.get('/values/all', async (req,res) => {
  const values = await pgClient.query('SELECT * FROM values');
  res.send(values.rows);
});

app.get('/values/current', async (req,res) => {
  // Redis doens't support promises :( so no cool await syntax
  redisClient.hgetall('values', (err,values) => {
    res.send(values);
  });
});

app.post('/values', async (req,res) => {
  const index = req.body.index;
  if (+index > 40) return res.status(422).send('Index too high!!');
  redisClient.hset('values', index, 'Nothing yet!');
  // This is how we wake up the worker process
  redisPublisher.publish('insert', index);

  // Add the new index to postgres
  pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

  res.send({ working : true });
});

app.listen(5000, () => {
  console.log('Listening');
});
