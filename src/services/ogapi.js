/**
 *
 * ogclient.js
 *
 * Client Service portion of the show
 *
 * ogAPI rewritten for Bellini/Blueline Architecture
 * ES6 module version
 *
 * December 2017
 *
 *
 **/

import * as OGSystem from '../system/ogsystem'
import Promise from 'bluebird'

/**
 * Returns object.data | Helper with chaining Angular $http
 *
 * @param {Object} response
 * @returns response.data
 */
function stripData( response ) {
    return response.data;
}

// unique name, like io.ourglass.cralwer
let _appName;
// The above is called appId everywhere else, so we support both in here until we can clean up!
let _appId;
let _appType;

let _deviceUDID;
let _jwt;
let _venueUUID;

let _userPermissions;
let _user;

let _lockKey;

// Callbacks
let _deviceDataCb;
let _venueDataCb;

// Message callback when a DM is sent from BL
let _appMsgCb, _sysMsgCb, _venueMsgCb;

// Database IDs
let _deviceModelDBId, _venueModelDBId;

// The actual models
let _deviceModel, _venueModel;


export default class ogAPI {

    constructor( $http, $log, $interval, $rootScope ) {

        $log.debug( 'OurglassAPIService constructing' );
        this.$http = $http;
        this.$log = $log;
        this.$interval = $interval;
        this.$rootScope = $rootScope;

        const ogsystem = OGSystem.getOGSystem();
        _deviceUDID = ogsystem.udid;

        _jwt = ogsystem.jwt;
        if ( _jwt ) {
            $http.defaults.headers.common.Authorization = 'Bearer ' + _jwt;
        }

        _venueUUID = ogsystem.venue;

        // Socket IO setup

        io.socket.on( "connect", () => {
            $log.debug( "(Re)Connecting to websockets rooms" );
            // joinDeviceAppRoom();
            // subscribeToAppData();
        } );

        // Received appdata change from cloud (either APP+DEVICE or APP+VENUE)
        io.socket.on( 'appdata', ( data ) => {

            // The custom broadcast calls in AppDataController pull off one of the "datas"
            // The 'previous' field is only on the blueprint generated callbacks
            let modelData = data.previous ? data.data.data : data.data;

            if ( data.id == _deviceModelDBId ) {

                $log.debug( "Received an A+D model update" );
                _deviceModel = modelData;
                if ( _deviceDataCb ) {
                    this.$rootScope.$apply( () => {
                        _deviceDataCb( _deviceModel );
                        this.$log.debug( 'Device AppData change for ' + _deviceModel );
                    } );
                } else {
                    this.$log.warn( 'Dropping sio device data change rx (no cb):' + JSON.stringify( data ) );
                }
            } else if ( data.id === _venueModelDBId ) {

                $log.debug( "Received an A+V model update" );
                _venueModel = modelData;
                if ( _venueDataCb ) {
                    $rootScope.$apply( () => {
                        _venueDataCb( _venueModel );
                        this.$log.debug( 'Venue AppData change for ' + _venueModel );
                    } );
                } else {
                    this.$log.warn( 'Dropping sio venue data change rx (no cb):' + JSON.stringify( data ) );
                }

            } else {
                this.$log.error( "Got a data SIO update and it is for an unknown DB Id!!" );
            }


        } );


    }

    getUserForJwt() {

        if ( !_jwt ) {
            return Promise.resolve( {
                firstName:   'Petro',
                lastName:    'McPatron',
                mobilePhone: '408-555-1212'
            } )
        }

        return this.$http.post( '/user/coreuserfortoken', { jwt: _jwt } )
            .then( stripData );

    }

    checkForFauxJwt() {

        if ( !_jwt ) {
            this.$log.debug( "No jwt, no permissions" );
            return Promise.resolve( { manager: false, owner: false, anymanager: false } );
        }

        if ( _jwt === 'oooo' ) {
            this.$log.debug( 'Faux owner jwt for testing' );
            return Promise.resolve( { manager: true, owner: true, anymanager: true } );
        }

        if ( _jwt === 'mmmm' ) {
            this.$log.debug( 'Faux manager jwt for testing' );
            return Promise.resolve( { manager: true, owner: false, anymanager: true } );
        }

        return null;
    }

    getUsersPermissionsForThisDevice() {

        const permissions = this.checkForFauxJwt();

        if ( permissions !== null ) return permissions;

        // There are no fake permissions, get real ones
        return this.$http.post( '/user/isusermanager', { jwt: _jwt, deviceUDID: _deviceUDID } )
            .then( stripData )
    }


    /**
     * Checks user level
     * Queries /user/coreuserfortoken and /user/isusermanager
     *
     * @returns {Promise<Object>}
     */
    checkUserLevel() {

        const permissions = this.checkForFauxJwt();
        if ( permissions !== null ) return permissions;

        // TODO
        return this.getUserForJwt()
            .then( ( user ) => {
                _user = user;
            } )
            .then( this.getUsersPermissionsForThisDevice )
            .then( ( permissions ) => {
                _userPermissions = permissions;
                return permissions;
            } )
            .catch( ( err ) => {
                this.$log.error( "Problem checking permissions. " + err.message );
                return Promise.resolve( { manager: false, owner: false, anymanager: false } ); // swallow for now
            } );
    }

    /**
     * update device model
     *
     * @param {Object} newData
     * @returns {Object} deviceModel
     */
    updateModel( newData ) {
        _deviceModel = newData;
        if ( _deviceDataCb ) _deviceDataCb( _deviceModel );
        return _deviceModel;
    }

    // static synonym
    static updateDeviceModel( newData ){
        _deviceModel = newData;
        if ( _deviceDataCb ) _deviceDataCb( _deviceModel );
        return _deviceModel;
    }

    /**
     * Gets the data for either venue or device
     * @param {boolean} [getVenue=false]  false means get device data
     */
    getDataForApp( getVenue ) {
        if ( getVenue ) {
            return this.$http.get( '/appmodel/' + _appId + '/venue' )
                .then( stripData )
                .then( stripData ); // conveniently the object goes resp.data.data
        } else {
            return this.$http.get( '/appmodel/' + _appId + '/' + _deviceUDID )
                .then( stripData )
                .then( stripData ); // conveniently the object goes resp.data.data
        }
    }

    /**
     * Someone should implement this locking one day on the server one day
     *
     * @returns
     */
    getDataForAppAndLock() {
        return this.$http.get( API_PATH + 'appdata/' + _appId + "?lock" )
            .then( stripData );
    }

    /**
     * Join device into app room
     *
     * @returns {Promise} promise if a socket posting room: appID+deviceID
     */
    joinDeviceAppRoom() {

        const roomId = _appId + ':' + _deviceUDID;

        io.socket.on( roomId, ( data ) =>  {

            if ( _appMsgCb ) {
                this.$rootScope.$apply(  () => {
                    _appMsgCb( data );
                } );
            } else {
                this.$log.debug( 'Dropping app message rx (no cb)' );
            }

        } );


        return new Promise( ( resolve, reject )=> {

            io.socket.post( '/socket/join', {
                room: roomId
            },  ( resData, jwres ) => {
                this.$log.debug( resData );
                if ( jwres.statusCode !== 200 ) {
                    reject( jwres );
                } else {
                    this.$log.debug( "Successfully joined room for this device" );
                    resolve();
                }
            } );
        } );

    };


    // System messages are always sent by the server and are things like "channel change", "move to new spot on screen"
    joinSystemMsgRoom() {

        // Received direct message from cloud
        io.socket.on( 'sysmsg:' + _deviceUDID, ( data ) => {
            if ( _sysMsgCb ) {
                this.$rootScope.$apply( () => {
                    _sysMsgCb( data );
                } );
            } else {
                console.log( 'Dropping sio DEVICE_DM message rx (no cb)' );
            }
        } )

        return new Promise( ( resolve, reject ) => {

            io.socket.post( '/ogdevice/subSystemMessages', {
                deviceUDID: _deviceUDID
            },  ( resData, jwres ) => {
                this.$log.debug( resData );
                if ( jwres.statusCode !== 200 ) {
                    reject( jwres );
                } else {
                    this.$log.debug( "Successfully joined sysmsg room for this device" );
                    resolve();
                }
            } );
        } );

    }

    /**
     * Join venue room
     *
     * @returns {Promise}
     */
    joinVenueMsgRoom() {

        const roomId = 'venue_' + _venueUUID;

        io.socket.on( roomId, ( data ) => {

            if ( _venueMsgCb ) {
                this.$rootScope.$apply( () => {
                    _venueMsgCb( data );
                } );
            } else {
                this.$log.debug( 'Dropping venue message rx (no cb)' );
            }

        } );


        return new Promise( ( resolve, reject ) => {

            io.socket.post( '/venue/joinroom', {
                venueUUID: _venueUUID
            }, ( resData, jwres ) => {
                this.$log.debug( resData );
                if ( jwres.statusCode !== 200 ) {
                    reject( jwres );
                } else {
                    this.$log.debug( "Successfully joined room for this venue" );
                    resolve();
                }
            } );
        } );

    };

    /**
     *
     *
     * @returns { venue: venueData, device: deviceData }
     */
    subscribeToAppData() {

        return new Promise( ( resolve, reject ) => {
            io.socket.post( '/appdata/subscribe', {
                deviceUDID: _deviceUDID,
                appid:      _appId
            }, ( resData, jwres ) => {
                console.log( resData );
                if ( jwres.statusCode !== 200 ) {
                    reject( jwres );
                } else {
                    this.$log.debug( "Successfully subscribed to appData" );
                    let rval = {};
                    resData.forEach( ( d ) => {
                        if ( d.forDeviceUDID === 'venue' ) {
                            _venueModelDBId = d.id;
                            rval.venue = d && d.data;
                        }
                        else {
                            _deviceModelDBId = d.id;
                            rval.device = d && d.data;
                        }
                    } );
                    resolve( rval );
                }
            } );
        } );
    }

    /**
     * Initialization function.
     *
     * @param {any} params required
     * @returns
     */

    init( { appType, appName, appId, deviceModelCallback, venueModelCallback,
            appMsgCallback, sysMsgCallback, venueMsgCallback } ) {

        // Check the app type
        if ( !appType ) {
            throw new Error( "appType parameter missing and is required." );
        }

        _appType = appType;
        this.$log.debug( "Init called for app type: " + _appType );

        // The below is in the constructor
        //_deviceUDID = OGSystem.getOGSystem().udid;


        // Check the app name
        if ( !appName && !appId ) {
            throw new Error( "appId parameter missing and is required." );
        }

        if ( appName )
            console.log( "%c appName parameter is deprecated and is now appId. Fix it in your code!", "background-color: #cb42f4; color: #fff;" );

        _appName = appId || appName;
        _appId = _appName;

        this.$log.debug( "Init for app: " + _appId );

        _deviceDataCb = deviceModelCallback;

        if ( !_deviceDataCb )
            this.$log.warn( "You didn't specify a deviceModelCallback, so you won't get one!" );


        _venueDataCb = venueModelCallback;

        if ( !_venueDataCb )
            this.$log.warn( "You didn't specify a venueModelCallback, so you won't get one!" );


        _appMsgCb = appMsgCallback;
        if ( !_appMsgCb )
            this.$log.warn( "You didn't specify an appMsgCallback, so you won't get one!" );

        _sysMsgCb = sysMsgCallback;
        if ( !_sysMsgCb )
            this.$log.warn( "You didn't specify a sysMsgCallback, so you won't get one!" );

        _venueMsgCb = venueMsgCallback;
        if ( !_venueMsgCb )
            this.$log.warn( "You didn't specify a venueMsgCallback, so you won't get one!" );

        return this.$http.post( '/appmodel/initialize', { appid: _appId, deviceUDID: _deviceUDID } )
            .then( stripData )
            .then(  ( model ) => {
                this.$log.debug( "ogAPI: Model data init complete" );
                this.$log.debug( "ogAPI: Subscribing to model changes" );
                return this.subscribeToAppData();
            } )
            .then( ( initialData ) => {
                _deviceModel = initialData.device;
                _venueModel = initialData.venue;
                this.$log.debug( "ogAPI: Subscribing to messages" );

                let p = [];

                if ( _appMsgCb ) p.push( this.joinDeviceAppRoom() );
                if ( _sysMsgCb ) p.push( this.joinSystemMsgRoom() );
                if (_venueMsgCb ) p.push( this.joinVenueMsgRoom());

                return Promise.all( p );
            } )
            .then( () => {
                this.$log.debug( "Checking user level for this device" );
                if ( _appType === 'mobile' ) {
                    return this.checkUserLevel();
                } else {
                    return "TV APP";
                }
            } )
            .then( ( userLevel ) => {
                this.$log.debug( "User level: " + userLevel );
                return { device: _deviceModel, venue: _venueModel };
            } );
    }

    /**
     * Sends a message to the socket with the url and wrapped message
     *
     * @param {String} url
     * @param {Object} message
     * @returns
     */
    sendSIOMessage( url, message ) {
        const wrappedMessage = { deviceUDID: _deviceUDID, message: message };
        return new Promise( ( resolve, reject ) => {
            io.socket.post( url, wrappedMessage, ( resData, jwRes )=> {
                if ( jwRes.statusCode !== 200 ) {
                    reject( jwRes );
                } else {
                    resolve( { resData: resData, jwRes: jwRes } );
                }
            } );

        } );
    }

    /**
     * sends a put request to a socket io. Pass in url and params for it to send
     *
     * @param {String} url
     * @param {any} params
     * @returns {Promise}
     */
    sioPut( url, params ) {
        return new Promise( ( resolve, reject ) => {
            io.socket.put( url, params, ( resData, jwRes ) => {
                if ( jwRes.statusCode !== 200 ) {
                    reject( jwRes );
                } else {
                    resolve( { resData: resData, jwRes: jwRes } );
                }
            } );

        } );
    }

    /**
     * Send SIO message to /ogdevice/dm
     *
     * @param {String} message
     * @returns
     */
    sendMessageToDeviceRoom ( message ) {
        // NOTE must have leading slash!
        return this.sendSIOMessage( '/ogdevice/message', message );
    }

    /**
     * Sends a message to a venue room (/venue/dm)
     *
     * UNFUCKING TESTED, HOMIE!!!
     *
     * @param {Object} message
     * @returns
     */
    sendMessageToVenueRoom ( message ) {
        // NOTE must have leading slash!

        return new Promise( ( resolve, reject ) => {
            io.socket.post( '/venue/message', { venueUUID: _venueUUID, message: message}, ( resData, jwRes ) => {
                if ( jwRes.statusCode !== 200 ) {
                    reject( new Error('Bad return status code: '+ jwRes );
                } else {
                    resolve( { resData: resData, jwRes: jwRes } );
                }
            } );

        } );
    };

    sendMessageToAppRoom ( message, includeMe ) {
        const room = _appId + ':' + _deviceUDID;
        return this.sioPut( '/socket/send', { room: room, message: message, echo: includeMe } );
    };

    /**
     * Returns _userPermissions variable
     *
     * @return {any} Promise
     */
    getPermissionsPromise() {
        return this.getUsersPermissionsForThisDevice();
    };

    /**
     * @deprecated
     * @returns {Object}
     */
    getPermissions() {
        return _userPermissions;
    }

    /**
     * Gets user
     *
     * @returns {Object} Promise
     */
    getUserPromise() {
        return this.getUserForJwt();
    };

    /**
     * @deprecated
     * @returns {Object}
     */
    getUser() {
        return _user;
    }

    // TWITTER

    /**
     * Queries the socialscrape result controller for information about social scraping
     *
     * @returns {Promise<Object>} Data from socialscrape result
     */
    getTweets() {
        return this.$http.get( '/socialscrape/result?deviceUDID=' + _deviceUDID + '&appId=' + _appId )
            .then( stripData );
    };


    /**
     * Queries the socialscrape channeltweets controller for information about a channel's tweets
     *
     * @returns {Promise<Object>}
     */
    getChannelTweets() {
        return this.$http.get( '/socialscrape/channeltweets?deviceUDID=' + _deviceUDID )
            .then( stripData );
    };

    /**
     * Posts to /socialscrape/add with queryString, deviceUDID, and appID
     *
     * @param {any} paramsArr
     * @returns {Promise} promiseResolveReject
     */
    updateTwitterQuery( paramsArr ) {
        var query = paramsArr.join( '+OR+' );
        return this.$http.post( '/socialscrape/add', {
            queryString: query,
            deviceUDID:  _deviceUDID,
            appId:       _appId
        } );
    };


    // updated for BlueLine
    // TODO replace with socketIO?
    // Is this even used?? 12-2017
    /**
     * HTTP Put to save appmodel for appid and deviceUDID
     * This is where we'd want to look at saving based on venueUDID instead
     * @deprecated
     * @returns {Promise}
     */
    saveHTTP() {
        return this.$http.put( '/appmodel/' + _appId + '/' + _deviceUDID, { data: service.model } )
            .then( stripData )
            .then(  ( data ) => {
                this.$log.debug( "ogAPI: Model data saved via PUT" );
                //updateModel( data[0] )
            } );
    };

    // Helper
    saveDeviceModel() {
        return this.save( 'device' );
    };

    // Helper
    saveVenueModel() {
        return this.save( 'venue' );
    };

    saveAll() {
        return Promise.all( [ this.saveDeviceModel(), this.saveVenueModel() ] );
    };

    /**
     * Calls sioPut to save appmodel, appId, and deviceUDID
     *
     * @returns {Promise}
     */
    save( scope ) {

        if ( scope && [ 'device', 'venue' ].indexOf( scope ) < 0 ) {
            throw new Error( '"device" and "venue" are the only valid scopes, chief.' );
        }

        scope = scope || "device"; // default for backwards compat

        const payload = {
            data:  ( scope === "device" ) ? _deviceModel : _venueModel,
            scope: scope
        };

        return this.sioPut( '/appmodel/' + _appId + '/' + _deviceUDID, payload )
            .then( ( data ) => {
                this.$log.debug( "ogAPI: " + scope + " model data saved via si PUT" );
                return data.resData;
            } );
    };


    /**
     * Loads model by calling getDataForApp and then updateModel
     *
     * @returns {Promise}
     */
    loadModel( getVenue ) {
        if ( getVenue ) {
            return this.getDataForApp( 'venue' )
                .then( this.updateModel );
        } else {
            return this.getDataForApp()
                .then( this.updateModel );
        }
    };

    get deviceModel() {
        return _deviceModel;
    }

    set deviceModel(newValue) {
        _deviceModel = newValue;
    }

    get venueModel() {
        return _venueModel;
    }

    set venueModel( newValue ) {
        _venueModel = newValue;
    }

    /**
     * Updates the model and tries to aquire lockkey. Currently doesn't do anything
     * TODO implement model locking on Bellini side...
     *
     * @returns {Promise} HttpPromise
     */
    loadModelAndLock () {
        return this.getDataForAppAndLock()
            .then( ( model ) => {
                if ( !model.hasOwnProperty( 'lockKey' ) )
                    throw new Error( "Could not acquire lock" );

                _lockKey = model.lockKey;
                model.lockKey = undefined;
                return model;
            } )
            .then( this.updateModel );
    };


    // App Control

    /**
     * performs a post to the move endpoint for either the current app or the appid that is passed in
     *
     * @param {any} appid the app to move, if not included, then move the _appId
     * @returns {Promise} HttpPromise
     */
    move( appid ) {
        appid = appid || _appId;
        return this.$http.post( '/ogdevice/move', { deviceUDID: _deviceUDID, appId: appid } )
            .then( stripData )
            .then( ( d ) => {
                this.$rootScope.$broadcast( '$app_state_change', { action: 'move', appId: appid } );
                return d;
            } )
            .catch( ( err ) => {
                this.$log.info( "App move FAILED for: " + appid );
                this.$rootScope.$broadcast( '$app_state_change_failure', { action: 'move', appId: appid } );
                throw err; // Rethrow
            } );
    };

    /**
     * performs a post to the launch endpoint for either the current app or the appid that is passed in
     *
     * @param {String} appid the app to move, if not included, then move the _appId
     * @returns {Promise} HttpPromise
     */
    launch( appid ) {

        appid = appid || _appId;
        return this.$http.post( '/ogdevice/launch', { deviceUDID: _deviceUDID, appId: appid } )
            .then( stripData )
            .then( ( d ) => {
                this.$log.info( "App launch successful for: " + appid );
                this.$rootScope.$broadcast( '$app_state_change', { action: 'launch', appId: appid } );
                return d;
            } )
            .catch( ( err ) => {
                this.$log.info( "App launch FAILED for: " + appid );
                this.$rootScope.$broadcast( '$app_state_change_failure', { action: 'launch', appId: appid } );
                throw err; // Rethrow
            } );
    };

    /**
     * performs a post to the kill endpoint for either the current app or the appid that is passed in
     * @param [appid] the app to move, if not included, then move the _appId
     * @returns {HttpPromise}
     */
    kill( appid ) {
        appid = appid || _appId;
        //should be able to return the promise object and act on it
        return this.$http.post( '/ogdevice/kill', { deviceUDID: _deviceUDID, appId: appid } )
            .then( stripData )
            .then( ( d ) => {
                this.$rootScope.$broadcast( '$app_state_change', { action: 'kill', appId: appid } );
                return d;
            } )
            .catch(( err ) => {
                this.$log.info( "App kill FAILED for: " + appid );
                this.$rootScope.$broadcast( '$app_state_change_failure', { action: 'kill', appId: appid } );
                throw err; // Rethrow
            } );
    };

    /**
     * Relocate window.location.href to control app
     *
     * @param {Object} app
     */
    relocToControlApp( app ) {

        this.logUserInteraction( { interaction: "CONTROL_APP", meta: { appid: app.appId } } );

        window.location.href = '/appcontrol/' + app.appId + '/' +
            _deviceUDID + '?jwt=' + _jwt || '*' + '?displayName=' + app.displayName;
    };

    /**
     * posts up an SMS message request
     *
     * @param {any} phoneNumber
     * @param {any} message
     * @returns {Promise<Object>}
     */
    sendSMS( phoneNumber, message ) {
        return this.$http.post( '/ogdevice/sms', {
            phoneNumber: phoneNumber,
            message:     message,
            deviceUDID:  _deviceUDID
        } );
    };

    // TODO: is this used anywhere?
    /**
     * @deprecated
     * @param email should be { to: emailAddr, emailbody: text }
     * @returns {HttpPromise}
     */
    sendSpam( email ) {
        return this.$http.post( API_PATH + 'spam', email );
    };


    // New methods for BlueLine Architecture

    /**
     * Gets the DB model for this device
     *
     * @returns {Promise<Object>}
     */
    getOGDeviceModel() {
        return this.$http.get( '/ogdevice/findByUDID?deviceUDID=' + _deviceUDID )
            .then( stripData );
    }

    getOGSystem(){
        return OGSystem.getOGSystem();
    }

    /**
     * Gets the current program per Bellini
     * Returns something like:
     * "currentProgram": {
             *  "channelNumber": "269",
             *  "episodeTitle": "Titanic Pawn",
             *  "networkName": "HISTHD",
             *  "programId": "25980234",
             *  "title": "Pawn Stars"
             *  }
     */
    getCurrentProgram() {
        return this.getOGDeviceModel()
            .then( ( device ) => {
                return device.currentProgram;
            } )
    };

    // TODO: Exact dupe of above. Used?
    /**
     * Gets the current program per Bellini
     */
    getOGDevice() {
        return this.getOGDeviceModel();
    };

    /**
     * Returns _deviceUDID
     *
     * @returns {_deviceUDID}
     */
    getDeviceUDID() { return _deviceUDID; };


    // TV Control and Guide Stuff


    /**
     * Returns striped data from /pgs/grid
     *
     * @returns {Promise<Object>}
     */
    getGrid() {
        return this.$http.get( '/pgs/grid?deviceUDID=' + _deviceUDID )
            .then( stripData );
    };

    /**
     * Changes the channel by making a post to /ogdevice/changechannel
     *
     * @param {number} channelNum
     * @returns
     */
    changeChannel( channelNum ) {
        return this.$http.post( '/ogdevice/changechannel?deviceUDID=' + _deviceUDID
            + '&channel=' + channelNum )
            .then( stripData );
    };

    /**
     * Figures out what channel is currently running and calls getGridForChannel
     *
     * @returns promise for {Object} channel listings
     */
    getGridForCurrentChannel() {

        return this.getCurrentProgram()
            .then( ( program ) => {
                const channel = program.channelNumber; // could be undefined
                if ( !channel ) return Promise.resolve(); // dump out a bag of undef
                return this.getGridForChannel( channel );
            } );

    };

    /**
     * Gets the grid for a channel
     * Does an http call to listingsforchannel and strips the data
     *
     * @param {number} channelNum
     * @returns {Object} channel listings
     */
    getGridForChannel( channelNum ) {

        return this.$http.get( '/pgs/listingsforchannel?deviceUDID=' + _deviceUDID
            + '&channel=' + channelNum )
            .then( stripData );

    };

    // TODO: WTF Is the method below?
    /**
     * Checks if a device is paired by querying getOGSystem
     *
     * @returns {Function} getOGSystem();
     */
    pairedSTB() {
        return OGSystem.getOGSystem();
    };


    /**
     * Interaction must be of the form { interaction: "STRING", meta: { obj }}
     * Fire and forget.
     * @param interaction
     */
    logUserInteraction( interaction ) {
        const postData = _.assignIn( { deviceUDID: _deviceUDID, venueUUID: OGSystem.getOGSystem().venue },
            interaction );
        this.$http.post( '/userinteraction/log', { userId: _user.id, logdata: postData } )
            .then( () => {
                this.$log.debug( "User interaction recorded" );
            } )
            .catch( ( err ) => {
                this.$log.error( "Failed to record user interaction, oh well oh well" );
            } );
    };

    /**
     * This method bounces a GET off of Bellini-DM as a proxy. Use this
     * instead of trying to GET right from a service to avoid CORS fails.
     * This will only work if no authorization header stuff is needed for
     * the call performed by the server.
     *
     * @param {String} url
     */
    proxyGet( url ) {
        return this.$http.get( '/proxy/get?url=' + url )
            .then( stripData );
    };


}

ogAPI.$inject = [ '$http', '$log', '$interval', '$rootScope', ];