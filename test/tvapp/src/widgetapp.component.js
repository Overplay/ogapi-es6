require( './widget.scss' );

class Controller {
    constructor( $log, ogAds, ogAPI ) {

        this.$log = $log;
        this.$log.debug( 'loaded Widget Controller.' );
        this.ogAds = ogAds;
        this.ogAPI = ogAPI;

        this.deviceModelUpdate = this.deviceModelUpdate.bind( this );
        this.venueModelUpdate = this.venueModelUpdate.bind( this );
        this.appMsgCallback = this.appMsgCallback.bind( this );
        this.sysMsgCallback = this.sysMsgCallback.bind( this );
        this.venueMsgCallback = this.venueMsgCallback.bind( this );

        this.ogAPI.init( {
            appType:             'tv',
            appId:               'io.ourglass.widgettest',
            deviceModelCallback: this.deviceModelUpdate,
            venueModelCallback:  this.venueModelUpdate,
            appMsgCallback:      this.appMsgCallback,
            sysMsgCallback:      this.sysMsgCallback,
            venueMsgCallback:    this.venueMsgCallback
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
        this.appMsg = data;
    }

    sysMsgCallback( data ) {
        this.sysMsg = data;
    }

    venueMsgCallback( data ){
        this.venueMsg = data;
    }

    // injection here
    static get $inject() {
        return [ '$log', 'ogAds', 'ogAPI' ];
    }
}

export const name = 'widgetComponent';

const Component = {
    $name$:       name,
    bindings:     {},
    controller:   Controller,
    controllerAs: '$ctrl',
    template:     `
        <div class="widget-holder">
            <p>DMod: {{$ctrl.deviceModel}}</p>
            <p>VMod: {{$ctrl.venueModel}}</p>
            <p>AMsg: {{$ctrl.appMsg}}</p>
            <p>VMsg: {{$ctrl.venueMsg}}</p>
            <p>SMsg: {{$ctrl.sysMsg}}</p>

            <div class="ad-holder">
                <og-advert-xfade type="widget"></og-advert-xfade>
            </div>
        </div>`
};

export default Component
