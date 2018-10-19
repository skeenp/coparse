# Coparse

Coordinate parser for use in Node JS which parses coordinates in DD. DM, DMS and UTM coordinates, returning a standardised DD json object.

Intended to initially be used in Google Cloud Functions.

## Use

Append ?q={coordinate} to your node URL, and the query string will be parsed and a standard json object will be returned.

## Responce

A success tag indicates parse success, and the result is returned as a set of records. An array of results is provided for potential future use.

Successful Query

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
