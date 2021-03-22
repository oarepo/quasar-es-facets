import {h, resolveComponent, computed} from "vue";
import {useConfig} from "./config";


export function useComponent(definition, options) {
  const config = useConfig(definition, options)

  /**
   * looks up a component
   *
   * @param key a key, for example 'facet', 'bucket', ...
   * @param facet  the facet for which a component is looked up
   * @param allowEmpty If true and component is not found, undefined is returned. If false, warning component is returned
   * @return dictionary `{component: string, props: {}, attrs: {}}`
   */
  function getComponent(key, facet, allowEmpty) {
    const component = config.findFacetOption(`components.${key}`, facet)
    if (!component && !allowEmpty) {
      return {
        component: 'facets-unknown'
      }
    }
    return component
  }

  /**
   * looks up a generic, facet-independent component
   *
   * @param key a key
   * @param allowEmpty If true and component is not found, undefined is returned. If false, warning component is returned
   * @return dictionary `{component: string, props: {}, attrs: {}}`
   */
  function getGenericComponent(key, allowEmpty) {
    const component = config.findGenericOption(`components.${key}`, this.path, this.level)
    if (!component && !allowEmpty) {
      return {
        component: 'facets-unknown'
      }
    }
    return component
  }

  function hd(component, extra = {}, children) {
    if (!component) {
      return h('div')
    }
    const props1 = {
      ...merge(component.attrs, extra),
      class: extra.class !== null ? merge(component.class, extra.class) : undefined,
      style: extra.style !== null ? merge(component.style, extra.style) : undefined
    }
    return h(
      component.html ? component.component : resolveComponent(component.component), props1,
      children || undefined
    )
  }

  function hh(component = null, extra = {}, children) {
    if (children === undefined && typeof extra !== 'object') {
      children = extra
      extra = {}
    }
    if (children && typeof children === 'function') {
      const _children = children
      children = {default: () => _children()}
    }

    return h(component, extra, children)
  }

  function hc(clazz, extra, children) {
    if (children === undefined && typeof extra !== 'object') {
      children = extra
      extra = {}
    }
    return h('div', {...extra, class: clazz}, children)
  }

  function he(el, extra, children) {
    if (children === undefined && typeof extra !== 'object') {
      children = extra
      extra = {}
    }
    return h(el, extra, children)
  }

  function merge(a, ...args) {
    const ret = {
      ...convertToObject(a)
    }
    for (let b of args) {
      if (!b) {
        continue
      }
      b = convertToObject(b)
      Object.entries(b).forEach(([key, value]) => {
        if (value === null) {
          if (ret[key] !== undefined) {
            delete ret[key]
          }
        } else {
          ret[key] = value
        }
      })
    }
    return ret
  }

  function convertToObject(a) {
    if (a && Array.isArray(a)) {
      a = a.reduce((p, x) => {
        p[x] = true
        return p
      }, {})
    } else if (a && typeof a !== 'object') {
      a = {[a]: true}
    }
    return a
  }


  function slotOrChildren(compDefinition, func) {
    if (compDefinition.useChildren) {
      return [func()]
    }
    if (compDefinition.useSlot) {
      return {default: () => func()}
    }
    return undefined
  }

  return {
    getComponent,
    getGenericComponent,
    hd,
    hh,
    hc,
    he,
    slotOrChildren
  }
}
