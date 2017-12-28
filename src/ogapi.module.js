/**
 *
 * ogapi.module.js
 *
 * ogAPI rewritten for Bellini/Blueline Architecture
 * ES6 module version
 *
 * December 2017
 *
 *
 **/

import ogadverts from './services/ogadverts'
import failedImageDirective from './directives/failedimage.directive'
import ogAdvertDirective from './directives/ogadvert.directive'
import ogAdvertXfadeDirective from './directives/ogadvertxfade.directive'
// Deprecating the directive for the component
//import ogAppHeader from './directives/ogappheader.directive'
import ogAppHeaderComponent from './components/ogappheader.component'
import ogFallbackImgDirective from './directives/ogfallbackimg.directive'
import ogHUDDirective from './directives/oghud.directive'
import ogAPI from './services/ogapi'

(function ( window, angular ) {

    /**
     * Definition of the ourglassAPI module
     */
    const ogapiModule = angular.module( 'ourglassAPI2', [] );

    ogapiModule.service( 'ogAds', ogadverts );
    ogapiModule.directive( 'failedImage', failedImageDirective );
    ogapiModule.directive( 'ogAdvert', ogAdvertDirective );
    ogapiModule.directive( 'ogAdvertXfade', ogAdvertXfadeDirective );
    //ogapiModule.directive( 'ogAppHeader', ogAppHeader ); //deprecated
    ogapiModule.component( ogAppHeaderComponent.$name$, ogAppHeaderComponent );
    ogapiModule.directive( 'ogFallbackImg', ogFallbackImgDirective );
    ogapiModule.directive( 'ogHud', ogHUDDirective );
    ogapiModule.service('ogAPI', ogAPI);


})( window, window.angular );