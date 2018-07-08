<style lang="less">
    @import '../../styles/common.less';
    @import './components/table.less';
</style>

<template>
    <div>
        <Row class="margin-top-10">
            <Col span="24">
                <Card>
                    <div class="edittable-con-1">
                        <can-edit-table refs="table1" @on-submit="submit" v-model="tableData" :columns-list="columnsList"></can-edit-table>
                    </div>
                </Card>
            </Col>
        </Row>
    </div>
</template>

<script>
import canEditTable from './components/canEditTable.vue';
import tableData from './components/table_data.js';
import axios from 'axios';
export default {
    name: 'sales-receipt',
    components: {
        canEditTable
    },
    data () {
        return {
            columnsList: [],
            tableData: []
        };
    },
    methods: {
        getData () {
            this.columnsList = tableData.table1Columns;
        },
        handleNetConnect (state) {
            this.breakConnect = state;
        },
        handleLowSpeed (state) {
            this.lowNetSpeed = state;
        },
        getCurrentData () {
            this.showCurrentTableData = true;
        },
        submit (val, index) {
            this.$Message.success('删除了第' + (index + 1) + '行数据');
        },
        handleCellChange (val, index, key) {
            this.$Message.success('修改了第 ' + (index + 1) + ' 行列名为 ' + key + ' 的数据');
        },
        handleChange (val, index) {
            this.$Message.success('修改了第' + (index + 1) + '行数据');
        }
    },
    created () {
        //let domain = process.env.API_DOMAIN
//alert(process.env.API_DOMAIN)
        let domain = 192.168.86.25:3000

        this.getData()

        axios.get(domain + '/api/v2/sales-receipt/pending-sales-receipt/all').then(response => {
            if (!response.data.success) alert(response.data.message)
            console.log(response.data.data)
            this.tableData = response.data.data
        }).catch(error => {
            alert(error)
        });
    }
};
</script>
