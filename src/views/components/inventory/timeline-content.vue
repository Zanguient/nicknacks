<style scoped>
    .time{
        font-size: 14px;
        font-weight: bold;
    }
    .content{
        padding-left: 5px;
    }
</style>
<template>



        <Timeline v-if="inventory.timeline">
            <!-- if date = 0 means its the first line of existing stock.
                 else if stock is above 10, show green.
                 below 10 but above 0, show yellow.
                 the rest is red -->
            <TimelineItem
                v-for="(line, index) in inventory.timeline.list"
                :key="'timeline_' + inventory.InventoryID + '_' + index"
                :color="(line.date === 0 || line.stockAvailableAtCurrentDate > 10) ? 'green' : (
                    (line.stockAvailableAtCurrentDate > 0) ? 'yellow' : 'red'
                )">

                <!-- stock -->
                <span v-if="line.date === 0">
                    <p class="time">Now</p>
                    <p class="content">Stock: {{ line.stockAvailableAtCurrentDate }}</p>
                </span>

                <!-- unscheduled deliveries -->
                <span v-else-if="line.date === 9999999999999">
                    <p class="time">Not scheduled</p>
                    <p class="content">
                        Change: {{ line.change }},
                        Stock: {{ line.stockAvailableAtCurrentDate }},
                        Info:
                            <span v-if="line.type==='sales'"><Icon type="ios-cart" /></span>
                            <span v-else-if="line.type==='transit'"><Icon type="ios-boat" /></span>
                            {{ line.info.display }}
                    </p>
                </span>

                <!-- scheduled -->
                <span v-else>
                    <p class="time">{{ line.date | unixToDate }}
                        <Tag v-if="line.isConfirmed" color="green">
                            <span v-if="line.type==='transit'">shipped</span>
                            <span v-else>confirmed</span>
                        </Tag>
                    </p>
                    <p class="content">
                        Change: {{ line.change }},
                        Stock: {{ line.stockAvailableAtCurrentDate }},
                        Info:
                            <span v-if="line.type==='sales'"><Icon type="ios-cart" /></span>
                            <span v-else-if="line.type==='transit'"><Icon type="ios-boat" /></span>
                            {{ line.info.display }}
                    </p>
                </span>

            </TimelineItem>
        </Timeline>

</template>
<script>
import D from 'dottie'
import _ from 'lodash'

module.exports = {
    data() {
        return {}
    },
    props: {
        inventory: {
            name: String,
            sku: String,
            InventoryID: String,
            timeline: {
                list: [],
                hasShortFall: Boolean
            }
        }
    },
    computed: {},
    methods: {}
}
</script>
