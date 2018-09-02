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
                    <span v-if="(shipment.actualShipOut && parseInt(shipment.expectedArrival) < (new Date()).getTime()) || (parseInt(shipment.estimatedShipOut) < (new Date()).getTime())">
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

        <Modal
            v-model="addShipmentModal.show"
            title="Add Shipment"
            :loading="addShipmentModal.loading"
            @on-ok="addShipmentOK()"
            >

            <Form label-position="right" :label-width="90" ref="addShipmentForm" :model="addShipmentModal.form" :rules="addShipmentModal.formRules">

                <FormItem label="Name" prop="name">
                    <Input v-model="addShipmentModal.form.name"></Input>
                </FormItem>
                <FormItem label="Est. Ship Out" prop="estimatedShipOut">
                    <DatePicker format="dd-MMM-yyyy" type="date" placeholder="Select date" v-model="addShipmentModal.form.estimatedShipOut"></DatePicker>
                </FormItem>
                <FormItem label="Est. Arrival" prop="expectedArrival">
                    <DatePicker format="dd-MMM-yyyy" type="date" placeholder="Select date" v-model="addShipmentModal.form.expectedArrival"></DatePicker>
                </FormItem>
                <FormItem label="Remarks" prop="remarks">
                    <Input v-model="addShipmentModal.form.remarks" type="textarea" :autosize="{minRows: 2,maxRows: 10}" placeholder="Any factory/shipping instructions or information..."></Input>
                </FormItem>

                <Row
                v-for="(product, index) in addShipmentModal.form.products"
                :key="product.unique">
                    <FormItem :label="'Item ' + (index+1)">
                        <Col span="16">
                            <FormItem prop="products">
                                <Select placeholder="Select product" v-model="product.InventoryID" filterable>
                                    <Option v-for="(inventory, index) in inventories" :value="inventory.InventoryID" :key="index">{{ inventory.name }} <br> <i>{{ inventory.sku }}</i></Option>
                                </Select>
                            </FormItem>
                        </Col>

                        <Col span="5">
                            <FormItem :prop="'products.' + index + '.quantity'" :rules="{ type: 'number', min: 1, message: 'Quantity cannot be less than 1', trigger: 'blur' }">
                                <InputNumber :max="999" :min="1" v-model="product.quantity"></InputNumber>
                            </FormItem>
                        </Col>

                        <Col span="2">
                            <FormItem>
                                <Button type="info" @click="removeShipmentProductLine(index)"><Icon type="md-close" /></Button>
                            </FormItem>
                        </Col>
                    </FormItem>
                </Row>
                <FormItem>
                    <Button type="dashed" long @click="addShipmentProductLine()" icon="md-add">Add item</Button>
                </FormItem>

            </Form>

            <div v-if="addShipmentModal.form.mode === 'edit'">
                <Divider>⚠️ DANGER</Divider>

                <div style="width: 100%; text-align: center;">
                    <Button  type="error" @click="deleteShipment(addShipmentModal.form)">
                        <Icon type="ios-trash" /> Delete Shipment
                    </Button>
                </div>
            </div>

        </Modal>

        <Modal
            v-model="shipOutModal.show"
            title="Ship Out"
            :loading="shipOutModal.loading"
            @on-ok="shipOutOK()"
            >

            <h1 style="text-align: center; margin-bottom: 10px;">{{ shipOutModal.name }}</h1>

            <Form label-position="right" :label-width="90" ref="shipOutForm" :model="shipOutModal.form" :rules="shipOutModal.formRules">

                <FormItem label="Ship Out" prop="actualShipOut">
                    <DatePicker format="dd-MMM-yyyy" type="date" placeholder="Select date" v-model="shipOutModal.form.actualShipOut"></DatePicker>
                </FormItem>
                <FormItem label="Est. Arrival" prop="expectedArrival">
                    <DatePicker format="dd-MMM-yyyy" type="date" placeholder="Select date" v-model="shipOutModal.form.expectedArrival"></DatePicker>
                </FormItem>
                <FormItem label="Shipping details" prop="shipOutDetails">
                    <Input v-model="shipOutModal.form.shipOutDetails" type="textarea" :autosize="{minRows: 2,maxRows: 10}" placeholder="Vessel, voyage, BOL..."></Input>
                </FormItem>

            </Form>

        </Modal>

        <Modal
            v-model="inventoriseModal.show"
            title="Inventorise"
            :loading="inventoriseModal.loading"
            @on-ok="inventoriseOK()"
            width="80%"
            >

            <h1 style="text-align: center; margin-bottom: 10px;">{{ inventoriseModal.name }}</h1>

            <Form label-position="right" :label-width="90" ref="inventoriseForm" :model="inventoriseModal.form" :rules="inventoriseModal.formRules">

                <FormItem label="Act. Arrival" prop="actualArrival">
                    <DatePicker format="dd-MMM-yyyy" type="date" placeholder="Select date" v-model="inventoriseModal.form.actualArrival"></DatePicker>
                </FormItem>
                <FormItem label="Arrival details" prop="arrivalDetails">
                    <Input v-model="inventoriseModal.form.arrivalDetails" type="textarea" :autosize="{minRows: 2,maxRows: 10}" placeholder="Any comment shipment, storage, damages etc..."></Input>
                </FormItem>

                <

                <Table :columns="inventoriseColumns" :data="inventoriseModal.form.products"></Table>

            </Form>

        </Modal>

    </div>
</template>
<script>
import axios from 'axios'
import D from 'dottie'
import _ from 'lodash'
import moment from 'moment'

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

            inventoriseColumns: [{
                title: 'No.',
                key: 'ShipmentID',
                width: 65,
                render: (h, params) => {
                    return <p>{(params.index + 1)}</p>
                }
            }, {
                title: 'Product',
                key: 'sku',
                render: (h, params) => {
                    return (
                        <div>
                            <p>{params.row.name}</p>
                            <p><i>{params.row.sku}</i></p>
                        </div>
                    )
                }
            }, {
                title: 'Qty',
                key: 'quantity',
                width: 65,
            }, {
                title: 'Locations',
                key: 'ShipmentID',
                render: (h, params) => {

                    let storageLocationRows = []

                    params.row.toInventorise.forEach((storage, index) => {

                        let row = h('FormItem', {

                            props: {
                                label: storage.name,
                                prop: 'storageQuantities',
                                rules: {
                                    type: 'number',
                                    min: 0,
                                    message: 'Quantity cannot be less than 1',
                                    trigger: 'blur',
                                    validator (rule, value, callback, source) {

                                        console.log(params.row.toInventorise)
                                        console.log(11111)

                                        // let ids = _.map(value, product => {
                                        //     if(!isNaN(parseInt(product.InventoryID))) return product.InventoryID
                                        // })
                                        //
                                        // // take out all the non-truthy items
                                        // ids = _.filter(ids)
                                        //
                                        // if (ids.length === 0) return callback(new Error('You have to select at least 1 product.'))
                                        // if (_.uniq(ids).length !== ids.length) return callback(new Error('You have selected a duplicated product.'))
                                        // return callback()

                                    }
                                }
                            }
                        }, [
                            h('InputNumber', {
                                props: {
                                    max: 999, min:0
                                },
                                on: { input: (value) => { console.log(value);console.log(params.row.toInventorise[index]);params.row.toInventorise[index].quantity = value } }
                            })
                        ])

                        storageLocationRows.push(row)
                    })
                    return h('div', {}, storageLocationRows)

                }
            },],

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

            // addShipment Form
            addShipmentModal: {
                mode: '',
                show: false,
                loading: true,
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
                },
                formRules: {
                    name: [
                        { required: true, message: 'The name cannot be empty', trigger: 'blur' }
                    ],
                    estimatedShipOut: [
                        { required: true, type: 'date', message: 'Please select the date', trigger: 'change' }
                    ],
                    expectedArrival: [
                        { required: true, trigger: 'change', validator (rule, value, callback, source) {

                            if (!(value instanceof Date)) return callback( new Error('Please select the date') )

                            if (value < V.addShipmentModal.form.estimatedShipOut) return callback( new Error('Expected arrival cannot be earlier than estimated ship out.') )

                            // everything passed
                            return callback()

                        }}
                    ],
                    products: [
                        { required: true, trigger: 'change', validator (rule, value, callback) {
                            let ids = _.map(value, product => {
                                if(!isNaN(parseInt(product.InventoryID))) return product.InventoryID
                            })

                            // take out all the non-truthy items
                            ids = _.filter(ids)

                            if (ids.length === 0) return callback(new Error('You have to select at least 1 product.'))
                            if (_.uniq(ids).length !== ids.length) return callback(new Error('You have selected a duplicated product.'))
                            return callback()
                        }}
                    ]
                }
            },
            shipmentCache: {},

            // shipout Form
            shipOutModal: {
                name: '',
                show: false,
                loading: true,
                form: {
                    ShipmentID: '',
                    actualShipOut: '',
                    expectedArrival: '',
                    shipOutDetails: ''
                },
                formRules: {
                    actualShipOut: [
                        { required: true, type: 'date', message: 'Please select the date', trigger: 'change' }
                    ],
                    expectedArrival: [
                        { required: true, trigger: 'change', validator (rule, value, callback, source) {

                            if (!(value instanceof Date)) return callback( new Error('Please select the date') )

                            if (value < V.shipOutModal.form.actualShipOut) return callback( new Error('Expected arrival cannot be earlier than actual ship out.') )

                            // everything passed
                            return callback()

                        }}
                    ],
                    shipOutDetails: [
                        { required: true, message: 'Please fill in shipping details.', trigger: 'change' }
                    ]
                }
            },

            // inventorise Form
            inventoriseModal: {
                name: '',
                show: false,
                loading: true,
                form: {
                    ShipmentID: '',
                    actualArrival: '',
                    arrivalDetails: '',
                    products: []
                },
                formRules: {
                    actualArrival: [
                        { required: true, type: 'date', message: 'Please select the date', trigger: 'change' }
                    ],
                    storageQuantities: [
                        { trigger: 'change', validator (rule, value, callback, source) {

                            let ids = _.map(value, product => {
                                if(!isNaN(parseInt(product.InventoryID))) return product.InventoryID
                            })

                            // take out all the non-truthy items
                            ids = _.filter(ids)

                            if (ids.length === 0) return callback(new Error('You have to select at least 1 product.'))
                            if (_.uniq(ids).length !== ids.length) return callback(new Error('You have selected a duplicated product.'))
                            return callback()

                        }}
                    ]
                }
            }

        }

    },
    methods: {
        addShipmentOK() {
            let self = this
            this.$refs['addShipmentForm'].validate(valid => {
                if(!valid) {
                    this.addShipmentModal.loading = false
                    setTimeout(() => { self.addShipmentModal.loading = true }, 1)
                    this.$Message.error('Check your entry!');
                    return
                }

                let payload = _.cloneDeep(this.addShipmentModal.form)

                payload.estimatedShipOut = moment.utc(moment(payload.estimatedShipOut).startOf('day').format('LL')).valueOf()
                payload.expectedArrival = moment.utc(moment(payload.expectedArrival).startOf('day').format('LL')).valueOf();

                var ajax
                if (this.addShipmentModal.mode === 'add') {
                    ajax = axios.put(domain + '/api/v2/shipment/create', payload)
                } else if (this.addShipmentModal.mode === 'edit') {
                    ajax = axios.post(domain + '/api/v2/shipment/edit', payload)
                } else {
                    throw new Error('addShipmentModal `mode` not defined.')
                }

                ajax.then(response => {

                    // if success: false
                    if (!response.data.success) {

                        let error = new Error('API operation not successful.')
                        error.reponse = response
                        throw error
                    }

                    if (this.addShipmentModal.mode === 'add') {
                        this.shipments.unshift(response.data.shipment)
                        this.$Message.success('Successfully added shipment!')
                    } else if (this.addShipmentModal.mode === 'edit') {
                        // find the shipment ID and update it.
                        let self = this
                        let shipmentIndex = _.findIndex(self.shipments, { ShipmentID: response.data.shipment.ShipmentID})
                        this.shipments[shipmentIndex] = response.data.shipment
                    }

                    this.addShipmentModal.show = false

                }).catch(error => {

                    this.$Message.error('Failed request!');
                    CATCH_ERR_HANDLER(error)

                }).then(() => {
                    this.addShipmentModal.loading = false
                    setTimeout(() => { self.addShipmentModal.loading = true }, 1)
                })
            })
        },
        addShipment() {
            this.$refs['addShipmentForm'].resetFields()
            this.addShipmentModal.form.products.length = 0
            this.addShipmentModal.form.products.push({
                unique: (new Date()).getTime(),
                InventoryID: '',
                quantity: 1
            })
            this.addShipmentModal.mode = 'add'
            this.addShipmentModal.show = true
        },
        addShipmentProductLine () {
            // this.index++;
            this.addShipmentModal.form.products.push({
                unique: (new Date()).getTime(),
                InventoryID: '',
                quantity: 1
            });
        },
        removeShipmentProductLine (index) {
            let self = this
            this.addShipmentModal.form.products.splice(index, 1)
        },
        editShipment(shipment) {
            this.$refs['addShipmentForm'].resetFields()

            this.shipmentCache = _.cloneDeep(shipment)

            this.addShipmentModal.form = this.shipmentCache

            let self = this

            this.addShipmentModal.form.estimatedShipOut = new Date(parseInt(self.addShipmentModal.form.estimatedShipOut))
            this.addShipmentModal.form.expectedArrival = new Date(parseInt(self.addShipmentModal.form.expectedArrival))
            this.addShipmentModal.form.products.forEach(el => {
                el.quantity = parseInt(el.quantity)
            })

            this.addShipmentModal.mode = 'edit'
            this.addShipmentModal.show = true
        },
        shipOut(shipment) {

            this.$refs['shipOutForm'].resetFields()

            this.shipOutModal.name = shipment.name
            this.shipOutModal.form.ShipmentID = shipment.ShipmentID
            this.shipOutModal.form.expectedArrival = new Date(parseInt(shipment.expectedArrival))

            this.shipOutModal.show = true

        },
        shipOutOK() {

            let self = this
            this.$refs['shipOutForm'].validate(valid => {
                if(!valid) {
                    this.shipOutModal.loading = false
                    setTimeout(() => { self.shipOutModal.loading = true }, 1)
                    this.$Message.error('Check your entry!');
                    return
                }

                let payload = _.cloneDeep(this.shipOutModal.form)

                payload.actualShipOut = moment.utc(moment(payload.actualShipOut).startOf('day').format('LL')).valueOf()
                payload.expectedArrival = moment.utc(moment(payload.expectedArrival).startOf('day').format('LL')).valueOf();

                axios.post(domain + '/api/v2/shipment/shipout', payload).then(response => {

                    // if success: false
                    if (!response.data.success) {
                        let error = new Error('API operation not successful.')
                        error.reponse = response
                        throw error
                    }

                        // find the shipment ID and update it.
                        let shipmentIndex = _.findIndex(self.shipments, { ShipmentID: response.data.shipment.ShipmentID})
                        this.shipments[shipmentIndex] = response.data.shipment

                    this.shipOutModal.show = false

                }).catch(error => {
                    this.$Message.error('Failed request!');
                    CATCH_ERR_HANDLER(error)

                }).then(() => {
                    this.shipOutModal.loading = false
                    setTimeout(() => { self.shipOutModal.loading = true }, 1)
                })
            })
        },
        deleteShipment(shipment) {

            // how did you get a delete button when you are in 'add' mode?
            if (this.addShipmentModal.form.mode === 'add') this.addShipmentModal.show = false

            let self = this
            let ShipmentID = shipment.ShipmentID

            this.$Modal.confirm({
                title: 'Delete Shipment',
                content: '<p>Confirm delete shipment <strong>' + shipment.name + '</strong>?</p>',
                loading: true,
                onOk: () => {
                    axios.delete(domain + '/api/v2/shipment/delete', { data: { ShipmentID: ShipmentID }}).then(response => {
                        if (!response.data.success) {
                            let error = new Error('API operation not successful.')
                            error.reponse = response
                            throw error
                        }

                        let deletedIndex = _.find(self.shipments, { ShipmentID: ShipmentID })

                        // remove the deleted entry
                        self.shipments.splice(self.shipments.indexOf(deletedIndex), 1)

                        this.$Message.info('Succesfully deleted shipment!')
                        addShipmentModal.show = false

                    }).catch(error => {

                        CATCH_ERR_HANDLER(error)
                        this.$Message.error('Failed request!')

                    }).then(() => {
                        this.$Modal.remove()
                    })

                }
            })
        },
        inventorise(shipment) {
            let self = this
            this.$refs['inventoriseForm'].resetFields()
            this.inventoriseModal.form = shipment
            this.inventoriseModal.show = true

            // if it is the first time opening a form for a shipment,
            // attach the template.
            if (!D.get(shipment, 'products[0].toInventorise')) {
                shipment.products.forEach(product => {
                    product.toInventorise = _.cloneDeep(this.storageLocationTemplate)
                })
            }
        }
    },
    filters: {},
    created () {

        window.V = this
        window.moment = moment

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

        // get all storage location info
        axios.get(domain + '/api/v2/storage-location/all').then(response => {
            if (!response.data.success) {
                let error = new Error('API operation not successful.')
                error.reponse = response
                throw error
            }
            console.log(response.data.data)
            this.storageLocations = response.data.data

            // create a storagelocation template
            this.storageLocationTemplate = _.map(this.storageLocations, storageLocation => {
                return {
                    StorageLocationID: storageLocation.StorageLocationID,
                    quantity: 0,
                    name: storageLocation.name
                }
            })

        }).catch(CATCH_ERR_HANDLER)
    }
}
</script>
