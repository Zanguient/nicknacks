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
    <Modal v-model="modalData.show" title="Timeline">
        <h1>{{ modalData.inventory.name }}</h1>
        <p><i>{{ modalData.inventory.sku }}</i></p>


        <timeline-content :inventory="modalData.inventory"></timeline-content>


    </Modal>
</template>
<script>
import D from 'dottie'
import _ from 'lodash'
import timelineContent from './timeline-content.vue'

module.exports = {
    components: {
        timelineContent
    },
    data() {
        return {}
    },
    props: {
        modalData: {
            show: false,
            inventory: {
                name: String,
                sku: String,
                InventoryID: String,
                timeline: {
                    list: [],
                    hasShortFall: Boolean
                }
            }
        }
    },
    computed: {},
    methods: {}
}
</script>
