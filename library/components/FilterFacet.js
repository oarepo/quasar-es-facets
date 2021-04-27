import {useComponent} from "../composition/component";
import {computed, defineComponent, h, unref} from "vue";
import {useShownFacets, useFacetProps} from "../composition/facet";

export default defineComponent({
  name: 'FilterFacet',
  props: {
    ...useFacetProps()
  },
  inheritAttrs: false,
  emits: ['facetSelected', 'facetActivated', 'facetDeactivated'],
  setup(props, {attrs, emit}) {
    const c = useComponent(props.definition, props.options)
    const aggsProps = computed(() => {
      const p = unref(props)
      return {
        ...p,
        facets: p.facet.aggs || {}
      }
    })
    const {preprocessedFacets} = useShownFacets(
      aggsProps.value, c, 'facet', false)

    return () => {
      return preprocessedFacets.value.map(facet => {
          if (!facet.definition.facetComponent) {
            facet.definition.facetComponent = c.getComponent('facet', facet)
          }
          return c.hd(facet.definition.facetComponent, {
            options: props.options,
            facet,
            facetSelection: props.facetSelection,
            activeFacets: props.activeFacets,
            key: facet.definition.path,
            onFacetSelected: value => emit('facetSelected', value),
            onFacetActivated: value => emit('facetActivated', value),
            onFacetDeactivated: value => emit('facetDeactivated', value)
          })
        }
      )
    }
  }
})
