/**
 * Handles HTTP requests for converting coordinates in DD, DM, DMS, or UTM format into a standardized DD JSON object.
 *
 * @param {!express:Request} req - The HTTP request context.
 * @param {!express:Response} res - The HTTP response context.
 * @param {string} req.query.q - The coordinate query to parse.
 * @param {string} req.query.d - Flag for debug mode which returns additional information in the response.
 * @param {string} req.query.t - The desired response type. Options include:
 *     - 'simple' for a simple x, y result in a json object (default)
 *     - 'ckanapi' for a CKAN-like object (see https://docs.ckan.org/en/2.8/maintaining/datastore.html#ckanext.datastore.logic.action.datastore_search_sql)
 *     - 'geojson' for a GeoJSON object
 * @returns {void}
 */

// Setup the express app
const express = require('express');
const app = express();
module.exports = app;

// Load transformers
const { toCkanAPI, toGeoJSON, toSimple } = require('./to');
const { fromDD, fromDM, fromDMS, fromUTM, RE_DD, RE_DM, RE_DMS, RE_UTM } = require('./from');

// Setup the route for query
app.get('/', (req, res) => {
  // Initialize the response object
  let resp = {};
  const debug = req.query.d;
  // Check output type
  if (![undefined, "geojson", "ckanapi", "json", "simple"].includes(req.query.t)) {
    // Return failed result if the requested output type is not recognized
    resp.success = false;
    resp.error = `Invalid output type [Expected: geojson, ckanapi, json, simple (default), Received: ${req.query.t}]`;
  }
  // Check if a query has been passed
  else if (!req.query.q) {
    // Return failed result if no query was sent
    resp.success = false;
    resp.error = "No query sent";
  } else {
    // Setup method placeholder
    let method = 'Unknown';
    // Get the query from the request
    const query = req.query.q.toUpperCase().trim()
      .replace(/NORTH/g, 'N')
      .replace(/SOUTH/g, 'S')
      .replace(/EAST/g, 'E')
      .replace(/WEST/g, 'W');
    // Setup coordinate object
    let coordObj;
    // Check if the input matches the DD format
    if (RE_DD.test(query)) {
      // Call the fromDD function from the from.js module to convert the DD coordinates to lat/lon
      method = "DD";
      coordObj = fromDD(query, debug);
    }
    // Check if the input matches the DM format
    else if (RE_DM.test(query)) {
      // Call the fromDM function from the from.js module to convert the DM coordinates to lat/lon
      method = "DM";
      coordObj = fromDM(query, debug);
    }
    // Check if the input matches the DMS format
    else if (RE_DMS.test(query)) {
      // Call the fromDMS function from the from.js module to convert the DMS coordinates to lat/lon
      method = "DMS";
      coordObj = fromDMS(query, debug);
    }
    // Check if the input matches the UTM format
    else if (RE_UTM.test(query)) {
      // Call the fromUTM function from the from.js module to convert the UTM coordinates to lat/lon
      method = "UTM";
      coordObj = fromUTM(query, debug);
    }
    else {
      // Return failed result
      coordObj = { success: false, error: "Unable to determine coordinate type. Please use DD, DM, DMS, or UTM." }
    }
    // check if conversion was successful
    if (!coordObj.success) {
      // Return failed conversion result
      resp.success = false;
      resp.error = coordObj.error;
    } else {
      // Round lat and lng to 4 decimal places and build a label
      const lat = Math.round(coordObj.lat * 10000) / 10000;
      const lng = Math.round(coordObj.lng * 10000) / 10000;
      coordObj.display = `${lat < 0 ? 'S' : 'N'}${Math.abs(lat)} ${lng < 0 ? 'W' : 'E'}${Math.abs(lng)}`;
      // Convert the result to the requested output type
      if (req.query.t === "geojson") {
        resp = toGeoJSON(coordObj);
      } else if (req.query.t === "ckanapi") {
        resp = toCkanAPI(coordObj);
      } else if (req.query.t === "simple" || req.query.t === "json" || !req.query.t) {
        resp = toSimple(coordObj);
      } else {
        // Return failed result if the requested output type is not recognized
        resp.success = false;
        resp.error = `Invalid output type [Expected: geojson, ckanapi, json, simple (default), Received: ${req.query.t}]`;
      }
    }
    // Add in debug information if debug is requested
    if (req.query.d) {
      resp.debug = {
        query: req.query.q,
        query_clean: query,
        method,
        ...coordObj.debug
      };
    }
  }
  // Set up CORS headers
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  // Send the result as a JSON response
  res.status(resp.success ? 200 : 400).json(resp);
});