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

describe("GET all companies- /companies", () => {
  test("List all companies", async function () {
    const response = await request(app).get("/companies");

    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual({"companies": [
      {code: "test_co1", name: "test co1"},
      {code: "test_co2", name: "test co2"}
    ]});
  });
});

// this route saw changes in further study after the requested tests. The test will fail.
describe("GET /companies/:code", function () {

  test("Get single company by code param", async function(){
    let response = await request(app).get("/companies/test_co1")

    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual({"company" : {
    code: "test_co1", 
    name: "test co1", 
    description: "first test company",
    invoices: [1],
  }});
})});

// this route was later altered in further study to reflect slugify on code/ name

describe("POST /companies", function () {

  test("Create new company w/ code, name & description" , async function(){
    let response = await request(app).post("/companies").send({
      code : "Post_Co",
      name: "Post Company",
      description: "Created is test post route"
    });

    expect(response.statusCode).toEqual(201)
    expect(response.body).toEqual({"company" : {
    code: "Post_Co", 
    name: "Post Company", 
    description: "Created is test post route"
  }});
})});


describe("PUT /company/:code", function(){
  test("Update single company", async function(){
      const response = await request(app).put('/companies/test_co1').send({ name: "Updated tst_co1", description: "updated desc" });
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
          company: {
              code: "test_co1", name: "Updated tst_co1", description: "updated desc"
          }
      })
  })
})

describe("DELETE /company/:code", function(){
  test("Delete company by company code param", async function(){
      const response = await request(app).delete('/companies/test_co1');
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({ status: "deleted" })
  })
})