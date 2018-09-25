<style scoped>
.time{
    font-size: 14px;
    font-weight: bold;
}
.content{
    padding-left: 5px;
}
</style>

<template>
    <div>
        <Spin size="large" fix v-if="spinShow"></Spin>
        <Breadcrumb class="mainBreadCrumb">
            <BreadcrumbItem>Shipments</BreadcrumbItem>
        </Breadcrumb>

        <Button type="primary" @click="addShipment()">Add shipment</Button>

        <span v-if="shipments.length < 1">
            <Card class="salesReceiptCard">
                <p slot="title">No outstanding shipments.</p>
            </Card>
        </span>

        <span v-else>
            <Card v-for="shipment in shipments" :key="shipment.ShipmentID" class="salesReceiptCard">
                <p slot="title">
                    <Icon type="ios-boat" />
                    {{ shipment.name }}
                </p>

                <strong>Status:</strong>

                <Tag v-if=" shipment.status === 'Inventorised' " color="success">{{ shipment.status }}</Tag>
                <Tag v-else-if=" shipment.status === 'On sail' " color="warning">{{ shipment.status }}</Tag>
                <Tag v-else=" shipment.status === 'Not shipped' " color="default">{{ shipment.status }}</Tag>

                <span v-if="!shipment.hasArrived">
                    <!-- if shipped out and expected arrival is past today, OR if NOT shipped out and estimated ship out is past today -->
                    <span v-if="(shipment.actualShipOut && parseInt(shipment.expectedArrival) < (new Date()).getTime()) || ( !shipment.actualShipOut && ( parseInt(shipment.estimatedShipOut) < (new Date()).getTime()) )">
                        <Tag color="error">Delayed</Tag>
                    </span>
                </span>


                <Button v-if="!shipment.hasArrived && shipment.actualShipOut" type="success" slot="extra" @click="inventorise(shipment)">
                    <span>Inventorise</span>
                </Button>
                <Button v-else-if="!shipment.hasArrived && !shipment.actualShipOut" type="warning" slot="extra" @click="shipOut(shipment)">
                    <span>Ship</span>
                </Button>

                <Button v-if="!shipment.hasArrived" type="primary" slot="extra" @click="editShipment(shipment)">
                    <span>Edit</span>
                </Button>

                <Collapse style="max-width: 100%;" value="info">
                    <Panel name="info">
                        Info
                        <p slot="content">

                            <strong>Remarks:</strong> {{ shipment.remarks }}<br><br>

                            <Timeline>
                                <TimelineItem color="red">
                                    <p class="time">Ship Out</p>
                                    <p class="content"><strong>Est.:</strong> {{ shipment.estimatedShipOut | unixToDate }}</p>
                                    <p v-if="shipment.actualShipOut" class="content"><strong>Actual Ship Out:</strong> {{ shipment.actualShipOut | unixToDate }}</p>
                                    <p v-if="shipment.actualShipOut" class="content"><strong>Details:</strong> {{ shipment.shipOutDetails }}</p>
                                </TimelineItem>
                                <TimelineItem color="green">
                                    <p class="time">Arrival</p>
                                    <p class="content"><strong>Expected:</strong> {{ shipment.expectedArrival | unixToDate }}</p>
                                    <p v-if="shipment.actualArrival" class="content"><strong>Actual:</strong> {{ shipment.actualArrival | unixToDate }}</p>
                                    <p v-if="shipment.actualArrival" class="content"><strong>Arrival details:</strong> {{ shipment.arrivalDetails }}</p>
                                </TimelineItem>
                            </Timeline>
                        </p>
                    </Panel>
                    <Panel name="shipmentItems">
                        <Icon type="ios-cube" />
                        Products (<b v-if="shipment.products">{{ shipment.products.length }}</b><b v-else>0</b>)
                        <p slot="content">
                            <Table :columns="productColumns" v-if="shipment.products" :data="shipment.products"></Table>
                        </p>
                    </Panel>
                </Collapse>

            </Card>
        </span>


        <add-or-edit-shipment-modal
            v-on:shipment:added="lineAdd"
            v-on:shipment:edited="lineRefresh"
            v-on:shipment:deleted="lineRemove"
            :modalData="addOrEditShipmentModal"
            :inventories="inventories"
            ref="addOrEditShipmentModal"></add-or-edit-shipment-modal>

        <ship-out-modal
            v-on:shipment:shipped="lineRefresh"
            :modalData="shipOutModal"
            ></ship-out-modal>


        <inventorise-modal
            v-on:shipment:inventorised="lineRemove"
            :modalData="inventoriseModal"
            :storageLocations="storageLocations"
            ></inventorise-modal>

    </div>
</template>
<script>

import D from 'dottie'
import _ from 'lodash'
import moment from 'moment'
import { FormItem, InputNumber, Input } from 'iview'
import Vue from 'vue'
import addOrEditShipmentModal from './components/shipment/add-or-edit.vue'
import shipOutModal from './components/shipment/ship-out.vue'
import inventoriseModal from './components/shipment/inventorise.vue'

const domain = process.env.API_DOMAIN

export default {

    components: {
        addOrEditShipmentModal,
        shipOutModal,
        inventoriseModal
    },

    data () {
        return {

            spinShow: true,

            productColumns: [{
                title: 'No.',
                key: 'ShipmentID',
                width: 30
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

            inventories: [],
            storageLocations: [],

            // addShipment
            addOrEditShipmentModal: {
                mode: '',
                show: false,
                form: {
                    ShipmentID: '',
                    name: '',
                    estimatedShipOut: '',
                    products: [{
                        unique: (new Date()).getTime(),
                        InventoryID: '',
                        quantity: 1
                    }],
                    remarks: ''
                }
            },
            // used by edit shipment
            shipmentCache: {},

            // shipout Form
            shipOutModal: {
                name: '',
                show: false,
                form: {
                    ShipmentID: '',
                    actualShipOut: '',
                    expectedArrival: '',
                    shipOutDetails: ''
                }
            },

            // inventorise Form
            inventoriseModal: {
                name: '',
                show: false,
                form: {
                    ShipmentID: '',
                    actualArrival: '',
                    arrivalDetails: '',
                    products: []
                }
            }

        }

    },
    methods: {

        lineAdd(shipment) {
            this.shipments.unshift(shipment)
        },
        lineRefresh(shipment) {
            // find the shipment ID and update it.
            let self = this
            let index = _.findIndex(self.shipments, { ShipmentID: shipment.ShipmentID})
            this.$set(this.shipments, index, shipment)
        },
        lineRemove(shipmentID) {
            let self = this
            let index = _.findIndex(self.shipments, { ShipmentID: shipmentID })
            self.shipments.splice(index, 1)
        },
        addShipment() {
            this.$refs['addOrEditShipmentModal'].$refs['addOrEditShipmentForm'].resetFields()
            this.addOrEditShipmentModal.form.products.length = 0
            this.addOrEditShipmentModal.form.products.push({
                unique: (new Date()).getTime(),
                InventoryID: '',
                quantity: 1
            })
            this.addOrEditShipmentModal.mode = 'add'
            this.addOrEditShipmentModal.show = true
        },
        editShipment(shipment) {
            this.$refs['addOrEditShipmentModal'].$refs['addOrEditShipmentForm'].resetFields()

            this.shipmentCache = _.cloneDeep(shipment)

            this.addOrEditShipmentModal.form = this.shipmentCache

            let self = this

            this.addOrEditShipmentModal.form.estimatedShipOut = new Date(parseInt(self.addOrEditShipmentModal.form.estimatedShipOut))
            this.addOrEditShipmentModal.form.expectedArrival = new Date(parseInt(self.addOrEditShipmentModal.form.expectedArrival))
            this.addOrEditShipmentModal.form.products.forEach(el => {
                el.quantity = parseInt(el.quantity)
            })

            this.addOrEditShipmentModal.mode = 'edit'
            this.addOrEditShipmentModal.show = true
        },
        shipOut(shipment) {

            this.shipOutModal.name = shipment.name
            this.shipOutModal.form.ShipmentID = shipment.ShipmentID
            this.shipOutModal.form.expectedArrival = new Date(parseInt(shipment.expectedArrival))
            this.shipOutModal.show = true

        },
        inventorise(shipment) {

            let self = this

            // if it is the first time opening a form for a shipment,
            // attach the template.
            if (!D.get(shipment, 'products[0].toInventorise')) {
                shipment.products.forEach(product => {
                    product.toInventorise = _.cloneDeep(this.storageLocationTemplate)
                    product.quantityRemaining = parseInt(product.quantity)
                })
            }
            // needs cloneDeep if not model will be reactive.
            this.inventoriseModal.form = _.cloneDeep(shipment)
            this.inventoriseModal.show = true
        }
    },
    filters: {},
    created () {

        window.V = this
        window.moment = moment

        this.AXIOS.get(domain + '/api/v2/shipment/all').then(response => {

            if (!response.data.success) {
                let error = new Error('API operation not successful.')
                error.reponse = response
                throw error
            }

            console.log(response.data.data)

            this.shipments = response.data.data

        }).catch(CATCH_ERR_HANDLER).then(() => { this.spinShow = false })

        this.AXIOS.get(domain + '/api/v2/inventory/all').then(response => {
            if (!response.data.success) {
                let error = new Error('API operation not successful.')
                error.reponse = response
                throw error
            }
            console.log(response.data.data)
            this.inventories = response.data.data
        }).catch(CATCH_ERR_HANDLER)

        // get all storage location info
        this.AXIOS.get(domain + '/api/v2/storage-location/all').then(response => {
            if (!response.data.success) {
                let error = new Error('API operation not successful.')
                error.reponse = response
                throw error
            }
            console.log(response.data.data)
            this.storageLocations = response.data.data

            // create a storagelocation template
            this.storageLocationTemplate = {
                stores: {},
                total: 0
            }

            this.storageLocations.forEach(storageLocation => {
                this.storageLocationTemplate.stores[storageLocation.name] = storageLocation
                this.storageLocationTemplate.stores[storageLocation.name].quantity = 0
            })

        }).catch(CATCH_ERR_HANDLER)
    }
}
</script>
