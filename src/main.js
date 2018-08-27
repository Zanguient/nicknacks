import Vue from 'vue'
import iView from 'iview/dist/iview.min'
import VueRouter from 'vue-router'
import Routers from './router'
import Util from './libs/util'
import App from './app.vue'
import 'iview/dist/styles/iview.css'
import locale from 'iview/dist/locale/en-US'
import D from 'dottie'

Vue.use(VueRouter)
Vue.use(iView, { locale })
Vue.use(require('vue-moment'))

// 路由配置
const RouterConfig = {
    mode: 'history',
    routes: Routers
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

    let response = console.log(D.get(err , 'response'))

    //if this is an api response
    if(response) {
        console.log(D.get(err , 'response'))
        alert(D.get(err, 'response.data.message'))
    } else {
        alert(err)
    }
}
