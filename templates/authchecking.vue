<template>
  <div></div>
</template>

<script>
import ls from 'lscache'

export default {
  data () {
    return {
      authorized: false
    }
  },
  created () {
    setInterval(() => {
      if (ls.get('jwt') != null) {
        this.authorized = true
      } else {
        this.authorized = false
      }
    }, 2);
  }
}
</script>

<style>
</style>
