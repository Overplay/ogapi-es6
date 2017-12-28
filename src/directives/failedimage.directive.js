/**
 * failed-image directive
 *
 * Used in the og-advert directive. If ad doesn't exist, it inserts the OG logo with a little
 * green dot so we know there has been a failure.
 *
 */

const WIDGET_OOPS = '/blueline/common/img/oglogo_widget_oops.jpg';
const CRAWLER_OOPS = '/blueline/common/img/oglogo_crawler_oops.jpg';

failedImage.$inject = ['$log'];

export default function failedImage( $log ) {
    return {
        restrict: 'A',
        link:     function ( scope, elem, attrs ) {
            elem.bind( 'error', function ( event ) {
                $log.error( "Failed to load image!" );
                // This is some serious hackage!
                const isWidget = event.path[ 1 ].outerHTML.indexOf( 'widget' ) > 0;
                const errImgUrl = isWidget ?  WIDGET_OOPS : CRAWLER_OOPS;
                attrs.$set( 'src', errImgUrl );
            } );
        }
    }
}
