import {computed, defineComponent, h, ref, resolveComponent} from 'vue'
import {useFacetProps} from "../composition/facet";
import {useBucketsComponents} from "../composition/buckets";
import {QTab, useQuasar} from "quasar";
import {useFacetListProps} from "../composition/facetlist";


export default defineComponent({
  name: 'FacetsTabsBucketsTab',
  props: {
    ...useFacetProps(),
  },
  setup(props, {emit, attrs}) {
    return () => {
        return h(QTab, {
          name: props.facet.definition.path,
          label: props.facet.definition.label || props.facet.definition.path,
          class: 'flex-left-important'
        }, () => {

        })
    }
  }
})
