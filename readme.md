#IMPORTANT: All conventions below are to be strictly adhered to. Non-compliance with the below mentioned conventions will result in severe liver damage.

#Standard error response:

    res.status(400).send({
        success: false, 
        message: 'An error has occurred, please try again.',
        hideMessage: false,
        debug: {
            message: '`nextPage` parameter is not valid.'
            error: [errorObject from the api]
        }
    });`


# Database/Sequelize Conventions

## In brief
O:O, set up a `Parent.hasOne(Child)` AND `Child.belongsTo(Parent)`.

O:M, set up `Parent.hasMany(Child)` AND `Child.belongsTo(Parent)`.

N:M*, set up `Parent.belongsToMany(Child, {through: 'Parent_Child', foreignKey: 'Parent_rowId'})` and `Child.belongsToMany(Parent, {through: 'Parent_Child', foreignKey: 'Child_rowId'})`.


## Table and keys naming conventions

TableNames: PascalCase

keys: camelCase

## Foreignkeys naming convention

Let's face it, all conventions used across anywhere now is confusing. If you retain the name of the key in the child table, it sometimes doesn't make sense. Rename it, it seems to be confusing as to where it came from.

So, follow this, you will never go wrong:

    foreignkeys: TableNameInPascalCase_foreignKeyInCamelCase_(optional)contextualMeaning

Case Example:

    I have a `userID` in the User table.
    I have a Post table. And User can have one on many Posts. I need the `userID` from User table into the Post table.

Solution:

    User_userId_postOwner

##The syntax for setting up relationships. And our conventions
###For O:O, and O:M:

    Parent.hasOne(Child, {foreignKey: 'Parent_childID'});
    Child.belongsTo(Parent, {foreignKey: 'Parent_childID'});

Note that we explicitly defined our foreignKeys to be Parent_childID. This is because we want this PascalCase_camelCase for TableName_keyName convention.

###Many to Many relationship

For a N:M relationship, do this:

    Parent.belongsToMany( Child, {
        as: [Relationship],
        through: [Parent_Child] //this can be string or a model,
        foreignKey: 'Parent_rowId'
    });

    Child.belongsToMany(Parent, {
        as: [Relationship2],
        through: [Parent_Child],
        foreignKey: 'Child_rowId'
    });

## Good read

###Methods gained by hasOne(), hasMany() and belongsTo()/belongsToMany()

To understand why we do the above associations we start off by knowing what are the methods we gain for each model.

###hasOne():
In setting a `Parent.hasOne(Child)`, methods available to `parent` DAO instance:

    parent.getChild,
    parent.setChild,
    parent.addChild,
    parent.createChild,
    parent.removeChild,
    parent.hasChild

###hasMany():
In setting a `Parent.hasMany(Child)`, methods available to `parent` DAO instance:

    parent.getChildren,
    parent.setChildren,
    parent.addChild,
    parent.createChild,
    parent.removeChild,
    parent.hasChild,
    parent.hasChildren


###belongsTo()/belongsToMany:
In setting a `Child.belongsTo(Parent)`, methods available to `child` DAO instance:

    child.getParent,
    child.setParent,
    child.createParent

    //belongsToMany
    child.getParents,
    child.setParents,
    child.createParents
