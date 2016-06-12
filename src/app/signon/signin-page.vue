<template>
  <div id="signin-page">
    <div class="photo"></div>
    <div class="main-panel">
      <div class="inner">
        <div class="inner2">
          <div class="header"><h1 style="color:rgb(144,0,0)">Claret @NBC</h1></div>
          <form v-on:submit.prevent="doSubmit" class="form" style="position:relative" :disabled="isLoading">
            <ui-progress-circular :show="isLoading" type="indeterminate" :size="48" :auto-stroke="true" style="position:absolute;top:calc(50% - 25px);left:calc(50% - 25px - 16px);" ></ui-progress-circular>
            <div style="height:32px">ลงชื่อเข้าใช้ระบบ</div>
            <ui-textbox type="text" name="user" label="ชื่อผู้ใช้" :value.sync="login.user" autofocus  :disabled="isLoading"></ui-textbox>
            <ui-textbox type="password" name="pass" :value.sync="login.pass"  :disabled="isLoading"></ui-textbox>

            <div v-if="error" class="error">{{error}}</div>
            <div class="actions">
              <div style="flex-grow:1;padding-top:8px;">
                <ui-checkbox :value.sync="login.remember" label="จำชื่อผู้ใช้" :disabled="isLoading"></ui-checkbox>
              </div>
              <div style="flex-shrink:0;width:16px"></div>
              <div style="flex-shrink:0">
                <ui-button type="normal" color="primary" text="เข้าสู่ระบบ" :disabled="isLoading"></ui-button>
              </div>
            </div>
          </form>
          <div class="push"></div>
          <div class="footer">
            <img src="/images/sysits.png"></img> nippon sysits
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const UiTextbox   = require('keen-ui/lib/UiTextbox')
const UiButton    = require('keen-ui/lib/UiButton')
const UiCheckbox  = require('keen-ui/lib/UiCheckbox')
const UiProgressCircular = require('keen-ui/lib/UiProgressCircular')
const helper      = require('../../lib/helper')

module.exports = {
  data: function() {
    let remember = helper.getCookie('signon.remember', '1', false)=='1'
    let user = remember ? helper.getCookie('signon.user', '', false) : ''
    return {
      login: {
        user: user,
        pass: '',
        remember,
      },
      error: '',
      sid: '',
      isLoading: false
    }
  },
  components: {
    UiTextbox,
    UiButton,
    UiCheckbox,
    UiProgressCircular,
  },
  ready: function() {
    this.errorTimer = null
    this.doSession = () => {
      this.$http.post('/signon/api/session').then((res) => {
        if (res.data.status) {
          this.sid = res.data.session.id
        }
      })
    }
    this.sessionTimer = setInterval(this.doSession, 60000)
    this.doSession()
  },
  beforeDestroy: function() {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer)
    }
    if (this.errorTimer) {
      clearTimeout(this.errorTimer)
    }
  },
  methods: {
    'doSubmit': function(event) {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
      let user = this.login.user
      let pass = this.login.pass
      let hash = helper.md5(this.sid + helper.md5('secret' + user + pass))
      let param = {
        user,
        sid: this.sid,
        hash
      }
      this.isLoading = true
      this.$http.post('/signon/api/signin', param).then((res) => {
        this.isLoading = false
        if (!res.data.status) {
          this.error = res.data.error
          if (this.timer) {
            clearTimeout(this.timer)
          }
          this.timer = setTimeout(() => {
            this.error = ''
            this.timer = null
          }, 3000)
          return
        }

        let remember = this.login.remember
        helper.setCookie('signon.remember', remember ? '1' : '0')
        helper.setCookie('signon.user', remember ? this.login.user : '');
        helper.setCookie('claret-user', res.data.session.data.user);
        window.location.href='/app'
      }, (err) => {
        this.isLoading=false
        console.log('ERROR', err)
      })
    }
  }
}
</script>
