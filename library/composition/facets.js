import {markRaw, reactive} from 'vue'
import deepcopy from 'deepcopy'

function findPath(obj, path) {
  path = path.split('.')
  const ret = []
  for (const p of path) {
    let facet = obj && obj[p]
    if (!facet) {
      // potential typed keys ...
      if (obj) {
        Object.entries(obj).find(([key, value]) => {
          key = key.split('#')
          if (key[key.length - 1] === p) {
            facet = value
            facet.__runtime_type = key[0]
            return true
          }
          return false
        })
      }
      if (!facet) {
        // potential in buckets
        // console.log('Looking for facet', p, 'in buckets of', obj)
        if (obj && obj.buckets) {
          obj.buckets.find(bucket => {
            if (bucket[p]) {
              facet = bucket[p]
              return true
            } else {
              return Object.entries(bucket).find(([key, value]) => {
                key = key.split('#')
                if (key[key.length - 1] === p) {
                  facet = value
                  facet.__runtime_type = key[0]
                  return true
                }
                return false
              })
            }
          })
        }
      }
    }
    ret.push({
      key: p,
      parent: obj,
      facet: facet
    })
    if (facet) {
      obj = facet.aggs || facet
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
    async loadFacets(paths, config) {
      const aggs = await facetLoader(facetSelection, activeFacets)
      for (const [key, facet] of Object.entries(this)) {
        if (facet.definition && aggs[key]) {
          facet.mergeFacetWith(aggs[key], config)
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
    mergeFacetWith(another, config) {
      // TODO: facets in buckets
      // at first clear everything but definition and sub-aggs
      this.clearFacet()

      if (this.definition && (this.definition.type || another['__runtime_type'])) {

        if (another['__runtime_type'] && this.definition && !this.definition.type) {
          this.definition.type = another['__runtime_type']
          delete this.definition.facetComponent
          delete this.definition.drawerFacetComponent
        }

        // preprocess the value
        const preprocessor = config.findFacetOption('facetPreprocessor', this)
        if (preprocessor) {
          another = preprocessor(another) || another
        }
      }

      // iterate through another and set
      // console.log('Loading from', another)
      for (const [k, v] of Object.entries(another)) {
        if (k === 'definition') {
          continue  // do not merge definition even if present
        }
        if (k === '__runtime_type') {
          continue   // already processed above
        }
        if (k === 'aggs') {
          if (!this.aggs) {
            this.aggs = {}
          }
          // recursively merge contained aggregations
          for (const [kk, vv] of Object.entries(v)) {
            if (this.aggs[kk]) {
              this.aggs[kk].mergeFacetWith(vv, config)
            }
          }
        } else if (k.indexOf('#') > 0) {
          if (!this.aggs) {
            this.aggs = {}
          }
          const withoutType = k.split('#').pop()
          if (this.aggs[withoutType]) {
            this.aggs[withoutType].mergeFacetWith(v, config)
          }
        } else {
          // set on this instance
          // console.log(k, v)
          this[k] = v
        }
      }
    },
    async loadFacet(excluded = [], extras = {}, config = null) {
      const aggs = await facetLoader(
        facetSelection,
        {...activeFacets, [this.definition.path]: this},
        excluded,
        {
          [this.definition.path]: extras
        }
      )
      if (aggs) {
        // console.log('loaded facet', aggs, this.definition.path)
        const data = findPath(aggs, this.definition.path)
        // console.log('data', data, this.definition)
        if (!data[0].facet) {
          return
        }
        this.mergeFacetWith(data[0].facet, config)
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
