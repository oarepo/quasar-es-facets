import deepcopy from 'deepcopy'
import deepmerge from 'deepmerge'

import axios from 'axios'
const ALL_VALUES_SIZE = 1000

/* eslint-disable quote-props */
const ALL_AGGS = {
  'terms-agg': {
    'terms': {
      'field': 'k',
      size: 10
    }
  },
  'significant-terms-agg': {
    'significant_terms': {
      'field': 'k'
    },
    hidden: true
  },
  'significant-text-agg': {
    'significant_text': {
      'field': 's',
      'filter_duplicate_text': true
    }
  },
  'date-histogram-agg': {
    'date_histogram': {
      'field': 'd',
      'calendar_interval': 'month'
    }
  },
  'auto-date-histogram-agg': {
    'auto_date_histogram': {
      'field': 'd',
      'buckets': 10
    }
  },
  'date-range-agg': {
    'date_range': {
      'field': 'd',
      'ranges': [
        {'from': 'now-10M/M'},
        {
          'to': 'now-10M/M',
          'from': 'now-20M/M'
        },
        {'to': 'now-20M/M'}
      ]
    }
  },
  'histogram-agg': {
    'histogram': {
      'field': 'f',
      'interval': 5
    }
  },
  'variable-width-histogram-agg': {
    'variable_width_histogram': {
      'field': 'f',
      'buckets': 3
    }
  },
  'missing-agg': {
    'missing': {
      'field': 'i'
    }
  },
  'exists-agg': {
    'filter': {
      'exists': {
        'field': 'i'
      }
    }
  },
  'rare-terms-agg': {
    'rare_terms': {
      'field': 'k'
    }
  },
  'rare-terms-date-agg': {
    'rare_terms': {
      'field': 'd'
    }
  },
  'range-agg': {
    'range': {
      'field': 'i',
      'ranges': [
        {'to': 50},
        {'from': 50}
      ]
    }
  },
  'global-agg': {
    'global': {},
    'aggs': {
      'global-terms-agg': {
        'terms': {
          'field': 'k'
        }
      }
    }
  },
  'filter-agg': {
    'filter': {'term': {'k': 'John'}},
    'aggs': {
      'filter-terms-agg': {
        'terms': {
          'field': 'i'
        }
      },
      'filter-fterms-agg': {
        'terms': {
          'field': 'f'
        }
      }
    }
  },
  'filters-agg': {
    'filters': {
      'filters': {
        'john': {'term': {'k': 'John'}},
        'mary': {'term': {'k': 'Mary'}}
      }
    }
  },
  'nested-agg': {
    'nested': {
      'path': 'n'
    },
    'aggs': {
      'nested-terms-agg': {
        'terms': {
          'field': 'n.k'
        }
      }
    }
  },
  'double-nested-agg': {
    'nested': {
      'path': 'n'
    },
    'aggs': {
      'inner-nested-agg': {
        'nested': {
          'path': 'n.n'
        },
        'aggs': {
          'double-nested-terms-agg': {
            'terms': {
              'field': 'n.n.k'
            }
          }
        }
      }
    }
  },
  'reverse-nested-agg': {
    'nested': {
      'path': 'n'
    },
    'aggs': {
      'reverse-nested-terms': {
        'terms': {
          'field': 'n.k'
        },
        'aggs': {
          'reverse-nested-reverse': {
            'reverse_nested': {},
            'aggs': {
              'reverse_nested_top-terms': {
                'terms': {
                  'field': 'k'
                }
              }
            }
          }
        }
      }
    }
  },
  'aggs-in-aggs': {
    'terms': {
      'field': 'k'
    },
    'aggs': {
      'aggs-in-aggs-inner': {
        'range': {
          'field': 'i',
          'ranges': [
            {'to': 50},
            {'from': 50}
          ]
        }
      }
    }
  },
  'extended-stats-agg': {
    'extended_stats': {
      'field': 'i'
    }
  }
}

function createQuery(aggs, facetSelection, excluded = []) {
  const selected = facetSelection.selected()
  if (Object.keys(selected).length) {
    return {
      bool: {
        must: {
          match_all: {},
        },
        filter: {
          bool: {
            must:
              Object.entries(selected)
                .filter(([facet, values]) => !excluded.includes(facet))
                .map(([facet, values]) => {
                  return {
                    'terms': {
                      [aggs[facet].terms.field]: Array.from(values)
                    }
                  }
                })
          }
        }
      }
    }
  } else {
    return {
      match_all: {}
    }
  }
}

export function extractAggs(aggs, paths, pathPrefix, extras = {}) {
  const ret = {}
  Object.entries(aggs).forEach(([key, agg]) => {
    const path = pathPrefix + key
    if (!paths.has(path)) {
      return
    }
    agg = deepcopy(agg)
    if ((extras[path] || {}).allValues) {
      if (agg.terms) {
        agg.terms.size = ALL_VALUES_SIZE
      }
    }

    ret[key] = agg
    if (agg.aggs !== undefined) {
      const extracted = extractAggs(agg.aggs, paths, path + '.')
      if (Object.keys(extracted).length > 0) {
        agg.aggs = extracted
      } else {
        delete agg.aggs
      }
    }
  })
  return ret
}

export async function esGetFacets(facetSelection, activeFacets, excludedFromQuery, extras = {}) {
  const paths = new Set(Object.keys(activeFacets))
  for (const path of Object.keys(facetSelection.selected())) {
    paths.add(path)
  }
  const currentAggs = extractAggs(ALL_AGGS, new Set(paths), '', extras)
  const currentQuery = createQuery(ALL_AGGS, facetSelection, excludedFromQuery)
  const axiosQuery = {
    'aggs': currentAggs,
    'query': currentQuery,
    'size': 0
  }
  return (await axios.post('/es', axiosQuery)).data
}

export function locatePath(data, path, separator) {
  path = path.split('.')
  for (const p of path) {
    data = data[separator][p]
  }
  return data
}

export function esGetDefinition(aggs) {
  if (!aggs) {
    aggs = deepcopy(ALL_AGGS)
  }
  Object.entries(aggs).forEach(([key, def]) => {
    def.label = `-- ${key} --`
    if (def.aggs !== undefined) {
      def.aggs = esGetDefinition(def.aggs)
    }
  })
  return aggs
}
