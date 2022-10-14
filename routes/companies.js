const express = require("express");
const { slugify } = require("slugify");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// as seen on app.js - all routes all have a prefix of companies/

router.get("/", async function(req, res, next) {

  try {
    let results = await  db.query(
      `SELECT code, name 
      FROM companies`);

    return res.json({"companies": results.rows});
  } catch (err){
    return next(err);
  }
})

// this route saw changes in further study after the requested tests. The test will fail.
router.get("/:code", async function (req, res, next){

  try {

    const results = await db.query("SELECT code, name, description FROM companies WHERE code = $1", [req.params.code]);

    const invData = await db.query("SELECT id FROM invoices WHERE comp_code = $1", [req.params.code]);

    // modified to query & respond w/ the industry data.
    const indData = await db.query(`
    SELECT i.industry FROM industries i
    JOIN company_industries ci 
      ON i.code = ci.industry_code
    JOIN companies c
      ON c.code = ci.company_code 
      WHERE c.code = $1;
  `, [req.params.code])

    if (results.rows.length === 0) {
        const notFound = new Error(`There is no company with that code: ${req.params.code}`);
        notFound.status = 404;
        throw notFound;
      }

    // we only need the company once, but all the invoices and industries
    const company = results.rows[0];
    const invoices = invData.rows;
    const industries = indData.rows
    
    // add propoerties to company object to inclue invoices (array of id's)
    // array of industry codes
    company.invoices = invoices.map(inv => inv.id);
    company.industries = industries.map(ind => ind.industry);

    return res.json({"company": company});

  } catch (err){
    return new ExpressError(`Invalid code`, 404);
  }
});

router.post("/", async function(req, res, next) {
  try {
    let {name, description } = req.body;
    // altered after tests step. Updated so user is provided a code based on the slugified version of the co. name
    let code = slugify(name, {lower:true});

    // immeditely sends error if a missing body item is found
    if (!code, !name, !description){
      return new ExpressError("A required field was left empty.", 404)
    };

    let result = await db.query(
      `INSERT INTO companies (code, name, description) 
      VALUES($1, $2, $3) 
      RETURNING code, name, description`, 
      [code, name, description] );

    return res.status(201).json({"company": result.rows[0]});

  } catch (err) {
    return next(err)
  }
});



router.put("/:code", async function(req, res, next) {
  try {
    let code = req.params.code;
    let { name, description } = req.body;

    let result = await db.query(
      `UPDATE companies 
      SET name = $1, description = $2 
      WHERE code = $3 
      RETURNING code, name, description`, 
      [name, description, code] );

    if (result.rows.length === 0) {
      throw new ExpressError(`Invalid company code: ${code}`, 404)
    } else {
      return res.json({"company": result.rows[0]});
    }

  } catch (err) {
    return new ExpressError("Code does not exist. Please enter a valid company code.", 404)
  }
});


router.delete("/:code", async function(req, res, next) {
  try {
    let code = req.params.code;

    let result = await db.query(
      `DELETE FROM companies 
      WHERE code = $1`, 
      [code]);

    return res.json({"status": "deleted"});

  } catch (err) {
    return new ExpressError("Code does not exist. Please enter a valid company code.", 404);
  }
});


// export the router to be used as middleware in app.js

module.exports = router;