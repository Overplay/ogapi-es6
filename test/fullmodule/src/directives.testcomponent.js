require( './components.scss' );

class Controller {
    constructor( $log, ogAds ) {
        this.$log = $log;
        this.$log.debug( 'loaded Controller.' );
        this.ogAds = ogAds;

    }


    $onInit() {
        this.$log.debug( 'In $onInit' );

    }


    $onDestroy() {
        this.$log.debug( 'In $onDestroy' );
    }


    // injection here
    static get $inject() {
        return [ '$log', 'ogAds' ];
    }
}

export const name = 'directivesComponent';

const Component = {
    $name$:       name,
    bindings:     {},
    controller:   Controller,
    controllerAs: '$ctrl',
    template:     `
        <div class="simulated-handset">
        <og-app-header name="'TEST APP'"></og-app-header>
        </div>`
};

export default Component
