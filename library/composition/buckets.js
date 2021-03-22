import {useComponent} from "app/library/composition/component";
import {useConfig} from "app/library/composition/config";
import {computed} from "vue";

export function useBucketsComponents(prefix, props, attrs, emit,
                                     bucketFilter = (bucket, selectedValues) => true) {
  const c = useComponent(props, attrs, false)
  const config = useConfig(props, false)

  const selectedValues = computed(() => {
    return props.facetSelection[props.facet.definition.path]
  })

  const bucketComponent = computed(() => {
    return c.getComponent(prefix + 'Bucket', props.facet)
  })

  function bucketSelected(bucket) {
    const selected = selectedValues.value
    selected.add(bucket.key)
    emit('facetSelected', {
      facet: props.facet,
      selection: selected
    })
  }

  function bucketUnselected(bucket) {
    let selected = selectedValues.value
    selected.delete(bucket.key)

    emit('facetSelected', {
      facet: props.facet,
      selection: selected
    })
  }

  function renderChildren() {
    return (props.facet.buckets || [])
      .filter((bucket) => bucketFilter(bucket, selectedValues.value))
      .map(bucket => {
        return c.hd(bucketComponent.value, {
          bucket,
          facet: props.facet,
          facetSelection: props.facetSelection,
          options: props.options,
          modelValue: selectedValues.value.has(bucket.key),
          'onUpdate:modelValue': (value) => {
            if (value) {
              bucketSelected(bucket)
            } else {
              bucketUnselected(bucket)
            }
          }
        })
      })
  }

  const label = computed(() => {
    return props.facet.definition.label || props.facet.definition.path
  })

  return {c, config, selectedValues, renderChildren, label};
}
