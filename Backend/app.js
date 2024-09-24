const express=require('express')
const cors=require('cors')
const axios = require('axios');
const cron = require('node-cron');
const router=require('./router/router')
const app = express();
app.use(cors())
app.use(express.json())
app.use('/',router);
const fetchAllCountriesData=require('../Backend/controller/scarp')


  
  // Schedule the task to run every 7 days at midnight
  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:4700/scarp');
      console.log('Data fetched:', response.data);
      // Process the fetched data here
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  // Schedule the task to run every 7 days at midnight
  cron.schedule('0 0 */7 * *', () => {
    console.log('Running a task every 7 days');
    fetchData();
  });


app.listen(4700,()=>{
    console.log(`server is running on Port 4700`);
})
