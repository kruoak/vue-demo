<template>
  <div :class="{'-dock':dock}" class="sidemenu">
    <div class="content">
      <div class="sidemenu-header">
        Claret @NBC
      </div>
      <div class="sidemenu-content">
        <ul class="list">
          <template v-for="item in menus">
            <a v-if="!item.type || item.type=='menu'" v-link="{path:item.path,activeClass:'active',exact:item.isRoot}" class="menu-item">
              <div class="icon"><ns-icon :icon="item.icon"></ns-icon></div>
              <div class="text"><div class="multiline">{{item.text}}</div></div>
              <div v-if="item.rightIcon" class="icon mns-icon">{{item.rightIcon}}</div>
            </a>
            <li v-if="item.type=='header'" class="header">{{item.text}}</li>
            <li v-if="item.type=='divider'" class="divider"></li>
          </template>
        </ul>
      </div>
      <div class="sidemenu-footer">
        <ul class="list">
          <li class="divider"></li>
          <li>
            <a href="#" @click="doConfirm" class="menu-item">
              <ns-icon class="icon" icon="exit_to_app"></ns-icon>
              <div class="title"><div class="multiline">Logout</div></div>
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div class="mask"></div>
    <ns-confirm
      :show.sync="showConfirm"
      confirm-button-text="ออกจากระบบ"
      deny-button-text="ยกเลิก"
      autofocus="deny-button"
      header="ยืนยันการออกจากระบบ"
      @confirmed="doExit"
    >
      คุณต้องการออกจากระบบ?
    </ns-confirm>
  </div>
</template>
<script>
module.exports = {
  props: {
    dock: {
      type: Boolean,
      default: false,
    },
  },
  data: function() {
    return {
      menus:[],
      showConfirm: false,
    }
  },
  events: {
    'set-menu': function(menus) {
      this.menus = menus
    }
  },
  methods: {
    'doConfirm': function() {
      this.showConfirm = true
    },
    'doExit': function() {
      console.log('doExit')
      this.$http.post('/app/api/system/signout').then(() => {
        this.showConfirm = false
        window.location.href = '/signon'
      })
    }
  }
}
</script>
