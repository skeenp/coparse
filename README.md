# Coparse

Coordinate parser for use in Node JS which parses coordinates in DD. DM, DMS and UTM coordinates, returning a standardised DD json object. By default the parser accepts coordinates in Long/Lat or UTM format.

See use.html for more information

Intended to initially be used in Google Cloud Functions.

## Use

Append ?q={coordinate} to your node URL, and the query string will be parsed and a standard json object will be returned. By default a simple object is returned, but a ckanapi-like object can also be returned by passing t=ckanapi. By default a simple object is returned.

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
