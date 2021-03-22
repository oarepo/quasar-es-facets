export const useFacetListProps = () => {
  return {
    options: {
      type: Object,
      default: () => ({})
    },
    facets: {
      type: Object,
    },
    facetSelection: {
      type: Object,
      required: true
    }
  }
}
