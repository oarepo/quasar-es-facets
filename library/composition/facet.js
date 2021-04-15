import {computed} from "vue";

export function useFacetProps() {
  return {
    facet: {
      type: Object,
      required: true
    },
    facetSelection: {
      type: Object,
      required: true
    },
    options: {
      type: Object,
      default: () => ({})
    }
  }
}

export function useShownFacets(props, c, facetComponentName, forceVisible = false) {

  const preprocessedFacets = computed(() => {
    let facets = props.facets.listFacets()
    // remove non-visible facets
    if (!forceVisible) {
      facets = facets.filter(facet => !facet.definition.hidden)
    }

    // set facet rendering component
    facets.forEach(facet => {
      if (!facet.definition[`${facetComponentName}Component`]) {
        facet.definition[`${facetComponentName}Component`] = c.getComponent(facetComponentName, facet)
      }
    })

    return facets
  })

  return {
    preprocessedFacets
  }
}
