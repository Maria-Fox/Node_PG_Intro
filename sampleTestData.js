const db = require("./db");

async function sampleData() {
  await db.query("DELETE FROM companies");
  await db.query("DELETE FROM invoices");
  await db.query("SELECT setval('invoices_id_seq', 1, false)");

  await db.query(`INSERT INTO companies (code, name, description)
                    VALUES ('test_co1', 'test co1', 'first test company'),
                    ('test_co2', 'test co2', 'second test company')`);

  const inv = await db.query(
        `INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date)
          VALUES ('test_co1', 200, false, '"2022-10-13T07:00:00.000Z"', null),
          ('test_co2', 400, false, '"2022-10-13T07:00:00.000Z"', null) 
          RETURNING id`);
}


module.exports = { sampleData };