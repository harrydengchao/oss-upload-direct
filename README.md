# oss-upload-direct

> 阿里云JavaScript客户端签名直传

## Install

```bash
npm install --save oss-upload-direct
```

## 标签引入
```html
<script type="text/javascript" src="/oss-upload-direct/dist/build.js"></script>
<script type="text/javascript">
  console.log(window.OSSUpload)
</script>
```

## UMD导入
```javascript
import OSSUpload from 'oss-upload-direct'
console.log(OSSUpload)
```

## Usage

```javascript
/**
 * @param { String } accessid { required: true }
 * @param { String } accesskey { required: true }
 * @param { String } host { default: 'http://post-test.oss-cn-hangzhou.aliyuncs.com' } // OSS目标主机
 * @param { Date } expiration { default: currentDate.getFullYear() + 10} // 失效时间，超过这个时间，就无法上传了。默认10年
 * @param { Number } file_size_max { default: 1048576000 } // 上传文件的最大限制
 * @param { String } object_name_type { default: 'random_name' } // 上传文件名，保持本地文件名 or 随机文件名。local_name or random_name
 * @param { String } dirname { default: '/' } // 目标目录
 */ 
const instance = new Upload({
  accessid: '6MKOqxGiGU4AUk44',
  accesskey: 'ufu7nS8kS59awNihtjSonMETLI0KLy',
})

/**
 * @param { DOM element/id } browse_button { required: true }
 * @param { String } runtimes { default: 'html5,flash,silverlight,html4' }
 * @param { String } url { default: 'http://oss.aliyuncs.com' }
 * @param { Promise } bindUploadEvent { required: true }  // 绑定点击添加文件事件
 * @param { Function } filesAdded  // 文件添加完成时的回调
 * @param { Function } beforeUpload  // 文件文件上传前的回调
 * @param { Function } uploadProgress  // 文件文件上传进度回调
 * @param { Function } fileUploaded  // 文件文件上传完成回调
 * @param { Function } error  // 文件文件上传失败回调
 */ 
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
```

[init_plupload参数 参照 -> plupload](https://github.com/moxiecode/plupload)


---

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at 0.0.0.0:9090
npm run dev

# build for production with minification
npm run build
```

