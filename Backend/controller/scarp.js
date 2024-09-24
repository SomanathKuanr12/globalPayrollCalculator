const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const natural = require('natural');
const db = require('../config') // Adjust the path as needed



const fetchDataAndLog = async (countryId, sourceUrl, type) => {
  try {
    const response = await axios.get(sourceUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
      }
    });
    const html = response.data;
    const $ = cheerio.load(html);

    const items = [];
    let emptyAssumptionNameCount = 0;

    const firstTable = $('table').first();
    firstTable.find('tr').each((rowIndex, rowElement) => {
      const columns = $(rowElement).find('td');
      if (columns.length > 1) {
        let assumptionRate = $(columns[type]).text().trim();
        let assumptionName = $(columns[type + 1]).text().trim();
        assumptionName = cleanAssumptionName(assumptionName);

        if (assumptionName == '') {
          emptyAssumptionNameCount += 1;
          if (emptyAssumptionNameCount === 2) {
            return false;
          }
        }

        assumptionRate = parseAssumptionRate(assumptionRate);
        items.push({ assumptionName, assumptionRate });
      }
    });

    for (const item of items) {
      const { assumptionName, assumptionRate } = item;

      try {
        const [rows] = await new Promise((resolve, reject) => {
          db.query('SELECT assumption_id, assumption_name, source_assumption_name, is_correct_value FROM sourceupdateassumption WHERE country_id = ?', [countryId], (err, results) => {
            if (err) reject(err);
            else resolve([results]);
          });
        });

        for (const dbRow of rows) {
          const { assumption_id, assumption_name, source_assumption_name, is_correct_value } = dbRow;
          const similarityAssumptionName = natural.JaroWinklerDistance(assumption_name, assumptionName);
          let SourcesimilarityAssumptionName = 0;

          if (similarityAssumptionName > 0.7) {
            await new Promise((resolve, reject) => {
              db.query('UPDATE assumption_info SET assumption_rate = ? WHERE assumption_id = ?', [assumptionRate, assumption_id], (err, results) => {
                if (err) reject(err);
                else resolve(results);
              });
            });

            console.log('----------------------------------------------------');
          } else {
            if (is_correct_value == 1) {
              SourcesimilarityAssumptionName = natural.JaroWinklerDistance(source_assumption_name, assumptionName);
              if (SourcesimilarityAssumptionName > 0.8) {
                await new Promise((resolve, reject) => {
                  db.query('UPDATE assumption_info SET assumption_rate = ? WHERE assumption_id = ?', [assumptionRate, assumption_id], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                  });
                });

                console.log('----------------------------------------------------');
              }
            }
          }
        }
      } catch (err) {
        console.log('Error executing query:', err);
      }
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

const cleanAssumptionName = (assumptionName) => {
  return assumptionName.replace(/\s*\([^)]*\d[^)]*\)/g, '').replace(/,.*$/, '').trim();
};

const parseAssumptionRate = (rate) => {
  const rangeMatch = rate.match(/([\d\.]+)\s*%?\s*(to|–|-)\s*([\d\.]+)\s*%?/i);
  if (rangeMatch) {
    const lowerBound = parseFloat(rangeMatch[1]);
    const upperBound = parseFloat(rangeMatch[3]);
    return Math.max(lowerBound, upperBound).toFixed(2);
  }

  const numMatch = rate.match(/[\d\.]+/);
  if (numMatch) {
    return parseFloat(numMatch[0]).toFixed(2);
  }
  return '0.00';
};

const fetchAllCountriesData = async () => {
  try {
    const [rows] = await new Promise((resolve, reject) => {
      db.query('SELECT DISTINCT country_id, source, type FROM sourceupdateassumption', (err, results) => {
        if (err) reject(err);
        else resolve([results]);
      });
    });

    for (const row of rows) {
      const { country_id, source, type } = row;
      if (source != null && type != null) {
        console.log(country_id);
        console.log(source);
        console.log(type);
        await fetchDataAndLog(country_id, source, type);
      }
    }
  } catch (error) {
    console.error('Error fetching countries data:', error);
  }
};


module.exports={
  fetchAllCountriesData
}


