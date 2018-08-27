<template>
    <div>
        <Spin size="large" fix v-if="spinShow"></Spin>
        <Breadcrumb class="mainBreadCrumb">
            <BreadcrumbItem>Shipments</BreadcrumbItem>
        </Breadcrumb>

        <span v-if="shipments.length < 1">
            <Card class="salesReceiptCard">
                <p slot="title">No outstanding sales receipts for accounting entry.</p>
            </Card>
        </span>

        <span v-else>
            <Card v-for="shipment in shipments" :key="shipment.ShipmentID" class="salesReceiptCard">
                <p slot="title">
                    <Icon type="ios-cart" />
                    {{ shipment.name }}
                </p>

                <Button type="primary" slot="extra">
                    <span v-if="!shipment.submitLoading">Edit</span>
                    <span v-else>Loading...</span>
                </Button>

                <Collapse style="max-width: 100%;" value="info">
                    <Panel name="info">
                        Info
                        <p slot="content">
                            <Icon type="ios-person" /> {{ shipment.name }}<br>
                            <Icon type="ios-mail" /> {{ shipment.estimatedShipOut }}<br>
                            <Icon type="ios-phone-portrait" /> {{ shipment.actualShipOut }}<br>
                            <Icon type="ios-phone-portrait" /> {{ shipment.expectedArrival }}<br>
                        </p>
                    </Panel>
                    <Panel name="shipmentItems">
                        <Icon type="ios-cube" />
                        Products (<b>{{ shipment.products.length }}</b>)
                        <p slot="content">
                            <Table :columns="productColumns" :data="shipment.products"></Table>
                        </p>
                    </Panel>
                </Collapse>

            </Card>
        </span>


    </div>
</template>
<script>
import axios from 'axios'
import D from 'dottie'
const domain = process.env.API_DOMAIN

export default {
    data () {
        return {

            spinShow: true,

            productColumns: [{
                title: 'No.',
                key: 'ShipmentID',
                width: 65,
                render: (h, params) => {
                    return h('p', params.index + 1)
                }
            }, {
                title: 'Product',
                key: 'sku',
                render: (h, params) => {
                    return [
                        h('p', params.row.name),
                        h('p', [h('i', params.row.sku)])
                    ]
                }
            }, {
                title: 'Qty',
                key: 'quantity',
                width: 65,
            }],

            shipments: [{
                ShipmentID: '',
                name:'',
                estimatedShipOut: '',
                actualShipOut: '',
                expectedArrival: '',
                products: []
            }],

            inventories: []

        }

    },
    methods: {

    },

    created () {

        window.V = this

        axios.get(domain + '/api/v2/shipment/all').then(response => {

            if (!response.data.success) {
                let error = new Error('API operation not successful.')
                error.reponse = response
                throw error
            }

            console.log(response.data.shipments)

            this.shipments = response.data.shipments

        }).catch(CATCH_ERR_HANDLER).then(() => { this.spinShow = false })

        axios.get(domain + '/api/v2/inventory/all').then(response => {
            if (!response.data.success) {
                let error = new Error('API operation not successful.')
                error.reponse = response
                throw error
            }
            console.log(response.data.data)
            this.inventories = response.data.data
        }).catch(CATCH_ERR_HANDLER)
    }
}
</script>
