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
}
</style>

<template>
    <div class="layout">

        <Menu mode="horizontal" theme="light" active-name="1">

            <MenuItem class="menuItem" name="1" to="/">
                <Icon class="menuIcon" type="ios-cart"></Icon>
                Sales
            </MenuItem>
            <MenuItem class="menuItem" name="2" to="/delivery">
                <Icon class="menuIcon" type="ios-briefcase" ></Icon>
                Delivery
            </MenuItem>
            <MenuItem class="menuItem" name="3">
                <Icon class="menuIcon" type="ios-cube" ></Icon>
                Inventory
            </MenuItem>
            <MenuItem class="menuItem" name="4" >
                <Icon class="menuIcon" type="ios-boat" ></Icon>
                Shipment
            </MenuItem>

        </Menu>

        <router-view></router-view>

    </div>
</template>
<script>
import axios from 'axios'
import D from 'dottie'
const domain = process.env.API_DOMAIN

export default {
    data () {
        return {}
    },
    methods: {},
    created () {}
}
</script>
