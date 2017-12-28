ogHud.$inject = [ '$log', '$timeout' ];

export default function ogHud( $log, $timeout ) {
    return {
        scope:    {
            message:      '=',
            dismissAfter: '@',
            issue:        '='
        },
        link:     function ( scope, elem, attr ) {

            scope.ui = { show: false };

            scope.$watch( 'issue', function ( nval ) {
                if ( nval ) {
                    $log.debug( 'firing HUD' );
                    scope.ui.show = true;
                    $timeout( function () {
                        scope.ui.show = false;
                        scope.issue = false;
                    }, scope.dismissAfter || 2000 );
                }
            } );

        },
        template: `
        <div ng-if="ui.show" style="width: 100vw; height: 100vh; background-color: rgba(30,30,30,0.25);">
            <div style="margin-top: 40vh; width: 100vw; text-align: center;"> {{ message }}</div>
        </div> 
        `
    };
}
