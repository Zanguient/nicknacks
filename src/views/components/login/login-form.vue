<style scoped>
#loginFormWrapperOuter {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}
#loginFormWrapperInner {
    width: 280px;
    text-align: center;
}
</style>
<template>
    <div id="loginFormWrapperOuter">
        <div id="loginFormWrapperInner">
            <Form ref="form" :model="form" :rules="ruleInline">
                <FormItem prop="user">
                    <Row>
                        <Col span="12">
                            <Input type="text" v-model="form.user" placeholder="Email">
                                <Icon type="ios-person-outline" slot="prepend"></Icon>
                            </Input>
                        </Col>
                        <Col span="10" offset="1">
                            <span>@greyandsanders.com</span>
                        </Col>
                    </Row>
                </FormItem>
                <FormItem prop="password">
                    <Input type="password" v-model="form.password" placeholder="Password">
                        <Icon type="ios-lock-outline" slot="prepend"></Icon>
                    </Input>
                </FormItem>
                <FormItem>
                    <Button :loading="submitFormButtonLoading" type="primary" @click="handleSubmit('form')">Signin</Button>
                </FormItem>
            </Form>

            <a href="javascript:void(0);" @click="openForgetPasswordModal()">Forget password</a>
        </div>

        <Modal
            v-model="modal.show"
            :loading="modal.loading"
            @on-ok="submitForgetPassword()"
            title="Enter your username"
        >
            <Form ref="forgetPasswordForm" :model="form" :rules="ruleInline">
                <FormItem prop="user">
                    <Row>
                        <Col span="12">
                            <Input type="text" v-model="form.user" placeholder="Email">
                                <Icon type="ios-person-outline" slot="prepend"></Icon>
                            </Input>
                        </Col>
                        <Col span="10" offset="1">
                            <span>@greyandsanders.com</span>
                        </Col>
                    </Row>
                </FormItem>
            </Form>

            <span>Note: After pressing "ok", an email with a reset link will be sent to your mailbox</span>

        </Modal>

    </div>
</template>
<script>
import axios from 'axios'
import D from 'dottie'

export default {
    components: {},
    data () {
        return {
            modal: {
                show: false,
                loading: true
            },
            form: {
                user: '',
                password: ''
            },
            submitFormButtonLoading: false,
            ruleInline: {
                user: [
                    { required: true, message: 'Username email cannot be empty', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: 'Please fill in the password.', trigger: 'blur' },
                    { type: 'string', min: 6, message: 'The password length cannot be less than 6 bits', trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        handleSubmit(name) {
            let self = this
            this.submitFormButtonLoading = true

            this.$refs[name].validate((valid) => {
                if (!valid) {
                    this.$Message.error('Please check your inputs!')
                    this.submitFormButtonLoading = false
                    return
                }

                let payload = {
                    email: self.form.user + '@greyandsanders.com',
                    password: self.form.password
                }

                axios.post(this.DOMAIN + '/api/v2/login', payload).then(response => {
                    if (!response.data.success) {
                        let error = new Error('API operation not successful.')
                        error.reponse = response
                        throw error
                    }
                    this.$store.commit('authenticated', response.data.user)
                    this.$Message.success('Login is successful!')
                    // redirect
                    this.$router.push({name: 'Sales'})

                }).catch(error => {

                    CATCH_ERR_HANDLER(error)
                    this.$Message.error('Failed to login! Please try again.')

                }).then(() => {
                    this.submitFormButtonLoading = false
                })
            })
        },
        openForgetPasswordModal() {
            this.modal.show = true
        },
        submitForgetPassword() {
            let self = this

            this.$refs["forgetPasswordForm"].validate((valid) => {
                if (!valid) {
                    this.$Message.error('Please check your inputs!')
                    this.modal.loading = false
                    setTimeout(() => { self.modal.loading = true }, 1)
                    return
                }

                let payload = {
                    email: self.form.user + '@greyandsanders.com'
                }

                axios.post(this.DOMAIN + '/api/v2/login/password/forget', payload).then(response => {
                    if (!response.data.success) {
                        let error = new Error('API operation not successful.')
                        error.reponse = response
                        throw error
                    }
                    // this.$store.state.authenticated()
                    this.$Message.success({
                        content: 'If your email is valid, a link to reset your password will be sent!',
                        duration: 10,
                        closable: true
                    })
                    this.modal.show = false

                }).catch(error => {

                    CATCH_ERR_HANDLER(error)
                    this.$Message.error('Failed request!')

                }).then(() => {
                    this.modal.loading = false
                    setTimeout(() => { self.modal.loading = true }, 1)
                })
            })
        }
    },
    created () {}
}
</script>
