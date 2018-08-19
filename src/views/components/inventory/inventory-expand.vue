<style scoped>
.expand-row{
    margin-bottom: 16px;
}
</style>
<template>
    <Tree :data="row"></Tree>
</template>
<script>
export default {
    props: {
        row: Object
    }
}
</script>
