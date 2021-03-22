<template>
  <q-page class="q-ma-xl">
    <div class="row q-col-gutter-md">
      <q-card class="col-4" bordered flat>
        <q-card-section>
          <facets
            :facets="aggregations"
            :definition="definition"
            :options="options"
            :shownFacets="shownFacets"
            :selectedFacets="selectedFacets"
            @facetOpen="facetOpen"
            @facetClosed="facetClosed"
            @facetSelected="facetSelected"
            drawer
          ></facets>
        </q-card-section>
      </q-card>
      <div class="col-8">
        <div>
          <q-tabs v-model="tab" class="text-teal">
            <q-tab name="output" label="Filtered output"></q-tab>
            <q-tab name="definition" label="Definition"></q-tab>
            <q-tab name="aggregations" label="Aggregations"></q-tab>
          </q-tabs>
        </div>
        <div>
          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="definition">
              <pre>{{ definition }}</pre>
            </q-tab-panel>
            <q-tab-panel name="aggregations">
              <pre>{{ aggregations }}</pre>
            </q-tab-panel>
            <q-tab-panel name="output">
              <div class="q-pl-md">
                Celkem {{ esResult.hits.total.value }} výsledků
              </div>
              <q-separator></q-separator>
              <q-list>
                <q-expansion-item v-for="result in esResult.hits.hits" :key="result._source.id"
                                  :label="result._source.name.join('')"
                >
                  <q-item-section>
                    <q-markup-table>
                      <tbody>
                      <tr v-for="[r,val] in Object.entries(result._source)" :key="r">
                        <th class="text-right">
                          {{ r }}
                        </th>
                        <td>
                          {{ formatValue(val) }}
                        </td>
                      </tr>
                      </tbody>
                    </q-markup-table>
                  </q-item-section>
                </q-expansion-item>
              </q-list>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import {esGetDefinition, esGetFacets, esGetResult, esLoadFacet} from 'src/es_api_company'
import deepmerge from 'deepmerge'
import {factory} from "app/library/composition/config";
import {useSelection} from "app/library/composition/selection";

const hashCode = function (s) {
  var hash = 0, i, chr;
  if (s.length === 0) return hash;
  for (i = 0; i < s.length; i++) {
    chr = s.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

function selectColor(facet) {
  const colors = ['light-green-3', 'light-green-6', 'green-3', 'green-6', 'yellow-3', 'yellow-6', 'yellow-10', 'orange-6', 'orange-10']
  let hc = hashCode(facet.facetKey) % colors.length
  if (hc < 0) {
    hc = hc + colors.length
  }
  return colors[hc]
}

function labelTranslator({bucket, facet}) {
  if (facet.facetPath.indexOf('Date') >= 0) {
    return new Date(bucket.key_as_string).toLocaleDateString('cs')
  }
  return {
    'yes': 'ano',
    'no': 'ne',
    'maybe': 'možná',
    'unknown': 'nezjištěno'
  }[bucket.key] || bucket.key_as_string || bucket.key
}

export default {
  name: 'Company',
  data: function () {
    return {
      esData: {aggregations: {}},
      esResult: {hits: {total: {value: 0}, hits: []}},
      enabledFacets: new Set(),
      selectedFacets: useSelection(),
      tab: 'output',
      definition: deepmerge(
        esGetDefinition(),
        {
          'addressesCity': {
            visible: factory(() => {
              return (this.selectedFacets['addressesCounty'] || []).size > 0
            })
          }
        }),
      shownFacets: [
        // Fakulta
        'addressesCounty',
        'addressesCity',
        'studyFields',
        'offersPraxis',
        // - Sponzoring SVK
        'scientificCooperation',
        'offersTheses',
        'lastCommunicationDate'
      ],
      options: {
        defaults: {
          components: {
            facetDrawerItem: {
              attrs: {
                color: 'secondary' // factory((params) => selectColor(params.facet)),
              }
            },
            extendedFacetsButton: {
              attrs: {
                label: 'Další filtry'
              }
            },
            listBucketsExtraItems: {
              title: function ({facet}) {
                const c = facet.sum_other_doc_count
                if (c === 1) {
                  return `... ještě ${c} položka`
                }
                if (c >= 2 && c < 5) {
                  return `... ještě ${c} položky`
                }
                return `... ještě ${c} položek`
              }
            },
            listBucketsSelectMore: {
              title: '... vybrat více'
            },
            listBucketLabel: {
              translator: labelTranslator
            },
            drawerBucketLabel: {
              translator: labelTranslator
            },
            dialogBucketLabel: {
              translator: labelTranslator
            },
            facetsAdditionalDialog: {
              title: 'Vyberte hodnoty'
            }
          },
          facetLoader: (facet) => {
            return esLoadFacet(facet.facetPath, this.selectedFacets)
          }
        }
      }
    }
  },
  computed: {
    aggregations: function () {
      return this.esData.aggregations || {}
    }
  },
  mounted() {
    this.loadFacets()
  },
  methods: {
    async loadFacets() {
      const loaded = await esGetFacets(Array.from(this.enabledFacets), this.selectedFacets)
      // keep previous aggregations
      if (!loaded.aggregations) {
        loaded.aggregations = {}
      }
      Object.entries(this.esData.aggregations || {}).forEach(([k, v]) => {
        if (loaded.aggregations[k] === undefined) {
          console.log(v)
          loaded.aggregations[k] = v
        }
      })
      console.log(loaded)
      this.esData = loaded
      this.esResult = await esGetResult(Array.from(this.enabledFacets), this.selectedFacets)
    },
    facetOpen(facet) {
      this.enabledFacets.add(facet.facetPath)
      this.loadFacets()
    },
    facetClosed(facet) {
      this.enabledFacets.delete(facet.facetPath)
      this.loadFacets()
    },
    facetSelected({facet, selection}) {
      this.loadFacets()
    },
    formatValue(val) {
      if (Array.isArray(val)) {
        return val.map(x => (x || '').toString()).join('\n')
      }
      return val
    }
  }
}
</script>
