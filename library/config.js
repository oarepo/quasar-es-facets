export const DEFAULT_OPTIONS = {
  // agg types and their renderers.
  // The following ones are not yet implemented
  types: {
    filters: {
      components: {
        facet: {component: 'facets-unknown'}
      }
    },
    filter: {
      components: {
        facet: {component: 'facets-unknown'}
      }
    },
    global: {
      components: {
        facet: {component: 'facets-unknown'}
      }
    },
    nested: {
      components: {
        facet: {
          component: 'nested-facet'
        }
      }
    },
    missing: {
      components: {
        facet: {component: 'facets-unknown'}
      }
    },
    extended_stats: {
      components: {
        facet: {component: 'facets-unknown'}
      }
    },
    date_histogram: {
      facetPreprocessor: (facet) => {
        let previous = '';
        (facet.buckets || []).forEach(bucket => {
          bucket.selection_key = previous + '--' + bucket.key_as_string
          previous = bucket.key_as_string
        })
      }
    }
  },

  // last-resort values
  defaults: {
    components: {
      facetsList: {
        component: 'facets-list'
      },
      drawer: {
        component: 'facets-drawer',
        attrs: {},
        style: {},
        class: []
      },
      facetListComponent: {
        component: 'q-list'
      },
      facet: {
        component: 'facets-list-buckets'
      },
      drawerFacet: {
        component: 'facets-drawer-buckets'
      },
      dialogFacet: {
        component: 'facets-dialog-buckets',
      },
      tabsFacet: {
        component: 'facets-tabs-buckets-tab'
      },
      bucketsContainer: {
        component: 'q-expansion-item'
      },
      listBucket: {
        component: 'facets-list-bucket',
      },
      listBucketLabel: {
        component: 'div',
        useChildren: true,
        html: true,
        translator: ({bucket, facet}) => (bucket.key_as_string || bucket.key)
      },
      listBucketValue: {
        component: 'q-badge',
        useSlot: true,
        translator: (({bucket}) => bucket.doc_count)
      },
      listBucketCheckbox: {
        component: 'q-checkbox',
        attrs: {
          dense: true
        },
        class: [
          'q-mr-sm'
        ]
      },
      drawerBucket: {
        component: 'facets-drawer-bucket',
        updateEventName: 'onUpdate:modelValue',
      },
      drawerBucketLabel: {
        component: 'span',
        useChildren: true,
        html: true,
        translator: ({bucket, facet}) => (bucket.key_as_string || bucket.key)
      },
      drawerBucketValue: {
        component: 'q-badge',
        useSlot: true,
        translator: (({bucket}) => bucket.doc_count)
      },
      dialogBucket: {
        component: 'facets-dialog-bucket',
      },
      dialogBucketLabel: {
        component: 'div',
        useChildren: true,
        html: true,
        translator: ({bucket, facet}) => (bucket.key_as_string || bucket.key)
      },
      dialogBucketValue: {
        component: 'q-badge',
        useSlot: true,
        translator: (({bucket}) => bucket.doc_count)
      },
      dialogBucketCheckbox: {
        component: 'q-checkbox',
        attrs: {
          dense: true
        },
        class: [
          'q-mr-sm'
        ]
      },

      listBucketsExtraItems: {
        component: 'q-btn',
        attrs: {
          flat: true,
          dense: true,
          noCaps: true,
          color: 'primary'
        },
        class: ['q-mx-md'],
        useSlot: true,
        clickEventName: 'onClick',
        title: ({facet}) => `and extra ${facet.sum_other_doc_count} items not in categories above`
      },
      listBucketsSelectMore: {
        component: 'q-btn',
        attrs: {
          flat: true,
          dense: true,
          noCaps: true,
          color: 'primary'
        },
        class: ['q-ml-xl'],
        useSlot: true,
        clickEventName: 'onClick',
        title: 'select more ...'
      },
      facetDrawerItem: {
        component: 'q-chip',
        useSlot: true,
        attrs: {
          removable: true,
          size: 'sm',
          color: 'secondary',
        }
      },
      facetsAdditionalDialog: {
        component: 'facets-additional-dialog',
        title: 'Select facet values'
      },
      moreFiltersDialog: {
        component: 'more-filters-dialog',
        title: 'More filters'
      },
      extendedFacetsButton: {
        component: 'q-btn',
        attrs: {
          flat: true,
          dense: true,
          color: 'primary',
          icon: 'keyboard_arrow_right',
          label: 'More filters'
        },
        class: ['float-right'],
        clickEventName: 'onClick'
      },
    }
  }
}
