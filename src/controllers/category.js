const pool = require("../connection");

const listCategories = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categorias');
        const categorias = result.rows;

        if (categorias.length > 0) {
            res.status(200).json(categorias);
        } else {
            res.status(204).send();
        }
    } catch (err) {
        res.status(500).json({ mensagem: "Ocorreu um erro ao buscar as categorias" });
    }
};

module.exports = { listCategories };