const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// as seen on app.js - all routes all have a prefix of invoices/

router.get("/", async function(req, res, next) {

  try {
    let results = await  db.query(`SELECT * FROM invoices`);
    return res.json({"invoices": results.rows})
  } catch (err){
    return next(err)
  }
})

router.get("/:id", async function (req, res, next){

  try {
    let id = Number(req.params.id)

    // do not use SELECT * ... could be other data user should not see.
    const result = await db.query(
      `SELECT inv.id, 
              inv.comp_code, 
              inv.amt, 
              inv.paid, 
              inv.add_date, 
              inv.paid_date, 
              comp.name, 
              comp.description 
      FROM invoices AS inv
      INNER JOIN companies AS comp ON (inv.comp_code = comp.code)  
      WHERE id = $1`,
    [id]);

    // we're joining to ensure the invoice corresponds to the company. displays both invoice and co. info.

    if (result.rows.length === 0) {
      throw new ExpressError(`Invoice id: ${id} does not exist.`, 404);
    }

    const invoiceCompanyInfo = result.rows[0]
    console.log(invoiceCompanyInfo)

    const invoice = {
      "id" : invoiceCompanyInfo.id,
      "amt" : invoiceCompanyInfo.amt,
      "paid": invoiceCompanyInfo.paid,
      "add_date": invoiceCompanyInfo.add_date,
      "paid_date" : invoiceCompanyInfo.paid_date,
      "company": {
        "code": invoiceCompanyInfo.code,
        "name": invoiceCompanyInfo.name,
        "description": invoiceCompanyInfo.description
      }
    }

    return res.json({"invoice": invoice});

  } catch (err){
    return new ExpressError(`Invalid invoice id.`, 404)
  }
})

router.post("/", async function(req, res, next) {
  try {
    let {comp_code, amt } = req.body;
    console.log(comp_code, amt)

    // immeditely sends error if a missing body item is found
    if (!comp_code, !amt ){
      return new ExpressError("Please include the invoice company code and the amount for the invoice.")
    }

    let result = await db.query(`
      INSERT INTO invoices (comp_code, amt) 
      VALUES($1, $2 ) 
      RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt] );

    return res.status(201).json({"invoice": result.rows[0]})

  } catch (err) {
    return new ExpressError("Error, please ensure you have the comp_code and amount entered to add a new invoice.", 404)
  }
})


// updated after tests in further study- allow paying of invoices


router.put("/:id", async function(req, res, next) {
  try {
    let id = Number(req.params.id);
    let { amt, paid } = req.body;
    let paidDate = null;

    // check if ID exists.

    let invoice = await db.query(`
      SELECT paid 
      FROM invoices 
      WHERE id = $1`, [id]);

    if (invoice.rows.length === 0){
      return new ExpressError ("Invalid invoice ID", 404);
    }

    // update the paid_Date if the invoice exists. Earlier set to null.
    // Checking to see if the invoice is paid. Assigning date accordingly

    const actualPaidDate = invoice.rows[0].paid_date;

    if (!actualPaidDate && paid) {
      paidDate = new Date();
    } else if (!paid) {
      paidDate = null
    } else {
      paidDate = actualPaidDate;
    }

    const result = await db.query(
        `UPDATE invoices
        SET amt = $1, paid = $2, paid_date = $3
        WHERE id = $4
        RETURNING id, comp_code, amt, paid, add_date, paid_date`,
        [amt, paid, paidDate, id]);

    return res.json({"invoice": result.rows[0]});

  } catch (err) {
    return next(err)
  }
})


router.delete("/:id", async function(req, res, next) {
  try {
    let id = Number(req.params.id)

    let result = await db.query(`
    DELETE FROM invoices 
    WHERE id = $1 RETURNING id`, [id])

    return res.json({"status": "deleted"})

  } catch (err) {
    return new ExpressError("Code does not exist. Please enter a valid company code.", 404)
  }
})





// export the router to be used as middleware in app.js

module.exports = router;