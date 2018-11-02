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
        "success": false
    };
    //Check debug status
    var debug = req.query.d == 'true'
    var ckanapi = req.query.t == 'ckanapi'
    // Check if query has been passed
    if (req.query.q) {
        //Get query string and convert w and s to minus
        query = req.query.q.toLowerCase();
        //Get coordinate parts
        var re = /([\-a-z]?)(\d+\.?\d*)([a-z]?)/g;
        var m;
        var parts = []
        while ((m = re.exec(query)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === re.lastIndex) {
                re.lastIndex++;
            }
            var part = []
            // The result can be accessed through the `m`-variable.
            m.forEach((match, groupIndex) => {
                part.push(match)
            });
            parts.push(part)
        }
        //Return query data in debug mode
        if (debug){
            responce.query = {
                "string": req.query.q,
                "parts": parts
            }
        }
        //Get coordinate point
        var pt = {};
        //Guess coord type by counting parts
        if (parts.length == 2) { //Lat long in DD
            if (debug) responce.method = 'DD';
            pt = fromDD(parts)
        } else if (parts.length == 3) { //UTM
            if (debug) responce.method = 'UTM'
            pt = fromUTM(parts)
        } else if (parts.length == 4) { //Lat long in DM
            if (debug) responce.method = 'DM'
            pt = fromDM(parts)
        } else if (parts.length == 6) { //Lat long in DMS
            if (debug) responce.method = 'DMS'
            pt = fromDMS(parts)
        } else {
            if (debug) responce.method = 'Unknown'
            pt.error = "Cannot determine coordinate type"
        }
        //Check for match
        if (pt.error) {
            //Return error
            responce.error = pt.error
        }else{
            //Setup display value
            pt.display = query
            delete pt.error
            //Update responce
            responce.success = true
            if (!ckanapi) {
                result = {"y":pt.y,"x":pt.x}
                responce.result = result;
            } else {
                result = {"records":[pt]}
                responce.result = result;
            }
            
        }
    } else {
        responce.error = 'No query sent'
    }
    res.status(200).send(JSON.stringify(responce));
}
/**
 * Convers a DD coordinate into a DD object
 *
 * @param {*} parts 2 part list consisting of lat decimal degrees, lng decimal degrees with the format [string,prefix,value,postfix]
 * @returns DD object
 */
function fromDD(parts) {
    //Parse parts
    var y = parseFloat(parts[0][2])
    var x = parseFloat(parts[1][2])
    //Parse hemispheres
    if (parts[0][1] == 's' || parts[0][3] == 's' || parts[0][1] == '-') y *= -1;
    if (parts[1][1] == 'w' || parts[1][3] == 'w' || parts[1][1] == '-') x *= -1;
    //Validate results
    if (y >= 90 || y <= -90) {
        return {
            "error": "Latitude degrees out of bounds [Expected:-90,90 Value: " + String(y) + ']'
        }
    }
    if (x >= 180 || x <= -180) {
        return {
            "error": "Longitude degrees out of bounds [Expected:-180,180 Value: " + String(x) + ']'
        }
    }
    //Return coords
    return {
        "y": y,
        "x": x,
        "error": null
    }
}
/**
 * Convers a DM coordinate into a DD object
 *
 * @param {*} parts 4 part array consisting of lat degrees, lat decimal minutes, lng degrees, lng decimal minutes with the format [string,prefix,value,postfix]
 * @returns DD object
 */
function fromDM(parts) {
    //Parse parts
    var dy = parseFloat(parts[0][2])
    var my = parseFloat(parts[1][2])
    var dx = parseFloat(parts[2][2])
    var mx = parseFloat(parts[3][2])
    //Parse hemispheres
    if (parts[0][1] == 's' || parts[0][3] == 's' || parts[1][3] == 's'  || parts[0][1] == '-') dy *= -1;
    if (parts[2][1] == 'w' || parts[2][3] == 'w' || parts[3][3] == 'w' || parts[2][1] == '-') dx *= -1;
    //Validate results
    if (y >= 90 || y <= -90) {
        return {
            "error": "Latitude degrees out of bounds [Expected:-90,90 Value: " + String(y) + ']'
        }
    }
    if (x >= 180 || x <= -180) {
        return {
            "error": "Longitude degrees out of bounds [Expected:-180,180 Value: " + String(x) + ']'
        }
    }
    if (my < 0 || my >= 60) {
        return {
            "error": "Latitude minutes out of bounds [Expected:0,60 Value: " + String(my) + ']'
        }
    }
    if (mx < 0 || mx >= 60) {
        return {
            "error": "Longitude minutes out of bounds [Expected:0,60 Value: " + String(mx) + ']'
        }
    }
    //Calculate coords
    var y = dy + Math.sign(dy) * my / 60
    var x = dx + Math.sign(dx) * mx / 60
    //Return coords
    return {
        "y": y,
        "x": x,
        "error": null
    }
}

/**
 * Convers a DMS coordinate into a DD object
 *
 * @param {*} parts  6 part array consisting of lat degrees, lat minutes, lat seconds, lng degrees, lng minutes, lng seconds with the format [string,prefix,value,postfix]
 * @returns DD object
 */
function fromDMS(parts) {
    //Parse parts
    var dy = parseFloat(parts[0][2])
    var my = parseFloat(parts[1][2])
    var sy = parseFloat(parts[2][2])
    var dx = parseFloat(parts[3][2])
    var mx = parseFloat(parts[4][2])
    var sx = parseFloat(parts[5][2])
        //Parse hemispheres
        if (parts[0][1] == 's' || parts[0][3] == 's' || parts[2][3] == 's' || parts[0][1] == '-') dy *= -1;
        if (parts[3][1] == 'w' || parts[3][3] == 'w' || parts[5][3] == 'w' || parts[3][1] == '-') dx *= -1;
    //Validate results
    if (y >= 90 || y <= -90) {
        return {
            "error": "Latitude degrees out of bounds [Expected:-90,90 Value: " + String(y) + ']'
        }
    }
    if (x >= 180 || x <= -180) {
        return {
            "error": "Longitude degrees out of bounds [Expected:-180,180 Value: " + String(x) + ']'
        }
    }
    if (my <= 0 || my >= 60) {
        return {
            "error": "Latitude minutes out of bounds [Expected:0,60 Value: " + String(my) + ']'
        }
    }
    if (mx < 0 || mx >= 60) {
        return {
            "error": "Longitude minutes out of bounds [Expected:0,60 Value: " + String(mx) + ']'
        }
    }
    if (sy < 0 || sy >= 60) {
        return {
            "error": "Latitude seconds out of bounds [Expected:0,60 Value: " + String(sy) + ']'
        }
    }
    if (sx < 0 || sx >= 60) {
        return {
            "error": "Longitude seconds out of bounds [Expected:0,60 Value: " + String(sx) + ']'
        }
    }
    //Calculate coords
    var y = dy + Math.sign(dy) * my / 60 + Math.sign(dy) * sy / 3600
    var x = dx + Math.sign(dx) * mx / 60 + Math.sign(dx) * sx / 3600
    //Return coords
    return {
        "y": y,
        "x": x,
        "error": null
    }
}
/**
 * Convers a UTM coordinate into a DD object
 *
 * @param {*} parts 3 part array consisting of zone, easting and nothing. Zone is negative if in southern hemisphere with the format [string,prefix,value,postfix]
 * @returns  DD object
 */
function fromUTM(parts) {
    //Parse input
    var hemi = 1
    if ((parts[0][1] < 'n') || (parts[0][3] < 'n')) {hemi = -1}
    var zone = parseInt(parts[0][2])
    var easting = parseFloat(parts[1][2])
    var northing = parseFloat(parts[2][2])
    //Validate input
    if (zone <= 0 || zone > 60) {
        return {
            "error": "Zone out of bounds [Expected:0,60 Value: " + String(zone) + ']'
        }
    }
    if (easting < 100000 || easting > 1000000) {
        return {
            "error": "Easting out of bounds [Expected:100000,999999 Value: " + String(easting) + ']'
        }
    }
    if (northing < 0 || northing > 10000000) {
        return {
            "error": "Northing out of bounds [Expected:0,10000000 Value: " + String(northing) + ']'
        }
    }
    //Calculate coords
    var coord = toLatLon(easting, northing, zone, hemi)
    //Return coords
    return {
        "y": coord[0],
        "x": coord[1],
        "error": null
    };
}

/* toLatLon minified from https://raw.githubusercontent.com/TimothyGu/utm/master/index.es.js */
function toLatLon(t,a,h,M){var o=.00669438,n=Math.pow(o,2),p=Math.pow(o,3),w=o/(1-o),r=Math.sqrt(1-o),i=(1-r)/(1+r),s=Math.pow(i,2),u=Math.pow(i,3),e=Math.pow(i,4),c=Math.pow(i,5),L=21/16*s-55/32*e,f=151/96*u-417/128*c,D=1097/512*e,q=6378137,v=t-5e5,z=a;M||(z-=1e7);var C=z/.9996/(q*(1-o/4-3*n/64-5*p/256)),I=C+(1.5*i-27/32*u+269/512*c)*Math.sin(2*C)+L*Math.sin(4*C)+f*Math.sin(6*C)+D*Math.sin(8*C),P=Math.sin(I),b=Math.pow(P,2),d=Math.cos(I),g=Math.tan(I),j=Math.pow(g,2),k=Math.pow(g,4),l=1-o*b,m=(1-o)/l,x=i*d*d,y=x*x,A=v/(.9996*(q/Math.sqrt(l))),B=Math.pow(A,2),E=Math.pow(A,3),F=Math.pow(A,4),G=(A-E/6*(1+2*j+x)+Math.pow(A,5)/120*(5-2*x+28*j-3*y+8*w+24*k))/d;return[tD(I-g/m*(B/2-F/24*(5+3*j+10*x-4*y-9*w))+Math.pow(A,6)/720*(61+90*j+298*x+45*k-252*w-3*y)),tD(G)+zCL(h)]}function zCL(t){return 6*(t-1)-180+3}function tD(t){return t/Math.PI*180}