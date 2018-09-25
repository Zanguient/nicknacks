<template>
    <Modal
        v-model="modalData.show"
        title="Create Discrepancy Voucher"
        :loading="loading"
        @on-ok="OK()">

        <h1>{{ modalData.inventory.name }}</h1>
        <p><i>{{ modalData.inventory.sku }}</i></p>

        <Form ref="discrepancyForm" :model="modalData.inventory" :rules="formRules">

            <el-table
                :data="modalData.inventory.stock"
                style="width: 100%">
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
                    label="Adjustment"
                    width="100"
                >
                    <template slot-scope="scope">
                        <FormItem
                            <InputNumber
                                class="discrepancyTableInputs"
                                :min="-999" :max="999"
                                v-model="scope.row.discrepancy"
                                @on-change="updateFinal(scope.row)"
                            ></InputNumber>
                        </FormItem>
                    </template>

                </el-table-column>

                <el-table-column width="80" label="Final">
                    <template slot-scope="scope">
                        <FormItem style="margin-bottom: 0px;">
                            <Input
                                class="discrepancyTableInputs"
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
                        <FormItem style="margin-bottom: 0px;">
                            <Input
                                class="transferTableInputs"
                                disabled
                                type="text"
                                v-model="scope.row.finalGrand"
                            ></Input>
                        </FormItem>
                    </template>
                </el-table-column>

            </el-table>

            <FormItem
                label="Reason"
                prop="discrepancyReason">
                <Input
                    v-model="modalData.inventory.discrepancyReason"
                    type="textarea"
                    :autosize="{minRows: 2,maxRows: 10}"
                    placeholder="Any comment on damages, misplacement, error etc..."
                    ></Input>
            </FormItem>

        </Form>

    </Modal>
</template>
<script>

import D from 'dottie'
import _ from 'lodash'

module.exports = {
    data() {

        return {
            loading: true,
            formRules: {
                discrepancyReason: [
                    { required: true, message: 'Please add a reason.', trigger: 'blur' }
                ]
            }
        }
    },
    props: {
        modalData: {
            show: false,
            inventory: Object
        }
    },
    computed: {
        currentGrand: function() {
            let self = this
            return _.sumBy(self.modalData.inventory.stock, o => { return parseInt(o.quantity) })
        },
        finalGrand: function() {
            let self = this
            return _.sumBy(self.modalData.inventory.stock, o => { return parseInt(o.final) })
        },
        summaryRow: function() {
            let self = this
            return [
                {
                    currentGrand: this.currentGrand,
                    finalGrand: this.finalGrand
                }
            ]
        }
    },
    methods: {
        OK() {
            let self = this
            let payload = this.modalData.inventory
            let gotAdjustment = false
            let netChangeToInventory = 0
            for(let i=0; i<payload.stock.length; i++) {
                let stock = payload.stock[i]
                let discrepancy = parseInt(stock.discrepancy)
                if (discrepancy !== 0) {
                    netChangeToInventory += discrepancy
                    gotAdjustment = true
                }
            }
            if (!gotAdjustment) {
                this.modalData.show = false
                this.$Message.error('No discrepancies to adjust.')
                return
            }
            if (netChangeToInventory === 0) {
                this.$Message.error('Net change is ZERO. Please use transfer voucher instead!')
                this.loading = false
                setTimeout(() => { self.loading = true }, 1)
                return
            }

            this.AXIOS.post(this.DOMAIN + '/api/v2/inventory/discrepancy', payload).then(response => {
                if (!response.data.success) {
                    let error = new Error('API operation not successful.')
                    error.reponse = response
                    throw error
                }

                // set the new inventory data for view
                this.$emit('inventory:discrepancy-complete', response.data.data)

                this.$Message.success('Success!');
                this.modalData.show = false

            }).catch(error => {

                CATCH_ERR_HANDLER(error)
                this.$Message.error('Failed request!');

            }).then(() => {
                this.loading = false
                setTimeout(() => { self.loading = true }, 1)
            })

        },
        updateFinal(row) {
            row.final = parseInt(row.quantity) + parseInt(row.discrepancy)
        }
    }
}
</script>
