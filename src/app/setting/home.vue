<template>
  <div class="page">
    <div class="app-content">
      <h1>Setting</h1>
    </div>
  </div>
</template>

<script>
module.exports = {
  data: function() {
    return {

    }
  },
  ready: function() {
    this.$dispatch('set-title', 'SETTING')
  }
}
</script>
