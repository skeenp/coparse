/**
 * Responds to a http request for a conversion of a DD, DM, DMS
 * or UTM coordinate into a standardised DD json object.
*
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.main = (req, res) => {
    //Setup responce
    responce = {
        "success": false,
        "result": {
            "records": []
        }
    };
    // Check if query has been passed
    if (req.query.q) {
        //Get query string and convert w and s to minus
        query = req.query.q.toLowerCase().replace('s', '-').replace('w', '-').replace('n', '').replace('e', '');
        //Get coordinate parts
        var re = /([-]?\d+\.?\d*)/g;
        var m;
        m = query.match(re);
        //Get coordinate point
        var pt = {};
        //Guess coord type by counting parts
        if (m.length == 2) { //Lat long in DD
            pt = fromDD(m)
        } else if (m.length == 3) {//UTM
            pt = fromUTM(m)
        } else if (m.length == 4) {//Lat long in DM
            pt = fromDM(m)
        } else if (m.length == 6) {//Lat long in DMS
            pt = fromDMS(m)
        }
        //Check for match
        if (pt !== {}) {
            //Setup display value
            pt.display = pt.y + " " + pt.x
            //Update responce
            responce.success = true
            responce.result.records.push(pt);
        }
    }
    //Respond
    res.status(200).send(JSON.stringify(responce));
}
/**
 * Convers a DD coordinate into a DD object
 *
 * @param {*} parts 2 part array consisting of lat decimal degrees, lng decimal degrees
 * @returns DD object
 */
function fromDD(parts) {
    var y = parseFloat(parts[0])
    var x = parseFloat(parts[1])
    return { "y": y, "x": x }
}
/**
 * Convers a DM coordinate into a DD object
 *
 * @param {*} parts 4 part array consisting of lat degrees, lat decimal minutes, lng degrees, lng decimal minutes
 * @returns DD object
 */
function fromDM(parts) {
    var dy = parseFloat(parts[0])
    var my = parseFloat(parts[1])
    var dx = parseFloat(parts[2])
    var mx = parseFloat(parts[3])
    var y = dy + Math.sign(dy) * my / 60
    var x = dx + Math.sign(dx) * mx / 60
    return { "y": y, "x": x }
}

/**
 * Convers a DMS coordinate into a DD object
 *
 * @param {*} parts  6 part array consisting of lat degrees, lat minutes, lat seconds, lng degrees, lng minutes, lng seconds
 * @returns DD object
 */
function fromDMS(parts) {
    var dy = parseFloat(parts[0])
    var my = parseFloat(parts[1])
    var sy = parseFloat(parts[2])
    var dx = parseFloat(parts[0])
    var mx = parseFloat(parts[1])
    var sx = parseFloat(parts[5])
    var y = dy + Math.sign(dy) * my / 60 + Math.sign(dy) * sy / 3600
    var x = dx + Math.sign(dx) * mx / 60 + Math.sign(dx) * sx / 3600
    return { "y": y, "x": x }
}

/**
 * Convers a UTM coordinate into a DD object
 *
 * @param {*} parts 3 part array consisting of zone, easting and nothing. Zone is negative if in southern hemisphere
 * @returns  DD object
 */
function fromUTM(parts) {
    var coord = toLatLon(easting = parts[1], northing = parts[2], zoneNum = parts[0], northen = Math.sign(parts[0]) == 1)
    return {
        "y": coord[0],
        "x": coord[1]
    };
}

/* toLatLon minified from https://raw.githubusercontent.com/TimothyGu/utm/master/index.es.js*/
function toLatLon(t,a,h,M){var o=.00669438,n=Math.pow(o,2),p=Math.pow(o,3),w=o/(1-o),r=Math.sqrt(1-o),i=(1-r)/(1+r),s=Math.pow(i,2),u=Math.pow(i,3),e=Math.pow(i,4),c=Math.pow(i,5),L=21/16*s-55/32*e,f=151/96*u-417/128*c,D=1097/512*e,q=6378137,v=t-5e5,z=a;M||(z-=1e7);var C=z/.9996/(q*(1-o/4-3*n/64-5*p/256)),I=C+(1.5*i-27/32*u+269/512*c)*Math.sin(2*C)+L*Math.sin(4*C)+f*Math.sin(6*C)+D*Math.sin(8*C),P=Math.sin(I),b=Math.pow(P,2),d=Math.cos(I),g=Math.tan(I),j=Math.pow(g,2),k=Math.pow(g,4),l=1-o*b,m=(1-o)/l,x=i*d*d,y=x*x,A=v/(.9996*(q/Math.sqrt(l))),B=Math.pow(A,2),E=Math.pow(A,3),F=Math.pow(A,4),G=(A-E/6*(1+2*j+x)+Math.pow(A,5)/120*(5-2*x+28*j-3*y+8*w+24*k))/d;return[tD(I-g/m*(B/2-F/24*(5+3*j+10*x-4*y-9*w))+Math.pow(A,6)/720*(61+90*j+298*x+45*k-252*w-3*y)),tD(G)+zCL(h)]}function zCL(t){return 6*(t-1)-180+3}function tD(t){return t/Math.PI*180}