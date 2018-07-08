const routers = [
    {
        path: '/',
        meta: {
            title: 'Sales'
        },
        component: (resolve) => require(['./views/index.vue'], resolve)
    }
];
export default routers;
