const knex = require('../connection');
const bcrypt = require('bcrypt');

const alredyExist = async (req, res, next) => {
    const { email } = req.body;
    try {
        const encontrarUsuario = await knex('usuarios').where({ email }).first();
        if (encontrarUsuario) {
            return res.status(404).json({ mensagem: "Conta existente" });
        };
        next();
    } catch (erro) {
        return res.status(500).json({ mensagem: "Erro interno do servidor" });
    };
};


const userNotFound = async (req, res, next) => {
    const { email, senha } = req.body;

    try {
        const user = await pool.query('select * from usuarios where email = $1', [email]);

        if (user.rowCount === 0) {
            return res.status(404).json({ mensagem: "Usuário e/ou senha inválido(s)." });
        };

        const passwordCheck = await bcrypt.compare(senha, user.rows[0].senha);

        if (!passwordCheck) {
            return res.status(400).json({ mensagem: "Usuário e/ou senha inválido(s)." });
        };

        next();
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    };
};

const updateAccountVerify = async (req, res, next) => {
    const userId = req.userId;
    const allInformed = req.body;

    if (Object.values(allInformed).some(campo => (campo === null || campo === undefined) || (typeof campo === 'string' && campo.trim() === ''))) {
        return res.status(400).json({ mensagem: 'É necessário preencher todos os campos' });
    } else if (!allInformed.nome || !allInformed.email || !allInformed.senha) {
        return res.status(400).json({ mensagem: 'É necessário preencher todos os camposss' });
    }

    try {
        const { rowCount } = await pool.query(`select * from usuarios where email = $1 and id != $2`, [allInformed.email, userId])
        if (rowCount > 0) {
            return res.status(409).json({ mensagem: "O e-mail informado já está sendo utilizado por outro usuário." });
        };
        next();
    } catch (erro) {
        return res.status(500).json({ mensagem: "Erro interno do servidor" });
    };
};

module.exports = {
    alredyExist,
    userNotFound,
    updateAccountVerify
};