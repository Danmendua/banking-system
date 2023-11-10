const pool = require('../connection');

const getTransactionsByUser = async (req, res) => {
    const userId = req.userId;
    const filtros = req.query.filtro;

    try {
        let query = 'SELECT t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao AS categoria_nome FROM transacoes t INNER JOIN categorias c ON t.categoria_id = c.id WHERE t.usuario_id = $1 ORDER BY id';

        if (filtros && Array.isArray(filtros) && filtros.length > 0) {
            const formatedFiltros = filtros.map(filtro => {
                return filtro[0].toUpperCase() + filtro.slice(1).toLowerCase();
            });

            query = `SELECT t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao AS categoria_nome
            FROM transacoes t
            INNER JOIN categorias c ON t.categoria_id = c.id
            WHERE t.usuario_id = $1
            AND c.descricao IN (${formatedFiltros.map((_, index) => `$${index + 2}`).join(', ')})`;

            const queryParams = [userId, ...formatedFiltros];
            const { rows } = await pool.query(query, queryParams);
            return res.status(200).json(rows);
        }

        const { rows } = await pool.query(query, [userId]);
        return res.status(200).json(rows);
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }
};

const getTransactionById = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId

    try {
        const query = 'SELECT t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao AS categoria_nome FROM transacoes t INNER JOIN categorias c ON t.categoria_id = c.id WHERE t.id = $1 AND t.usuario_id = $2';
        const { rows, rowCount } = await pool.query(query, [id, userId]);
        if (rowCount === 0) {
            return res.status(404).json({ mensagem: 'Transação não encontrada.' });
        }
        return res.status(200).json(rows[0]);
    } catch (error) {
        return res.status(401).json({ mensagem: 'Para acessar este recurso, um token de autenticação válido deve ser enviado.' });
    }
};

const createTransaction = async (req, res) => {
    const { descricao, valor, data, categoria_id, tipo } = req.body;
    const userId = req.userId;

    try {
        const query = 'INSERT INTO transacoes (descricao, valor, data, categoria_id, usuario_id, tipo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *'
        const { rows } = await pool.query(query, [descricao, valor, data, categoria_id, userId, tipo]);
        const { rows: categoryName } = await pool.query('SELECT descricao FROM categorias WHERE id = $1', [categoria_id]);

        const bodyFormat = rows.map(row => ({
            id: row.id,
            tipo: row.tipo,
            descricao,
            valor,
            data,
            usuario_id: userId,
            categoria_id,
            categoria_nome: categoryName[0].descricao
        }))[0] || null;
        return res.status(201).json(bodyFormat);
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
};

const updateTransaction = async (req, res) => {
    const { descricao, valor, data, categoria_id, tipo } = req.body;
    const idTransacao = req.params.id
    const userId = req.userId;
    try {
        const { rowCount } = await pool.query('SELECT * FROM transacoes WHERE id = $1 AND usuario_id = $2', [idTransacao, userId]);
        if (rowCount === 0) {
            return res.status(404).json({ mensagem: 'Transação não encontrada' });
        }
        const query = 'UPDATE transacoes SET descricao = $1, valor = $2, data = $3, categoria_id = $4, tipo = $5 WHERE id = $6';
        await pool.query(query, [descricao, valor, data, categoria_id, tipo, idTransacao]);
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
};

const deleteTransaction = async (req, res) => {
    const transacaoId = req.params.id;
    const userId = req.userId;
    try {
        const query = 'DELETE FROM transacoes WHERE id = $1 AND usuario_id = $2 RETURNING *';
        const { rowCount } = await pool.query(query, [transacaoId, userId]);
        if (rowCount === 0) {
            return res.status(404).json({ mensagem: 'Transação não encontrada' });
        }
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
};

const getTransaction = async (req, res) => {
    const userId = req.userId;
    const answer = {
        entrada: 0,
        saida: 0
    }
    try {
        const query = `SELECT tipo, SUM(valor) AS total FROM transacoes WHERE usuario_id = $1 GROUP BY tipo;`;
        const { rows, rowCount } = await pool.query(query, [userId]);
        if (rowCount === 0) {
            return res.status(404).json({ mensagem: 'Transação não encontrada' });
        };
        for (let each of rows) {
            if (each.tipo === 'entrada') {
                answer.entrada = Number(each.total)
            } else if (each.tipo === 'saida') {
                answer.saida = Number(each.total)
            }
        }
        return res.status(200).json(answer);
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro interno do servidor' });
    }
};

module.exports = {
    getTransactionsByUser,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransaction
};
