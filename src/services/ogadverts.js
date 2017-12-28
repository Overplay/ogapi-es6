import * as OGSystem from '../system/ogsystem'

let _forceAllAds = false;

let _adRotation = [];
let _adIndex = 0;

let urlForAllAds = '/proxysponsor/all';
let urlForVenueAds = '/proxysponsor/venue/';
let urlForProxiedImages = '/media/downloadFromCore/';


export default class ogAdverts {

    constructor( $http, $log ) {
        this.$http = $http;
        this.$log = $log;
        this.processNewAds = this.processNewAds.bind( this );

        this.refreshAds();
    }

    /**
     * Gets ads for a specific venue ID. Normally used for testing only.
     * @param venueId
     * @returns {Promise.<TResult>}
     */
    getAdsForVenue( venueId ) {
        const url = urlForVenueAds + venueId;
        return this.$http.get( url )
            .then( ( data ) => data.data )
            .then( this.processNewAds );
    }


    /**
     * Gets all ads in the system for all venues. Normally used for testing only, or if forceAll set.
     * @returns {Promise.<TResult>}
     */
    getAllAds() {
        return this.$http.get( urlForAllAds )
            .then( ( data ) => data.data )
            .then( this.processNewAds );
    }

    /**
     * Makes an http query to either VenueAds or AllAds and returns _adRotation.
     * This must be called before getNext!
     *
     * @returns {Object} _adRotation
     */
    refreshAds() {
        if ( OGSystem.getOGSystem().venue && !_forceAllAds ) {
            return this.getAdsForVenue( OGSystem.getOGSystem().venue );
        }
        this.$log.verbose( 'No venue or force all on, getting all ads.' );
        return this.getAllAds();
    }

    /**
     * Process new ads length
     *
     * @param {Array} newAds
     * @returns {Object} _adRotation
     */
    processNewAds( newAds ) {
        this.$log.debug( "ogAds loaded " + newAds.length + " ads. Enjoy!" );
        _adRotation = newAds;
        _adIndex = 0;
        return _adRotation;
    }

    /**
     * Returns next advertisiment in the rotation
     *
     * @returns {Object} advertisiment
     */
    getNextAd() {

        if ( !_adRotation.length )
            return null;

        _adIndex = (_adIndex + 1) % _adRotation.length;
        if ( !_adIndex ) this.refreshAds(); // grab new ones on loop
        return _adRotation[ _adIndex ];

    };

    /**
     * Resolves the currentAd running
     *
     * @returns {Object}  currentAd object
     */

    getCurrentAd() {
        if ( !_adRotation.length )
            return null;
        return _adRotation[ _adIndex ];
    };

    /**
     * Returns ad's image if there are ads, and a default if not
     *
     * @param {string} adType
     * @returns {string} location of ad's image
     */
    getImgUrl( adType ) {

        if ( _adRotation.length && _adRotation[ _adIndex ].advert.media ) { //This makes sure there is actually an advert to pull
            // TODO this needs more checking or a try catch because it can blow up if an ad does not have
            // a particular kind (crawler, widget, etc.)
            const ad = _adRotation[ _adIndex ];

            return urlForProxiedImages + ad.advert.media[ adType ].id;

        } else {

            switch ( adType ) {

                case "crawler":
                    return "/blueline/common/img/oglogo_crawler_ad.png";

                case "widget":
                    return "/blueline/common/img/oglogo_widget_ad.png";

                default:
                    throw Error( "No such ad type: " + adType );

            }
        }
    }

    /**
     * Sets up a force on all ads
     *
     * @param {any} alwaysGetAll
     */
    setForceAllAds( alwaysGetAll ) {
        _forceAllAds = alwaysGetAll;
    };

}

ogAdverts.$inject = [ '$http', '$log' ];