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
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(404).json('É obrigatório email e senha');
    }

    try {
        const usuario = await knex('usuarios').where({ email }).first();

        if (!usuario) {
            return res.status(400).json("O usuario não foi encontrado");
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            return res.status(400).json("Email e senha não confere");
        }

        const token = jwt.sign({ id: usuario.id }, process.env.PASSWORD, { expiresIn: '8h' });

        const { senha: _, ...dadosUsuario } = usuario;

        return res.status(200).json({
            usuario: dadosUsuario,
            token
        });
    } catch (error) {
        console.log(error.message)
        return res.status(400).json(error.message);
    }
}

const identifyUser = async (req, res) => {
    return res.status(200).json(req.usuario);
};

const updateUser = async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        const body = {};

        if (nome) body.nome = nome;
        if (email) body.email = email;
        if (senha) body.senha = senha;

        if (email) {
            if (email !== req.usuario.email) {
                const quantidadeUsuarios = await knex('usuarios').where({ email });

                if (quantidadeUsuarios.length > 0) {
                    return res.status(400).json("O email já existe");
                };
                console.log(quantidadeUsuarios)
            };
        };

        if (senha) {
            body.senha = await bcrypt.hash(senha, 10);
        };

        const usuarioAtualizado = await knex('usuarios').where('id', req.usuario.id).update(body).returning('*');

        if (!usuarioAtualizado) {
            return res.status(400).json("O usuario não foi atualizado");
        };

        return res.status(200).json('Usuario foi atualizado com sucesso.');
    } catch (error) {
        return res.status(400).json(error.message);
    };
};

module.exports = {
    createUser,
    login,
    identifyUser,
    updateUser
};