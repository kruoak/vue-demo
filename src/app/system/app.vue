<style lang="scss">
@import "../../scss/main";
</style>
<template>
  <div class="app">
    <app-header-bar></app-header-bar>
    <router-view></router-view>
    <app-side-menu :dock="breakPoint=='desktop'" ></app-side-menu>
    <ns-snackbar-container position="center">
      <ns-snakcbar
        :show.sync="snackbarShow"
        :message="snackbarMessage"
        :duration="snackbarDuration"
        >
      </ns-snakcbar>
    </ns-snackbar-container>
    <ns-modal
      :show.sync="sessionTimeout"
      header="ขาดการติดต่อนานเกินกว่าที่กำหนด"
      :show-close-button="false"
      :backdrop-dismissible="false"
      @closed="doExit"
    >
      กรุณาลงชื่อเข้าใช้ระบบอีกครั้ง
      <div slot="footer">
        <ns-button @click="doSignOut">เข้าสู่ระบบอีกครั้ง</ns-button>
      </div>
    </ns-modal>
  </div>
</template>
<script>
const helper = require('../../lib/helper');

module.exports = {
  data: function() {
    return {
      sessionTimeout: false,
      snackbarShow: true,
      snackbarMessage: '',
      snackbarDuration: 5000,
      breakPoint: 'mobile',
    }
  },
  components: {
    AppHeaderBar: require('./_app-header-bar.vue'),
    AppSideMenu: require('./_app-side-menu.vue'),
  },
  ready: function() {
    this.doSession = () => {
      this.$http.post('/signon/api/session').then((res) => {
        if (res.data.status) {
          this.sid = res.data.session.id
        }
      })
    }
    this.sessionTimer = setInterval(this.doSession, 60000);
    this.doSession();
    window.addEventListener('resize', this.handleResize)
  },
  events: {
    'set-title': function(title) {
      this.$broadcast('set-title', title)
    },
    'set-menu': function(menus) {
      this.$broadcast('set-menu', menus)
    },
    'session-timeout': function() {
      this.sessionTimeout = true
    },
    'toast': function(message, duration) {
      if (message != '') {
        this.$broadcast('ns-snackbar::create', {
          message,
          duration: duration || 5000
        })
      }
    }
  },
  methods: {
    'doExit': function() {
      helper.setCookie('claret-user', '{}');
      window.location.href='/signon'
    },
    doSignOut: function() {
      this.sessionTimeout=false
      console.log('SignOut Click')
//      window.location.href='/signon'
    },
    handleResize: function() {
      let el = window.getComputedStyle ? window.getComputedStyle(document.body, ':after') : false;
      if (el===false) {
        return
      }
      let currentBreakPoint = el.getPropertyValue('content')
      if (this.breakBpoint != currentBreakPoint) {
        this.breakPoint = currentBreakPoint
      }
    }
  }
}
</script>
