<template>
    <Modal
        v-model="modalData.show"
        title="Transfer voucher"
        @on-ok="transferOK()"
        :loading="loading"
    >

        <h1>{{ modalData.inventory.name }}</h1>
        <p><i>{{ modalData.inventory.sku }}</i></p>

        <Form ref="transferForm" v-model="stock" :rules="formRules">

            <el-table
                :data="stock"
                style="width: 100%"
            >
                <el-table-column
                    type="index"
                    label="No"
                    width="50"
                >
                </el-table-column>

                <el-table-column
                    label="Name"
                    width="120"
                >
                    <template slot-scope="scope">
                        <p v-if="scope.row.StorageLocationID">{{ scope.row.name }}</p>
                    </template>
                </el-table-column>

                <el-table-column
                    label="Qty"
                    width="50"
                    prop="quantity"
                >
                </el-table-column>

                <el-table-column
                    label="Transfer"
                    width="100"
                >
                    <template slot-scope="scope">
                        <FormItem
                            <InputNumber
                                class="transferTableInputs"
                                :min="-scope.row.quantity" :max="scope.row.transfer + remaining"
                                v-model="scope.row.transfer"
                                @on-change="updateFinal(scope.row)"
                            ></InputNumber>
                        </FormItem>
                    </template>

                </el-table-column>

                <el-table-column width="80" label="Final">
                    <template slot-scope="scope">
                        <FormItem style="margin-bottom: 0px;">
                            <Input
                                class="transferTableInputs"
                                disabled
                                type="text"
                                v-model="scope.row.final"
                            ></Input>
                        </FormItem>
                    </template>
                </el-table-column>

            </el-table>

            <el-table
                :data="summaryRow"
                style="width: 100%"
                :show-header="false"
            >
                <el-table-column width="50"></el-table-column>

                <el-table-column width="120">
                    <template slot-scope="scope">
                        <strong>Totals</strong>
                    </template>
                </el-table-column>

                <el-table-column prop="currentGrand" width="50"></el-table-column>

                <el-table-column
                    label="Transfer"
                    width="100"
                ></el-table-column>

                <el-table-column width="80" label="Final">
                    <template slot-scope="scope">
                        <FormItem style="margin-bottom: 0px;" prop="transferredGrand">
                            <Input
                                class="transferTableInputs"
                                disabled
                                type="text"
                                v-model="scope.row.transferredGrand"
                            ></Input>
                        </FormItem>
                    </template>
                </el-table-column>

            </el-table>

            <FormItem
                label="Reason"
                prop="transferReason">

                <Input
                    v-model="transferReason"
                    type="textarea"
                    :autosize="{minRows: 2,maxRows: 10}"
                    placeholder="Any comment on movement or errors etc...">
                </Input>
            </FormItem>

        </Form>
    </Modal>

</template>
<script>
import axios from 'axios'
import D from 'dottie'
import _ from 'lodash'

const domain = process.env.API_DOMAIN

module.exports = {
    data() {

        const validateTransferQty = (rule, value, callback, source) => {

            if (this.transferredGrand < this.currentGrand) {
                let msg = 'The total quantity after transfer does not tally.'
                this.$Message.error(msg)
                return callback( new Error(msg) )
            }
            // everything passed
            return callback()
        }

        const validateReason = (rule, value, callback, source) => {

            if (this.transferReason.length === 0) return callback( new Error('Please enter something.') )
            // everything passed
            return callback()
        }


        return {
            loading: true,
            remaining: 0,
            transferReason: '',
            formRules: {
                transferredGrand: [{
                    trigger: 'blur',
                    validator: validateTransferQty
                }]
                ,
                transferReason: [{ trigger: 'blur', validator: validateReason }]
            }
        }
    },
    props: {
        stock: Array,
        modalData: {
            show: Boolean,
            inventory: {
                InventoryID: String,
                name: String,
                sku: String,
                stock: Array
            }
        }
    },
    computed: {
        currentGrand: function() {
            let self = this
            return _.sumBy(self.stock, o => { return parseInt(o.quantity) })
        },
        transferredGrand: function() {
            let self = this
            return _.sumBy(self.stock, o => { return parseInt(o.final) })
        },
        summaryRow: function() {
            let self = this
            return [
                {
                    currentGrand: this.currentGrand,
                    transferredGrand: this.transferredGrand
                }
            ]
        }

    },
    methods: {
        updateFinal(row) {
            row.final = parseInt(row.quantity) + parseInt(row.transfer)

            // make sure computed properties are calculated first before this.
            this.$nextTick(() => {
                this.remaining = Math.max(this.currentGrand - this.transferredGrand, 0)
            })

        },
        transferOK() {

            let self = this
            this.$refs['transferForm'].validate(valid => {

                if (!valid) {
                    this.loading = false
                    setTimeout(() => { self.loading = true }, 1)
                    return false
                }

                // cannot find any transfer that is not zero
                if( !(_.find(self.stock, o => { return parseInt(o.transfer) !== 0 })) ) {
                    this.$Message.error('There are no transfers made.')
                    this.loading = false
                    setTimeout(() => { self.loading = true }, 1)
                    return false
                }


                let payload = {
                    InventoryID: this.modalData.inventory.InventoryID,
                    stock: this.stock,
                    transferReason: this.transferReason
                }

                console.log(payload)

                axios.post(domain + '/api/v2/inventory/transfer', payload).then(response => {
                    if (!response.data.success) {
                        let error = new Error('API operation not successful.')
                        error.reponse = response
                        throw error
                    }

                    this.$Message.success('Success!')
                    self.$emit('inventory:transferred', response.data.data)
                    self.modalData.show = false

                }).catch(error => {

                    CATCH_ERR_HANDLER(error)
                    this.$Message.error('Failed request!');

                }).then(() => {
                    let self = this
                    this.loading = false
                    setTimeout(() => { self.loading = true }, 1)
                })
            })
        }
    }
}
</script>
