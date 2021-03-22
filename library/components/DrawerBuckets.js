import {defineComponent} from 'vue'
import {useFacetProps} from "../composition/facet";
import {useBucketsComponents} from "../composition/buckets";


export default defineComponent({
  name: 'FacetsDrawerBuckets',
  props: {
    ...useFacetProps(),
  },
  inheritAttrs: false,
  emits: ['facetOpen', 'facetClosed', 'facetSelected'],
  setup(props, {emit, attrs}) {

    function bucketFilter(bucket, selectedValues) {
      return selectedValues.has(bucket.key)
    }

    const {renderChildren} =
      useBucketsComponents('drawer', props, attrs, emit, bucketFilter);

    return () => {
      return renderChildren()
    }
  }
})
