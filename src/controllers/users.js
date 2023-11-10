const knex = require('../connection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const createUser = async (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome) {
        return res.status(404).json("O campo nome é obrigatório");
    };

    if (!email) {
        return res.status(404).json("O campo email é obrigatório");
    };

    if (!senha) {
        return res.status(404).json("O campo senha é obrigatório");
    };

    try {
        const encriptedPassword = await bcrypt.hash(senha, 10);
        const newUser = await knex('usuarios').insert({ nome, email, senha: encriptedPassword }).returning(['nome', 'email']);

        if (!newUser) {
            return res.status(400).json("O usuário não foi cadastrado.");
        };

        return res.status(201).json(newUser[0]);
    } catch (erro) {
        return res.status(500).json({ mensagem: "Erro interno do servidor" });
    };
};

const login = async (req, res) => {
    const { email } = req.body;

    try {
        const query = 'SELECT * FROM USUARIOS WHERE email = $1';
        const user = await pool.query(query, [email]);

        const token = jwt.sign({ id: user.rows[0].id, nome: user.rows[0].nome }, process.env.PASSWORD, { expiresIn: '8h' });

        const { senha: _, ...loggedInUser } = user.rows[0];

        return res.json({ usuario: loggedInUser, token });

    } catch (erro) {
        return res.status(500).json({ mensagem: "Erro interno do servidor" });
    };
};

const identifyUser = async (req, res) => {
    const userId = req.userId;
    try {
        const query = 'SELECT * FROM USUARIOS WHERE id = $1';
        const { rows } = await pool.query(query, [userId]);
        const { senha: _, ...loggedInUser } = rows[0];
        return res.json(loggedInUser);
    } catch (error) {
        return res.status(401).json({ mensagem: 'Para acessar este recurso um token de autenticação válido deve ser enviado.' })
    };
};


const updateUser = async (req, res) => {
    const userId = req.userId;
    const { nome, email, senha } = req.body;

    try {
        const encriptedPassword = await bcrypt.hash(senha, 10);
        const query = 'UPDATE USUARIOS SET nome = $1, email = $2, senha = $3 WHERE id = $4';
        await pool.query(query, [nome, email, encriptedPassword, userId]);
        return res.sendStatus(204);
    } catch (error) {
        return res.status(500).json({ mensagem: "Erro interno do servidor" });
    };
};

module.exports = {
    createUser,
    login,
    identifyUser,
    updateUser
};