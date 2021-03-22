import {useComponent} from "../composition/component";
import {computed, defineComponent, h, ref, watch} from "vue";
import {useFacetListProps} from "../composition/facetlist";
import {useShownFacets} from "../composition/facet";
import {QScrollArea, QTabs} from "quasar";

export default defineComponent({
  name: 'FacetsTabs',
  props: {
    ...useFacetListProps(),
  },
  emits: ['facetSelected'],
  setup(props, {attrs, emit}) {
    const c = useComponent(props, attrs, true)
    const selectedTab = ref(null)

    const {preprocessedFacets} = useShownFacets(
      props, c, 'dialogFacet', true)

    const tabsFacets = computed(() => {
      return preprocessedFacets.value.map(f => {
        f.definition.tabComponent = c.getComponent('tabsFacet', f)
        f.definition.dialogComponent = c.getComponent('dialogFacet', f)
        return f
      })
    })

    const selectedFacet = computed(() => {
      // TODO: nested facets
      return tabsFacets.value.find(x => x.definition.path === selectedTab.value)
    })

    const loadedFacet = ref(null);

    watch(selectedFacet, async () => {
      loadedFacet.value = null
      if (selectedFacet.value) {
        await selectedFacet.value.loadFacet(
          [selectedFacet.value.definition.path],
          {allValues: true})
        loadedFacet.value = selectedFacet.value
      }
    })

    return () => {
      return h('div', {class: 'row items-stretch full-height'}, [
        c.hh(QScrollArea, {style: "min-width: 40%"},
          () => [c.hh(QTabs, {
              modelValue: selectedTab.value,
              dense: true,
              vertical: true,
              align: 'left',
              class: "text-teal",
              contentClass: 'wrap text-left',
              'onUpdate:modelValue': (val) => {
                selectedTab.value = val
              }
            },
            () => [...tabsFacets.value.map(facet => {
                return c.hd(facet.definition.tabComponent, {
                  facet,
                  facetSelection: props.facetSelection,
                  key: facet.definition.path,
                })
              }
            )]
          )]
        ),
        c.hh(QScrollArea, {style: "width: 60%"},
          () => c.he('div', {class: 'col'},
            loadedFacet.value ? c.hd(loadedFacet.value.definition.dialogComponent, {
              facet: loadedFacet.value,
              key: loadedFacet.value.definition.path,
              facetSelection: props.facetSelection,
              onFacetSelected: (value) => {
                emit('facetSelected', value)
              }
            }) : undefined
          )
        )
      ])
    }
  }
})
