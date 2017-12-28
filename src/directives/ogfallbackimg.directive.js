
ogFallbackImg.$inject = ['$log'];

export default function ogFallbackImg( $log ) {
    return {
        restrict: 'A',
        link:     function ( scope, element, attrs ) {

            element.bind( 'error', function () {
                $log.debug( "Source not found for image, using fallback" );
                attrs.$set( "src", attrs.ogFallbackImg );
            } );

        }
    };
}