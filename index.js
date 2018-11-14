/**
 * Responds to a http request for a conversion of a DD, DM, DMS
 * or UTM coordinate into a standardised DD json object.
 *
 * @param {!express:Request} req HTTP request context.
 * q: query to parse
 * d: debug flag
 * t: responce type - simple - simple x y result (Default)
 *                  - ckanapi - ckan-like object (see https://docs.ckan.org/en/2.8/maintaining/datastore.html#ckanext.datastore.logic.action.datastore_search_sql)
 * @param {!express:Response} res HTTP response context.
 */
exports.main = (req, res) => {
  //Setup responce
  responce = {
    success: false
  };
  //Check debug status
  var debug = req.query.d == "true";
  var ckanapi = req.query.t == "ckanapi";
  // Check if query has been passed
  if (req.query.q) {
    //Get query string and strip unneccessary chars
    query = req.query.q.toLowerCase().replace(/[^\-a-z0-9\.\ \,\;]+/g, "");
    //Get coordinate parts
    var re = /([\-a-z]?)(\d+\.?\d*)([a-z]?)/g;
    var m;
    var parts = [];
    while ((m = re.exec(query)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === re.lastIndex) {
        re.lastIndex++;
      }
      var part = [];
      // The result can be accessed through the `m`-variable.
      m.forEach((match, groupIndex) => {
        part.push(match);
      });
      parts.push(part);
    }
    //Return query data in debug mode
    if (debug) {
      responce.query = {
        string: req.query.q,
        parsed: query,
        parts: parts
      };
    }
    //Get coordinate point
    var pt = {};
    //Guess coord type by counting parts
    if (parts.length == 2) {
      //Lat long in DD
      if (debug) responce.method = "DD";
      pt = fromDD(parts);
    } else if (parts.length == 3) {
      //UTM
      if (debug) responce.method = "UTM";
      pt = fromUTM(parts);
    } else if (parts.length == 4) {
      //Lat long in DM
      if (debug) responce.method = "DM";
      pt = fromDM(parts);
    } else if (parts.length == 6) {
      //Lat long in DMS
      if (debug) responce.method = "DMS";
      pt = fromDMS(parts);
    } else {
      if (debug) responce.method = "Unknown";
      pt.error = "Cannot determine coordinate type";
    }
    //Check for match
    if (pt.error) {
      //Return error
      responce.error = pt.error;
    } else {
      //Setup display value
      pt.display = req.query.q;
      delete pt.error;
      //Update responce
      responce.success = true;
      if (!ckanapi) {
        result = { y: pt.y, x: pt.x };
        responce.result = result;
      } else {
        result = { records: [pt] };
        responce.result = result;
      }
    }
  } else {
    responce.error = "No query sent";
  }
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.status(200).send(JSON.stringify(responce));
};
/**
 * Convers a DD coordinate into a DD object
 *
 * @param {*} parts 2 part list consisting of lat decimal degrees, lng decimal degrees with the format [string,prefix,value,postfix]
 * @returns DD object
 */
function fromDD(parts) {
  //Parse parts
  var lng = parseFloat(parts[0][2]);
  var lat = parseFloat(parts[1][2]);
  //Parse hemispheres
  if (parts[0][1] == "w" || parts[0][3] == "w" || parts[0][1] == "-") lng *= -1;
  if (parts[1][1] == "s" || parts[1][3] == "s" || parts[1][1] == "-") lat *= -1;
  //Validate results
  if (lat >= 90 || lat <= -90) {
    return {
      error:
        "Latitude degrees out of bounds [Expected:-90,90 Value: " +
        String(lat) +
        "]"
    };
  }
  if (lng >= 180 || lng <= -180) {
    return {
      error:
        "Longitude degrees out of bounds [Expected:-180,180 Value: " +
        String(lng) +
        "]"
    };
  }
  //Return coords
  return {
    y: lat,
    x: lng,
    error: null
  };
}
/**
 * Convers a DM coordinate into a DD object
 *
 * @param {*} parts 4 part array consisting of lat degrees, lat decimal minutes, lng degrees, lng decimal minutes with the format [string,prefix,value,postfix]
 * @returns DD object
 */
function fromDM(parts) {
  //Parse parts
  var dlng = parseFloat(parts[0][2]);
  var mlng = parseFloat(parts[1][2]);
  var dlat = parseFloat(parts[2][2]);
  var mlat = parseFloat(parts[3][2]);
  //Parse hemispheres
  if (
    parts[0][1] == "w" ||
    parts[0][3] == "w" ||
    parts[1][3] == "w" ||
    parts[0][1] == "-"
  )
    dlng *= -1;
  if (
    parts[2][1] == "s" ||
    parts[2][3] == "s" ||
    parts[3][3] == "s" ||
    parts[2][1] == "-"
  )
    dlat *= -1;
  //Validate results
  if (dlat >= 90 || dlat <= -90) {
    return {
      error:
        "Latitude degrees out of bounds [Expected:-90,90 Value: " +
        String(y) +
        "]"
    };
  }
  if (dlng >= 180 || dlng <= -180) {
    return {
      error:
        "Longitude degrees out of bounds [Expected:-180,180 Value: " +
        String(x) +
        "]"
    };
  }
  if (mlat < 0 || mlat >= 60) {
    return {
      error:
        "Latitude minutes out of bounds [Expected:0,60 Value: " +
        String(mlat) +
        "]"
    };
  }
  if (mlng < 0 || mlng >= 60) {
    return {
      error:
        "Longitude minutes out of bounds [Expected:0,60 Value: " +
        String(mlng) +
        "]"
    };
  }
  //Calculate coords
  var lng = dlng + (Math.sign(dlng) * mlng) / 60;
  var lat = dlat + (Math.sign(dlat) * mlat) / 60;
  //Return coords
  return {
    y: lat,
    x: lng,
    error: null
  };
}

/**
 * Convers a DMS coordinate into a DD object
 *
 * @param {*} parts  6 part array consisting of lat degrees, lat minutes, lat seconds, lng degrees, lng minutes, lng seconds with the format [string,prefix,value,postfix]
 * @returns DD object
 */
function fromDMS(parts) {
  //Parse parts
  var dlng = parseFloat(parts[0][2]);
  var mlng = parseFloat(parts[1][2]);
  var slng = parseFloat(parts[2][2]);
  var dlat = parseFloat(parts[3][2]);
  var mlat = parseFloat(parts[4][2]);
  var slat = parseFloat(parts[5][2]);
  //Parse hemispheres
  if (
    parts[0][1] == "w" ||
    parts[0][3] == "w" ||
    parts[2][3] == "w" ||
    parts[0][1] == "-"
  )
    dlng *= -1;
  if (
    parts[3][1] == "s" ||
    parts[3][3] == "s" ||
    parts[5][3] == "s" ||
    parts[3][1] == "-"
  )
    dlat *= -1;
  //Validate results
  if (dlat >= 90 || dlat <= -90) {
    return {
      error:
        "Latitude degrees out of bounds [Expected:-90,90 Value: " +
        String(dlat) +
        "]"
    };
  }
  if (dlng >= 180 || dlng <= -180) {
    return {
      error:
        "Longitude degrees out of bounds [Expected:-180,180 Value: " +
        String(dlng) +
        "]"
    };
  }
  if (mlng <= 0 || mlng >= 60) {
    return {
      error:
        "Latitude minutes out of bounds [Expected:0,60 Value: " +
        String(mlng) +
        "]"
    };
  }
  if (mlat < 0 || mlat >= 60) {
    return {
      error:
        "Longitude minutes out of bounds [Expected:0,60 Value: " +
        String(mlat) +
        "]"
    };
  }
  if (slng < 0 || slng >= 60) {
    return {
      error:
        "Latitude seconds out of bounds [Expected:0,60 Value: " +
        String(slng) +
        "]"
    };
  }
  if (slat < 0 || slat >= 60) {
    return {
      error:
        "Longitude seconds out of bounds [Expected:0,60 Value: " +
        String(slat) +
        "]"
    };
  }
  //Calculate coords
  var lng = dlng + (Math.sign(dlng) * mlng) / 60 + (Math.sign(dlng) * slng) / 3600;
  var lat = dlat + (Math.sign(dlat) * mlat) / 60 + (Math.sign(dlat) * slat) / 3600;
  //Return coords
  return {
    y: lat,
    x: lng,
    error: null
  };
}
/**
 * Convers a UTM coordinate into a DD object
 *
 * @param {*} parts 3 part array consisting of zone, easting and nothing. Zone is negative if in southern hemisphere with the format [string,prefix,value,postfix]
 * @returns  DD object
 */
function fromUTM(parts) {
  //Parse input
  var hemi = "N";
  if (parts[0][1] == "s" || parts[0][1] == "-" || parts[0][3] == "s") {
    hemi = "S";
  }
  var zone = parseInt(parts[0][2]);
  var easting = parseFloat(parts[1][2]);
  var northing = parseFloat(parts[2][2]);
  //Validate input
  if (zone <= 0 || zone > 60) {
    return {
      error: "Zone out of bounds [Expected:0,60 Value: " + String(zone) + "]"
    };
  }
  if (easting < 100000 || easting > 1000000) {
    return {
      error:
        "Easting out of bounds [Expected:100000,999999 Value: " +
        String(easting) +
        "]"
    };
  }
  if (northing < 0 || northing > 10000000) {
    return {
      error:
        "Northing out of bounds [Expected:0,10000000 Value: " +
        String(northing) +
        "]"
    };
  }
  //Calculate coords
  var coord = convertUtmToLatLng(easting, northing, zone, hemi);
  //Return coords
  return {
    y: coord["lat"],
    x: coord["lng"],
    error: null
  };
}

/* Modified from https://github.com/shahid28/utm-latlng/blob/master/UTMLatLng.js */
function convertUtmToLatLng(
  UTMEasting,
  UTMNorthing,
  UTMZoneNumber,
  UTMZoneLetter
) {
  var a = 6378137;
  var eccSquared = 0.00669438;
  var e1 = (1 - Math.sqrt(1 - eccSquared)) / (1 + Math.sqrt(1 - eccSquared));
  var x = UTMEasting - 500000.0;
  var y = UTMNorthing;
  var ZoneNumber = UTMZoneNumber;
  var ZoneLetter = UTMZoneLetter;

  if ("N" !== ZoneLetter) {
    y -= 10000000.0;
  }

  var LongOrigin = (ZoneNumber - 1) * 6 - 180 + 3;

  var eccPrimeSquared = eccSquared / (1 - eccSquared);

  M = y / 0.9996;
  var mu =
    M /
    (a *
      (1 -
        eccSquared / 4 -
        (3 * eccSquared * eccSquared) / 64 -
        (5 * eccSquared * eccSquared * eccSquared) / 256));

  var phi1Rad =
    mu +
    ((3 * e1) / 2 - (27 * e1 * e1 * e1) / 32) * Math.sin(2 * mu) +
    ((21 * e1 * e1) / 16 - (55 * e1 * e1 * e1 * e1) / 32) * Math.sin(4 * mu) +
    ((151 * e1 * e1 * e1) / 96) * Math.sin(6 * mu);
  var phi1 = toDegrees(phi1Rad);

  var N1 =
    a / Math.sqrt(1 - eccSquared * Math.sin(phi1Rad) * Math.sin(phi1Rad));
  var T1 = Math.tan(phi1Rad) * Math.tan(phi1Rad);
  var C1 = eccPrimeSquared * Math.cos(phi1Rad) * Math.cos(phi1Rad);
  var R1 =
    (a * (1 - eccSquared)) /
    Math.pow(1 - eccSquared * Math.sin(phi1Rad) * Math.sin(phi1Rad), 1.5);
  var D = x / (N1 * 0.9996);

  var Lat =
    phi1Rad -
    ((N1 * Math.tan(phi1Rad)) / R1) *
      ((D * D) / 2 -
        ((5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * eccPrimeSquared) *
          D *
          D *
          D *
          D) /
          24 +
        ((61 +
          90 * T1 +
          298 * C1 +
          45 * T1 * T1 -
          252 * eccPrimeSquared -
          3 * C1 * C1) *
          D *
          D *
          D *
          D *
          D *
          D) /
          720);
  Lat = toDegrees(Lat);

  var Long =
    (D -
      ((1 + 2 * T1 + C1) * D * D * D) / 6 +
      ((5 -
        2 * C1 +
        28 * T1 -
        3 * C1 * C1 +
        8 * eccPrimeSquared +
        24 * T1 * T1) *
        D *
        D *
        D *
        D *
        D) /
        120) /
    Math.cos(phi1Rad);
  Long = LongOrigin + toDegrees(Long);
  return { lat: Lat, lng: Long };
}

function toDegrees(rad) {
  return (rad / Math.PI) * 180;
}
