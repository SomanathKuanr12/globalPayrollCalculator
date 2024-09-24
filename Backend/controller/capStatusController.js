
const con = require('../config'); // Import the database connection
 
// Route to get all cap statuses with pagination
// router.get('/getCapStatuses', (req, res) => 
    function getCapStatus(req, res) {
    
    
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.offset) || 1;
    console.log(limit);
    console.log(page);
    
    const offset = (page - 1) * limit;
 
    const query = `
        SELECT * FROM cap_status
        LIMIT ?, ?`;
 
    con.query(query, [offset, limit], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
 
        // Count the total number of rows in the table for pagination metadata
        con.query('SELECT COUNT(*) AS total FROM cap_status', (countErr, countResults) => {
            if (countErr) {
                return res.status(500).json({ error: countErr.message });
            }
 
            const totalItems = countResults[0].total;
            const totalPages = Math.ceil(totalItems / limit);
 
            // Response with pagination metadata, current page data, and offset
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
 
// Route to update an existing cap status
function updateCapSatus(req, res){
    const statusId = req.params.id;
    const { status_name } = req.body;
 
    const query = 'UPDATE cap_status SET status_name = ? WHERE status_id = ?';
 
    con.query(query, [status_name, statusId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
 
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cap status not found' });
        }
 
        res.status(200).json({ message: 'Cap status updated successfully' });
    });
};
 
module.exports = {
    getCapStatus,
    updateCapSatus
}