const express = require('express');
const Sheet = require('../utils/SheetInteractor.js');
const recordRoutes = express.Router();

recordRoutes.route('/sheet/:trm').get(async function (req, res) {
    console.log("Hi")
    let sheet = new Sheet();
    try {
        await sheet.init();

        const data = await sheet.getTerm(req.params.trm);

        res.status(200).json(data);
    }catch (err) {
        console.log(err)
        res.status(404).send(err.message)
    }
})

recordRoutes.route('/sheet').get(async function (req, res) {
    let sheet = new Sheet();
    try {
        await sheet.init();

        const data = await sheet.getTerms();

        res.status(200).json(data);
    }catch (err) {
        console.log(err)
        res.status(404).send(err.message)
    }
})

module.exports = recordRoutes;