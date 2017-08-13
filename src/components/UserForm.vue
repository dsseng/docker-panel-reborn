<template>
<div class='form'>
  <div class="floating-label">
    <input v-model="username" required class="full-width">
    <label>Username</label>
  </div>
  <div class="floating-label">
    <input type='password' v-model="password" required class="full-width">
    <label>Password</label>
  </div>
  <div v-if="confirm" class="floating-label">
    <input type='password' v-model="confirmPassword" required class="full-width">
    <label>Confirm password</label>
  </div>
  <q-progress-button indeterminate class="blue" dark-filler :percentage="progress" @click.native="submit()">{{message}}</q-progress-button>
</div>
</template>

<script>
import {
  Toast
} from 'quasar'

export default {
  props: ['message', 'confirm'],
  data () {
    return {
      username: '',
      password: '',
      confirmPassword: '',
      progress: 0,
      workingButton: ''
    }
  },
  methods: {
    workButton () {
      this.stopWorkButton()
      this.progress = 15
      this.workingButton = setInterval(() => {
        this.progress += parseInt(Math.random() * 12, 10)
        if (this.progress >= 100) {
          this.stopWorkButton()
        }
      }, 500)
    },
    stopWorkButton (index) {
      if (this.workingButton) {
        clearInterval(this.workingButton)
        this.workingButton = null
      }
      if (typeof index !== 'undefined') {
        this.progress = index
      }
    },
    clear () {
      this.username = this.password = this.confirmPassword = ''
    },
    submit () {
      this.workButton()
      if (this.username !== '' && this.password !== '') {
        if (this.confirm) {
          if (this.password === this.confirmPassword) {
            this.$emit('submit', {
              username: this.username,
              password: this.password
            })
            this.stopWorkButton(100)
          }
          else {
            Toast.create['negative']({
              html: 'Passwords are not same!'
            })
            this.stopWorkButton(-1)
          }
        }
        else {
          this.$emit('submit', {
            username: this.username,
            password: this.password
          })
          this.stopWorkButton(100)
        }
      }
      else {
        Toast.create['negative']({
          html: 'Username and password are required!'
        })
        this.stopWorkButton(-1)
      }
    }
  }
}
</script>

<style scoped>
.form {
  margin-left: auto;
  margin-right: auto;
  width: 60%;
}
</style>
