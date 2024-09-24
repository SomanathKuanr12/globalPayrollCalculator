const express = require('express');
const router = express.Router();
const calculatedFXRate= require('../controller/calculateCostComponentController')
const countryCurrency=require('../controller/countryCurrencyController')
const scarp=require('../controller/scarp')
const CapStatusesController=require('../controller/capStatusController')
const assumptionInfoController=require('../controller/assumption_infoController')
const countryCurrencyController=require('../controller/country_currencies_fxrateController')
const sourceUpdateAssumptionController=require('../controller/sourceupdateassumptionController')

router.get('/currencies',countryCurrency.getInvoiceCurrencies)
router.get('/country',countryCurrency.getCountries)
router.post('/calculateData',calculatedFXRate.calculateCostComponent);
router.get('/scarp',scarp.fetchAllCountriesData)
router.get('/capStatus/:limit/:offset',CapStatusesController.getCapStatus)
router.put('/capStatus',CapStatusesController.updateCapSatus)
router.get('/sourceUpdate/:limit/:offset',sourceUpdateAssumptionController.getUpdatedAssumption)
router.put('/sourceUpdate',sourceUpdateAssumptionController.updateUpdatedAssumption)
router.get('/assuumptionInfo/:limit/:offset',assumptionInfoController.getAssumptionInfo)
router.put('/assuumptionInfo',assumptionInfoController.updateAssumptionInfo)
router.get('/countryFxRate/:limit/:offset',countryCurrencyController.getCountryFxRate)
router.put('/sourceUpdate',countryCurrencyController.updateCountryFxRate)

module.exports=router;