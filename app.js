/** BizTime express application. */


const express = require("express");

const app = express();
const ExpressError = require("./expressError")
const db = require("./db");
const compRoutes = require("./routes/companies");
const invRoutes = require("./routes/invoices");
const router = require("./routes/companies");

// middleware used tp parse incoming requests/ body as json
app.use(express.json());


// from required files/routes add prefix of...
app.use("/companies", compRoutes)
app.use("/invoices", invRoutes)


/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});


// start server

app.listen(5000, function () {
  console.log("Express server running on port 5000.")
});

module.exports = app;
