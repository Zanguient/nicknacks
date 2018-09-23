<style scoped>
.layout{
    border: 1px solid #d7dde4;
    background: #f5f7f9;
    position: relative;
    border-radius: 4px;
    overflow: hidden;
}
.layout-nav{
    width: 420px;
    margin: 0 auto;
    margin-right: 20px;
}
.menuIcon {
    margin-right: 2px !important;
}
.menuItem {
    padding: 0 5px !important;
    @media all and (max-width: 320px) {
        font-size: 11px !important;
    }
}
</style>

<template>
    <div class="layout">
        <div v-if="$store.state.isAuthenticated">

            <Menu mode="horizontal" theme="light" active-name="1">

                <MenuItem class="menuItem" name="1" :to="{name: 'Sales'}">
                    <Icon class="menuIcon" type="ios-cart"/>
                    Sales
                </MenuItem>
                <MenuItem class="menuItem" name="2" :to="{name: 'Delivery'}">
                    <Icon class="menuIcon" type="ios-briefcase" />
                    Delivery
                </MenuItem>
                <Submenu class="menuItem" name="3">
                    <template slot="title">
                        <Icon class="menuIcon" type="ios-cube" />
                        Inventory
                    </template>
                    <MenuItem name="3-1" :to="{ name: 'Inventory' }">List</MenuItem>
                    <MenuItem name="3-2" :to="{ name: 'InventoryLog' }">Log</MenuItem>
                </Submenu>

                <MenuItem class="menuItem" name="4"  :to="{ name: 'Shipment' }">
                    <Icon class="menuIcon" type="ios-boat" />
                    Shipment
                </MenuItem>

            </Menu>

            <p>Logged in as: {{$store.state.user.name}} <a href="javascript:void(0);" @click="logout()">logout</a></p>

            <router-view></router-view>
        </div>
        <div v-else-if="$route.name === 'ForgetPasswordReset'">
            <router-view></router-view>
        </div>
        <div v-else>
            <Spin size="large" fix v-if="spinShow"></Spin>
            <login-form></login-form>
        </div>

    </div>
</template>
<script>
import axios from 'axios'
import D from 'dottie'
import loginForm from './components/login/login-form'
const domain = process.env.API_DOMAIN

export default {
    components: {
        loginForm
    },
    data () {
        return {
            spinShow: false
        }
    },
    methods: {
        logout() {

            this.$Modal.confirm({
                title: 'Logout',
                content: '<p>Confirm?</p>',
                loading: true,
                onOk: () => {

                    axios.post(this.DOMAIN + '/api/v2/login/logout').then(response => {
                        if (!response.data.success) {
                            let error = new Error('API operation not successful.')
                            error.reponse = response
                            throw error
                        }

                        this.$Modal.remove();
                        this.$store.commit('logout')
                        this.$Message.info('Succesfully logged out!')

                    }).catch(error => {

                        CATCH_ERR_HANDLER(error)

                        this.$Modal.remove()
                        this.$Message.error('Failed to log out!')

                    })

                }
            })
        }
    },
    created () {

        // if flag indicates user is authenticated, no need to check with server
        if (this.$store.state.isAuthenticated) this.spinShow = false

        // check with server on authentication status
        this.spinShow = true
        axios.get(domain + '/api/v2/login/am-i-authenticated').then(response => {

            if (!response.data.success) {
                let error = new Error('API operation not successful.')
                error.reponse = response
                throw error
            }

            this.$store.commit('authenticated', response.data.user)

        }).catch(CATCH_ERR_HANDLER).then(() => { this.spinShow = false })

    }
}
</script>
