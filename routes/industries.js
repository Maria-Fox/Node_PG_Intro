const { Router } = require("express");
const express = require("express");
const router = new express.Router();
const slugify = require("slugify")
const db = require("../db")
const ExpressError = require("../expressError")

// routes are all prefixed w/ "/industries" as seen on app.js

router.get("/", async function(req, res, next) {
    try {
      const results = await db.query("SELECT code, industry FROM industries");
      return res.json({ industries: results.rows });
    } catch(err){
      return next(err);
    }
  });


router.get("/:code", async function(req, res, next) {
    try {
        const results = await db.query("SELECT * FROM industries WHERE code = $1", [req.params.code]);
        
        const compCodeData = await db.query(`
            SELECT c.code FROM companies c
                JOIN company_industries ci
                    ON c.code = ci.company_code
                JOIN industries i
                    ON i.code = ci.industry_code
                WHERE i.code = $1;
            `, [req.params.code])
        
            if (results.rows.length === 0) {
            const notFound = new Error(`There is no industry with code: ${req.params.code}`);
            notFound.status = 404;
            throw notFound;
            }
    
            const industry = results.rows[0];
            const compCodes = compCodeData.rows;
    
            industry.companyCodes = compCodes.map(code => code.code);
    
            return res.json({"industry": industry });

    } catch(err){
        next(err)
    }
})


router.post("/", async function(req, res, next){
    try {
        const code = slugify(req.body.code, '_')

        const newIndustry = await db.query("INSERT INTO industries VALUES($1, $2) RETURNING code, industry", [code, req.body.industry]);
        
        return res.status(201).json({industry: newIndustry.rows[0]});

    } catch(err){
        return next(err)
    }
})

//associating an industry to a company.
// the code here is the industry code. We pass in a company to associate.
router.post("/:code", async function(req, res, next){
    try {
        let industry_code = req.params.code;
        const company_code = req.body.company_code;

        const new_assoc = await db.query(`
            INSERT INTO company_industries (company_code, industry_code)
                VALUES ($1, $2) RETURNING company_code, industry_code;
        `, [company_code, industry_code]);

        if(new_assoc.rows.length === 0){
            return new ExpressError(`Invalid code: ${req.params.code}`, 404);
        }
        
        return res.json({"association": new_assoc.rows[0]})
    } catch(err) {
      next(err)
    }
})

  module.exports = router;