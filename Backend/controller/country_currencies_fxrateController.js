
const con = require('../config'); // Import the database connection
 
// Route to get paginated country currencies FX rates

    // Get page and limit from query parameters, with default values
 function getCountryFxRate(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
 
    const query = `
        SELECT * FROM country_currencies_fxrate
        LIMIT ?, ?`;
 
    con.query(query, [offset, limit], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
 
        // Count the total number of rows in the table for pagination metadata
        con.query('SELECT COUNT(*) AS total FROM country_currencies_fxrate', (countErr, countResults) => {
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
 
// Route to update an existing country currency FX rate
function updateCountryFxRate(req,res) {
    const fxRateId = req.params.id;
    const { country_name, currency, currency_symbol, gbp_rate, inverse_gbp_rate, country_id, monthly_management_fee, is_invoice_currency } = req.body;
 
    const query = `
        UPDATE country_currencies_fxrate
        SET country_name = ?, currency = ?, currency_symbol = ?, gbp_rate = ?, inverse_gbp_rate = ?, country_id = ?, monthly_management_fee = ?, is_invoice_currency = ?
        WHERE country_id = ?`;
 
    con.query(query, [country_name, currency, currency_symbol, gbp_rate, inverse_gbp_rate, country_id, monthly_management_fee, is_invoice_currency, fxRateId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
 
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'FX rate not found' });
        }
 
        res.status(200).json({ message: 'FX rate updated successfully' });
    });
};
 
module.exports = {
    getCountryFxRate,
    updateCountryFxRate
};