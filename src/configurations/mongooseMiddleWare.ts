export enum MongooseDocumentMiddleware {
    validate = 'validate',
    save = 'save',
    remove = 'remove',
    updateOne = 'updateOne',
    deleteOne = 'deleteOne',
    init = 'init',
}
export enum MongooseQueryMiddleware {
    count = 'count',
    deleteMany = 'deleteMany',
    deleteOne = 'deleteOne',
    distinct = 'distinct',
    find = 'find',
    findOne = 'findOne',
    findOneAndDelete = 'findOneAndDelete',
    findOneAndRemove = 'findOneAndRemove',
    findOneAndUpdate = 'findOneAndUpdate',
    remove = 'remove',
    update = 'update',
    updateOne = 'updateOne',
    updateMany = 'updateMany',
}