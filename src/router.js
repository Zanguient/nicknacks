const routers = [
    {
        path: '/',
        component: (resolve) => require(['./views/index.vue'], resolve),
        children : [{
            path: '',
            title: 'Sales',
            name: 'Sales',
            component: (resolve) => require(['./views/sales.vue'], resolve)
        },{
            path: '/delivery',
            title: 'Delivery',
            name: 'Delivery',
            component: (resolve) => require(['./views/delivery.vue'], resolve)
        }]
    }
];
export default routers;
