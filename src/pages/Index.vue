<template>
  <q-page class="q-ma-xl">
    <div class="row q-col-gutter-md items-stretch">
      <q-card class="col-4">
        <q-card-section>
          <facets
            :definition="definition"
            :options="options"
            :facetLoader="facetLoader"
            @facetSelected="facetSelected"
            drawer
          ></facets>
        </q-card-section>
      </q-card>
      <div class="column">
        <q-tabs v-model="tab" class="text-teal">
          <q-tab name="definition" label="Definition"></q-tab>
          <q-tab name="aggregations" label="Aggregations"></q-tab>
          <q-tab name="output" label="Filtered output"></q-tab>
        </q-tabs>
        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="definition">
            <pre>{{ definition }}</pre>
          </q-tab-panel>
          <q-tab-panel name="aggregations">
            <pre>{{ aggregations }}</pre>
          </q-tab-panel>
          <q-tab-panel name="output">
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
  </q-page>
</template>

<script>
import {esGetDefinition, esGetFacets, esLoadFacet} from 'src/es_api'
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
  const colors = ['light-green-3', 'light-green-6', 'green', 'green-9', 'green-10', 'yellow-3', 'yellow-10']
  let hc = hashCode(facet.facetKey) % colors.length
  if (hc < 0) {
    hc = hc + colors.length
  }
  return colors[hc]
}


export default {
  name: 'PageIndex',
  data: function () {
    return {
      tab: 'definition',
      definition: esGetDefinition(),
      facetSelection: {},
      options: {
        defaults: {
          components: {
            facetDrawerItem: {
              attrs: {
                color: factory((params) => selectColor(params.facet)),
              }
            }
          }
        }
      }
    }
  },
  methods: {
    async facetLoader(facetSelection, activeFacets, excludedFromQuery, extras = {}) {
      const esData = await esGetFacets(facetSelection, activeFacets, excludedFromQuery, extras)
      // return content of aggregations
      return esData.aggregations || {}
    },
    async loadFacets() {
    },
    facetSelected(facetSelection) {
      this.facetSelection = facetSelection
      console.log('Facet selected', facetSelection)
    }
  }
}
</script>
