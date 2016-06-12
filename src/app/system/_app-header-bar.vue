<template>
  <div class="header-bar">
    <ns-icon-button :icon="menuIcon" class="icon" color="white" @click="menuClick"></ns-icon-button>
    <div class="title">{{title}}</div>
    <ns-icon-button icon="more_vert" class="icon" color="white"></ns-icon-button>
  </div>
</template>
<script>
module.exports = {
  data: function() {
    return {
      title: '',
      menuIcon:''
    }
  },
  computed: {
    menuIcon: function() {
      return this.$route.path == '/' ? 'home' : 'arrow_back'
    },
    prevPath: function() {
      let oldPath =  this.$route.path
      if (oldPath=='/') {
        return '/'
      }
      let tmp = oldPath.split('/')
      tmp.pop()
      if (tmp.length==1) {
        return '/'
      }
      return tmp.join('/')
    }
  },
  methods: {
    menuClick: function(event) {
      this.$route.router.go(this.prevPath)
    }
  },
  events: {
    'set-title': function(title) {
      this.title = title
    }
  }
}
</script>
