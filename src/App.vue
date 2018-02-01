<template>
  <div id="app">
    <input class="filter-upload"
      ref="filterUpload"
      type="file"
      multiple
      :name="upload.name"
      :accept="upload.accept"
      @change="onBatchUpload"
    />
    <button id="submit-upload" ref="submitUpload">上传</button>
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
    const instance = new OSSUpload({
      accessid: '6MKOqxGiGU4AUk44',
      accesskey: 'ufu7nS8kS59awNihtjSonMETLI0KLy'
    })
    const that = this
    instance.init_plupload({
      browse_button: this.$refs.filterUpload,
      // 绑定点击事件
      bindUploadEvent: new Promise((resolve) => {
        that.$refs.submitUpload.onclick = (event) => {
          resolve(event)
          return false
        }
      }),
      filesAdded(up, files) {
        console.log('filesAdded: ')
        console.log(up, files)
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
  },
  methods: {
    // 批量上传
    onBatchUpload(event) {
      const { files } = event.target || {}
      console.log(files)
      return undefined
      this.handleGetToken()
        .then((res) => {
          console.info(res)
        })
        .catch((error) => {
          console.error(error)
        })
    },
    // 获取OSS token
    handleGetToken() {
      return new Promise((resolve, reject) => {
        axios
          .get('http://test.tjapi.gxtr9.com:5396/tj/oss/getOssToken?appid=sys_127')
          .then((response) => {
            const { code, data, message } = response.data || {}
            if (code === 0) {
              resolve(data)
            } else {
              reject(message)
            }
          })
          .catch(reject)
      })
    },
    // 上传文件到OSS
    handleUploadToOSS() {
      
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
