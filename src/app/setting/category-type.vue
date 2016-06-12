<template>
  <div class="page">
    <div class="app-content">
      <h1>category-type</h1>
      <ns-select
        name="list"
        icon="save"
        label="ทดสอบภาษาไทย"
        :value.sync="listItem"
        :options="list"
        :selected-value.sync="selectedValue"
      ></ns-select>
      <ns-button text="Click Me" @click="setValue"></ns-button>
    </div>
  </div>
</template>

<script>
module.exports = {
  data: function() {
    let list = [
      {value:'01',text:'Item01'},
      {value:'02',text:'Item02'},
      {value:'03',text:'Item03'},
      {value:'04',text:'Item04'},
      {value:'05',text:'Item05'},
      {value:'06',text:'Item06'},
      {value:'07',text:'Item07'},
    ]
    return {
      list,
      listItem: null,
      selectedValue: '05',
    }
  },
  ready: function() {
//    this.$dispatch('set-title', 'SETTING')
  },
  methods: {
    setValue() {
      this.selectedValue = '03';
      setTimeout(() => {
        console.log('itemSelected=', this.listItem.value);
      }, 1);
    }
  }
}
</script>
