const mongoClient   = require( 'mongodb' ).MongoClient
const argon2        = require( 'argon2' )
const dateTime      = require( './dateTime.js' )
const msgSys        = require( './msgSystem.js' )
const token         = require( './token.js' )
const email         = require( './email.js' )
const config        = require( '../assets/config.json' )


/**
 * Manage mongoDB database
 * @class
 */
class Database {
    /**
     * Prepare mongoDB instance
     * @constructor
     * @param {string} [user] account username
     * @param {string} [pwd] account password
     * @param {string} [name] of database
     */
    constructor(user, pwd, name) {
        this.uri = `mongodb://${user}:${pwd}@127.0.0.1:27017/?authSource=${name}&readPreference=primary&appname=MongoDB%20Compass&ssl=false`
        this.name = name
        this.client = new mongoClient( this.uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        } )
    }

    /**
     * Connection to mongoDB
     * @method
     * @returns {Promise<void>} a MongoClient instance
     */
    async connection() {
        await this.client.connect()
        this.db = this.client.db( this.name )
        await msgSys.send( `Open connection to Database "${ this.name }" and get "${ collec }"` )
    }

    /**
     * Get all documents in targeted collection into Array [mongoDB]
     * @method
     * @param {string} [collection] targeted
     * @returns {Promise<Array>} Get all documents in collection
     */
    async getCollection( collection ) {
        await this.connection()
        this.collection = await this.db.collection( collection ).find( ).toArray( )
        return this.collection
        await this.client.close( )
    }

    /**
     * Add new document in specific collection [mongoDB]
     * @param {string} [collection] targeted
     * @param {string} [primaryKey] ex: {key: value} to check if document already exist
     * @param {object} [fields] to create new document
     * @returns {Promise<string>} message for error or success
     */
    async addDocument( collection, primaryKey, fields ) {
        await this.connection()
        this.document = await this.db.collection( collection ).find( primaryKey ).toArray()
        if ( document.length != 0 ){
            return 'already existing document'
        } else {
            await this.db.collection( collection ).insertOne( fields, error => {
                if ( error ) {
                    msgSys.send( error, "error" )
                }
                msgSys.send( `Document ADD with success in ${collection}`, 'success' )
            })
            return 'add document'
        }
    }

}

let db = new Database( config.db.userRW, config.db.pwdRW, config.db.name )
exports.db = db

msgSys.send( 'Database..............READY', 'success' )

// let client
//
// function dbConnect ( dbUser, dbPwd, dbName ) {
//
//     const uri = `mongodb://${dbUser}:${dbPwd}@127.0.0.1:27017/?authSource=${dbName}&readPreference=primary&appname=MongoDB%20Compass&ssl=false`
//
//     client = new mongoClient( uri, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//     } )
//
// }

// async function dbLoad ( dbUser, dbPwd, dbName, dbCollection ) {
//
//     dbConnect( dbUser, dbPwd, dbName )
//
//     try {
//         await client.connect( )
//         msgSys.send( `Open connection to Database "${ dbName }" and get "${ dbCollection.name }"` )
//         const db = client.db( dbName )
//         const collection = await db.collection( dbCollection.name ).find( ).toArray( )
//
//         return collection
//
//     } catch ( e ) {
//         msgSys.send( e, 'error' )
//     } finally {
//         await client.close()
//     }
//
// }

// async function dbLogin ( dbUser, dbPwd, dbName, dbCollection, dbElem ) {
//
//     dbConnect( dbUser, dbPwd, dbName )
//
//     try {
//         await client.connect()
//         const db = client.db( dbName )
//         const document = await db.collection( dbCollection ).find( { email: dbElem.email } ).toArray()
//
//         if ( document.length != 0 ){
//
//             try {
//                 if ( await argon2.verify( document[0].password, dbElem.password ) ) {
//
//                     msgSys.send( `User login "${ document[0]._id }"` )
//
//                     let userData = token.tokenList.add()
//                         .then(e => {
//                             let data = {
//                                 'email': document[0].email,
//                                 'firstname': document[0].firstname,
//                                 'lastname': document[0].lastname,
//                                 'address': document[0].address,
//                                 'postalCode': document[0].postalCode,
//                                 'town': document[0].town,
//                                 'shipping_address': document[0].shipping_address,
//                                 'shipping_postalCode': document[0].shipping_postalCode,
//                                 'shipping_town': document[0].shipping_town,
//                                 'token': e
//                             }
//                             return data
//                         })
//                     return userData
//
//                 } else {
//                     return 'incorrect password'
//                 }
//             } catch ( err ) {
//                 msgSys.send( err, 'error' )
//             }
//         } else {
//             return 'user not found'
//         }
//
//     } catch ( e ) {
//         msgSys.send( e, 'error' )
//     } finally {
//         await client.close( )
//     }
//
// }
//
// async function dbRegister ( dbUser, dbPwd, dbName, dbCollection, dbElem ) {
//
//     dbConnect( dbUser, dbPwd, dbName )
//
//     try {
//         await client.connect(  )
//
//         const db = client.db( dbName )
//         let document = await db.collection( dbCollection ).find( { email: dbElem.email } ).toArray()
//
//         if ( document.length != 0 ){
//
//             return 'email already use'
//
//         } else {
//
//             let sendData = {}
//             let passwordHash = await argon2.hash( dbElem.password )
//             sendData['password'] = passwordHash
//             sendData['email'] = dbElem.email
//             sendData['firstname'] = ''
//             sendData['lastname'] = ''
//             sendData['address'] = ''
//             sendData['postalCode'] = ''
//             sendData['town'] = ''
//             sendData['shipping_address'] = ''
//             sendData['shipping_postalCode'] = ''
//             sendData['shipping_town'] = ''
//
//             db.collection( dbCollection ).insertOne( sendData, err => {
//                 if ( err ) {
//                     msgSys.send( err, "error" )
//                 }
//                 msgSys.send( `New user register`, 'success' )
//             })
//
//             email.email.send( {
//                 email: dbElem.email,
//                 subject: 'Votre inscription sur notre site',
//                 textFile: 'confirmRegister',
//             } )
//
//             return 'register ok'
//
//         }
//
//     } catch ( e ) {
//         msgSys.send( e, 'error' )
//     } finally {
//         await client.close( )
//     }
//
// }
//
// async function dbUpdateUser( dbUser, dbPwd, dbName, dbCollection, dbElem ){
//
//     dbConnect( dbUser, dbPwd, dbName )
//
//     try {
//         await client.connect(  )
//
//         dbElem = JSON.parse( dbElem )
//
//         const db = client.db( dbName )
//         let dataUser = {
//             'email': dbElem.email,
//             'firstname': dbElem.firstname,
//             'lastname': dbElem.lastname,
//             'address': dbElem.address,
//             'postalCode': dbElem.postalCode,
//             'town': dbElem.town,
//             'shipping_address': dbElem.shipping_address,
//             'shipping_postalCode': dbElem.shipping_postalCode,
//             'shipping_town': dbElem.shipping_town,
//         }
//         let document = await db.collection( dbCollection ).findOneAndUpdate(
//             { email: dbElem.email },
//             { $set: dataUser }
//         )
//         msgSys.send( `User edit profil "${document.value._id}"` )
//         return dataUser
//     } catch ( e ) {
//         msgSys.send( e, 'error' )
//     } finally {
//         await client.close( )
//     }
//
// }
//
// async function dbUpdatePassword ( dbUser, dbPwd, dbName, dbCollection, dbElem ) {
//
//     dbConnect( dbUser, dbPwd, dbName )
//
//     try {
//         await client.connect();
//
//         const db = client.db( dbName )
//         const document = await db.collection( dbCollection ).find( { email: dbElem.email } ).toArray()
//
//         if ( document.length != 0 ){
//             try {
//                 if ( await argon2.verify( document[0].password, dbElem.password ) ) {
//
//                     let passwordHash = await argon2.hash( dbElem.newPassword )
//                     let updateDocument = await db.collection( dbCollection ).findOneAndUpdate(
//                         { email: dbElem.email },
//                         { $set: { 'password': passwordHash } }
//                     )
//                     msgSys.send( `User edit password "${updateDocument.value._id}"` )
//                     return 'password updated'
//
//                 } else {
//                     return 'incorrect password'
//                 }
//             } catch ( err ) {
//                 msgSys.send( err, 'error' )
//             }
//         } else {
//             return 'user not found'
//         }
//
//     } catch ( e ) {
//         msgSys.send( e, 'error' )
//     } finally {
//         await client.close( )
//     }
//
// }
//
// async function dbCart( dbUser, dbPwd, dbName, dbCollection, action, userEmail, dbElem ){
//
//     dbConnect( dbUser, dbPwd, dbName )
//
//     try {
//         await client.connect(  )
//
//         const db = client.db( dbName )
//         if( action === 'saveCart' ){
//
//             let data = JSON.parse( dbElem )
//
//             let dataCart = {
//                 'cart': data,
//             }
//             let document = await db.collection( dbCollection ).findOneAndUpdate(
//                 { email: userEmail },
//                 { $set: dataCart }
//             )
//
//         } else if( action === 'getCart' ){
//
//             let document = await db.collection( dbCollection ).find( { email: userEmail } ).toArray( )
//             if( document[0].cart != 'null' ) {
//                 return JSON.stringify( document[0].cart )
//             } else {
//                 return 'cart empty'
//             }
//         }
//
//     } catch ( e ) {
//         msgSys.send( e, 'error' )
//     } finally {
//         await client.close( )
//     }
//
// }
//
// async function dbOrders( dbUser, dbPwd, dbName, dbCollection, action, dbElem ) {
//
//     dbConnect( dbUser, dbPwd, dbName )
//
//     try {
//         await client.connect(  )
//
//         const db = client.db( dbName )
//         if( action === 'createOrders' ){
//
//             let userInfo = await db.collection( 'users' ).find( { email: dbElem } ).toArray( )
//
//             let status = 'inProgress'
//             let cart = userInfo[0].cart
//             let infos = { }
//             for ( let [ k, v ] of Object.entries( userInfo[0] ) )
//                 k != 'password' && k != 'cart' ? infos[k] = v : null
//
//             let dateCreate = await dateTime.get( )
//             let order = {
//                 'status': status,
//                 'cart': cart,
//                 'infos': infos,
//                 'dateCreate': dateCreate,
//                 'datePurchase': ''
//             }
//
//             let document = await db.collection( dbCollection ).insertOne( order, ( err, res ) => {
//                 if ( err ) {
//                     msgSys.send( err, 'error' )
//                 }
//
//                 msgSys.send( `User (${ userInfo[0]._id }) create an order "${ res.insertedId }"`, 'success' )
//             } )
//
//
//             email.email.send( {
//                 email: dbElem,
//                 subject: 'Votre commande sur notre site',
//                 textFile: 'orderInProgress',
//             } )
//
//             return 'order created'
//
//
//         } else if( action === 'editOrders' ){
//
//
//         }
//
//     } catch ( e ) {
//         msgSys.send( e, 'error' )
//     } finally {
//         await client.close( )
//     }
//
// }
//
// module.exports = {
//     dbLoad,
//     dbLogin,
//     dbRegister,
//     dbUpdateUser,
//     dbUpdatePassword,
//     dbCart,
//     dbOrders,
// }