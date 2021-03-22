import {computed} from "vue";
import {useFacetProps} from "./facet";

export function useBucketProps() {
  return {
    ...useFacetProps(),
    bucket: {
      type: Object,
      required: true
    },
    modelValue: {
      type: Boolean,
      required: true
    }
  }
}

export function useBucket(prefix, props, c, config) {

  const bucketLabel = computed(() => {
    return labelTranslator.value({
      bucket: props.bucket,
      facet: props.facet,
      props
    })
  })

  const bucketValue = computed(() => {
    return valueTranslator.value({
      bucket: props.bucket,
      facet: props.facet,
      props
    })
  })

  const labelComponent = computed(() => {
    return c.getComponent(prefix + 'BucketLabel', props.facet)
  })

  const valueComponent = computed(() => {
    return c.getComponent(prefix + 'BucketValue', props.facet)
  })

  const valueTranslator = computed(() => {
    return valueComponent.value.translator
  })

  const labelTranslator = computed(() => {
    return labelComponent.value.translator
  })

  return {bucketLabel, bucketValue, labelComponent, valueComponent};
}
