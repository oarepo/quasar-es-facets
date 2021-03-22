import {defineComponent} from "vue";
import {useConfig} from "../composition/config";
import {useFacetListProps} from "../composition/facetlist";
import {useComponent} from "../composition/component";
import {useShownFacets} from "../composition/facet";


export default defineComponent({
  name: 'FacetsDrawer',
  props: {
    ...useFacetListProps()
  },
  setup(props, {attrs, emit}) {
    const c = useComponent(props, attrs, true)
    const config = useConfig(props, true)

    const {preprocessedFacets} =
      useShownFacets(props, c, 'drawerFacet', true)

    return () => {
      return c.hc('drawer', {},
        {
          default: () => preprocessedFacets.value.map(facet => {
              return c.hd(facet.definition.drawerFacetComponent, {
                options: props.options,
                facet,
                facetSelection: props.facetSelection,
                activeFacets: props.activeFacets,
                key: facet.definition.path,
                onFacetSelected(value) {
                  emit('facetSelected', value)
                }
              })
            }
          )
        }
      )
    }
  }
})
