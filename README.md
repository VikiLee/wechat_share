# wechat_share
这个是基于ES6的微信分享组件
特性:
1. 不需要任何的依赖
1. 能够在微信里分享给朋友和朋友圈（不做微博和qq方面的分享）
1. 可二次分享，一次实例化，多次分享，在SPA中发挥作用
**注：在vue中路由mode为history的时候不能二次分享，需要在进入每个页面后再次实例化，比如在组件mouted后实例化**
#### 使用例子
```javascript
import { WechatShare } from wechat_share//首先引入
let weixinUrl = "xxx"//获取微信权限配置的url
let shareData = {
	  title: '分享标题',
      link: 'http://www.xxx.com',//分享的url
      imgUrl: 'http://www.xxx.com/share.png',//分享预览图片
      desc: '分享描述'//分享描述
}
let share = new WechatShare(weixinUrl, shareData);//实例化分享实例
//二次分享
share.setShareData({
	  title: '二次分享标题',
      link: 'http://www.xxx.com',//分享的url
      imgUrl: 'http://www.xxx.com/share.png',//分享预览图片
      desc: '二次分享描述'//分享描述
});
```
