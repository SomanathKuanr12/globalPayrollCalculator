
const con = require('../config'); // Import the database connection
 
// Route to get paginated source update assumptions
function getUpdatedAssumption(req, res){
    
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
 
    const query = `
        SELECT * FROM sourceupdateassumption
        LIMIT ?, ?`;
 
    con.query(query, [offset, limit], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
 
        con.query('SELECT COUNT(*) AS total FROM sourceupdateassumption', (countErr, countResults) => {
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
 
// Route to update a source update assumption
function updateUpdatedAssumption (req, res) {
    const sourceUpdateAssumptionId = req.params.id;
    const { country_id, country_name, assumption_id, assumption_name, full_assumption_name, source_assumption_name, match_percentage, source, type, is_correct_value } = req.body;
 
    const query = `
        UPDATE sourceupdateassumption
        SET country_id = ?, country_name = ?, assumption_id = ?, assumption_name = ?, full_assumption_name = ?, source_assumption_name = ?, \`match%\` = ?, source = ?, type = ?, is_correct_value = ?
        WHERE sourceUpdateAssumption_id = ?`;
 
    con.query(query, [country_id, country_name, assumption_id, assumption_name, full_assumption_name, source_assumption_name, match_percentage, source, type, is_correct_value, sourceUpdateAssumptionId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
 
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Source update assumption not found' });
        }
 
        res.status(200).json({ message: 'Source update assumption updated successfully' });
    });
};
 
 
module.exports = {
    getUpdatedAssumption,
    updateUpdatedAssumption
};
 