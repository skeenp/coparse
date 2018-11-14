# Coparse

Coordinate parser for use in Node JS which parses coordinates in DD. DM, DMS and UTM coordinates, returning a standardised DD json object. By default the parser accepts coordinates in Long/Lat or UTM format.

See use.html for more information

Intended to initially be used in Google Cloud Functions.

## Use

Append ?q={coordinate} to your node URL, and the query string will be parsed and a standard json object will be returned. By default a simple object is returned, but a ckanapi-like object can also be returned by passing t=ckanapi. By default a simple object is returned.

### Supported Query Formats
Queries can be passed in Degrees, Decimal Degrees, Degrees Minutes Seconds or UTM format. The following are some examples of supported query strings.

#### Decimal Degrees (Long Lat)

The following are tested variants on a value passed as Decimal Degrees:

 * 146.038588 -41.805062
 * E146.038588 S41.805062
 * 146.038588E 41.805062S

#### Degrees Decimal Minutes (Long Lat)

The following are tested variants on a value passed as Degrees Decimal Minutes:

 * 146° 2.3153' -41° 48.3037'
 * E146° 2.3153' S41° 48.3037'
 * 146° 2.3153'E 41° 48.3037'S
 * 146° 2.3153' -41° 48.3037'
 * 146 2.3153 -41 48.3037
 * 146 2.3153E 41 48.3037S

#### Degrees Minutes Seconds (Long Lat)

The following are tested variants on a value passed as Degrees Minutes Seconds:

 * 146° 2' 18.9168" -41° 48' 18.2226"
 * E146° 2' 18.9168" S41° 48' 18.2226"
 * 146° 2' 18.9168"E 41° 48' 18.2226"S
 * 146 2 18.9168 -41 48 18.2226
 * E146 2 18.9168 S41 48 18.2226
 * 146 2 18.9168E 41 48 18.2226S

#### UTM (Zone Easting Northing)

The following are tested variants on a value passed as UTM:

 * S55 420135E 5371420N
 * 55S E420135 N5371420

### Debug
Specifying d=true, a debug output will be appended to the output object.

## Responce

Successful Query (simple type)

```json
{
  "success": true,
  "result": {
        "y": "-74.123",
        "x": "40.123"
    }
}
```

Successful Query (ckanapi type)

```json
{
  "success": true,
  "result": {
    "records": [
      {
        "display": "40.123 -74.123",
        "y": "-74.123",
        "x": "40.123"
      }
    ]
  }
}
```

Unsuccessful Query

```json
{
  "success": false,
  "result": {
    "records": [
    ]
  }
}
```
