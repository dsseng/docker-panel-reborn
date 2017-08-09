<template>
  <!-- Don't drop "q-app" class -->
  <div id="q-app">
    <q-layout>
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
          <q-tab route="/Error404" icon="fingerprint">
            My account
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
export default {}
</script>

<style></style>
