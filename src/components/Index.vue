<template>
<div>
  <div class="card welcome">
    <div class="card-title">
      <h4>Welcome to Docker Control Panel Reborn!</h4>
    </div>
    <q-parallax src="https://d2v9y0dukr6mq2.cloudfront.net/video/thumbnail/xCCDBUa/technology-or-bio-molecular-structure-with-space-for-text-4k-looped-animation-presentation-background_voflj4vnl__F0000.png" :height="150">
      <div slot="loading">Loading...</div>
    </q-parallax>
    <div class="card-content">
      <h6>This able you to control your Docker containers with ease.</h6>
    </div>
  </div>
  <h2 v-if="!authorized">To get started, go to <router-link to="/MyAccount">My account</router-link></h2>
  <div v-if="authorized">
    <div class="floating-label">
      <input v-model="asd" required class="full-width">
      <label>Message</label>
    </div>
    <button v-on:click="send">Send</button>
    <h2>{{ dt }}</h2>
  </div>
</div>
</template>

<script>
import {
  Toast
} from 'quasar'
import ls from 'lscache'

export default {
  data () {
    return {
      authorized: false,
      asd: '',
      dt: ''
    }
  },
  created () {
    setInterval(() => {
      if (ls.get('jwt') != null) {
        this.authorized = true
      }
      else {
        this.authorized = false
      }
    }, 2)
  },
  sockets: {
    data (obj) {
      if (obj.success) {
        if (obj.date) {
          this.dt = obj.date
        }
      }
      else {
        Toast.create['negative']({
          html: obj.msg
        })
      }
    }
  },
  methods: {
    send () {
      this.$socket.emit('data', { msg: this.asd, jwt: this.getToken() })
    },
    getToken () {
      try {
        if (ls.get('jwt') != null) {
          return ls.get('jwt')
        }
        else {
          return ''
        }
      }
      catch (e) {
        return ''
      }
    }
  }
}
</script>

<style>
.welcome {
  padding: 2%;
}
  
h1, h2, h3, h4, h5, h6 {
  text-align: center;
}
</style>
