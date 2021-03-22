# Quasar Elasticsearch facets (quasar-es-facets)

Renders elasticsearch aggregations as facets

## Usage

Create a quasar boot file `facets.js`
with the following content:

```javascript
import QuasarESFacets from
    '@oarepo/quasar-es-facets'

export default async ({app}) => {
  app.use(QuasarESFacets)
}
```

In your application, pass to template:

```html
    <facets
      :definition="definition"
      :options="options"
      :facetLoader="facetLoader"
      @facetSelected="facetSelected"
      drawer
    ></facets>
```

## Parameters

### ``drawer``

Boolean property, if passed will render
a drawer with selected options.

### ``facetSelected``

An event emitted when facet's bucket is
selected/deselected. It is passed
a facetSelection object - reactive object with
a structure:

```javascript
const facetSelection = {
    <facet_path>: Set(of bucket keys)
}
```

The facet selection contains a method
``.selected()`` that returns only the selected facets.

### ``definition``

The definition of allowed facets. It has the
same structure as ``aggs`` query in elasticsearch
but might contain additional properties.

Example:

```json5
{
  title: {
    terms: {
      field: 'title.keyword',
      size: 50
    },
    label: 'Article Title'
  },
  // ...
}
```

### ``options``

Optional extra options passed for the facets.
Contains definition of elements/attributes,
label/value translators and other options.

See ``config.js`` in this library for structure
of this property and set of possible options.

#### Option resolution order

For options related to a facet, the resolution order is:

1. Look for it in the definition
2. If not found, look for it in options under path `facetPath`
3. If not found, look for it in options under path ``defaults``
4. If not found, look for it in default options under path ``defaults``

For options not bound to a concrete facet, the resolution is:

1. Look for it in options under path ``defaults``
2. If not found, look for it in default options under path ``defaults``

### ``facetLoader``

A function responsible for calling elasticsearch and returning the contents of ``response.aggregations`` field.
Parameters:

```javascript
/**
 * facetSelection - an object of selected facets as described above.
 *                  facetSelection.selected() facets must be included
 *                  in aggs query
 *                  This selection should also be used for ES filtering
 * activeFacets -   dictionary of currently open facets. These must be
 *                  included in aggregations as well
 * excludedFromQuery - array of facet paths that should be excluded from
 *                  filtering
 * extras - {size: 1000} - any extras, currently only 'size' attribute is
 *                  provided to limit number of buckets returned
 */
async facetLoader(facetSelection, activeFacets, excludedFromQuery, extras = {}) {
  // ...
}
```

Sample implementation in the es_api.js calls
elasticsearch directly. A more sane implementation
would serialize the parameters to HTTP query, call
backend that would create and call the ES API.

