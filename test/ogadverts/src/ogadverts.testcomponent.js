require( './ogadvertstest.scss' );

class Controller {
    constructor( $log, ogadverts, $interval ) {
        this.$log = $log;
        this.$log.debug( 'loaded Controller.' );
        this.ogadverts = ogadverts;
        this.$interval = $interval;
        this.nextads = [];
    }


    $onInit() {
        this.$log.debug( 'In $onInit' );
        this.ogadverts.getAllAds()
            .then( ( adverts ) => {
                this.adverts = adverts;
            } );

        this.ogadverts.getAdsForVenue('sim-001')
            .then( (adverts) => {
                this.simadverts = adverts;
            })

        this.ogadverts.refreshAds()
            .then( ( adverts ) => {
                this.refadverts = adverts;
            } );

        this.$interval(()=>{
            this.nextads.push(this.ogadverts.getNextAd());
        }, 5000);
    }


    $onDestroy() {
        this.$log.debug( 'In $onDestroy' );
    }


    // injection here
    static get $inject() {
        return [
            '$log', 'ogadverts', '$interval'
        ];
    }
}

export const name = 'ogadvertsComponent';

const Component = {
    $name$:       name,
    bindings:     {},
    controller:   Controller,
    controllerAs: '$ctrl',
    template:     `
        <h3>Next Ad</h3>
        <ul><li ng-repeat="ad in $ctrl.nextads">{{ ad.name }}</li></ul>
        <h3>Refresh Ads</h3>
        <div ng-repeat="ad in $ctrl.refadverts" class="adjson"><pre>{{ad | json}}</pre></div>
        <h3>All Ads</h3>
        <div ng-repeat="ad in $ctrl.adverts" class="adjson"><pre>{{ad | json}}</pre></div>
        <h3>SIM-001 Ads</h3>
        <div ng-repeat="ad in $ctrl.simadverts" class="adjson"><pre>{{ad | json}}</pre></div>`
};

export default Component
