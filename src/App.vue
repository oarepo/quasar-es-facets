<template>
  <router-view/>
</template>
<script>
import {defineComponent} from 'vue';
import {useQuasar} from 'quasar'

export default defineComponent({
  name: 'App',
  setup() {
    const $q = useQuasar()
    setTimeout(() => {
      import(
        /* webpackInclude: /(cs|en-us)\.js$/ */
        `quasar/lang/cs`).then(lang => {
        $q.lang.set(lang.default)
      })
    }, 10)
  }
})
</script>
