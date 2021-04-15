import {useConfig} from "../composition/config";
import {useComponent} from "../composition/component";
import {computed, defineComponent} from "vue";
import {useFacetListProps} from "../composition/facetlist";
import {useFacets, useShownFacets} from "../composition/facet";

export default defineComponent({
  name: 'FacetsList',
  props: {
    ...useFacetListProps()
  },
  emits: ['facetSelected', 'facetActivated', 'facetDeactivated'],
  setup(props, {attrs, emit}) {
    const c = useComponent(props.definition, props.options)

    const {preprocessedFacets} = useShownFacets(props, c, 'facet', false)
    const listComponent = computed(() => {
      return c.getGenericComponent('facetListComponent')
    })

    return () => {
      return c.hd(listComponent.value, {},
        {
          default: () => preprocessedFacets.value.map(facet => {
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
      )
    }
  }
})
