require( './control.scss' );

class Controller {
    constructor( $log, ogAds, ogAPI ) {

        this.$log = $log;
        this.$log.debug( 'loaded Control Controller.' );
        this.ogAds = ogAds;
        this.ogAPI = ogAPI;

        this.deviceModelUpdate = this.deviceModelUpdate.bind( this );
        this.venueModelUpdate = this.venueModelUpdate.bind( this );
        this.appMsgCallback = this.appMsgCallback.bind( this );
        this.sysMsgCallback = this.sysMsgCallback.bind( this );

        this.ogAPI.init( {
            appType:             'mobile',
            appId:               'io.ourglass.widgettest',
            deviceModelCallback: this.deviceModelUpdate,
            venueModelCallback:  this.venueModelUpdate,
            appMsgCallback:      this.appMsgCallback,
            sysMsgCallback:      this.sysMsgCallback
            } )
            .then( ( modelData ) => {
                this.deviceModel = modelData.device;
                this.venueModel = modelData.venue;
            } )
            .catch( ( err ) => {
                this.$log.error( 'Calling init failed!' );
                this.$log.error( err.data.error );
            } );



    }


    $onInit() {
        this.$log.debug( 'In $onInit' );
    }


    $onDestroy() {
        this.$log.debug( 'In $onDestroy' );
    }

    deviceModelUpdate( model ) {
        this.deviceModel = model;
    }

    venueModelUpdate( model ) {
        this.venueModel = model;
    }

    appMsgCallback( data ) {

    }

    sysMsgCallback( data ) {

    }

    changeDeviceData() {
        this.ogAPI.deviceModel = this.newDeviceData;
        this.ogAPI.save()
            .then(()=>{
                this.$log.debug('Device model saved');
            })
    }

    changeVenueData(){
        this.ogAPI.venueModel = this.newVenueData;
        this.ogAPI.save('venue')
            .then( () => {
                this.$log.debug( 'Venue model saved' );
            } )
    }

    sendAppMsg(){
        this.ogAPI.sendMessageToAppRoom(this.appMsg);
    }

    sendVenueMsg(){
        this.ogAPI.sendMessageToVenueRoom( this.venueMsg );
    }

    // injection here
    static get $inject() {
        return [ '$log', 'ogAds', 'ogAPI' ];
    }
}

export const name = 'controlComponent';

const Component = {
    $name$:       name,
    bindings:     {},
    controller:   Controller,
    controllerAs: '$ctrl',
    template:     `
            <div class="row">
                <div class="col-sm-2">
                    <button class="btn btn-success" style="width: 100%;"
                    ng-click="$ctrl.changeDeviceData()">Change Device Data</button>
                </div>
                <div class="col-sm-4">
                    <input ng-model="$ctrl.newDeviceData" style="width: 100%;"/>
                </div>
             </div>
             <div class="row">
                <div class="col-sm-2">
                    <button class="btn btn-success" style="width: 100%;"
                    ng-click="$ctrl.changeVenueData()">Change Venue Data</button>
                </div>
                <div class="col-sm-4">
                    <input ng-model="$ctrl.newVenueData" style="width: 100%;"/>
                </div>
            </div>
             <div class="row">
                <div class="col-sm-2">
                    <button class="btn btn-success" style="width: 100%;"
                    ng-click="$ctrl.sendAppMsg()">Send App Message</button>
                </div>
                <div class="col-sm-4">
                    <input ng-model="$ctrl.appMsg" style="width: 100%;"/>
                </div>
             </div>
             <div class="row">
                <div class="col-sm-2">
                    <button class="btn btn-success" style="width: 100%;"
                    ng-click="$ctrl.sendVenueMsg()">Send Venue Msg</button>
                </div>
                <div class="col-sm-4">
                    <input ng-model="$ctrl.venueMsg" style="width: 100%;"/>
                </div>
            </div>
             
             <hr>
            <div class="row">
                <div class="col-sm-6">
                <p>Venue Data: {{$ctrl.venueModel}}</p>
            <p>Device Data: {{$ctrl.deviceModel}}</p>
                </div>
            
            </div>
            `
};

export default Component
