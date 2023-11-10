const knex = require('../connection')
const pool = require('../connection');

const validateRequiredFields = (req, res, next) => {
    const { descricao, valor, data, categoria_id, tipo } = req.body;
    try {
        if (!descricao || !valor || !data || !categoria_id || !tipo) {
            return res.status(400).json({ mensagem: 'Todos os campos obrigatórios devem ser informados.' });
        }
        next();
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
};

const validateTransactionType = (req, res, next) => {
    const { tipo } = req.body;
    try {
        if (tipo !== 'entrada' && tipo !== 'saida') {
            return res.status(400).json({ mensagem: 'O tipo deve ser entrada ou saida.' });
        }
        next();
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
};

const checkTransactionExistence = async (req, res, next) => {
    const { id } = req.params;

    try {
        const { rowCount } = await pool.query('SELECT * FROM transacoes WHERE id = $1', [id]);
        if (rowCount === 0) {
            return res.status(404).json({ mensagem: 'Transação não encontrada.' });
        }
        next();
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
};

const checkCategory = async (req, res, next) => {
    const { categoria_id } = req.body;
    try {
        const query = 'SELECT * FROM categorias WHERE id = $1';
        const { rows, rowCount } = await pool.query(query, [categoria_id]);

        if (rowCount === 0) {
            return res.status(404).json({ mensagem: 'Categoria não encontrada.' });
        }

        req.categoria = rows[0];
        next();
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
};

module.exports = {
    validateRequiredFields,
    validateTransactionType,
    checkTransactionExistence,
    checkCategory
};
