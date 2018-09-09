<template>
    <Modal
        v-model="modalData.show"
        title="Edit product"
        :loading="loading"
        @on-ok="OK(modalData.inventory)">

        <Form label-position="right" :label-width="80" ref="editInventoryForm" :model="modalData.form" :rules="formRules">

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

        <Collapse>
            <Panel>
                Advanced
                <p slot="content">
                    <Button type="warning" @click="deactivateInv(modalData.inventory)">Deactivate</Button>
                    <Button type="error" @click="deleteInv(modalData.inventory)">Delete</Button>
                </p>
            </Panel>
        </Collapse>

        <p>InventoryID: {{ modalData.inventory.InventoryID }}</p>

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
            deactivateInvSKU: '',
            deleteInvSKU: '',
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
            inventory: Object,
            form: {
                name: '',
                sku: '',
                cogs: 0
            }
        },
    },
    methods: {
        OK(inventory) {

            let self = this

            let newVal = this.modalData.form
            if (newVal.name === inventory.name && newVal.sku === inventory.sku && newVal.cogs === inventory.cogs) {

                //no changes.
                this.$Message.success('There are no changes made.');
                this.modalData.show = false
                return
            }

            this.$refs['editInventoryForm'].validate(valid => {

                if (!valid) {
                    this.loading = false
                    setTimeout(() => { self.loading = true }, 1)
                    this.$Message.error('Check your entry!');
                }

                let payload = {
                    InventoryID: this.modalData.inventory.InventoryID,
                    name: this.modalData.form.name,
                    sku: this.modalData.form.sku,
                    cogs: this.modalData.form.cogs
                }

                axios.post(self.DOMAIN + '/api/v2/inventory/update', payload).then(response => {

                    if (!response.data.success) {
                        let error = new Error('API operation not successful.')
                        error.reponse = response
                        throw error
                    }

                    self.$emit('inventory:edited', response.data.data)
                    this.$Message.success('Success!');
                    this.modalData.show = false

                }).catch(error => {

                    CATCH_ERR_HANDLER(error)
                    this.$Message.error('Failed request!');

                }).then(() => {
                    let self = this
                    this.loading = false
                    setTimeout(() => { self.loading = true }, 1)
                })
            })
        },
        deactivateInv(inventory) {
            let self = this
            this.deactivateInvSKU = ''

            this.$Modal.confirm({
                render: (h) => {

                    return h('Input', {
                        props: {
                            value: this.deactivateInvSKU,
                            autofocus: true,
                            placeholder: 'To confirm, please type the product sku'
                        },
                        on: {
                            input: (val) => { this.deactivateInvSKU = val }
                        }
                    })
                },
                onOk() {

                    if(self.deactivateInvSKU.toLowerCase() !== inventory.sku.toLowerCase()) {
                        alert('Your sku entered does not match.')
                        this.$Modal.remove()
                        return
                    }

                    // do delete
                    axios.post(this.DOMAIN + '/api/v2/inventory/deactivate', { InventoryID: inventory.InventoryID }).then(response => {
                        if (!response.data.success) {
                            let error = new Error('API operation not successful.')
                            error.reponse = response
                            throw error
                        }

                        // remove the inventory from view
                        self.$emit('inventory:deactivatedOrDeleted', inventory.InventoryID)
                        self.$Message.success(inventory.name + ' has been deactivated!')
                        self.$Modal.remove()
                        self.modalData.show = false

                    }).catch(error => {

                        CATCH_ERR_HANDLER(error)
                        self.$Modal.loading = false
                        setTimeout(() => { self.$Modal.loading = true }, 1)
                        self.$Message.error('Failed request!');

                    })

                },
                loading: true
            })
        },
        deleteInv(inventory) {

            let self = this
            this.deleteInvSKU = ''

            this.$Modal.confirm({
                render: (h) => {

                    return h('p', [
                        'DANGER: This process is irreversible. Only delete an inventory if you made a mistake in creating it.',
                        h('Input', {
                            props: {
                                value: this.deleteInvSKU,
                                autofocus: true,
                                placeholder: 'To confirm, please type the product sku'
                            },
                            on: {
                                input: (val) => { this.deleteInvSKU = val }
                            }
                        })
                    ])

                },
                onOk() {

                    if(self.deleteInvSKU.toLowerCase() !== inventory.sku.toLowerCase()) {
                        alert('Your sku entered does not match.')
                        this.$Modal.remove()
                        return
                    }

                    // do delete
                    axios.delete(self.DOMAIN + '/api/v2/inventory/delete', { data: {InventoryID: inventory.InventoryID} }).then(response => {
                        if (!response.data.success) {
                            let error = new Error('API operation not successful.')
                            error.reponse = response
                            throw error
                        }

                        // remove the inventory from view
                        self.$emit('inventory:deactivatedOrDeleted', inventory.InventoryID)
                        self.$Message.success(inventory.name + ' has been deleted!')
                        self.$Modal.remove()
                        self.modalData.show = false

                    }).catch(error => {

                        CATCH_ERR_HANDLER(error)

                        self.$Modal.loading = false
                        setTimeout(() => { self.$Modal.loading = true }, 1)
                        self.$Message.error('Failed request!');
                    })

                },
                loading: true
            })
        }
    }
}
</script>
