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


module.exports = {
    alredyExist,
    userNotFound,
};