<template>
  <div>
    <div v-if="!authorized">
      <h2>Sign in!</h2>
      <UserForm ref="lin" message="Sign In" v-on:submit="login"></UserForm>
      <h4>Haven't got account?! Register now!</h4>
      <UserForm ref="reg" message="Register" v-on:submit="register" v-bind:confirm="true"></UserForm>
    </div>
    <div style="margin-left: 2%" v-if="authorized">
      <button class="primary circular" style="margin-top: 1%" v-on:click="logout()">
        <i>exit_to_app</i>
      </button>
      <h3>User info</h3>
      
      <h4>{{ info.login }}</h4>
      <!--<Avatar class="centered" style="margin-bottom: 8px" url="https://www.iconsfind.com/wp-content/uploads/2015/11/20151112_5643f331cf8c4-210x210.png" v-bind:username="info.login"></Avatar>-->
      <a class="centered" v-on:click="changingPassword = !changingPassword">Change password</a>
      <div class="changePass" v-if="changingPassword">
        <div class="floating-label">
          <input type='password' v-model="oldPassword" required class="full-width">
          <label>Old password</label>
        </div>
        <div class="floating-label">
          <input type='password' v-model="password" required class="full-width">
          <label>New password</label>
        </div>
        <div class="floating-label">
          <input type='password' v-model="confirmPassword" required class="full-width">
          <label>Confirm password</label>
        </div>
        <q-progress-button indeterminate class="yellow" dark-filler :percentage="progress" @click.native="submit()">Change password</q-progress-button>
      </div>
    </div>
  </div>
</template>

<script>
import UserForm from './UserForm.vue'
// import Avatar from './Avatar.vue'
import {
  Toast
} from 'quasar'
import ls from 'lscache'

export default {
  data () {
    return {
      authorized: false,
      info: {
        login: '',
        avatar: ''
      },
      oldPassword: '',
      password: '',
      confirmPassword: '',
      progress: 0,
      workingButton: '',
      changingPassword: false
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
    this.getInfo()
  },
  sockets: {
    lin (obj) { // Login
      this.$refs.lin.clear()
      if (obj.success) {
        try {
          ls.set('jwt', obj.jwt, 60)
          Toast.create['positive']({
            html: 'Login successful!'
          })
          this.getInfo()
        }
        catch (e) {}
      }
      else {
        Toast.create['negative']({
          html: obj.msg
        })
      }
    },
    reg (obj) { // Registration
      this.$refs.reg.clear()
      if (obj.success) {
        Toast.create['positive']({
          html: 'Register successful!'
        })
      }
      else {
        Toast.create['negative']({
          html: obj.msg
        })
      }
    },
    userInfo (obj) {
      if (obj.success) {
        this.info = obj.info
      }
      else {
        Toast.create['negative']({
          html: obj.msg
        })
      }
    },
    changePassword (obj) {
      if (obj.success) {
        this.stopWorkButton(100)
        Toast.create['positive']({
          html: 'Password changed!'
        })
        this.changingPassword = false
      }
      else {
        this.stopWorkButton(-1)
        Toast.create['negative']({
          html: obj.msg
        })
      }
    }
  },
  methods: {
    login (data) {
      this.$socket.emit('lin', data)
    },
    logout () {
      ls.remove('jwt')
      Toast.create['positive']({
        html: 'Exitted!'
      })
    },
    register (data) {
      this.$socket.emit('reg', data)
    },
    getInfo () {
      this.$socket.emit('userInfo', { uinforeq: true, jwt: this.getToken() })
    },
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
      this.oldPassword = this.password = this.confirmPassword = ''
    },
    submit () {
      this.workButton()
      if (this.oldPassword !== '' && this.password !== '') {
        if (this.password === this.confirmPassword) {
          this.$socket.emit('changePassword', {
            oldPassword: this.oldPassword,
            newPassword: this.password,
            jwt: this.getToken()
          })
          this.clear()
        }
        else {
          Toast.create['negative']({
            html: 'Passwords are not same!'
          })
          this.stopWorkButton(-1)
          this.clear()
        }
      }
      else {
        Toast.create['negative']({
          html: 'Passwords and confirmation are required!'
        })
        this.stopWorkButton(-1)
        this.clear()
      }
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
  },
  components: {
    UserForm/* ,
    Avatar */
  }
}
</script>

<style scoped>
h1, h2, h3, h4, h5, h6 {
  text-align: center;
},

.centered {
  text-align: center;
}

.changePass {
  margin-left: auto;
  margin-right: auto;
  width: 60%;
}
</style>
