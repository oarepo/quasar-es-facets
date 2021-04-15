import {computed, defineComponent, getCurrentInstance, h, reactive, ref, resolveComponent, toRaw, watch} from 'vue'
import {useFacetProps} from "../composition/facet";
import {useBucketsComponents} from "../composition/buckets";
import {useQuasar} from "quasar";
import deepcopy from "deepcopy";


export default defineComponent({
  name: 'FacetsBuckets',
  props: {
    ...useFacetProps()
  },
  emits: ['facetSelected', 'facetActivated', 'facetDeactivated'],
  setup(props, {emit, attrs}) {
    const $q = useQuasar()
    const inst = getCurrentInstance()

    const {c, config, selectedValues, renderChildren, label} =
      useBucketsComponents('list', props, attrs, emit);

    const containerComponent = computed(() => {
      return c.getComponent('bucketsContainer', props.facet)
    })

    const expanded = ref(!!containerComponent.value.initialExpanded)

    watch(expanded, async () => {
      if (expanded.value) {
        props.facet.loadFacet([], {}, config)
        emit('facetActivated', props.facet)
      } else {
        emit('facetDeactivated', props.facet)
      }
    })

    const facetsAdditionalDialog = resolveComponent(
      c.getComponent('facetsAdditionalDialog', props.facet, false).component
    )

    const facetsAdditionalDialogTitle =
      c.getComponent('facetsAdditionalDialog', props.facet, false).title


    const facetDialogComponent = resolveComponent(
      c.getComponent('dialogFacet', props.facet, false).component
    )

    const facetLoader = config.findFacetOption('facetLoader', props.facet)

    const extraItemsComponent = computed(() => {
      return c.getComponent('listBucketsExtraItems', props.facet)
    })

    const selectMoreComponent = computed(() => {
      return c.getComponent('listBucketsSelectMore', props.facet)
    })

    const extraItemsTitle = computed(() => {
      // noinspection JSUnresolvedVariable
      const title = extraItemsComponent.value.title
      if (typeof title === 'function') {
        return title({facet: props.facet})
      }
      return title
    })

    const selectMoreTitle = computed(() => {
      // noinspection JSUnresolvedVariable
      const title = selectMoreComponent.value.title
      if (typeof title === 'function') {
        return title({facet: props.facet})
      }
      return title
    })


    async function extraItemsSelected() {
      // open dialog and get initial data

      // duplicate the facet so that its data are not influenced
      const duplicatedFacet = reactive(deepcopy(toRaw(props.facet)))
      await duplicatedFacet.loadFacet(
        [duplicatedFacet.definition.path], {allValues: true}, config
      )

      $q.dialog({
        component: facetsAdditionalDialog,
        componentProps: {
          facet: duplicatedFacet,
          facetDialogComponent,
          initial: selectedValues.value,
          options: props.options,
          title: facetsAdditionalDialogTitle
        }
      }).onOk(data => {
        const f = props.facetSelection[props.facet.definition.path]
        f.clear()
        Array.from(data).forEach(x => f.add(x))
        emit('facetSelected', {
          facet: props.facet,
          selection: props.facetSelection[props.facet.definition.path]
        })
      })
    }

    function renderExtraItems() {
      const ret = []
      // noinspection JSUnresolvedVariable
      if (props.facet.sum_other_doc_count) {
        ret.push(
          h(
            c.hd(extraItemsComponent.value, {
              facet: props.facet,
              [extraItemsComponent.value.clickEventName]: () => extraItemsSelected(),
            }, {default: () => extraItemsTitle.value})
          )
        )
      } else if (selectedValues.value.size) {
        ret.push(
          c.hd(selectMoreComponent.value, {
            facet: props.facet,
            [selectMoreComponent.value.clickEventName]: () => extraItemsSelected(),
          }, {default: () => selectMoreTitle.value})
        )
      }
      return ret
    }

    return () => {
      return c.hd(containerComponent.value, {
          icon: props.facet.definition.icon,
          label: label.value,
          caption: props.facet.definition.caption,
          modelValue: expanded.value,
          dense: true,
          headerClass: selectedValues.value.length > 0 ? 'values-selected' : undefined,
          'onUpdate:modelValue': (val) => {
            expanded.value = val
          }
        },
        {
          default: () => [
            h(resolveComponent('q-list'), {},
              {
                default: renderChildren
              }
            ),
            ...renderExtraItems()
          ]
        }
      )
    }
  }
})
