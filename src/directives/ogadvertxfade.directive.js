ogAdvertXfade.$inject = [ '$log', 'ogAds', '$interval', '$timeout' ];

/**
 * This is the preferred directive for placing ads. Does proper xfade.
 * @param $log
 * @param ogAds
 * @param $interval
 * @param $timeout
 * @returns {{restrict: string, template: string, link: link}}
 */

export default function ogAdvertXfade( $log, ogAds, $interval, $timeout ) {
    return {
        restrict: 'E',
        template: '<div style="position: relative; width: 100%; height: 100%;">' + '' +
                  '<img width="100%" height="100%"' +
                  'style="-webkit-transition: opacity 1.0s; transition: opacity 1.0s; position: absolute; top: 0; left: 0; display: block;"' +
                  'ng-style="adstyle.bottom" ng-src=\"{{adurl.bottom}}\" failed-image/>' +
                  '<img width="100%" height="100%"' +
                  'style="-webkit-transition: opacity 1.0s; transition: opacity 1.0s; position: absolute; top: 0; left: 0; display: block;"' +
                  'ng-style="adstyle.top" ng-src=\"{{adurl.top}}\" failed-image/>' +
                  '</div>',
        link:     function ( scope, elem, attrs ) {

            let bottomVisible = true;

            const interval = parseInt( attrs.interval ) || 15000;
            const adType = attrs.type || 'widget';

            if ( adType !== 'widget' && adType !== 'crawler' ) {
                throw Error( "Unsupported ad type. Must be widget or crawler" );
            }

            let intervalPromise;

            scope.adstyle = { bottom: { opacity: 0.0 }, top: { opacity: 0.0 } };

            // grab the first two ads
            scope.adurl = { bottom: ogAds.getImgUrl( adType ) };
            ogAds.getNextAd();
            scope.adurl.top = ogAds.getImgUrl( adType );

            $timeout( function () {
                setVisible();
            }, 2500 );  // initial load

            let preloadedImg = new Image();
            preloadedImg.onload = function () {
                $log.debug( 'Preload complete: ' + preloadedImg.src );
                setVisible(); // flip to and bottom
                console.log( scope.adurl );
            };


            function setVisible() {
                if ( bottomVisible ) {
                    console.log( 'showing bottom' );
                    scope.adurl.bottom = preloadedImg.src;
                    scope.adstyle = { bottom: { opacity: 1.0 }, top: { opacity: 0.0 } };
                } else {
                    console.log( 'showing top' );
                    scope.adurl.top = preloadedImg.src;
                    scope.adstyle = { bottom: { opacity: 0.0 }, top: { opacity: 1.0 } };
                }
                bottomVisible = !bottomVisible; // invert for next pass
            }

            function update() {
                console.log( 'Update called' );
                ogAds.getNextAd();
                var nextUrl = ogAds.getImgUrl( adType );
                preloadedImg.src = nextUrl;

            }

            update();

            intervalPromise = $interval( update, interval );

            scope.$on( '$destroy', function () {
                $interval.cancel( intervalPromise );
            } );

        }
    };

}
