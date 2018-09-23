const routers = [
    {
        path: '/',
        component: (resolve) => require(['./views/index.vue'], resolve),
        children : [{
            path: '',
            title: 'Sales',
            name: 'Sales',
            meta: {
                title: 'Sales'
            },
            component: (resolve) => require(['./views/sales.vue'], resolve)
        }, {
            path: '/delivery',
            title: 'Delivery',
            name: 'Delivery',
            meta: {
                title: 'Delivery'
            },
            component: (resolve) => require(['./views/delivery.vue'], resolve)
        }, {
            path: '/inventory',
            title: 'Inventory',
            name: 'Inventory',
            meta: {
                title: 'Inventory'
            },
            component: (resolve) => require(['./views/inventory.vue'], resolve)
        }, {
            path: '/inventory/log',
            title: 'Inventory Log',
            name: 'InventoryLog',
            meta: {
                title: 'Inventory Log'
            },
            component: (resolve) => require(['./views/inventory-log.vue'], resolve)
        }, {
            path: '/inventory/one/:inventoryID',
            title: 'Inventory Info',
            name: 'InventoryInfo',
            meta: {
                title: 'Inventory Info'
            },
            component: (resolve) => require(['./views/inventory-info.vue'], resolve)
        }, {
            path: '/shipment',
            title: 'Shipment',
            name: 'Shipment',
            meta: {
                title: 'Shipment'
            },
            component: (resolve) => require(['./views/shipment.vue'], resolve)
        }, {
            path: '/login/forget-password-reset/:token',
            title: 'Forget Password Reset',
            name: 'ForgetPasswordReset',
            meta: {
                title: 'Forget Password Reset'
            },
            component: (resolve) => require(['./views/forget-password-reset.vue'], resolve)
        }]
    }
];
export default routers;
