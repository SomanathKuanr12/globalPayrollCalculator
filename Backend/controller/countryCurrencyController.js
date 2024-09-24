const con = require('../config')

function getCountries(req,res){
    con.query('SELECT country_name FROM country_currencies_fxrate',(err,result)=>{
        if (err) {
            console.log(err);
            res.status(402).json({ message: 'error in db' })
        }
        else{
            
            const countryNames = result.map(row => row.country_name);
            //console.log(countryNames);
            res.json(countryNames);
        }
    })
}


function getInvoiceCurrencies(req,res){
    con.query('SELECT DISTINCT currency FROM country_currencies_fxrate WHERE is_invoice_currency=1',(err,result)=>{
        if (err) {
            console.log(err);
            res.status(402).json({ message: 'error in db' })
        }
        else{
            const currencies = result.map(row => row.currency);
            //console.log(countryNames);
            res.json(currencies);
        }
    })
}


module.exports={
    getCountries,
    getInvoiceCurrencies
}