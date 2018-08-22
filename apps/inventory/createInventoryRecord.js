function createInventoryRecord(t, source, sourceData, user) {
    return DB.InventoryMovement.create({
        source: source,
        sourceData: sourceData,
        user: D.get(user, 'userName') || 'Anonymous' // to remove anonymous once login system is up
    }, {
        transaction: t // same for DB calls "required" from outside, it will be outside of this CLS scoping, need to manually pass `t`
    })
}
module.exports = createInventoryRecord
