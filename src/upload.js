import Base64 from './lib/base64'
require('./lib/crypto1/crypto/crypto')
require('./lib/crypto1/hmac/hmac')
require('./lib/crypto1/sha1/sha1')
const Crypto = window.Crypto
const plupload = require('plupload/js/plupload.full.min');

class Upload {
  /**
   * @param { String } accessid { required: true }
   * @param { String } accesskey { required: true }
   * @param { String } host { default: 'http://post-test.oss-cn-hangzhou.aliyuncs.com' } // OSS目标主机
   * @param { Date } expiration { default: '2030-01-01T12:00:00.000Z'} // 失效时间，超过这个时间，就无法上传了
   * @param { Number } file_size_max { default: 1048576000 } // 上传文件的最大限制
   * @param { String } object_name_type { default: 'random_name' } // 上传文件名，保持本地文件名 or 随机文件名。local_name or random_name
   * @param { String } dirname { default: '/' } // 目标目录
   */ 
  constructor({
    accessid,
    accesskey,
    host = 'http://post-test.oss-cn-hangzhou.aliyuncs.com',
    expiration,
    file_size_max = 1048576000,
    object_name_type = 'random_name',
    dirname = '/'
  }) {
    if (!accessid) {
      throw new Error('Upload 参数缺失： accessid')
      return undefined
    } else if (!accesskey) {
      throw new Error('Upload 参数缺失： accesskey')
      return undefined
    }

    // 默认时间，10年
    if (!expiration) {
      const date = new Date()
      date.setFullYear(date.getFullYear() + 10)
      this.expiration = date.toISOString()
    } else {
      this.expiration = new Date(expiration).toISOString()
    }

    this.accessid = accessid
    this.accesskey = accesskey
    this.host = host
    this.timestamp = Date.parse(new Date()) / 1000
    this.now = this.timestamp
    this.object_name_type = object_name_type
    this.dirname = dirname.replace(/^\//, '')
    if (!/\/$/.test(this.dirname)) {
      this.dirname += '/'
    }

    this.policyText = {
      "expiration": this.expiration, //设置该Policy的失效时间，超过这个失效时间之后，就没有办法通过这个policy上传文件了
      "conditions": [
        ["content-length-range", 0, file_size_max] // 设置上传文件的大小限制
      ]
    }

    this.policyBase64 = Base64.encode(JSON.stringify(this.policyText))
    const message = this.policyBase64
    const bytes = Crypto.HMAC(Crypto.SHA1, message, this.accesskey, { asBytes: true })
    this.signature = Crypto.util.bytesToBase64(bytes)

    const that = this
    // 分类链
    this.chain = [
      {
        name: 'local_name',
        get handle() {
          const get_object_name = (filename) => {
            return that.dirname + "${filename}"
          }
          const get_uploaded_object_name = (filename) => {
            let tmp_name = get_object_name(filename)
            return tmp_name.replace("${filename}", filename)
          }
          return {
            get_object_name,
            get_uploaded_object_name
          }
        }
      }, {
        name: 'random_name',
        get handle() {
          const get_object_name = (filename) => {
            const suffix = that.get_suffix(filename)
            return that.dirname + that.get_random_string(10) + suffix
          }
          const get_uploaded_object_name = (filename) => {
            return get_object_name(filename)
          }
          return {
            get_object_name,
            get_uploaded_object_name
          }
        }
      }
    ]
  }

  // 获取随机字符串
  // 传入字符串长度 @param { Number } num { default: 32 }
  get_random_string(len = 32) {
    const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
    const maxPos = chars.length
    let pwd = ''
    for (let i = 0; i < len; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * maxPos))
    }
    return pwd
  }

  // 获取文件名后缀
  // 传入文件名 @param { String } filename { demo: 'test.png' }
  get_suffix(filename) {
    const pos = filename.lastIndexOf('.')
    let suffix = ''
    if (pos != -1) {
      suffix = filename.substring(pos)
    }
    return suffix
  }

  // 设置上传参数
  set_upload_param(up, filename, ret) {
    let object_name = this.chain.filter(obj => obj.name === this.object_name_type)[0].handle.get_object_name(filename)
    const new_multipart_params = {
      'key': object_name,
      'policy': this.policyBase64,
      'OSSAccessKeyId': this.accessid,
      'success_action_status': '200', //让服务端返回200,不然，默认会返回204
      'signature': this.signature,
    }

    up.setOption({
      'url': this.host,
      'multipart_params': new_multipart_params
    })
    up.start()
  }

  // 初始化 plupload
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
  init_plupload({
    browse_button,
    runtimes = 'html5,flash,silverlight,html4',
    url = 'http://oss.aliyuncs.com',
    bindUploadEvent,
    filesAdded,
    beforeUpload,
    uploadProgress,
    fileUploaded,
    error
  } = {}) {
    if (!browse_button) {
      throw new Error('init_plupload 缺少 browse_button 参数')
      return undefined
    } else if (!bindUploadEvent) {
      throw new Error('init_plupload 缺少绑定点击事件')
      return undefined
    } else if (bindUploadEvent && typeof bindUploadEvent !== 'object' || typeof bindUploadEvent.then !== 'function') {
      throw new Error('init_plupload 缺少 bindUploadEvent 必须为 Promise')
      return undefined
    }

    const that = this
    const uploader = new plupload.Uploader({
      browse_button,
      runtimes,
      flash_swf_url: 'node_modules/plupload/js/Moxie.swf',
      silverlight_xap_url: 'node_modules/plupload/js/Moxie.xap',
      url,
      init: {
        PostInit: function () {
          // 绑定点击事件
          bindUploadEvent
            .then(() => {
              that.set_upload_param(uploader, '', false)
            })
            .catch(error => console.error(`PostInit catch: ${error}`))
        },
        // 文件添加完成
        FilesAdded: function (up, files) {
          filesAdded && filesAdded(up, files)
        },
        // 上传前
        BeforeUpload: function (up, file) {
          beforeUpload && beforeUpload(up, file)
          that.set_upload_param(up, file.name, true);
        },
        // 上传进度
        UploadProgress: function (up, file) {
          uploadProgress && uploadProgress(up, file)
        },
        // 文件上传完成
        FileUploaded: function (up, file, info) {
          fileUploaded && fileUploaded(up, file, info)
        },
        // 上传出错
        Error: function (up, err) {
          error(up, err)
        }
      }
    })
    // 初始化
    uploader.init()
  }
}

export default Upload
