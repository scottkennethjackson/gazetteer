# Gazetteer TODOs

## Tourist Attractions Layer

- Current status: Disabled
- Reason: Geoapify Places API does not yet support `filter=countrycode:XX`.
  - Bounding box (`rect:`) approach works poorly for large/multi-territory countries (e.g. USA, France).
  - To avoid inaccurate markers, we have disabled attractions for now.

## Action Items

- Monitor Geoapify API updates: [https://apidocs.geoapify.com/docs/places](https://apidocs.geoapify.com/docs/places)
- When `countrycode` filter becomes available:
  1. Update `/api/placesProxy.js` to use  
     ```
     filter=countrycode:${countryCode}
     ```
  2. Re-enable marker logic in `/utils/countryPlaces.js`.
  3. Remove the fallback console message.
