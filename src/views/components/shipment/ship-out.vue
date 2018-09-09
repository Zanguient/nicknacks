<template>
    <Modal
        v-model="modalData.show"
        title="Ship Out"
        :loading="loading"
        @on-ok="OK()"
        >

        <h1 style="text-align: center; margin-bottom: 10px;">{{ modalData.name }}</h1>

        <Form label-position="right" :label-width="90" ref="shipOutForm" :model="modalData.form" :rules="formRules">

            <FormItem label="Ship Out" prop="actualShipOut">
                <DatePicker format="dd-MMM-yyyy" type="date" placeholder="Select date" v-model="modalData.form.actualShipOut"></DatePicker>
            </FormItem>
            <FormItem label="Est. Arrival" prop="expectedArrival">
                <DatePicker format="dd-MMM-yyyy" type="date" placeholder="Select date" v-model="modalData.form.expectedArrival"></DatePicker>
            </FormItem>
            <FormItem label="Shipping details" prop="shipOutDetails">
                <Input v-model="modalData.form.shipOutDetails" type="textarea" :autosize="{minRows: 2,maxRows: 10}" placeholder="Vessel, voyage, BOL..."></Input>
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

        const validateExpectedArrival = (rule, value, callback, source) => {

            if (!(value instanceof Date)) return callback( new Error('Please select the date') )

            if (value < this.modalData.form.actualShipOut) return callback( new Error('Expected arrival cannot be earlier than actual ship out.') )

            // everything passed
            return callback()
        }

        return {
            loading: true,
            formRules: {
                actualShipOut: [
                    { required: true, type: 'date', message: 'Please select the date', trigger: 'change' }
                ],
                expectedArrival: [
                    { required: true, trigger: 'change', validator: validateExpectedArrival}
                ],
                shipOutDetails: [
                    { required: true, message: 'Please fill in shipping details.', trigger: 'change' }
                ]
            }
        }
    },
    props: {
        modalData: {
            mode: String,
            show: Boolean,
            name: String,
            form: {
                ShipmentID: String,
                actualShipOut: Number,
                expectedArrival: Number,
                shipOutDetails: String
            }
        }
    },
    methods: {
        OK() {
            let self = this

            this.$refs['shipOutForm'].validate(valid => {
                if(!valid) {
                    this.loading = false
                    setTimeout(() => { self.loading = true }, 1)
                    this.$Message.error('Check your entry!');
                    return
                }

                let payload = _.cloneDeep(this.modalData.form)

                payload.actualShipOut = moment.utc(moment(payload.actualShipOut).startOf('day').format('LL')).valueOf()
                payload.expectedArrival = moment.utc(moment(payload.expectedArrival).startOf('day').format('LL')).valueOf();

                axios.post(domain + '/api/v2/shipment/shipout', payload).then(response => {

                    // if success: false
                    if (!response.data.success) {
                        let error = new Error('API operation not successful.')
                        error.reponse = response
                        throw error
                    }

                    self.$emit('shipment:shipped', response.data.data)

                    this.modalData.show = false

                }).catch(error => {
                    this.$Message.error('Failed request!');
                    CATCH_ERR_HANDLER(error)

                }).then(() => {
                    this.loading = false
                    setTimeout(() => { self.loading = true }, 1)
                })
            })
        }

    }
}
</script>
