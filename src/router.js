const express = require('express');
const routers = express();
routers.use(express.json());

// controllers
const { createUser,
    login,
    identifyUser,
    updateUser } = require('./controllers/users')

const { listCategories } = require('./controllers/category')

const { getTransactionsByUser,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransaction } = require('./controllers/transaction')

// middlewares
const { alredyExist,
    userNotFound,
    updateAccountVerify } = require('./middlewares/users')

const { validateRequiredFields,
    validateTransactionType,
    checkTransactionExistence,
    checkCategory } = require('./middlewares/transaction');

// authorization middleware
const { verifyLogin } = require('./middlewares/authorization');

// routers
routers.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
routers.post('/usuario', alredyExist, createUser);
routers.post('/login', userNotFound, login);

routers.use(verifyLogin);

routers.get('/usuario', identifyUser)
routers.put('/usuario', updateAccountVerify, updateUser)

routers.get('/categoria', listCategories);

routers.get('/transacao/extrato', getTransaction);
routers.get('/transacao', getTransactionsByUser);
routers.get('/transacao/:id', checkTransactionExistence, getTransactionById);
routers.post('/transacao', validateRequiredFields, checkCategory, validateTransactionType, createTransaction);
routers.put('/transacao/:id', checkTransactionExistence, validateRequiredFields, checkCategory, validateTransactionType, updateTransaction);
routers.delete('/transacao/:id', deleteTransaction);



module.exports = routers;
