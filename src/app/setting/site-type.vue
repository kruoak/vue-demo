<template>
  <div class="page">
    <div class="app-content">
      <div style="width:960px">
        <h1>site-type</h1>
        <ns-textbox
          id="code"
          name="code"
          label="Code"
          :value.sync="form.code"
          :max-length="2"
          validation-rules="min:2|max:2|required"
          ></ns-textbox>
        <ns-textbox
          id="name"
          name="name"
          label="Name"
          :value.sync="form.name"
          validation-rules="required"
          ></ns-textbox>
        <ns-button text="Save" icon="save" @click="doSave"></ns-button>
        <table>
          <thead>
            <tr>
              <td>ID</td>
              <th>CODE</th>
              <th>NAME</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in list">
              <td>{{$index+1}}</td>
              <td v-text="item.code"></td>
              <td v-text="item.name"></td>
              <td>
                <ns-icon-button icon="mode_edit" @click="edit(item)"></ns-icon-button>
                <ns-icon-button icon="clear" @click="del(item)"></ns-icon-button>
              </td>
            </tr>
          </tbody>
        </table>
        <ns-confirm
          :show.sync="showComfirm"
          header="ยืนยันการลบ"
          confirm-button-text="ยืนยัน"
          deny-button-text="ยกเลิก"
          @confirmed="doDelete()"
          :close-on-confirm="true"
          >
          {{msg}}
        </ns-confirm>
      </div>
    </div>
  </div>
</template>

<script>

module.exports = {
  data() {
    return {
      form: {
        code: '',
        name: '',
      },
      list:[],
      showComfirm: false,
      msg:''
    }
  },

  ready: function() {
//    this.$dispatch('set-title', 'SETTING')
    this.getList();
  },

  methods: {
    edit(item) {
      //this.form = item;
      this.form.code = item.code;
      this.form.name = item.name;
    },
    del(item) {
      this.msg = "รหัส " + item.code + " จะถูกลบ";
      this.showComfirm = true;
      this.codeToDel = item.code;
    },
    doDelete() {
      this.$http.post('/app/api/setting/site-type/del', {code:this.codeToDel}).then((res) => {
        if (!res.data.status) {
          this.$dispatch('toast', 'เกิดข้อผิดพลาด ไม่สามารถข้อมูลได้')
        } else {
          this.$dispatch('toast', 'ลบข้อมูลเรียบร้อยแล้ว')
          this.getList();
        }
      });
    },
    getList() {
      this.$http.post('/app/api/setting/site-type/list', {}).then((res) => {
        if (!res.data.status) {
          return
        }
//        this.list.length = 0;
//        this.list.push(...res.data.list);
        this.list = res.data.list;
      })
    },
    doSave() {
      // TODO:
      if (this.form.code.length != 2) {
        let el = this.$el.querySelector('#code');
        el.focus();
        el.select();
        return;
      }
      if (this.form.name.length ==0 ) {
        let el = this.$el.querySelector('#name');
        el.focus();
        el.select();
        return;
      }

      this.$http.post('/app/api/setting/site-type/save', this.form)
      .then((res) => {
        if (!res.data.status) {
          this.$dispatch('toast', 'เกิดข้อผิดพลาด')
        } else {
          this.$dispatch('toast', 'บันทึกเรียบร้อยแล้ว')
          this.getList();
        }
      })
    }
  }
}
</script>
