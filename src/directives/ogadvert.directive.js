// Main directive for inserting an advert in BL apps

ogAdvert.$inject = ['$log', 'ogAds', '$interval', '$timeout' ];

/**
 * @deprecated
 *
 * Original directive, use ogAdvertXfade instead!
 *
 * @param $log
 * @param ogAds
 * @param $interval
 * @param $timeout
 * @returns {{restrict: string, template: string, link: link}}
 */
export default function ogAdvert( $log, ogAds, $interval, $timeout ) {
    return {
        restrict: 'E',
        template: '<img width="100%" height="100%" style="-webkit-transition: opacity 0.5s; transition: opacity 0.35s;" ' +
                  'ng-style="adstyle" ng-src=\"{{adurl}}\" failed-image/>',
        link:     function ( scope, elem, attrs ) {

            const interval = parseInt( attrs.interval ) || 15000;
            const adType = attrs.type || 'widget';
            let intervalPromise;

            scope.adstyle = { opacity: 0.0 };

            if ( adType !== 'widget' && adType !== 'crawler' ) {
                throw Error( "Unsupported ad type. Must be widget or crawler" );
            }

            function update() {

                scope.adstyle.opacity = 0;
                $timeout( function () {
                    scope.adurl = ogAds.getImgUrl( adType );
                    scope.adstyle.opacity = 1;
                    // HACK ALERT...let's trigger a new ad load
                    $timeout( ogAds.getNextAd, 200 );

                }, 1200 );

            }

            update();

            intervalPromise = $interval( update, interval );

            scope.$on( '$destroy', function () {
                $interval.cancel( intervalPromise );
            } );

        }
    }
}

