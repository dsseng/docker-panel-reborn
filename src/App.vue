<template>
  <!-- Don't drop "q-app" class -->
  <div id="q-app">
    <q-layout>
      <!--
            Router tabs
          -->
      <div slot="header" class="toolbar">
        <q-toolbar-title :padding="0">
          Docker dashboard
        </q-toolbar-title>
        <q-tabs default-tab="tab-4">
          <q-tab route="/" icon="dashboard">
            Dashboard
          </q-tab>
          <q-tab route="/Old" icon="settings">
            Settings
          </q-tab>
          <q-tab route="/MyAccount" icon="fingerprint">
            My Account
          </q-tab>
        </q-tabs>
      </div>
      
      <!--
            Replace following "div" with
            "<router-view class="layout-view">" component
            if using subRoutes
          -->
      <div class="layout-view">
        <router-view></router-view>
      </div>
    </q-layout>
  </div>
</template>

<script>
/*
 * Root component
 */
import ls from 'lscache'

export default {
  sockets: {
    auth (obj) { // If server requests our token, response to it!
      if (obj.jwtreq) {
        this.$socket.emit('auth', { jwt: this.getToken() })
      }
    }
  },
  methods: {
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

<style></style>
