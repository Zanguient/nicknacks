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

                <Button type="primary" slot="extra" @click="editShipment(shipment)">
                    <span v-if="!shipment.submitLoading">Edit</span>
                </Button>

                <Collapse style="max-width: 100%;" value="info">
                    <Panel name="info">
                        Info
                        <p slot="content">

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

            <Divider>⚠️ DANGER</Divider>

            <div v-if="addShipmentModal.form.mode === 'edit'" style="width: 100%; text-align: center;">
                <Button  type="error" @click="deleteShipment(addShipmentModal.form)">
                    <Icon type="ios-trash" /> Delete Shipment
                </Button>
            </div>


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

            shipments: [{
                ShipmentID: '',
                name:'',
                estimatedShipOut: '',
                actualShipOut: '',
                expectedArrival: '',
                products: []
            }],

            inventories: [],

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
                            let ids = _.map(value, 'InventoryID')
                            if (_.uniq(ids).length !== ids.length) return callback(new Error('You have selected a duplicated product.'))
                            return callback()
                        }}
                    ]
                }
            },
            shipmentCache: {}

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
    }
}
</script>
