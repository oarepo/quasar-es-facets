import {reactive} from "vue";

export function useSelection(initialValue = {}) {
  const selectionBase = reactive({
    selected() {
      return Object.entries(this)
        .filter(([k, v]) => v.size)
        .reduce((p, [k, v]) => {
          p[k] = v
          return p
        }, {})
    },
    replaceWithSelection(selection) {
      Object.values(this)
        .filter(v => v.size && v.clear)
        .forEach(v => v.clear())
      Object.entries(selection)
        .filter(([k, v]) => v.size && v.clear)
        .forEach(([k, v]) => {
          for (const vv of v) {
            this[k].add(vv)
          }
        })
    }
  })
  Object.entries(initialValue).forEach(([k, v]) => {
    if (v instanceof Set) {
      selectionBase[k] = new Set(Array.from(v))
    }
  })
  const selectionHandler = {
    get: function (target, prop, receiver) {
      if (target[prop] === undefined && typeof prop === 'string' && prop.substring(0, 1) != '_') {
        target[prop] = new Set()
      }
      return target[prop]
    }
  }
  return new Proxy(selectionBase, selectionHandler)
}
