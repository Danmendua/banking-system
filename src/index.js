require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.get('/favicon.ico', (req, res) => res.status(204));
app.use(express.static(path.join(__dirname, 'public')));

const router = require('./router');

app.use(router);
app.listen(process.env.PORT, () => {
    console.log('listening on port ' + process.env.PORT);
});