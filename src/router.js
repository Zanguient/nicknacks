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
        },{
            path: '/delivery',
            title: 'Delivery',
            name: 'Delivery',
            component: (resolve) => require(['./views/delivery.vue'], resolve)
        },{
            path: '/inventory',
            title: 'Inventory',
            name: 'Inventory',
            component: (resolve) => require(['./views/inventory.vue'], resolve)
        }, ,{
            path: '/shipment',
            title: 'Shipment',
            name: 'Shipment',
            component: (resolve) => require(['./views/shipment.vue'], resolve)
        }]
    }
];
export default routers;
