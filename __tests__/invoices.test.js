// jest --coverage in terminal to see test report
// Testing environment
process.env.NODE_ENV === "test"

const request = require("supertest");
const {sampleData} = require("../sampleTestData")
const app = require("../app");
const db = require("../db");

// see sampleTestData.js for steps taken to insert data into db.
beforeEach(sampleData)

afterAll(async function () {
  // need to close connection to server
  await db.end();
});


describe("GET /invoices", function(){
  test("See ALL invoices", async function(){
      const response = await request(app).get('/invoices');
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
          "invoices": [
            {
          id: 1,
          add_date: "2022-10-13T07:00:00.000Z",
          amt: 200,
          comp_code: "test_co1",
          paid: false,
          paid_date: null,
      },
            {
          id: 2,
          add_date: "2022-10-13T07:00:00.000Z",
          amt: 400,
          comp_code: "test_co2",
          paid: false,
          paid_date: null,
            },
          ]
        });
  });
});

describe("GET /invoices/:id", function () {
  test("GET invoice by id param", async function () {
    const response = await request(app).get("/invoices/1");
    expect(response.body).toEqual(
        {
          "invoice": {
              id: 1,
              add_date: "2022-10-13T07:00:00.000Z",
              amt: 200,
              paid: false,
              paid_date: null,
            company: {
              name: 'test co1',
              description: 'first test company',
            }
          }
        }
    );
  });
});

// you can only post an invoice to an existing ompany. 
describe("POST /invoices", function () {
  test("Create new invoice, post route", async function () {

    const response = await request(app).post("/invoices/").send({amt: 500, comp_code: 'test_co1'});

    expect(response.statusCode).toEqual(201)
    expect(response.body).toEqual(
        {
          "invoice": {
            id: 3,
            comp_code: "test_co1",
            amt: 500,
            paid: false,
            add_date: expect.any(String),
            paid_date: null
          }
        }
    );
  });
});



describe("PUT /invoices/:id", function () {
test("update an invoice, PUT route", async function () {
  const response = await request(app).put("/invoices/1").send({amt: 500, paid: false});
  expect(response.body).toEqual(
      {
        "invoice": {
          id: 1,
          comp_code: 'test_co1',
          amt: 500,
          paid: false,
          add_date: expect.any(String),
          paid_date: null,
        }
      }
  );
});
});


describe("DELETE /invoices/:id", function () {
  test("delete invoice with given id", async function () {
    const response = await request(app).delete("/invoices/1");
    expect(response.body).toEqual({"status": "deleted"});
  });
});