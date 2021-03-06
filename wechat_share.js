/**
 * 微信分享js
 */
export class WechatShare{
	  constructor(weixinUrl, shareData = {}){
	    if(!this._isWechat()) throw new Error('仅供WAP平台使用')
		this.shareData = shareData
		this.weixinUrl = weixinUrl//认证url
		let suffix = '&url=' + encodeURIComponent(window.location.href.split('#')[0]) + '&time=' + new Date().getTime()
        this.weixinUrl = this.weixinUrl + suffix
		this.wx = window.wx//微信分享js对象，通过引入微信js导入
		this._config()
    }
    /*
     *辅助方法@判断是否在微信平台上
     */
    _isWechat() {
        var ua = window.navigator.userAgent.toLowerCase()
        return (ua.match(/MicroMessenger/i) || [])[0] === 'micromessenger'
    }

    /**
     *辅助方法@格式化url。
     *作用：1、加密url中文等url会出现乱码的地方。
     *      2、将穿进来的data参数转为url param键值对
     *
     */
    _formatParams(data) {
        var arr = []
        for (var name in data) {
            arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]))
        }
        arr.push(('v=' + Math.random()).replace('.', ''))
        return arr.join('&')
    }

    /*
     *辅助方法@原生jsonp方法，以动态插入script标签实现跨域请求
     *
     */
    _jsonp(options) {
        options = options || {}
        options.data = options.data || {}
        if (!options.url || !options.callback) {
            throw new Error('参数不合法')
        }

        // 创建 script 标签并加入到页面中
        var callbackName = ('jsonp_' + Math.random()).replace('.', '')
        var oHead = document.getElementsByTagName('head')[0]
        options.data[options.callback] = callbackName
        var params = this._formatParams(options.data)
        var oS = document.createElement('script')
        oHead.appendChild(oS)

        // 创建jsonp回调函数
        window[callbackName] = function(json) {
            oHead.removeChild(oS)
            clearTimeout(oS.timer)
            window[callbackName] = null
            options.success && options.success(json)
        }

        // 发送请求
        if (options.url.indexOf('&') === -1) {
            oS.src = options.url + '?' + params
        } else {
            oS.src = options.url + '&' + params
        }
	    //超时处理
	    if (options.time) {
	          oS.timer = setTimeout(function () {
	              window[callbackName] = null
	              oHead.removeChild(oS)
	              options.fail && options.fail({ message: '超时' })
	          }, options.time)
	      }
	  }

    /**
     *@当页面未插入js分享的script时，通过手动方式引入，用Promise实现
     *
     */
    _loadScript() {
        let promise = null
        let that = this
        if (!this.wx) {
            let s = window.s = document.createElement('script')
            s.type = 'text/javascript'
            s.async = true
            s.src = 'http://res.wx.qq.com/open/js/jweixin-1.2.0.js'
            var x = document.getElementsByTagName('script')[0]
            x.parentNode.insertBefore(s, x)
            // 等页面加载完成后，状态设置为resolve
            promise = new Promise((resolve, reject) => {
                s.onload = function() {
                    that.wx = window.wx
                    resolve()
                }
            })
        } else {
            promise = Promise.resolve() // 如果页面有引入js，强制转为resolve状态
        }
        return promise
    }

    /**
     *@加载完分享js后，获取后台权限验证配置
     */
    async _getConfig() {
        await this._loadScript();
        var promise = new Promise((resolve, reject) => {
        	this._jsonp({
                url: this.weixinUrl,
                type: 'get',
                dataType: 'jsonp',
                callback: 'callback',
                success: function(res) {
                    resolve(res)
                }
            })
        })
        return promise
    }
    
    /**
     * 权限验证配置
     */
    async _config(){
        let res = await this._getConfig();
    	this.wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: 'appId', // 必填，公众号的唯一标识
            timestamp: res.data.timestamp, // 必填，生成签名的时间戳
            nonceStr: res.data.nonceStr, // 必填，生成签名的随机串
            signature: res.data.signature, // 必填，签名
            jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage'] // 必填，需要使用的JS接口列表
        })
        var that = this;
    	this.wx.ready(function() {
			that.wx.onMenuShareTimeline(that.shareData)
	        that.wx.onMenuShareAppMessage(that.shareData)
    	})
    }
    /**
     *@微信分享属性（如标题等）设置
     *
     */
    setShareData(shareData) {
        Object.assign(this.shareData, shareData)
        if (this.wx) {
            var that = this
            this.wx.ready(function() {
                // 隐藏分享按钮
                that.wx.onMenuShareTimeline(that.shareData)
                that.wx.onMenuShareAppMessage(that.shareData)
            })
        }
    }
} // class end
