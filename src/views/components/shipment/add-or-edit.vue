<template>
    <Modal
        v-model="modalData.show"
        :title="( (modalData.mode === 'add') ? 'Add' : 'Edit' ) + ' Shipment'"
        :loading="loading"
        @on-ok="OK()"
        >

        <Form label-position="right" :label-width="90" ref="addOrEditShipmentForm" :model="modalData.form" :rules="formRules">

            <FormItem label="Name" prop="name">
                <Input v-model="modalData.form.name"></Input>
            </FormItem>
            <FormItem label="Est. Ship Out" prop="estimatedShipOut">
                <DatePicker format="dd-MMM-yyyy" type="date" placeholder="Select date" v-model="modalData.form.estimatedShipOut"></DatePicker>
            </FormItem>
            <FormItem label="Est. Arrival" prop="expectedArrival">
                <DatePicker format="dd-MMM-yyyy" type="date" placeholder="Select date" v-model="modalData.form.expectedArrival"></DatePicker>
            </FormItem>
            <FormItem label="Remarks" prop="remarks">
                <Input v-model="modalData.form.remarks" type="textarea" :autosize="{minRows: 2,maxRows: 10}" placeholder="Any factory/shipping instructions or information..."></Input>
            </FormItem>

            <Row
            v-for="(product, index) in modalData.form.products"
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
                            <Button type="info" @click="removeProductLine(index)"><Icon type="md-close" /></Button>
                        </FormItem>
                    </Col>
                </FormItem>
            </Row>
            <FormItem>
                <Button type="dashed" long @click="addProductLine()" icon="md-add">Add item</Button>
            </FormItem>

        </Form>

        <div v-if="(modalData.mode === 'edit')">
            <Collapse>
                <Panel>
                    Advanced
                    <p slot="content">
                        <Divider>⚠️ DANGER</Divider>
                        <Button long type="error" @click="deleteShipment(modalData.form)">
                            <Icon type="ios-trash" /> Delete Shipment
                        </Button>
                    </p>
                </Panel>
            </Collapse>
        </div>

    </Modal>
</template>
<script>

import D from 'dottie'
import _ from 'lodash'

const domain = process.env.API_DOMAIN

module.exports = {
    data() {

        const validateExpectedArrival = (rule, value, callback, source) => {

            if (!(value instanceof Date)) return callback( new Error('Please select the date') )

            if (value < this.modalData.form.estimatedShipOut) return callback( new Error('Expected arrival cannot be earlier than estimated ship out.') )

            // everything passed
            return callback()
        }

        return {
            loading: true,
            formRules: {
                name: [
                    { required: true, message: 'The name cannot be empty', trigger: 'blur' }
                ],
                estimatedShipOut: [
                    { required: true, type: 'date', message: 'Please select the date', trigger: 'change' }
                ],
                expectedArrival: [
                    { required: true, trigger: 'change', validator: validateExpectedArrival }
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
        }
    },
    props: {
        inventories: Array,
        modalData: {
            mode: String,
            show: Boolean,
            form: {
                ShipmentID: String,
                name: String,
                estimatedShipOut: Object,
                products: [{
                    unique: (new Date()).getTime(),
                    InventoryID: '',
                    quantity: 1
                }],
                remarks: String
            }
        }
    },
    methods: {
        OK() {
            let self = this
            this.$refs['addOrEditShipmentForm'].validate(valid => {
                if(!valid) {
                    this.loading = false
                    setTimeout(() => { self.loading = true }, 1)
                    this.$Message.error('Check your entry!');
                    return
                }

                let payload = _.cloneDeep(this.modalData.form)

                payload.estimatedShipOut = moment.utc(moment(payload.estimatedShipOut).startOf('day').format('LL')).valueOf()
                payload.expectedArrival = moment.utc(moment(payload.expectedArrival).startOf('day').format('LL')).valueOf();

                var ajax
                if (this.modalData.mode === 'add') {
                    ajax = this.AXIOS.put(domain + '/api/v2/shipment/create', payload)
                } else if (this.modalData.mode === 'edit') {
                    ajax = this.AXIOS.post(domain + '/api/v2/shipment/edit', payload)
                } else {
                    throw new Error('addOrEditShipmentModal `mode` not defined.')
                }

                ajax.then(response => {

                    // if success: false
                    if (!response.data.success) {

                        let error = new Error('API operation not successful.')
                        error.reponse = response
                        throw error
                    }

                    if (this.modalData.mode === 'add') {

                        this.$Message.success('Successfully added shipment!')
                        self.$emit('shipment:added', response.data.data)

                    } else if (this.modalData.mode === 'edit') {

                        this.$Message.success('Successfully edited shipment!')
                        self.$emit('shipment:edited', response.data.data)

                    }

                    this.modalData.show = false

                }).catch(error => {

                    this.$Message.error('Failed request!');
                    CATCH_ERR_HANDLER(error)

                }).then(() => {
                    this.loading = false
                    setTimeout(() => { self.loading = true }, 1)
                })
            })
        },
        addProductLine () {
            // this.index++;
            this.modalData.form.products.push({
                unique: (new Date()).getTime(),
                InventoryID: '',
                quantity: 1
            });
        },
        removeProductLine (index) {
            let self = this
            this.modalData.form.products.splice(index, 1)
        },
        deleteShipment(shipment) {

            // how did you get a delete button when you are in 'add' mode?
            if (this.modalData.mode === 'add') {
                this.$Message.error('Please refresh and try again.')
                this.modalData.show = false
            }

            let self = this
            let ShipmentID = shipment.ShipmentID

            this.$Modal.confirm({
                title: 'Delete Shipment',
                content: '<p>Confirm delete shipment <strong>' + shipment.name + '</strong>?</p>',
                loading: true,
                onOk: () => {
                    this.AXIOS.delete(domain + '/api/v2/shipment/delete', { data: { ShipmentID }}).then(response => {

                        if (!response.data.success) {
                            let error = new Error('API operation not successful.')
                            error.reponse = response
                            throw error
                        }

                        this.$Message.info('Succesfully deleted shipment!')
                        self.$emit('shipment:deleted', ShipmentID)
                        self.modalData.show = false

                    }).catch(error => {

                        CATCH_ERR_HANDLER(error)
                        this.$Message.error('Failed request!')

                    }).then(() => {
                        this.$Modal.remove()
                    })

                }
            })
        }

    }
}
</script>
