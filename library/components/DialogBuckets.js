import {defineComponent, h} from 'vue'
import {useFacetProps} from "../composition/facet";
import {useBucketsComponents} from "../composition/buckets";


export default defineComponent({
  name: 'FacetsDialogBuckets',
  props: {
    ...useFacetProps(),
  },
  emits: ['facetSelected'],
  setup(props, {emit, attrs}) {

    const {c, renderChildren} =
      useBucketsComponents('dialog', props, attrs, emit);

    return () => {
      return h('div', {class: 'row q-col-gutter-md'},
        {
          default: () => [
            ...renderChildren().map(child => c.he('div', {class: 'col-3'}, [child]))
          ]
        }
      )
    }
  }
})
