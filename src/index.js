require('dotenv').config();
const express = require('express');

const app = express();
const router = require('./router');

app.use(router);
app.listen(process.env.PORT, () => {
    console.log('listening on port ' + process.env.PORT);
});