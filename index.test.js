// test.js
const request = require('supertest');
const server = require('./server.js');

// Close the server after all tests have run
afterAll(() => {
  server.close();
});

// Load test items from json file
const testItems = require('./index.test.json');

describe('Test bulk items coords', () => {
  // Iterate over test items
  testItems.forEach(item => {
    // Test case for each item
    it(`[${item.id}] should return correct output for ${item.desc}`, async () => {
      // Send a GET request to the server with the test query
      const res = await request(server)
        .get('/')
        .query({ q: item.test, d: true});
        console.log(res.body)
      // Check if success is true
      expect(res.body.success).toBe(true);
      // Check if the response matches the expected output
      let expected = {"display": item.test, "success": true}
      expect(res.body.success).toBe(expected.success);
      // Check if the x and y values are close to the expected values
      expect(res.body.result.x).toBeCloseTo(item.expected.x, 5); // 5 is the number of decimal places to check
      expect(res.body.result.y).toBeCloseTo(item.expected.y, 5); // 5 is the number of decimal places to check
    });
  });
});

// Test suite for output types
describe('Test output types', () => {

  // Test case for simple success output
  it('[T01] should return failed type', async () => {
    // Send a GET request to the server with a valid query
    const res = await request(server)
      .get('/')
      .query({ q: '146.038588 -41.805062', t: 'babel' });
    // Assert that the response matches the expected output
    expect(res.body.success).toBe(false);
    expect(res.body.error.startsWith('Invalid output type')).toBe(true);
  });

  // Test case for empty query
  it('[T02] should return no query sent', async () => {
    // Send a GET request to the server with a valid query
    const res = await request(server)
      .get('/')
      .query({ q: '' });
    // Assert that the response matches the expected output
    expect(res.body.success).toBe(false);
    expect(res.body.error).toEqual("No query sent")
  });

  // Test case for simple success output
  it('[T03] should return a successful simple output', async () => {
    // Send a GET request to the server with a valid query
    const res = await request(server)
      .get('/')
      .query({ q: '146.038588 -41.805062' });
    // Assert that the response matches the expected output
    expect(res.body.success).toBe(true);
    expect(res.body.result.display).toEqual("S41.8051 E146.0386")
    expect(res.body.result.x).toEqual(-41.805062)
    expect(res.body.result.y).toEqual(146.038588)})

  // Test case for ckanapi success output
  it('[T04] should return a successful ckanapi response', async () => {
    // Send a GET request to the server with a valid query and the ckanapi type
    const res = await request(server)
      .get('/')
      .query({ q: '146.038588 -41.805062' , t:'ckanapi'});
    // Assert that the response matches the expected output
    expect(res.body.success).toBe(true);
    expect(res.body.result.records[0].display).toEqual("S41.8051 E146.0386");
    expect(res.body.result.records[0].x).toBeCloseTo(-41.805062, 5);
    expect(res.body.result.records[0].y).toBeCloseTo(146.038588, 5);
  });

  // Test case for geojson success output
  it('[T05] should return a successful geojson response', async () => {
    // Send a GET request to the server with a valid query and the geojson type
    const res = await request(server)
      .get('/')
      .query({ q: '146.038588 -41.805062' , t:'geojson'});
    // Assert that the response matches the expected output
    expect(res.body.success).toBe(true);
    expect(res.body.type).toEqual("FeatureCollection");
    expect(res.body.features[0].type).toEqual("Feature");
    expect(res.body.features[0].properties.display).toEqual("S41.8051 E146.0386");
    expect(res.body.features[0].geometry.type).toEqual("Point");
    expect(res.body.features[0].geometry.coordinates).toEqual([146.038588, -41.805062]);
  });

  // Test case for debug output
  it('[T06] should return debug information', async () => {
    // Send a GET request to the server with a valid query and the debug flag
    const res = await request(server)
      .get('/')
      .query({ q: 's46.038588 -141.805062  ', d: true });
    // Assert that the response matches the expected output
    expect(res.body.success).toBe(true);
    expect(res.body.debug.query).toEqual('s46.038588 -141.805062  ');
    expect(res.body.debug.query_clean).toEqual('S46.038588 -141.805062');
    expect(res.body.debug.method).toEqual('DD');
  });

  // Test case for invalid input
  it('[T07] should return failed result for invalid input', async () => {
    // Send a GET request to the server with an invalid query
    const res = await request(server)
      .get('/')
      .query({ q: 'xyz' });
    // Assert that the success property in the response is false
    expect(res.body.success).toBe(false);
  });

})
