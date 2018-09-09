import Vue from 'vue'
import iView from 'iview/dist/iview.min'
import VueRouter from 'vue-router'
import Routers from './router'
import Util from './libs/util'
import App from './app.vue'
import 'iview/dist/styles/iview.css'
import locale from 'iview/dist/locale/en-US'
import D from 'dottie'
import moment from 'moment'
import Element from 'element-ui'

Vue.use(VueRouter)
Vue.use(iView, { locale })
Vue.use(Element)

//filters
Vue.filter('unixToDate', value => {
    var str
    if (typeof value === 'number') {
        str = value.toString()
    } else {
        str = value
    }

    if (str.length === 10) {
        str += '000'
    } else if (str.length !== 13) {
        return undefined
    }

    return moment(parseInt(str)).format('DD MMM YYYY');
})
Vue.mixin({
   data: function() {
      return {
       get DOMAIN() {
         return process.env.API_DOMAIN
       }
     }
   }
})

// 路由配置
const RouterConfig = {
    mode: 'history',
    routes: Routers,
    base: '/admin_' + process.env.ADMIN_URL_SUFFIX + '/'
}
const router = new VueRouter(RouterConfig)



router.beforeEach((to, from, next) => {
    iView.LoadingBar.start()
    Util.title(to.meta.title)
    next();
})

router.afterEach((to, from, next) => {
    iView.LoadingBar.finish()
    window.scrollTo(0, 0)
})

new Vue({
    el: '#app',
    router: router,
    render: h => h(App)
})

window.CATCH_ERR_HANDLER = (err) => {
    console.log('CATCH_ERR_HANDLER output:')
    console.log(err)

    let response = D.get(err , 'response')

    //if this is an api response
    if(response) {
        console.log(response)
        alert(D.get(response, 'data.error.message'))
    } else {
        alert(err)
    }
}
