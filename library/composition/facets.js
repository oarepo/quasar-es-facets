import {markRaw, reactive} from "vue";
import deepcopy from 'deepcopy'

function findPath(obj, path) {
  path = path.split('.')
  const ret = []
  for (const p of path) {
    const facet = obj && obj[p]
    ret.push({
      key: p,
      parent: obj,
      facet: facet
    })
    if (facet) {
      obj = facet.aggs
    }
    // TODO: obj in buckets
  }
  ret.reverse()
  return ret
}

function facetsMethods(facetLoader, facetSelection, activeFacets) {
  return {
    listFacets() {
      return Object.values(this).filter(x => !!x.definition)
    },
    async loadFacets() {
      const aggs = await facetLoader(facetSelection, activeFacets)
      for (const [key, facet] of Object.entries(this)) {
        if (facet.definition && aggs[key]) {
          facet.mergeFacetWith(aggs[key])
        }
      }
    }
  }
}

function facetMethods(facetLoader, facetSelection, activeFacets) {
  return {
    clearFacet() {
      Object.entries(this).forEach(([key, value]) => {
        if (key !== 'definition' && key !== 'aggs' && typeof value !== 'function') {
          delete this[key]
        }
      })
    },
    mergeFacetWith(another) {
      // TODO: facets in buckets
      // at first clear everything but definition and sub-aggs
      this.clearFacet()

      // iterate through another and set
      for (const [k, v] of Object.entries(another)) {
        if (k === 'definition') {
          continue  // do not merge definition even if present
        }
        if (k === 'aggs') {
          // recursively merge contained aggregations
          for (const [kk, vv] of Object.entries(v)) {
            if (this.aggs[kk]) {
              this.aggs[kk].mergeFacetWith(vv)
            }
          }
        } else {
          // set on this instance
          this[k] = v
        }
      }
    },
    async loadFacet(excluded=[], extras={}) {
      const aggs = await facetLoader(
        facetSelection,
        {...activeFacets, [this.definition.path]: this},
        excluded,
        {
          [this.definition.path]: extras
        }
      )
      if (aggs) {
        const data = findPath(aggs, this.definition.path)
        if (!data[0].facet) {
          return
        }
        this.mergeFacetWith(data[0].facet)
      } else {
        this.clearFacet()
      }
    }
  }
}


function convertDefinition(definition, path) {
  // definition is object of key => definition
  // in case of nested the definition contains 'aggs'
  const prefixedPath = path ? path + '.' : ''
  const ret = {}
  for (const [key, facet] of Object.entries(definition)) {
    ret[key] = {
      definition: deepcopy(facet)
    }
    ret[key].definition.path = prefixedPath + key
    ret[key].definition.key = key

    if (facet.aggs) {
      ret[key].aggs = convertDefinition(facet.aggs, prefixedPath + key)
    }
  }
  return ret
}

function addMethods(facets, facetLoader, facetSelection, activeFacets) {
  for (const [k, v] of Object.entries(facetsMethods(facetLoader, facetSelection, activeFacets))) {
    facets[k] = markRaw(v)
  }
  for (const facet of Object.values(facets)) {
    for (const [k, v] of Object.entries(facetMethods(facetLoader, facetSelection, activeFacets))) {
      facet[k] = markRaw(v)
    }
    if (facet.aggs) {
      addMethods(facet.aggs, facetLoader, facetSelection, activeFacets)
    }
  }
}

export function useFacets(definition, facetLoader, facetSelection, activeFacets) {
  // convert definition into format suitable for merging with facets from the server
  const rawFacets = convertDefinition(definition, '')
  // make that reactive
  const facets = reactive(rawFacets)
  // finally, add methods on the reactive proxy
  addMethods(facets, facetLoader, facetSelection, activeFacets)
  return facets
}
