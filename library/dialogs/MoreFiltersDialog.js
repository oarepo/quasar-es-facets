import {defineComponent} from 'vue'
import {useComponent} from "../composition/component"
import {QBtn, QCard, QCardActions, QCardSection, QDialog, QSpace, useDialogPluginComponent, useQuasar} from 'quasar'
import FacetsTabs from '../components/Tabs'
import {useFacetListProps} from "../composition/facetlist";
import {useSelection} from "../composition/selection";

export default defineComponent({
  name: 'MoreFiltersDialog',
  props: {
    ...useFacetListProps(),
    moreFiltersDialogComponent: Object
  },
  emits: [
    ...useDialogPluginComponent.emits
  ],
  setup(props, {attrs}) {
    const {dialogRef, onDialogHide, onDialogOK, onDialogCancel} = useDialogPluginComponent()
    const {hh, hc, he, hd} = useComponent(props, attrs, false)
    const $q = useQuasar()

    return {
      dialogRef,
      onDialogHide,
      onOKClick() {
        onDialogOK()
      },
      onCancelClick: onDialogCancel,
      hh, hc, he, hd, lang: $q.lang
    }
  },
  render() {
    const hh = this.hh
    const hc = this.hc
    return hh(QDialog, {ref: "dialogRef", fullWidth: true, fullHeight: true, onHide: this.onDialogHide}, () => [
      hh(QCard, {class: 'q-dialog-plugin column'}, () => [
        hh(QCardSection, {class: 'bg-primary'}, () => [
          hc('text-h6 text-white', null, this.moreFiltersDialogComponent.title)
        ]),
        hh(QCardSection, {class: 'q-ma-lg col'}, () => [
          hh(FacetsTabs, {
            ...this.$props,
            shownFacets: '*',
          })
        ]),
        hh(QCardActions, {align: 'right'}, () => [
          hh(QBtn, {
            color: 'grey-10',
            label: this.lang.label.cancel,
            flat: true,
            onClick: () => this.onCancelClick()
          }),
          hh(QSpace),
          hh(QBtn, {color: 'primary', label: this.lang.label.ok, flat: true, onClick: () => this.onOKClick()}),
        ])
      ])
    ])
  }
})
