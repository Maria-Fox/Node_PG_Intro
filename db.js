/** Database setup for BizTime. */

const { Client } = require("pg");

let DB_URI;

// configure depending on NOVE_ENV the db we connect to
if(process.env.NODE_ENV === "test"){
  DB_URI = "postgresql:///biztime_test";
} else {
  DB_URI = "postgresql:///biztime";
}

// sets up the connection string (attribute of pg/ client). Needed to connect the pg to db.
let db = new Client({
  connectionString: DB_URI
})

// propoerly connects 
db.connect()

module.exports = db;