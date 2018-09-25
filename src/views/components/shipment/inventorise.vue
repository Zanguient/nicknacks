<style scoped>
.inventoriseTableInputs {
    margin-left:-90px;
    width: 50px;
}
</style>

<template>
    <Modal
        v-model="modalData.show"
        title="Inventorise"
        :loading="loading"
        @on-ok="OK()"
        width="80%"
        >

        <h1 style="text-align: center; margin-bottom: 10px;">{{ modalData.name }}</h1>

        <Form label-position="right" :label-width="90" ref="inventoriseForm" :model="modalData.form" :rules="formRules">

            <FormItem label="Act. Arrival" prop="actualArrival">
                <DatePicker format="dd-MMM-yyyy" type="date" placeholder="Select date" v-model="modalData.form.actualArrival"></DatePicker>
            </FormItem>
            <FormItem label="Arrival details" prop="arrivalDetails">
                <Input v-model="modalData.form.arrivalDetails" type="textarea" :autosize="{minRows: 2,maxRows: 10}" placeholder="Any comment shipment, storage, damages etc..."></Input>
            </FormItem>

            <el-table
                :data="modalData.form.products"
                style="width: 100%">
                <el-table-column
                    type="index"
                    label="No"
                    width="50"
                >
                </el-table-column>

                <el-table-column label="Product">
                    <template slot-scope="scope">
                        <p>{{ scope.row.name }}</p>
                        <i>{{ scope.row.sku }}</i>
                    </template>
                </el-table-column>

                <el-table-column
                    label="Qty Shipped"
                    width="80"
                    prop="quantity"
                ></el-table-column>

                <el-table-column label="Inventorise">
                    <el-table-column
                        v-for="storageLocation in storageLocations"
                        :label="storageLocation.name"
                        :key="storageLocation.StorageLocationID"
                        width="80"
                    >
                        <template slot-scope="scope">
                            <FormItem prop="storageQuantities">
                                <InputNumber
                                    class="inventoriseTableInputs"
                                    :min="0" :max="scope.row.quantityRemaining + scope.row.toInventorise.stores[storageLocation.name].quantity"
                                    v-model="scope.row.toInventorise.stores[storageLocation.name].quantity"
                                    @on-change="countQuantities(scope.row, scope.row.toInventorise.stores[storageLocation.name])"
                                ></InputNumber>
                            </FormItem>
                        </template>

                    </el-table-column>

                    <el-table-column width="80" label="Total">
                        <template slot-scope="scope">

                            <!-- no idea why this inline rule doesn't work -->
                            <FormItem :rules="{ min: parseInt(scope.row.quantity), max: parseInt(scope.row.quantity), message: 'Incorrect qty.' }">
                                <InputNumber
                                    class="inventoriseTableInputs"
                                    disabled
                                    v-model="scope.row.toInventorise.total"
                                ></InputNumber>
                            </FormItem>

                        </template>
                    </el-table-column>
                </el-table-column>
            </el-table>
        </Form>
    </Modal>
</template>
<script>

import D from 'dottie'
import _ from 'lodash'

const domain = process.env.API_DOMAIN

module.exports = {
    data() {

        return {
            loading: true,
            formRules: {
                actualArrival: [
                    { required: true, type: 'date', message: 'Please select the date', trigger: 'change' }
                ]
            }
        }
    },
    props: {
        modalData: {
            name: '',
            show: false,
            form: {
                ShipmentID: String,
                actualArrival: Object,
                arrivalDetails: Object,
                products: Array
            }
        },
        storageLocations: Array
    },
    methods: {
        OK() {
            let self = this
            this.$refs['inventoriseForm'].validate(valid => {
                if(!valid) {
                    this.loading = false
                    setTimeout(() => { self.loading = true }, 1)
                    this.$Message.error('Check your entry!');
                    return
                }

                let products = this.modalData.form.products
                var qtyErrFlag = false
                for(let i=0; i<products.length; i++) {
                    let product = products[i]
                    if (product.quantityRemaining !== 0) {
                        qtyErrFlag = true
                        this.$Message.error('Quantity does not match for ' + product.name +'!')
                    }
                }
                if (qtyErrFlag) {
                    this.loading = false
                    setTimeout(() => { self.loading = true }, 1)
                    return
                }

                let payload = _.cloneDeep(this.modalData.form)

                payload.actualArrival = moment.utc(moment(payload.actualArrival).startOf('day').format('LL')).valueOf();

                this.AXIOS.post(domain + '/api/v2/shipment/arrive', payload).then(response => {

                    // if success: false
                    if (!response.data.success) {

                        let error = new Error('API operation not successful.')
                        error.reponse = response
                        throw error

                    }

                    this.$Message.success({
                        content: 'Successfully inventorised shipment! This record will be archived under "Inventory -> Movement"',
                        duration: 0,
                        closable: true
                    })
                    self.$emit('shipment:inventorised', response.data.data.ShipmentID)
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
        countQuantities(product, location) {

            let keys = Object.keys(product.toInventorise.stores)
            let count = 0
            for(let i=0; i<keys.length; i++) {
                let qty = product.toInventorise.stores[keys[i]].quantity
                count += parseInt(qty)
            }
            product.toInventorise.total = count
            product.quantityRemaining = parseInt(product.quantity) - count

        }

    }
}
</script>
