<style scoped>
.layout{
    border: 1px solid #d7dde4;
    background: #f5f7f9;
    position: relative;
    border-radius: 4px;
    overflow: hidden;
}
.layout-nav{
    width: 420px;
    margin: 0 auto;
    margin-right: 20px;
}
.ivu-icon {
    margin-right: 2px;
}
.ivu-menu-horizontal .ivu-menu-item {
    padding: 0 5px;
}
</style>
<template>
    <div class="layout">
        <Layout>
            <Header :style="{padding: '0 5px'}">
                <Menu mode="horizontal" theme="dark" active-name="1">
                    <div class="layout-nav">
                        <MenuItem name="1">
                            <Icon type="ios-cart"></Icon>
                            Sales
                        </MenuItem>
                        <MenuItem name="2" >
                            <Icon type="bag" ></Icon>
                            Delivery
                        </MenuItem>
                        <MenuItem name="3">
                            <Icon type="cube" ></Icon>
                            Inventory
                        </MenuItem>
                        <MenuItem name="4" >
                            <Icon type="android-boat" ></Icon>
                            Shipment
                        </MenuItem>
                    </div>
                </Menu>
            </Header>
            <Content :style="{padding: '5px'}">
                <Breadcrumb :style="{margin: '5px'}">
                    <BreadcrumbItem>Sales receipts</BreadcrumbItem>
                </Breadcrumb>

                <Card v-for="salesReceipt in salesReceipts" :key="salesReceipt.salesOrderNumber" style="width: 100%; max-width:780px;">
                    <p slot="title">
                        <Icon type="ios-film-outline"></Icon>
                        {{ salesReceipt.salesOrderNumber }}
                    </p>

                    <Row>
                        <Col :xs="24" :sm="12">
                            <p><Icon type="person"></Icon> {{ salesReceipt.customer.name }}</p>
                            <p><Icon type="email"></Icon> {{ salesReceipt.customer.email }}</p>
                            <p><Icon type="ios-telephone"></Icon> {{ salesReceipt.customer.phone }}</p>
                            <p style="margin-bottom: 5px;"><Icon type="card"></Icon> {{ salesReceipt.paymentMethod }}</p>
                        </Col>
                        <Col :xs="24" :sm="12">
                            <Card style="max-width: 100%;">
                                <p slot="title">
                                    <Icon type="ios-film-outline"></Icon>
                                    Product(s) sold
                                </p>

                                <a href="#" slot="extra" @click.prevent="addInventory">
                                    <Icon type="plus"></Icon>
                                    Add
                                </a>
                            </Card>
                        </Col>
                    </Row>

                    <Form :model="form" :label-width="80">
                        <FormItem label="COGS">
                            <Input v-model="form.COGS" placeholder=""></Input>
                        </FormItem>
                        <FormItem label="Comments">
                            <Input v-model="form.comments" placeholder=""></Input>
                        </FormItem>

                        <FormItem>
                            <Button type="primary">Submit</Button>
                        </FormItem>
                    </Form>



                </Card>
            </Content>
        </Layout>
    </div>
</template>
<script>
import axios from 'axios'

export default {
    data () {
        return {
            form: { COGS: 0, comments: '' },
            salesReceipts: []
        }
    },
    methods :{
        addInventory() {
            alert('Open a modal to add inventories.')
        }
    },
    created () {
        //let domain = process.env.API_DOMAIN
        //alert(process.env.API_DOMAIN)
        let domain = 'http://192.168.86.25:3000'

        axios.get(domain + '/api/v2/sales-receipt/pending-sales-receipt/all').then(response => {
            if (!response.data.success) alert(response.data.message)
            console.log(response.data.data)
            this.salesReceipts = response.data.data
        }).catch(error => {
            alert(error)
        });
    }
}
</script>
