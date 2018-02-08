<template>
  <div id="app">
    <input class="filter-upload"
      ref="filterUpload"
      type="file"
      multiple
      :name="upload.name"
      :accept="upload.accept"
    />
    <button id="submit-upload" ref="submitUpload" style="display: none;">上传</button>
  </div>
</template>

<script>
import axios from 'axios'
import OSSUpload from './upload'

export default {
  name: 'app',
  data () {
    return {
      upload: {
        // 上传文件的字段名
        name: 'img',
        limit: 2,
        accept: 'image/png,image/jpg,image/jpeg',
        beforeFileList: []
      }
    }
  },
  mounted() {
    this.handleOSSUpload({
      accessid: '6MKOqxGiGU4AUk44',
      accesskey: 'ufu7nS8kS59awNihtjSonMETLI0KLy',
      host: 'http://post-test.oss-cn-hangzhou.aliyuncs.com',
      dirname: 'www',
      object_name_type: 'random_name'
    })
  },
  methods: {
    // OSS直传初始化
    handleOSSUpload(option = {}) {
      const config = {}
      const initFieldList = ['accessid', 'accesskey', 'host', 'dirname']
      initFieldList.forEach((key) => {
        config[key] = option[key]
      })
      const instance = new OSSUpload(config)
      const that = this
      instance.init_plupload({
        browse_button: this.$refs.filterUpload,
        // 绑定点击事件
        bindUploadEvent: new Promise((resolve) => {
          that.$refs.submitUpload.onclick = (event) => {
            resolve(event)
          }
        }),
        filesAdded(up, files) {
          console.log('filesAdded: ')
          console.log(up, files)
          that.$refs.submitUpload.click()
        },
        beforeUpload(up, files) {
          console.log('beforeUpload: ')
          console.log(up, files)
        },
        uploadProgress(up, file) {
          console.log('uploadProgress: ')
          console.log(up, file)
        },
        fileUploaded(up, file, info) {
          console.log('fileUploaded: ')
          console.log(up, file, info)
        },
        error(up, err) {
          console.log('error: ')
          console.log(up, err)
        }
      })
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
