/**
 * Converts a result object to a CKAN API-like object.
 *
 * @param {Object} params - The parameters to convert. It should have properties: lat, lng, display.
 * @returns {Object} - The result object converted to a CKAN API-like object. If the input result was successful, the output object includes a result property with a records array
 */
function toCkanAPI({ lat, lng, display }) {
  // Initialize the CKAN API-like object
  return {
    success: true,
    result: {
      records: [{
        x: lat,
        y: lng,
        display
      }]
    }
  };
}

/**
 * Converts a result object to a simple json object.
 *
 * @param {Object} params - The parameters to convert. It should have properties: lat, lng, display.
 * @returns {Object} - The result object converted to a simple JSON object.
 */
function toSimple({ lat, lng, display }) {
  // Initialize the simple JSON object
  return {
    success: true,
    result: {
      x: lat,
      y: lng,
      display
    }
  };
}

/**
 * Converts a result object to a GeoJSON object.
 *
 * @param {Object} params - The parameters to convert. It should have properties: success, lat, lng, display.
 * @returns {Object} - The result object converted to a GeoJSON object. If the input result was successful, the GeoJSON object includes a Point feature.
 */
function toGeoJSON({ success, lat, lng, display }) {
  // Initialize the GeoJSON object
  let geojson_response = {
    type: "FeatureCollection",
    features: [{
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [lng, lat]
      },
      properties: {
        display
      }
    }],
    success
  };

  return geojson_response;
}

module.exports = { toCkanAPI, toSimple, toGeoJSON };