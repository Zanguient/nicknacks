<template>
    <Modal
        v-model="modalData.show"
        title="Add product"
        :loading="loading"
        @on-ok="OK()">

        <Form label-position="right" :label-width="80" ref="addInventoryForm" :model="modalData.form" :rules="formRules">

            <FormItem label="Name" prop="name">
                <Input v-model="modalData.form.name"></Input>
            </FormItem>
            <FormItem label="SKU" prop="sku">
                <Input v-model="modalData.form.sku"></Input>
            </FormItem>
            <FormItem prop="cogs" label="COGS">
                <Input type="text" number v-model="modalData.form.cogs"></Input>
            </FormItem>

        </Form>

    </Modal>
</template>
<script>
import axios from 'axios'
import D from 'dottie'
import _ from 'lodash'

module.exports = {
    data() {

        return {
            loading: true,
            formRules: {
                name: [
                    { required: true, message: 'The name cannot be empty', trigger: 'blur' }
                ],
                sku: [
                    { required: true, message: 'The sku cannot be empty', trigger: 'blur' }
                ],
                cogs: [{
                    required: true,
                    validator (rule, value, callback) {

                        // check regex
                        let regex = /^\d{1,6}(\.\d{1,2})?$/
                        if (!regex.test(value.toString())) return callback( new Error('Please the value in the correct format.') )

                        // everything passed
                        return callback()

                    },
                    trigger: 'blur'
                }]
            }
        }
    },
    props: {
        modalData: {
            show: false,
            form: {
                name: '',
                sku: '',
                cogs: 0
            }
        },
    },
    methods: {
        OK () {

            let self = this

            this.$refs['addInventoryForm'].validate(valid => {

                if (!valid) {
                    this.loading = false
                    setTimeout(() => { self.loading = true }, 1)
                    this.$Message.error('Check your entry!');
                }

                let payload = {
                    name: this.modalData.form.name,
                    sku: this.modalData.form.sku,
                    cogs: this.modalData.form.cogs
                }

                axios.put(this.DOMAIN + '/api/v2/inventory/add', payload).then(response => {
                    if (!response.data.success) {
                        let error = new Error('API operation not successful.')
                        error.reponse = response
                        throw error
                    }
                    console.log(response.data)

                    // push the new inventory into view
                    this.$emit('inventory:added', response.data.data)

                    this.$Message.success('Success!');
                    this.modalData.show = false

                }).catch(error => {

                    CATCH_ERR_HANDLER(error)
                    this.$Message.error('Failed request!')

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
