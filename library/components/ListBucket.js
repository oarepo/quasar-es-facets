import {computed, defineComponent, h, resolveComponent} from 'vue'
import {useConfig} from "../composition/config"
import {useComponent} from "../composition/component"
import {useBucket, useBucketProps} from "../composition/bucket";

export default defineComponent({
  name: 'FacetsBucket',
  props: {
    ...useBucketProps(),
  },
  emits: ['update:modelValue'],
  setup(props, {attrs, emit}) {
    const c = useComponent(props, attrs, false)
    const config = useConfig(props, false)
    const vue = {
      props, attrs, emit
    }

    const {bucketLabel, bucketValue, labelComponent, valueComponent} =
      useBucket('list', props, c, config);

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
        children.push(c.hd(labelComponent.value, {class: 'col'},
          c.slotOrChildren(labelComponent.value, () => bucketLabel.value)))
        children.push(c.hd(valueComponent.value, {
            title: `+/- ${props.facet.doc_count_error_upper_bound}`
          },
          c.slotOrChildren(valueComponent.value, () => bucketValue.value.toString())))
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
