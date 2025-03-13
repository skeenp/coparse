// Define regular expressions
const RE_DD = /^(?<dir1pre>[NESW]?)(?<deg1>-?\d*\.?\d+)(?<dir1post>[NESW]?)[ ,]+(?<dir2pre>[NESW]?)(?<deg2>-?\d*\.?\d+)(?<dir2post>[NESW]?)$/i;
const RE_DM = /^(?<dir1pre>[NESW]?)(?<deg1>-?\d*\.?\d+)[\°]?(?<dir1post>[NESW]?)[\°]?[ ,]+(?<min1>\d*\.?\d+)[\'\"]?(?<dir1end>[NESW]?)[\'\"]?[ ,]+(?<dir2pre>[NESW]?)(?<deg2>-?\d*\.?\d+)[\°]?(?<dir2post>[NESW]?)[\°]?[ ,]+(?<min2>\d*\.?\d+)[\'\"]?(?<dir2end>[NESW]?)[\'\"]?$/i;
const RE_DMS = /^(?<dir1pre>[NESW]?)(?<deg1>-?\d*\.?\d+)[\°]?(?<dir1post>[NESW]?)[\°]?[ ,]+(?<min1>\d*\.?\d+)[\'\"]?[ ,]+(?<sec1>\d*\.?\d+)[\'\"]?(?<dir1end>[NESW]?)[\'\"]?[ ,]+(?<dir2pre>[NESW]?)(?<deg2>-?\d*\.?\d+)[\°]?(?<dir2post>[NESW]?)[\°]?[ ,]+(?<min2>\d*\.?\d+)[\'\"]?[ ,]+(?<sec2>\d*\.?\d+)[\'\"]?(?<dir2end>[NESW]?)[\'\"]?$/i;
const RE_UTM = /^(?<zone>\d{1,2})(?<band>[NS])[ ,]+(?<dir1pre>[NE])?(?<coord1>\d*\.?\d+)(?<dir1post>[NE])?[ ,]+(?<dir2pre>[NE])?(?<coord2>\d*\.?\d+)(?<dir2post>[NE])?$/i;

/**
 * Validate degrees for a given coordinate type.
 * @param {number} deg - The degree value to validate.
 * @param {string} coordType - The type of coordinate ('latitude' or 'longitude').
 */
function validateDegrees(deg, coordType) {
  const rng = coordType === 'latitude' ? 90 : 180;
  validateValue(deg, coordType, -rng, rng)
}

/**
 * Validate minutes for a given coordinate type.
 * @param {number} min - The minute value to validate.
 * @param {string} coordType - The type of coordinate ('latitude' or 'longitude').
 */
function validateMinutes(min, coordType) {
  validateValue(min, coordType, 0, 60)
}

/**
 * Validate seconds for a given coordinate type.
 * @param {number} sec - The second value to validate.
 * @param {string} coordType - The type of coordinate ('latitude' or 'longitude').
 */
function validateSeconds(sec, coordType) {
  validateValue(sec, coordType, 0, 60)
}

/**
 * Validate a value.
 * @param {number} coord - The value to validate.
 * @param {string} type - The type of value to validate ('latitude' or 'longitude').
 * @param {number} min - The minimum valid value.
 * @param {number} max - The maximum valid value.
 */
function validateValue(coord, type, min, max) {
  if (coord < min || coord > max) {
    throw new Error(`Invalid ${type}. ${type.charAt(0).toUpperCase() + type.slice(1)} must be between -${max} and ${max} [recieved: ${coord}].`);
  }
}

/**
 * Check if a direction is in the negative hemisphere.
 * @param {string} dir - The direction to check.
 * @returns {boolean} - True if the direction is in the negative hemisphere, false otherwise.
 */
function isNegativeHemisphere(dir) {
  return ['W', 'S', '-'].includes(dir);
}

/**
 * Check if a direction is latitude.
 * @param {string} dir - The direction to check.
 * @returns {boolean} - True if the direction is latitude, false otherwise.
 */
function isLatitude(dir) {
  return ['N', 'S'].includes(dir);
}

/**
 * Check if a direction is longitude.
 * @param {string} dir - The direction to check.
 * @returns {boolean} - True if the direction is longitude, false otherwise.
 */
function isLongitude(dir) {
  return ['E', 'W'].includes(dir);
}

/**
 * Check if a direction is easting.
 * @param {string} dir - The direction to check.
 * @returns {boolean} - True if the direction is easting, false otherwise.
 */
function isEasting(dir) {
  return dir === 'E';
}

/**
  * Check if a direction is northing.
 * @param {string} dir - The direction to check.
 * @returns {boolean} - True if the direction is northing, false otherwise.
 */
function isNorthing(dir) {
  return dir === 'N';
}

/**
 * Swap coordinates if we think its an error
 * @param {number} deg1 - The first degree value.
 * @param {number} deg2 - The second degree value.
 * @returns {Array} - An array containing the swapped coordinates if appropriate.
 */
function swapLatLongCoordinatesIfAppropriate(deg1, deg2) {
  // Check if lat and long perhaps should be swapped
  if ((deg1 < -90 || deg1 > 90) && (deg2 >= -180 && deg2 <= 180)) {
    return [deg2, deg1];
  }
  return [deg1, deg2];
}

/**
 * Swap utm coordinates if we think its an error
 * @param {number} easting - The easting value.
 * @param {number} northing - The northng value.
 * @returns {Array} - An array containing the swapped coordinates if appropriate.
 */
function swapUTMCoordinatesIfAppropriate(easting, northing) {
  // Check if easting and northings perhaps should be swapped
  if ((easting > 999999 || easting < 100000) && (northing > 100000 && northing < 999999)) {
    return [northing, easting];
  }
  return [easting, northing]
}

/**
 * Converts a coordinate from degrees, minutes, and seconds (DMS) to decimal degrees.
 * 
 * @param {number} degrees - The degrees component of the coordinate.
 * @param {number} minutes - The minutes component of the coordinate.
 * @param {number} seconds - The seconds component of the coordinate.
 * 
 * @returns {number} The equivalent coordinate in decimal degrees.
 */
function convertDMS(degrees, minutes, seconds) {
  return degrees + minutes / 60 + seconds / 3600;
}

/**
 * Converts a coordinate from degrees, minutes, and seconds (DMS) to decimal degrees.
 * 
 * @param {number} degrees - The degrees component of the coordinate.
 * @param {number} minutes - The minutes component of the coordinate.
 * 
 * @returns {number} The equivalent coordinate in decimal degrees.
 */
function convertDM(degrees, minutes) {
  return convertDMS(degrees, minutes, 0);
}

/**
 * Converts a string representing coordinates in a decimal degrees-ish (DD) format to decimal degrees.
 * The input string is expected to have been validated against the `RE_DD` regular expression and be cast to upper case.
 * 
 * @param {string} q - The input string representing coordinates in a decimal degrees-ish (DD) format.
 * @param {boolean} debug - A flag indicating whether to include debug data in the returned object.
 * 
 * @returns {Object} An object containing the converted latitude and longitude in decimal degrees, 
 * and a success flag indicating whether the conversion was successful. If the conversion fails, 
 * the object will also contain an error message.
 */
function fromDD(q, debug = false) {
  let debug_data = { 'swapped': { 'direction': false, 'value': false } };
  try {
    // Match string
    const match = RE_DD.exec(q).groups;
    // Parse coordinates
    let deg1 = parseFloat(match.deg1);
    let deg2 = parseFloat(match.deg2);
    // Test if the coordinates are in the negative hemisphere
    deg1 = isNegativeHemisphere(match.dir1pre || match.dir1post) ? -deg1 : deg1;
    deg2 = isNegativeHemisphere(match.dir2pre || match.dir2post) ? -deg2 : deg2;
    // Check which value is likely lat
    let lat, lng;
    if (isLatitude(match.dir2pre || match.dir2post) || isLongitude(match.dir1pre || match.dir1post)) {
      [lat, lng] = [deg2, deg1];
      debug_data['swapped']['direction'] = true
    } else if (isLatitude(match.dir1pre || match.dir1post) || isLongitude(match.dir2pre || match.dir2post)) {
      [lat, lng] = [deg1, deg2];
    } else {
      // Swap coords if appropriate
      [lat, lng] = swapLatLongCoordinatesIfAppropriate(deg1, deg2);
      debug_data['swapped']['value'] = true
    }
    // Test if the degree values are valid
    validateDegrees(lat, 'latitude');
    validateDegrees(lng, 'longitude');
    // Return the DD coordinates
    let result = {
      lat,
      lng,
      success: true
    };
    // Add debug data if requested
    if (debug) {
      result['debug'] = debug_data;
    }
    return result
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Converts a string representing coordinates in a degrees minutes-ish (DM) format to decimal degrees.
 * The input string is expected to have been validated against the `RE_DM` regular expression and be cast to upper case.
 * 
 * @param {string} q - The input string representing coordinates in degrees minutes-ish (DM) format.
 * @param {boolean} debug - A flag indicating whether to include debug data in the returned object.
 * 
 * @returns {Object} An object containing the converted latitude and longitude in decimal degrees, 
 * and a success flag indicating whether the conversion was successful. If the conversion fails, 
 * the object will also contain an error message.
 */
function fromDM(q, debug = false) {
  let debug_data = { 'swapped': { 'direction': false, 'value': false } };
  try {
    // Match string
    const match = RE_DM.exec(q).groups;
    // Parse coordinates
    let deg1 = parseFloat(match.deg1);
    let deg2 = parseFloat(match.deg2);
    // Get minutes
    const min1 = parseFloat(match.min1);
    const min2 = parseFloat(match.min2);
    // Test if the minute values are valid
    validateMinutes(min1, 'minutes');
    validateMinutes(min2, 'minutes');
    // Get direction vars
    const dir1 = match.dir1pre || match.dir1post || match.dir1end;
    const dir2 = match.dir2pre || match.dir2post || match.dir2end;
    // Test if the coordinates are in the negative hemisphere
    deg1 = isNegativeHemisphere(dir1) ? -deg1 : deg1;
    deg2 = isNegativeHemisphere(dir2) ? -deg2 : deg2;
    // Check which value is likely lat
    let lat, lng;
    if (isLatitude(dir2) || isLongitude(dir1)) {
      [lat, lng] = [convertDM(deg2, min2), convertDM(deg1, min1)];
      debug_data['swapped']['direction'] = true
    } else if (isLatitude(dir1) || isLongitude(dir2)) {
      [lat, lng] = [convertDM(deg1, min1), convertDM(deg2, min2)];
    } else {
      // Swap coords if appropriate
      [lat, lng] = [convertDM(deg1, min1), convertDM(deg2, min2)];
      [lat, lng] = swapLatLongCoordinatesIfAppropriate(lat, lng);
      debug_data['swapped']['value'] = true
    }
    // Test if the degree values are valid
    validateDegrees(lat, 'latitude');
    validateDegrees(lng, 'longitude');
    // Return the DD coordinates
    let result = {
      lat: lat,
      lng: lng,
      success: true
    };
    // Add debug data if requested
    if (debug) {
      result['debug'] = debug_data;
    }
    return result
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Converts a string representing coordinates in a degrees minutes seconds-ish (DMS) format to decimal degrees.
 * The input string is expected to have been validated against the `RE_DMS` regular expression and be cast to upper case.
 * 
 * @param {string} q - The input string representing coordinates in degrees minutes seconds-ish (DMS) format.
 * @param {boolean} debug - A flag indicating whether to include debug data in the returned object.
 * 
 * @returns {Object} An object containing the converted latitude and longitude in decimal degrees, 
 * and a success flag indicating whether the conversion was successful. If the conversion fails, 
 * the object will also contain an error message.
 */
function fromDMS(q, debug = false) {
  let debug_data = { 'swapped': { 'direction': false, 'value': false } };
  try {
    // Match string
    const match = RE_DMS.exec(q).groups;
    // Parse coordinates
    let deg1 = parseFloat(match.deg1);
    let deg2 = parseFloat(match.deg2);
    // Get minutes
    const min1 = parseFloat(match.min1);
    const min2 = parseFloat(match.min2);
    // Test if the minute values are valid
    validateMinutes(min1, 'minutes');
    validateMinutes(min2, 'minutes');
    // Get seconds
    const sec1 = parseFloat(match.sec1);
    const sec2 = parseFloat(match.sec2);
    // Test if the minute values are valid
    validateSeconds(sec1, 'seconds');
    validateSeconds(sec2, 'seconds');
    // Get direction vars
    const dir1 = match.dir1pre || match.dir1post || match.dir1end;
    const dir2 = match.dir2pre || match.dir2post || match.dir2end;
    // Test if the coordinates are in the negative hemisphere
    deg1 = isNegativeHemisphere(dir1) ? -deg1 : deg1;
    deg2 = isNegativeHemisphere(dir2) ? -deg2 : deg2;
    // Check which value is likely lat
    let lat, lng;
    if (isLatitude(dir2) || isLongitude(dir1)) {
      [lat, lng] = [convertDMS(deg2, min2, sec2), convertDMS(deg1, min1, sec1)];
      debug_data['swapped']['direction'] = true
    } else if (isLatitude(dir1) || isLongitude(dir2)) {
      [lat, lng] = [convertDMS(deg1, min1, sec1), convertDMS(deg2, min2, sec2)];
    } else {
      // Swap coords if appropriate
      [lat, lng] = [convertDMS(deg1, min1, sec1), convertDMS(deg2, min2, sec2)];
      [lat, lng] = swapLatLongCoordinatesIfAppropriate(lat, lng);
      debug_data['swapped']['value'] = true
    }
    // Test if the degree values are valid
    validateDegrees(lat, 'latitude');
    validateDegrees(lng, 'longitude');
    // Return the DD coordinates
    let result = {
      lat: lat,
      lng: lng,
      success: true
    };
    // Add debug data if requested
    if (debug) {
      result['debug'] = debug_data;
    }
    return result
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Converts UTM coordinates to latitude and longitude.
 *
 * @param {number} UTMEasting - The easting coordinate.
 * @param {number} UTMNorthing - The northing coordinate.
 * @param {number} UTMZoneNumber - The UTM zone number.
 * @param {string} UTMZoneLetter - The UTM zone letter.
 * @returns {Object} An object containing the latitude and longitude.
 * 
 * Modified from https://github.com/shahid28/utm-latlng/blob/master/UTMLatLng.js
 * 
 */
function convertUtmToLatLng(UTMEasting, UTMNorthing, UTMZoneNumber, UTMZoneLetter) {
  // Constants for WGS84 datum
  const a = 6378137; // Semi-major axis
  const eccSquared = 0.00669438; // Square of eccentricity
  // Calculate e1
  const e1 = (1 - Math.sqrt(1 - eccSquared)) / (1 + Math.sqrt(1 - eccSquared));
  // Adjust Easting and Northing for false origin
  const x = UTMEasting - 500000.0;
  let y = UTMNorthing;
  // If in southern hemisphere, adjust Northing
  if (UTMZoneLetter !== 'N') {
    y -= 10000000.0;
  }
  // Calculate the Long Origin
  const LongOrigin = (UTMZoneNumber - 1) * 6 - 180 + 3;
  // Calculate eccPrimeSquared
  const eccPrimeSquared = eccSquared / (1 - eccSquared);
  // Calculate M
  const M = y / 0.9996;
  // Calculate mu
  const mu = M / (a * (1 - eccSquared / 4 - (3 * eccSquared * eccSquared) / 64 - (5 * eccSquared * eccSquared * eccSquared) / 256));
  // Calculate phi1Rad
  const phi1Rad = mu + ((3 * e1) / 2 - (27 * e1 * e1 * e1) / 32) * Math.sin(2 * mu) + ((21 * e1 * e1) / 16 - (55 * e1 * e1 * e1 * e1) / 32) * Math.sin(4 * mu) + ((151 * e1 * e1 * e1) / 96) * Math.sin(6 * mu);
  // Calculate N1, T1, C1, R1, D
  const N1 = a / Math.sqrt(1 - eccSquared * Math.sin(phi1Rad) * Math.sin(phi1Rad));
  const T1 = Math.tan(phi1Rad) * Math.tan(phi1Rad);
  const C1 = eccPrimeSquared * Math.cos(phi1Rad) * Math.cos(phi1Rad);
  const R1 = (a * (1 - eccSquared)) / Math.pow(1 - eccSquared * Math.sin(phi1Rad) * Math.sin(phi1Rad), 1.5);
  const D = x / (N1 * 0.9996);
  // Calculate latitude, in decimal degrees
  let lat = phi1Rad - ((N1 * Math.tan(phi1Rad)) / R1) * ((D * D) / 2 - ((5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * eccPrimeSquared) * D * D * D * D) / 24 + ((61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * eccPrimeSquared - 3 * C1 * C1) * D * D * D * D * D * D) / 720);
  lat = (lat / Math.PI) * 180;;
  // Calculate longitude, in decimal degrees
  let lng = (D - ((1 + 2 * T1 + C1) * D * D * D) / 6 + ((5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * eccPrimeSquared + 24 * T1 * T1) * D * D * D * D * D) / 120) / Math.cos(phi1Rad);
  lng = LongOrigin + (lng / Math.PI) * 180;;
  return {
    lat,
    lng
  };
}

/**
 * Converts a string representing coordinates in a UTM-ish format to decimal degrees.
 * The input string is expected to have been validated against the `RE_UTM` regular expression and be cast to upper case.
 * 
 * @param {string} q - The input string representing coordinates in UTM-ish format.
 * @param {boolean} debug - A flag indicating whether to include debug data in the returned object.
 * 
 * @returns {Object} An object containing the converted latitude and longitude in decimal degrees, 
 * and a success flag indicating whether the conversion was successful. If the conversion fails, 
 * the object will also contain an error message.
 */
function fromUTM(q, debug = false) {
  let debug_data = { 'swapped': { 'direction': false, 'value': false } };
  try {
    match = RE_UTM.exec(q).groups;
    // Parse the UTM coordinates
    const zone = parseInt(match.zone);
    const hemisphere = match.band;
    const coord1 = parseFloat(match.coord1);
    const dir1 = match.dir1pre || match.dir1post;
    const coord2 = parseFloat(match.coord2);
    const dir2 = match.dir2pre || match.dir2post;
    // Check which value is likely easting/northing
    let easting, northing;
    if (isEasting(dir2) || isNorthing(dir1)) {
      [easting, northing] = [coord2, coord1];
      debug_data['swapped']['direction'] = true
    } else if (isEasting(dir1) || isNorthing(dir2)) {
      [easting, northing] = [coord1, coord2];
    } else {
      // Swap coords if appropriate
      [easting, northing] = swapUTMCoordinatesIfAppropriate(coord1, coord2)
      debug_data['swapped']['value'] = true
    }
    // Validate the zone, easting, and northing
    validateValue(zone, 'UTM Zone', 0, 60)
    validateValue(easting, 'UTM Easting', 100000, 999999)
    validateValue(northing, 'UTM Northing', 0, 10000000)
    // Get lat lng  
    const { lat, lng } = convertUtmToLatLng(easting, northing, zone, hemisphere);
    // Return the DM coordinates
    let result = {
      lat,
      lng,
      success: true
    };
    // Add debug data if requested
    if (debug) {
      result['debug'] = debug_data;
    }
    return result
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { fromDD, fromDM, fromDMS, fromUTM, RE_DD, RE_DM, RE_DMS, RE_UTM };
