const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
app.use(express.json())
let db = null
const db_path = path.join(__dirname, 'covid19India.db')
const initializeDbandServer = async () => {
  try {
    db = await open({
      filename: db_path,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Sever started!!!')
    })
  } catch (e) {
    console.log(error.message)
    process.exit(1)
  }
}
initializeDbandServer()

//API 1
app.get('/states/', async (request, response) => {
  const query = `
    SELECT *
    FROM state;
    `
  const query_result = await db.all(query)
  response.send(
    query_result.map(eachItem => {
      return {
        stateId: eachItem.state_id,
        stateName: eachItem.state_name,
        population: eachItem.population,
      }
    }),
  )
})
//API 2
app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const query = `
    SELECT 
      *
    FROM 
      state
    WHERE 
      state_id = ${stateId};
    `
  const query_result = await db.get(query)
  response.send({
    stateId: query_result.state_id,
    stateName: query_result.state_name,
    population: query_result.population,
  })
})

//API 3
app.post('/districts/', async (request, response) => {
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const query = `
  INSERT INTO
    district(district_name, state_id, cases, cured, active, deaths)
  VALUES(
    '${districtName}',
    ${stateId},
    ${cases},
    ${cured},
    ${active},
    ${deaths}
  );
  `
  const query_result = await db.run(query)
  response.send('District Successfully Added')
})

//API 4
app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const query = `
      SELECT 
        *
      FROM 
        district
      WHERE
        district_id = ${districtId};
    `
  const query_result = await db.get(query)
  response.send({
    districtId: query_result.district_id,
    districtName: query_result.district_name,
    stateId: query_result.state_id,
    cases: query_result.cases,
    cured: query_result.cured,
    active: query_result.active,
    deaths: query_result.deaths,
  })
})

//API 5
app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const query = `
  DELETE FROM
    district
  WHERE
    district_id = ${districtId};
  `
  const query_result = await db.run(query)
  response.send('District Removed')
})

//API 6
app.put('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const query = `
    UPDATE
      district
    SET 
      district_name = '${districtName}',
      state_id = ${stateId},
      cases = ${cases},
      cured  =${cured},
      active =${active},
      deaths = ${deaths}
    WHERE
      district_id = ${districtId};
  
  `
  const query_result = await db.run(query)
  response.send('District Details Updated')
})

//API 7
app.get('/states/:stateId/stats/', async (request, response) => {
  const {stateId} = request.params
  const query = `
  SELECT
     sum(cases) As  totalCases,
     sum(cured) As  totalCured,
     sum(active) AS  totalActive,
     sum(deaths) As  totalDeaths
  FROM
    district Natural Join state
  WHERE 
    state_id = ${stateId}

  `
  const query_result = await db.get(query)
  response.send(query_result)
})

//API 8
app.get('/districts/:districtId/details/', async (request, response) => {
  const {districtId} = request.params
  const query = `
  SELECT 
    state_name AS stateName
  FROM
    district Natural Join state
  WHERE
    district_id = ${districtId};
  `
  const query_result = await db.get(query)
  response.send(query_result)
})

module.exports = app
