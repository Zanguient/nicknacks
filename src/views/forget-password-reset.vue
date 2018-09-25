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
            <Form ref="form" :model="form" :rules="rules">
                <FormItem prop="password">
                    <Input type="password" v-model="form.password" placeholder="Password">
                        <Icon type="ios-lock-outline" slot="prepend"></Icon>
                    </Input>
                </FormItem>
                <FormItem prop="passwordConfirm">
                    <Input type="password" v-model="form.passwordConfirm" placeholder="Confirm password">
                        <Icon type="ios-lock-outline" slot="prepend"></Icon>
                    </Input>
                </FormItem>
                <FormItem>
                    <Button :loading="submitFormButtonLoading" type="primary" @click="handleSubmit('form')">Reset Password</Button>
                </FormItem>
            </Form>

        </div>

    </div>
</template>
<script>

import D from 'dottie'

export default {
    components: {},
    data () {
        const validatePassCheck = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('Please enter your password again'));
            } else if (value !== this.form.password) {
                callback(new Error('The two input passwords do not match!'));
            } else {
                callback();
            }
        }

        return {
            modal: {
                show: false,
                loading: true
            },
            form: {
                password: '',
                passwordConfirm: ''
            },
            submitFormButtonLoading: false,
            rules: {
                password: [
                    { required: true, message: 'Please fill in the password.', trigger: 'blur' },
                    { type: 'string', min: 6, message: 'The password length cannot be less than 6 bits', trigger: 'blur' }
                ],
                passwordConfirm: [
                    { validator: validatePassCheck, trigger: 'blur' }
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
                    password: self.form.password,
                    token: self.$route.params.token
                }

                this.AXIOS.post(this.DOMAIN + '/api/v2/login/password/reset', payload).then(response => {
                    if (!response.data.success) {
                        let error = new Error('API operation not successful.')
                        error.reponse = response
                        throw error
                    }
                    self.$store.commit('authenticated', response.data.user)
                    self.$Message.success('Reset is successful!')
                    self.$router.push({name: 'Sales'})

                }).catch(error => {

                    CATCH_ERR_HANDLER(error)
                    this.$Message.error('Unable to reset! Please try again')

                }).then(() => {
                    this.submitFormButtonLoading = false
                })
            })
        }
    },
    created () {
        window.V = this
    }
}
</script>
