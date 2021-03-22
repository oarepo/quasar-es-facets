import deepcopy from 'deepcopy'
import axios from 'axios'
import {extractAggs, locatePath} from "src/es_api";


/* eslint-disable quote-props */
const ALL_AGGS = {
  'offersScholarship': {
    'terms': {
      'field': 'offersScholarship.keyword'
    }
  },
  'offersBrigades': {
    'terms': {
      'field': 'offersBrigades.keyword'
    }
  },
  'acceptsTrainees': {
    'terms': {
      'field': 'acceptsTrainees.keyword',
    }
  },
  'missingSkills': {
    'terms': {
      'field': 'missingSkills.keyword',
    }
  },
  'scientificCooperation': {
    'terms': {
      'field': 'scientificCooperation.keyword',
    }
  },
  'offersExcursions': {
    'terms': {
      'field': 'offersExcursions.keyword',
    }
  },
  'alumniPossible': {
    'terms': {
      'field': 'alumniPossible.keyword',
    }
  },
  'technologyTransferPossible': {
    'terms': {
      'field': 'technologyTransferPossible.keyword',
    }
  },
  'employeeTrainingPossible': {
    'terms': {
      'field': 'employeeTrainingPossible.keyword',
    }
  },
  'applicantFeePossible': {
    'terms': {
      'field': 'applicantFeePossible.keyword',
    }
  },
  'addressesCity': {
    'terms': {
      'field': 'addresses.city.keyword',
    }
  },
  'addressesCountry': {
    'terms': {
      'field': 'addresses.country.keyword',
    }
  },
  'addressesCounty': {
    'terms': {
      'field': 'addresses.county.keyword',
    }
  },
  'legalform': {
    'terms': {
      'field': 'legalform.keyword',
    }
  },
  'tags': {
    'terms': {
      'field': 'tags.keyword',
    }
  },
  'studyLevels': {
    'terms': {
      'field': 'studyLevels.keyword',
    }
  },
  'existingSkills': {
    'terms': {
      'field': 'existingSkills.keyword',
    }
  },
  'offersPraxis': {
    'terms': {
      'field': 'offersPraxis.keyword',
    }
  },
  'offersTheses': {
    'terms': {
      'field': 'offersTheses.keyword',
    }
  },
  'studyFields': {
    'terms': {
      'field': 'studyFields.keyword',
    }
  },
  'alumniCountPerYear': {
    'terms': {
      'field': 'alumniCountPerYear',
    }
  },
  'communicationStatus': {
    'terms': {
      'field': 'communicationStatus.value.keyword',
    }
  },
  'lastCommunicationDate': {
    'terms': {
      'field': 'communicationStatus.when',
    }
  },
  'lastCommunicationWho': {
    'terms': {
      'field': 'communicationStatus.who.fullname',
    }
  }
}

function createQuery(aggs, selectedFacets, excluded=[]) {
  if (Object.keys(selectedFacets).length) {
    return {
      bool: {
        must: {
          match_all: {},
        },
        filter: {
          bool: {
            must:
              Object.entries(selectedFacets)
                .filter(([facet, values]) => !excluded.includes(facet))
                .filter(([facet, values]) => values && values.size)
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

export async function esGetFacets(enabledFacets, selectedFacets) {
  const paths = new Set()
  for (const enabledFacet of enabledFacets) {
    const facetPath = enabledFacet.split('.')
    for (const i in facetPath) {
      paths.add(facetPath.slice(0, i + 1).join('.'))
    }
  }
  const currentAggs = extractAggs(ALL_AGGS, paths, '')
  const currentQuery = createQuery(ALL_AGGS, selectedFacets)
  const axiosQuery = {
    'aggs': currentAggs,
    'query': currentQuery,
    'size': 0
  }
  return (await axios.post('/company', axiosQuery)).data
}

export async function esGetResult(enabledFacets, selectedFacets) {
  const paths = new Set()
  for (const enabledFacet of enabledFacets) {
    const facetPath = enabledFacet.split('.')
    for (const i in facetPath) {
      paths.add(facetPath.slice(0, i + 1).join('.'))
    }
  }
  const currentQuery = createQuery(ALL_AGGS, selectedFacets)
  const axiosQuery = {
    'query': currentQuery,
    'size': 100
  }
  return (await axios.post('/company', axiosQuery)).data
}

export async function esLoadFacet(facetPath, selectedFacets) {
  const currentAggs = {
    aggs: extractAggs(ALL_AGGS, new Set([facetPath]), '')
  }
  const p = locatePath(currentAggs, facetPath, 'aggs')
  Object.entries(p).forEach(([k, v]) => {
    if (k !== 'aggs') {
      v.size = 10000
      // v.order = {"_key": "asc"}
    }
  })
  const currentQuery = createQuery(ALL_AGGS, selectedFacets, [facetPath])
  const axiosQuery = {
    ...currentAggs,
    'query': currentQuery,
    'size': 0
  }
  const data = (await axios.post('/company', axiosQuery)).data
  return locatePath(data, facetPath, 'aggregations')
}

/*
Datum kontaktu
Stav komunikace
Studijní programy a specializace

*/

const labels = {
  'offersScholarship': 'Nabídka stipendií',
  'offersBrigades': 'Nabídka brigád',
  'acceptsTrainees': 'Absolventské a tréninkové pozice',
  'missingSkills': 'Slabiny absolventů',
  'scientificCooperation': 'Zájem o vědeckou spolupráci',
  'offersExcursions': 'Nabídka exkurzí',
  'alumniPossible': 'Zájem o spolupráci s alumni',
  'technologyTransferPossible': 'Zájem o spolupráci s oddělením transferu technologií',
  'employeeTrainingPossible': 'Zájem o postgraduální vzdělávání zaměstnanců',
  'applicantFeePossible': 'Ochota platit za výběr absolventů',
  'addressesCity': 'Město',
  'addressesCountry': 'Stát',
  'addressesCounty': 'Kraj',
  'legalform': 'Právní forma',
  'tags': 'Štítky',
  'studyLevels': 'Úrovně studia',
  'existingSkills': 'Oceňované dovednosti absolventů',
  'offersPraxis': 'Nabídka praxe',
  'offersTheses': 'Nabídka temat závěrečných prací',
  'studyFields': 'Studijní oblasti',
  'alumniCountPerYear': 'Alumni za rok',
  'communicationStatus': 'Stav komunikace',
  'lastCommunicationDate': 'Poslední datum komunikace',
  'lastCommunicationWho': 'Kdo komunikoval',
}

export function esGetDefinition(aggs) {
  if (!aggs) {
    aggs = ALL_AGGS
  }
  const ret = {}
  Object.entries(aggs).forEach(([key, def]) => {
    ret[key] = {
      label: labels[key] || key
    }
    if (aggs.aggs !== undefined) {
      ret[key].aggs = esGetDefinition(aggs.aggs)
    }
  })
  return ret
}
