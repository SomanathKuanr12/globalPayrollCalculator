 const con = require('../config');

function calculateCostComponent(req, res) {
    const { invoice_currency, annual_salary, country_name, IES_charges } = req.body;

    con.query('SELECT country_id, inverse_gbp_rate, currency FROM country_currencies_fxrate WHERE country_name=?', [country_name], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Error in DB query' });
        }

        if (result && result.length > 0) {
            const countryData = result[0];

            con.query('SELECT inverse_gbp_rate FROM country_currencies_fxrate WHERE currency=? LIMIT 1', [invoice_currency], (err, result1) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ message: 'Error in DB query' });
                }

                if (result1 && result1.length > 0) {
                    const fxRate = result1[0].inverse_gbp_rate / countryData.inverse_gbp_rate;
                    const monthly_salary = (annual_salary * fxRate) / 12;
                    const country_id = countryData.country_id;

                    con.query('SELECT * FROM assumption_info WHERE country_id=?', [country_id], (err, res1) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({ message: 'Error in DB query' });
                        }

                        const local_currency = countryData.currency;
                        const result2Array = [];

                        if (res1.length < 1) {
                            const totalCost = 0;
                            const monthly_IES_charges = IES_charges * fxRate;
                            const employer_contribution_per_month = totalCost + monthly_IES_charges;
                            const total_employer_cost_per_month = monthly_salary + employer_contribution_per_month;
                            const total_annual_cost = 12 * total_employer_cost_per_month;

                            result2Array.push({ item: 'Monthly IES Charges', localValue: Math.ceil(monthly_IES_charges * 100) / 100, baseValue:Math.ceil(IES_charges*100)/100 });
                            result2Array.push({ item: 'Employer Contribution per Month', localValue: Math.ceil(employer_contribution_per_month * 100) / 100, baseValue: Math.ceil(employer_contribution_per_month / fxRate * 100) / 100 });
                            result2Array.push({ item: 'Total Employer Cost per Month', localValue: Math.ceil(total_employer_cost_per_month * 100) / 100, baseValue: Math.ceil(total_employer_cost_per_month / fxRate * 100) / 100 });
                            result2Array.push({ item: 'Total Annual Cost', localValue: Math.ceil(total_annual_cost * 100) / 100, baseValue: Math.ceil(total_annual_cost / fxRate * 100) / 100 });
                            //console.log(parseFloat(fxRate.toFixed(4)));
                            
                            const final_results = [
                                { FX_Rate: parseFloat(fxRate.toFixed(4)) },
                               {annual_salary_in_local_currency: parseFloat((fxRate * annual_salary).toFixed(2)).toLocaleString()},
                        
                                { local_currency: local_currency },
                                { base_currency: invoice_currency },
                                result2Array
                            ];
                            //console.log(final_results);
                            return res.json(final_results);
                        } else {
                            const action = 'process_all';
                            con.query('CALL CalculateEachAssumptionCostchecking(?, ?, ?)', [action, monthly_salary, country_id], (error, results, fields) => {
                                if (error) {
                                    console.error('Error executing stored procedure:', error);
                                    return res.status(500).json({ error: 'An error occurred while executing the stored procedure.' });
                                }

                                const result2 = results[0];
                                let totalCost = 0;

                                result2Array.push({ item: 'Base Salary (per month)', localValue: parseFloat(monthly_salary.toFixed(2)), baseValue: parseFloat((annual_salary / 12).toFixed(2)) });

                                result2.forEach(item => {
                                    result2Array.push({ item: item.assumption_name, localValue: item.calculated_cost, baseValue: Math.floor((item.calculated_cost / fxRate) * 100) / 100 });
                                    totalCost += item.calculated_cost;
                                });

                                const monthly_IES_charges = IES_charges * fxRate;
                                const employer_contribution_per_month = totalCost + monthly_IES_charges;
                                const total_employer_cost_per_month = monthly_salary + employer_contribution_per_month;
                                const total_annual_cost = 12 * total_employer_cost_per_month;

                                result2Array.push({ item: 'Monthly IES Charges', localValue: Math.ceil(monthly_IES_charges * 100) / 100, baseValue: IES_charges });
                                result2Array.push({ item: 'Employer Contribution per Month', localValue: Math.ceil(employer_contribution_per_month * 100) / 100, baseValue: Math.ceil(employer_contribution_per_month / fxRate * 100) / 100 });
                                result2Array.push({ item: 'Total Employer Cost per Month', localValue: Math.ceil(total_employer_cost_per_month * 100) / 100, baseValue: Math.ceil(total_employer_cost_per_month / fxRate * 100) / 100 });
                                result2Array.push({ item: 'Total Annual Cost', localValue: Math.ceil(total_annual_cost * 100) / 100, baseValue: Math.ceil(total_annual_cost / fxRate * 100) / 100 });
                                console.log(fxRate);
                                
                                const final_results = [
                                    { FX_Rate: parseFloat(fxRate.toFixed(4)) },
                                    {annual_salary_in_local_currency: parseFloat((fxRate.toFixed(4) * annual_salary).toFixed(2)).toLocaleString()},
                                    { local_currency: local_currency },
                                    { base_currency: invoice_currency },
                                    result2Array
                                ];
                               // console.log(final_results);
                                
                                res.json(final_results);
                            });
                        }
                    });
                }
            });
        } else {
            res.status(404).json({ message: 'Country not found' });
        }
    });
}

module.exports = { calculateCostComponent };



