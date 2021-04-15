import {DEFAULT_OPTIONS} from "../config";

import * as deepcopy from 'deepcopy'
import deepmerge from 'deepmerge'
import {isPlainObject} from 'is-plain-object'

export function factory(fun) {
  return {
    fun,
    __factory__: true
  }
}

function defun(obj, params) {
  if (!obj) {
    return obj
  }
  if (typeof obj === 'string') {
    return obj
  }
  if (typeof obj === 'number') {
    return obj
  }
  if (Array.isArray(obj)) {
    return obj.map(x => defun(x, params))
  }
  if (typeof obj === 'object') {
    if (obj.__factory__) {
      obj = obj.fun(params)
      return defun(obj, params)
    } else {
      return Object.keys(obj).reduce((p, x) => {
        p[x] = defun(obj[x], params)
        return p
      }, {})
    }
  }
  return obj
}

export function useConfig(definition, options) {

  function findFacetOption(key, facet, extra = {}) {
    const opt = findOption(
      key, facet.definition.key,
      facet.definition.path, facet.definition.type)
    return defun(opt, {
      facet,
      ...extra
    })
  }

  function findOption(key, facetKey, facetPath, facetType) {
    // console.log('findOption called with', key, facetKey, facetPath, facetType, options)
    let ret = internalFindOption(DEFAULT_OPTIONS || {}, `defaults.${key}`)
    if (facetType) {
      ret = internalFindOption(DEFAULT_OPTIONS || {}, `types.${facetType}.${key}`, ret)
    }
    ret = internalFindOption(options || {}, `defaults.${key}`, ret)
    if (facetType) {
      ret = internalFindOption(options || {}, `types.${facetType}.${key}`, ret)
    }
    ret = internalFindOption(options || {}, `${facetPath}.${key}`, ret)
    ret = internalFindOption(definition || {}, `${key}`, ret)
    return ret
  }

  function findGenericOption(key, path, level, extra = {}) {
    const val = internalFindGenericOption(key, path, level)
    return defun(val, extra)
  }

  function internalFindGenericOption(key, facetPath) {
    let ret = internalFindOption(DEFAULT_OPTIONS || {}, `defaults.${key}`) || {}
    ret = internalFindOption(options || {}, `defaults.${key}`, ret)
    ret = internalFindOption(options || {}, `${facetPath}.${key}`, ret)
    return ret
  }

  function internalFindOption(obj, path, previous) {
    path = path.split('.')
    for (const p of path) {
      obj = obj[p]
      if (obj === undefined) {
        return previous
      }
    }
    if (obj === undefined) {
      return previous
    }
    if (previous === undefined) {
      return deepcopy(obj)
    } else if (typeof previous === 'object' && previous !== null) {
      return deepmerge(previous, obj, {
        arrayMerge: combineMerge,
        isMergeableObject: isPlainObject
      })
    }
    return deepcopy(obj)
  }

  return {
    findFacetOption,
    findGenericOption
  }
}


const combineMerge = (target, source, options) => {
  const destination = target.slice()

  source.forEach((item, index) => {
    if (typeof destination[index] === 'undefined') {
      destination[index] = options.cloneUnlessOtherwiseSpecified(item, options)
    } else if (options.isMergeableObject(item)) {
      destination[index] = deepmerge(target[index], item, options)
    } else if (target.indexOf(item) === -1) {
      destination.push(item)
    }
  })
  return destination
}
