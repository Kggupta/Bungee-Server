const express = require('express');
const Sheet = require('../utils/SheetInteractor.js');
const recordRoutes = express.Router();

recordRoutes.route('/sheet/expense').patch(async (req, res) => {
    const {item, term, value} = req.body;
    if (item == undefined || term == undefined || isNaN(value)) { res.sendStatus(400); return; }

    let sheet = new Sheet();
    try {
        await sheet.init();
        await sheet.saveExpense(item, term, value);
        res.status(200).send("Update successful.");
    } catch (err) {
        console.log(err);
        res.status(404).send("Not found.")
    }
})

recordRoutes.route('/sheet/income').patch(async (req, res) => {
    const {item, term, value} = req.body;
    if (item == undefined || term == undefined || isNaN(value)) { res.sendStatus(400); return; }

    let sheet = new Sheet();
    try {
        await sheet.init();
        await sheet.saveIncome(item, term, value);
        res.status(200).send("Update successful.");
    } catch (err) {
        console.log(err);
        res.status(404).send("Not found.")
    }
})

module.exports = recordRoutes;