export const table1Columns = [
    {
        title: 'S/No',
        type: 'index',
        width: 50,
        align: 'center'
    },
    {
        title: 'Info',
        align: 'center',
        key: 'salesOrderNumber'
    },
    {
        title: 'Sales Amount',
        align: 'center',
        key: 'sales-amount'
    },
    {
        title: 'Add inventory',
        align: 'center',
        key: 'add-inventory'
    },
    {
        title: 'Entry',
        align: 'center',
        key: 'entry'
    },
    {
        title: 'Submit',
        align: 'center',
        width: 120,
        key: 'handle',
        handle: ['submit']
    }
];

const tableData = {
    table1Columns: table1Columns
};

export default tableData;
