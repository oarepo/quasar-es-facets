import {computed, defineComponent, h, resolveComponent} from 'vue'
import {useConfig} from "../composition/config"
import {useFacetProps} from "../composition/facet"
import {useComponent} from "../composition/component"
import {useBucket} from "../composition/bucket";

export default defineComponent({
  name: 'FacetsDialogBucket',
  props: {
    ...useFacetProps(),
    bucket: Object,
    modelValue: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, {attrs, emit}) {
    const c = useComponent(props, attrs, false)
    const config = useConfig(props, false)

    const {bucketLabel, bucketValue, labelComponent} =
      useBucket('dialog', props, c, config);

    const checkboxComponent = computed(() => {
      return c.getComponent('listBucketCheckbox', props.facet)
    })

    function checkboxClicked(value) {
      emit('update:modelValue', value)
    }

    return () => {
      function genChildren() {
        let children = [
          c.hd(checkboxComponent.value, {
            modelValue: props.modelValue,
            'onUpdate:modelValue': checkboxClicked
          })
        ]
        children.push([
          c.hd(labelComponent.value, {
              class: 'col',
              title: `+/- ${props.facet.doc_count_error_upper_bound}`
            },
            c.slotOrChildren(
              labelComponent.value,
              () => `${bucketLabel.value} (${bucketValue.value.toString()})`))
        ])
        return children
      }

      return h(resolveComponent('q-item'), {
          key: props.bucket.key,
          dense: true
        }, {
          default: () => [
            h(resolveComponent('q-item-section'), null,
              {
                default: () => [
                  h('div', {class: 'row items-start'}, genChildren())
                ]
              }
            )
          ]
        }
      )
    }
  }
})
