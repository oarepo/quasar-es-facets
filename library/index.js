import Facets from './components/Facets.js'
import FacetsDrawer from './components/Drawer.js'
import FacetsList from './components/List.js'
import FacetsTabs from './components/Tabs.js'
import FacetsUnknown from './components/Unknown.js'
import FacetsListBuckets from './components/ListBuckets.js'
import FacetsListBucket from './components/ListBucket.js'
import FacetsDialogBuckets from './components/DialogBuckets.js'
import FacetsDialogBucket from './components/DialogBucket.js'
import FacetsDrawerBuckets from './components/DrawerBuckets.js'
import FacetsDrawerBucket from './components/DrawerBucket.js'
import FacetsTabsBucketsTab from './components/TabsBucketsTab.js'
import NestedFacet from './components/NestedFacet.js'
import FilterFacet from './components/FilterFacet.js'
import FacetsAdditionalDialog from './dialogs/AdditionalDialog.js'
import MoreFiltersDialog from './dialogs/MoreFiltersDialog.js'

export default {
  install(Vue, options) {
    Vue.component('Facets', Facets)
    Vue.component('FacetsDrawer', FacetsDrawer)
    Vue.component('FacetsList', FacetsList)
    Vue.component('FacetsTabs', FacetsTabs)
    Vue.component('FacetsUnknown', FacetsUnknown)
    Vue.component('FacetsListBuckets', FacetsListBuckets)
    Vue.component('FacetsListBucket', FacetsListBucket)
    Vue.component('FacetsDialogBuckets', FacetsDialogBuckets)
    Vue.component('FacetsDialogBucket', FacetsDialogBucket)
    Vue.component('FacetsAdditionalDialog', FacetsAdditionalDialog)
    Vue.component('MoreFiltersDialog', MoreFiltersDialog)
    Vue.component('FacetsDrawerBuckets', FacetsDrawerBuckets)
    Vue.component('FacetsDrawerBucket', FacetsDrawerBucket)
    Vue.component('FacetsTabsBucketsTab', FacetsTabsBucketsTab)
    Vue.component('NestedFacet', NestedFacet)
    Vue.component('FilterFacet', FilterFacet)
  }
}

export * from './composition/bucket.js'
export * from './composition/buckets.js'
export * from './composition/component.js'
export * from './composition/config.js'
export * from './composition/facet.js'
export * from './composition/facets.js'
export * from './composition/facetlist.js'
export * from './composition/selection.js'
