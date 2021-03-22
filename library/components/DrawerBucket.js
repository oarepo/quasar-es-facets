import {defineComponent, h, resolveComponent} from 'vue'
import {useConfig} from "../composition/config"
import {useFacetProps} from "../composition/facet"
import {useComponent} from "../composition/component"
import {useBucket} from "../composition/bucket";

export default defineComponent({
  name: 'FacetsBucket',
  props: {
    ...useFacetProps(),
    bucket: Object,
    modelValue: Boolean,
  },
  inheritAttrs: false,
  emits: ['update:modelValue'],
  setup(props, {attrs, emit}) {
    const c = useComponent(props, attrs, false)
    const config = useConfig(props, false)

    const {bucketLabel, bucketValue, labelComponent} = useBucket('drawer', props, c, config);

    function removeClicked() {
      emit('update:modelValue', false)
    }

    return () => {
      return h(resolveComponent('q-chip'), {
          class: null,
          title: bucketValue.value.toString(),
          removable: true,
          clickable: true,
          size: 'sm',
          color: 'secondary',
          onClick: removeClicked,
          onRemove: removeClicked
        },
        {
          default: () => [
            // label
            c.hd(labelComponent.value, {class: null, style: null},
              c.slotOrChildren(labelComponent.value,
                () => bucketLabel.value.toString())),
          ]
        }
      )
    }
  }
})
