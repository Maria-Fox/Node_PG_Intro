const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// as seen on app.js - all routes all have a prefix of companies/

router.get("", async function(req, res, next) {

  try {
    let results = await  db.query(`SELECT code, name FROM companies`);
    return res.json({"companies": results.rows});
  } catch (e){
    return next(e);
  }
})

router.get("/:code", async function (req, res, next){

  try {
    let code = req.params.code

    let result = await db.query(
      `SELECT code, name, description
      FROM companies 
      WHERE code = $1`, 
      [code]
    );

    if (result.rows[0].length === 0){
      throw new ExpressError("Invalid company code.", 404);
    }

    // We also grab the invoies for the given company. Both tables use the same keys variables just different names.

    let invoiceResults = await db.query(`
        SELECT id
        FROM invoices
        WHERE comp_code = $1`, [code]
    );

    let invoices = invoiceResults.rows;
    let company = result.rows[0];
    // add dict.key for all company invoices. Invoices are mapped (copied) into an array. Invoices are references by invoice.id 
    company.invoices = invoices.map(inv => inv.id)

    return res.json({company});

  } catch (e){
    return new ExpressError(`Invalid code`, 404);
  }
});

router.post("/", async function(req, res, next) {
  try {
    let {code, name, description } = req.body;

    // immeditely sends error if a missing body item is found
    if (!code || !name || !description){
      return new ExpressError("Please include the company code, name, and description.")
    };

    let result = await db.query(`INSERT INTO companies (code, name, description) VALUES($1, $2, $3) RETURNING code, name, description`, [code, name, description] );

    return res.json({"company": result.rows[0]});

  } catch (e) {
    return new ExpressError("Company not found", 404);
  }
});



router.patch("/:code", async function(req, res, next) {
  try {
    let code = req.params.code;
    let { name, description } = req.body;

    let result = await db.query(`UPDATE companies SET name = $1, description = $2 WHERE code = $3 RETURNING code, name, description`, [name, description, code] );

    return res.json({"company": result.rows[0]});

  } catch (e) {
    return new ExpressError("Code does not exist. Please enter a valid company code.", 404)
  }
});


router.delete("/:code", async function(req, res, next) {
  try {
    let code = req.params.code;

    let result = await db.query(`DELETE FROM companies WHERE code = $1`, [code]);

    return res.json({"status": "deleted"});

  } catch (e) {
    return new ExpressError("Code does not exist. Please enter a valid company code.", 404);
  }
});





// export the router to be used as middleware in app.js

module.exports = router;