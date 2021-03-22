import {defineComponent, h} from 'vue'
import {useComponent} from "../composition/component"
import {
  QBtn,
  QCard,
  QCardActions,
  QCardSection,
  QDialog,
  QScrollArea,
  QSpace,
  useDialogPluginComponent,
  useQuasar
} from 'quasar'
import {useFacetListProps} from "../composition/facetlist";
import {useSelection} from "../composition/selection";

export default defineComponent({
  name: 'FacetsAdditionalDialog',
  props: {
    facet: Object,
    facetDialogComponent: Object,
    initial: Object,
    options: Object,
    title: String,
    ...useFacetListProps()
  },
  emits: [
    ...useDialogPluginComponent.emits
  ],
  setup(props, {attrs}) {
    const {dialogRef, onDialogHide, onDialogOK, onDialogCancel} = useDialogPluginComponent()
    const {hh, hc, he, hd} = useComponent(props, attrs, false)
    const $q = useQuasar()

    const facetSelection = useSelection(props.initial);
    for (const k of props.initial)
      facetSelection[props.facet.definition.path].add(k)

    return {
      dialogRef,
      onDialogHide,
      onOKClick() {
        onDialogOK(facetSelection[props.facet.definition.path])
      },
      onCancelClick: onDialogCancel,
      hh, hc, he, hd,
      facetSelection,
      $q
    }
  },
  render() {
    const hh = this.hh
    const hc = this.hc
    const he = this.he
    const hd = this.hd
    return hh(QDialog, {
      ref: "dialogRef", fullWidth: true,
      fullHeight: true, onHide: this.onDialogHide
    }, () => [
      hh(QCard, {class: 'q-dialog-plugin column'}, () => [
        hh(QCardSection, {class: 'bg-primary'}, () => [
          hc('text-h6 text-white', null, this.title)
        ]),
        hh(QCardSection, {class: 'q-ma-lg col'}, () => [
          hh(QScrollArea, {class: 'full-width full-height'}, () => [
            h(this.facetDialogComponent, {
              definition: this.facet.definition,
              facet: this.facet,
              key: this.facet.definition.path,
              options: this.options,
              facetSelection: this.facetSelection,
              shownFacets: [],
              facets: {},
            })
          ])
        ]),
        hh(QCardActions, {align: 'right'}, () => [
          hh(QBtn, {
            color: 'grey-10',
            label: this.$q.lang.label.cancel,
            flat: true,
            onClick: () => this.onCancelClick()
          }),
          hh(QSpace),
          hh(QBtn, {color: 'primary', label: this.$q.lang.label.ok, flat: true, onClick: () => this.onOKClick()}),
        ])
      ])
    ])
  }
})
