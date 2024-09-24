
const con = require('../config'); // Import the database connection
 
// Route to get paginated assumption data
function getAssumptionInfo(req, res){
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
 
    const query = `
        SELECT * FROM assumption_info
        LIMIT ?, ?`;
 
    con.query(query, [offset, limit], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
 
        con.query('SELECT COUNT(*) AS total FROM assumption_info', (countErr, countResults) => {
            if (countErr) {
                return res.status(500).json({ error: countErr.message });
            }
 
            const totalItems = countResults[0].total;
            const totalPages = Math.ceil(totalItems / limit);
 
            res.status(200).json({
                currentPage: page,
                totalPages,
                totalItems,
                limit: limit,
                offset: offset,
                data: results
            });
        });
    });
};
 
// Route to edit assumption data
function updateAssumptionInfo(req, res){
    const assumptionId = req.params.id;
    const { country_id, assumption_name, assumption_rate, cap_status, cap_value, min_thresold, max_thresold } = req.body;
 
    const query = `
        UPDATE assumption_info
        SET country_id = ?, assumption_name = ?, assumption_rate = ?, cap_status = ?, cap_value = ?, min_thresold = ?, max_thresold = ?
        WHERE assumption_id = ?`;
 
    con.query(query, [country_id, assumption_name, assumption_rate, cap_status, cap_value, min_thresold, max_thresold, assumptionId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
 
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Assumption not found' });
        }
 
        res.status(200).json({ message: 'Assumption updated successfully' });
    });
};
 
// Route to get all assumptions data
function updateAssumptionInfo(req, res){
    const query = 'SELECT * FROM assumption_info';
 
    con.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
 
        res.status(200).json(results);
    });
};
 
module.exports = {
    getAssumptionInfo,
    updateAssumptionInfo
};