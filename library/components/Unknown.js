import {h, resolveComponent} from 'vue'

export default {
  name: 'FacetsUnknown',
  props: {
    facet: Object
  },
  render() {
    return h(resolveComponent('q-item'), () => [
      h(resolveComponent('q-item-section'), {},
        () => `Unknown facet type "${this.facet.definition.type}" at "${this.facet.definition.path}"`)
    ])
  }
}
