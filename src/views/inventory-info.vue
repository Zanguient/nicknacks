<template>
    <div>
        <Spin size="large" fix v-if="spinShow"></Spin>
        <Breadcrumb class="mainBreadCrumb">
            <BreadcrumbItem :to="{ name: 'Inventory' }">Inventory</BreadcrumbItem>
            <BreadcrumbItem>{{ inventory.name }}</BreadcrumbItem>
        </Breadcrumb>

        <h1>Stock level</h1>

        <el-table
            :data="inventory.stock"
            :summary-method="getSummaries"
            show-summary>
            <el-table-column type="index" width="50"></el-table-column>
            <el-table-column prop="name" label="Location"></el-table-column>
            <el-table-column prop="quantity" label="Quantity"></el-table-column>
        </el-table>


        <h1 style="margin-top: 50px;">Timeline</h1>

        <timeline-content :inventory="inventory"></timeline-content>

        <h1 style="margin-top: 50px;">Movment Records</h1>

        <el-table :data="movementRecords">

            <el-table-column type="index" width="50"></el-table-column>

            <el-table-column
                min-width="40"
                prop="source"
                label="Source"
                sortable
                :filters="categoryFilters"
                :filter-method="categoryFilterHandler"
            ></el-table-column>

            <el-table-column width="15" type="expand">
                <template slot-scope="scope">
                    <div v-if="scope.row.source === 'shipment'">
                        <div v-for="product in scope.row.sourceData.data.inventorised">
                            <p><strong>{{ product.name }}</strong></p>
                            <p style="margin-left: 15px;" v-for="(value, key) in product.toInventorise.stores" v-if="parseInt(value.quantity) !== 0">
                                {{ key }}: {{value.quantity}}
                            </p>
                        </div>
                    </div>

                    <h2 style="margin-top: 20px;">All data</h2>
                    <vue-json-pretty
                      :path="'res'"
                      :data="scope.row.sourceData"
                      :deep="0"
                    >
                    </vue-json-pretty>
                </template>
            </el-table-column>

            <el-table-column
                min-width="97"
                label="Info"
            >
                <template slot-scope="scope">
                    <div v-if="scope.row.source === 'shipment'">
                        {{ scope.row.sourceData.name }}
                    </div>
                    <div v-else-if="scope.row.source === 'inventoryTransfer'">
                        {{ scope.row.sourceData.transferReason }}
                    </div>
                    <div v-else-if="scope.row.source === 'discrepancy'">
                        {{ scope.row.sourceData.discrepancyReason }}
                    </div>
                    <div v-else-if="scope.row.source === 'delivery'">
                        {{ scope.row.IDStub}} {{ scope.row.sourceData.details.customerName }}
                    </div>
                    <div v-else-if="scope.row.source === 'inventoryDeleted' || scope.row.source === 'inventoryDeactivated'">
                    </div>
                </template>

            </el-table-column>

            <el-table-column label="Movement">
                <template slot-scope="scope">
                    <div v-if="scope.row.source === 'shipment'">
                        <div v-for="product in scope.row.sourceData.data.inventorised" v-if="parseInt(product.InventoryID) === parseInt(inventory.InventoryID)">
                            <p v-for="(value, key) in product.toInventorise.stores" v-if="parseInt(value.quantity) !== 0">
                                {{ key }} <span style="color: green"><Icon type="md-arrow-up" />{{value.quantity}}</span>
                            </p>
                        </div>
                    </div>
                    <div v-else-if="scope.row.source === 'inventoryTransfer'">
                        <span v-for="transfer in scope.row.sourceData.transfer" v-if="parseInt(transfer.transfer) !== 0">
                            {{transfer.name}}
                            <span v-if="parseInt(transfer.transfer) > 0">
                                <span style="color: green"><Icon type="md-arrow-up" />{{transfer.transfer}}<br></span>
                            </span>
                            <span v-else>
                                <span style="color: red"><Icon type="md-arrow-down" />{{transfer.transfer * -1}}<br></span>
                            </span>
                        </span>
                    </div>
                    <div v-else-if="scope.row.source === 'discrepancy'">
                        <span v-for="adjustment in scope.row.sourceData.adjustments">
                            {{adjustment.storageLocationName}}
                            <span v-if="parseInt(adjustment.adjustment) > 0">
                                <span style="color: green"><Icon type="md-arrow-up" />{{adjustment.adjustment}}<br></span>
                            </span>
                            <span v-else>
                                <span style="color: red"><Icon type="md-arrow-down" />{{adjustment.adjustment * -1}}<br></span>
                            </span>
                        </span>
                        <Tag :color="( scope.row.net > 0 ) ? 'success' : 'error'">Net: {{ scope.row.net }}</Tag>
                    </div>
                    <div v-else-if="scope.row.source === 'delivery'">
                        <span v-for="soldInventory in scope.row.sourceData.soldInventories" v-if="parseInt(soldInventory.InventoryID) === parseInt(inventory.InventoryID)">
                            {{soldInventory.StorageLocationName}} <span style="color: red"><Icon type="md-arrow-down" />{{soldInventory.quantity}}</span>
                        </span>
                    </div>
                    <div v-else-if="scope.row.source === 'inventoryDeleted' || scope.row.source === 'inventoryDeactivated'">
                        <span v-for="stored in scope.row.sourceData.storageLocations">
                            {{stored.name}} <span style="color: red"><Icon type="md-arrow-down" />{{stored.Inventory_Storage.quantity}}</span>
                        </span>
                    </div>
                </template>
            </el-table-column>

            <el-table-column min-width="80" prop="user" label="User"></el-table-column>

            <el-table-column min-width="100" prop="createdAt" label="Date" sortable>
                  <template slot-scope="scope">
                      {{ scope.row.createdAt | timestampToDate }}
                  </template>
            </el-table-column>

        </el-table>

    </div>
</template>
<script>
import axios from 'axios'
import D from 'dottie'
import _ from 'lodash'
import moment from 'moment'


import timelineContent from './components/inventory/timeline-content.vue'

export default {
    components: {
        timelineContent
    },
    data () {

        return {
            spinShow: true,
            inventory: {
                name: String,
                sku: String,
                InventoryID: String,
                timeline: {
                    list: [],
                    hasShortFall: Boolean
                }
            },
            movementRecords: [],
            categoryFilters: []
        }
    },
    methods: {
        categoryFilterHandler (value, row) {
            return row.source.indexOf(value.toLowerCase()) === 0
        },
        getSummaries(param) {
        const { columns, data } = param;
        const sums = [];
        columns.forEach((column, index) => {
          if (index === 0) {
            sums[index] = '';
            return;
          }
          if (index === 1) {
            sums[index] = 'Total quantity';
            return;
          }
          const values = data.map(item => Number(item[column.property]));
          if (!values.every(value => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
              const value = Number(curr);
              if (!isNaN(value)) {
                return prev + curr;
              } else {
                return prev;
              }
            }, 0);
          } else {
            sums[index] = 'N/A';
          }
        });

        return sums;
      }
    },
    created () {

        window.V = this
        var self = this

        axios.get(this.DOMAIN + '/api/v2/inventory/one/audit-log/' + this.$route.params.inventoryID).then(response => {

            if (!response.data.success) {
                let error = new Error('API operation not successful.')
                error.reponse = response
                throw error
            }

            let categoryArray = []
            // split up the skus and get the broad categories
            for(let i=0; i<response.data.data.movementRecords.length; i++) {
                let record = response.data.data.movementRecords[i]
                let source = record.source

                // discrepancy final count
                if (source === 'discrepancy') {
                    let count = 0
                    record.sourceData.adjustments.forEach(adjust => {
                        count += parseInt(adjust.adjustment)
                    })
                    record.net = count
                }

                if(source === 'delivery') {
                    // id
                    record.IDStub = (function(ID) {
                        var stub
                        for(let i=2; i < ID.length; i++) {
                            if(ID[i] === "0") continue;
                            stub = "#" + ID.substring(i, ID.length);
                            break;
                        }
                        return stub
                    })(record.sourceData.salesOrderNumber)
                }


                if (categoryArray.indexOf(source) > -1) continue
                categoryArray.push(source)
            }

            _.sortBy(categoryArray)

            //make categoryArray into filters
            let categoryFilters = []
            for(let i=0; i<categoryArray.length; i++) {
                let cat = categoryArray[i]

                categoryFilters.push({
                    text: cat,
                    value: cat
                })

            }

            console.log(response.data.data)

            this.categoryFilters = categoryFilters
            this.movementRecords = response.data.data.movementRecords
            this.inventory = response.data.data.inventory


        }).catch(CATCH_ERR_HANDLER).then(() => { this.spinShow = false })

    }
}
</script>
