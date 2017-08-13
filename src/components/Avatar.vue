<template>
  <div>
    <img v-bind:src="url" v-bind:title="username">
  </div>
</template>

<script>

export default {
  data () {
    return {}
  },
  props: ['url', 'username']
}
</script>

<style scoped>
img {
  border-radius: 50%;
  height: 32px;
}
</style>
