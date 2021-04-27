import {useComponent} from "../composition/component";
import {computed, defineComponent, reactive, resolveComponent, Teleport, h} from "vue";
import {QSeparator, useQuasar} from "quasar";
import {useSelection} from "../composition/selection";
import {useFacets} from "../composition/facets";
import { useConfig } from '../composition/config';

export default defineComponent({
  name: 'Facets',
  props: {
    definition: {
      type: Object,
      required: true
    },
    options: {
      type: Object,
      default: () => ({})
    },
    drawer: {
      type: Boolean,
      default: false
    },
    facetLoader: {
      type: Function,
      required: true
    },
    teleport: {
      type: String
    }
  },
  emits: ['facetSelected'],
  setup(props, {attrs, emit}) {
    const c = useComponent(props.definition, props.options)
    const config = useConfig(props.definition, props.options)
    const $q = useQuasar()

    const facetSelection = useSelection()
    const activeFacets = reactive({})

    const facets = useFacets(props.definition, props.facetLoader, facetSelection, activeFacets)

    const drawerComponent = computed(() => {
      return props.drawer && c.getGenericComponent('drawer')
    })

    const extendedFacetsComponent = computed(() => {
      return c.getGenericComponent('extendedFacetsButton')
    })

    const facetListComponent = computed(() => {
      return c.getGenericComponent('facetsList')
    })

    const moreFiltersDialog = resolveComponent(
      c.getGenericComponent('moreFiltersDialog').component)

    async function reload() {
      const pathsToLoad = new Set(
        Object.entries(facetSelection).filter(([k, v]) => v.size).map(([k, v]) => k)
      )
      for (const path of Object.keys(activeFacets)) {
        pathsToLoad.add(path)
      }
      await facets.loadFacets(Array.from(pathsToLoad), config)
    }

    function openExtendedFacetsDialog() {

      const extendedFacetSelection = useSelection(facetSelection)
      const extendedActiveFacets = reactive({})

      const extendedFacets = useFacets(props.definition, props.facetLoader,
        extendedFacetSelection, extendedActiveFacets)

      $q.dialog({
        component: moreFiltersDialog,
        componentProps: {
          options: props.options,
          facets: extendedFacets,
          facetSelection: extendedFacetSelection,
          moreFiltersDialogComponent: moreFiltersDialog,
        }
      }).onOk(() => {
        // copy extendedFacetSelection back to facets
        facetSelection.replaceWithSelection(extendedFacetSelection)
        emit('facetSelected', facetSelection)
        void reload()
      })
    }

    return () => {
      const ret = []
      if (props.drawer) {
        const drawer = () => c.hd(drawerComponent.value, {
          options: props.options,
          facets,
          facetSelection,
          onFacetSelected: () => {
            void reload()
            emit('facetSelected', facetSelection)
          },
        });
        if (props.teleport) {
          const teleport = h(
            Teleport,
            {
              to: props.teleport
            },
            {default: () => [drawer()]}
          )
          ret.push(teleport)
        } else {
          ret.push(drawer())
        }
      }
      ret.push(c.hd(facetListComponent.value, {
        options: props.options,
        facets,
        facetSelection,
        onFacetSelected: () => {
          void reload()
          emit('facetSelected', facetSelection)
        },
        onFacetActivated: (facet) => {
          activeFacets[facet.definition.path] = facet
        },
        onFacetDeactivated: (facet) => {
          delete activeFacets[facet.definition.path]
        }
      }))
      ret.push(c.hh(QSeparator, {class: ['q-my-md']}))
      ret.push(
        c.hd(extendedFacetsComponent.value, {
          [extendedFacetsComponent.value.clickEventName]: openExtendedFacetsDialog
        })
      )
      return ret
    }
  }
})
