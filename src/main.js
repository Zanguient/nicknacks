import Vue from 'vue'
import iView from 'iview/dist/iview.min'
import VueRouter from 'vue-router'
import Routers from './router'
import Util from './libs/util'
import App from './app.vue'
import 'iview/dist/styles/iview.css'
import locale from 'iview/dist/locale/en-US'
import D from 'dottie'
import moment from 'moment-timezone'
import Element from 'element-ui'
import El_locale from 'element-ui/lib/locale/lang/en'
import VueJsonPretty from 'vue-json-pretty'
import Vuex from 'vuex'

Vue.use(VueRouter)
Vue.use(iView, { locale })
Vue.use(Element, { El_locale })
Vue.use(VueJsonPretty)
Vue.use(Vuex)

Vue.component('vue-json-pretty', VueJsonPretty)

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

    return moment(parseInt(str)).tz('Asia/Singapore').format('DD MMM YYYY');
})
//filters
Vue.filter('timestampToDate', value => {
    return moment(value).tz('Asia/Singapore').format('DD MMM YYYY hh:mm')
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

const store = new Vuex.Store({
    state: {
        isAuthenticated: false,
        user: {}
    },
    mutations: {
        authenticated (state, payload) {
            state.isAuthenticated = true
            state.user = payload
        },
        logout (state) {
            state.isAuthenticated = false
            state.user = {}
        }
    }
})

new Vue({
    el: '#app',
    store,
    router: router,
    render: h => h(App)
})

window.CATCH_ERR_HANDLER = (err) => {

    return (function(store) {
        return function() {
            let response = D.get(err , 'response')

            //if this is an api response
            if(response) {

                if (response.status === 401) {
                    store.state.logout()
                    return
                }

                if (response.status === 403) {
                    return alert('Oops. Looks like you don\'t have enough rights to access this resource.')
                }

                console.log(response)
                alert(D.get(response, 'data.message'))


            } else {
                alert(err)
            }
        }
    })(store)

}
