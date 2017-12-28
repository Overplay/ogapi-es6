/**
 *
 * Import this into the main entry if you want angular 1.5+ capability.
 * Created by mkahn on 10/15/17.
 *
 * */

import angular from 'angular';
import ogadvertsComponent from './ogadverts.testcomponent';
import ogadvertsService from '../../../src/services/ogadverts';

const ngModule = angular.module( 'ngApp', [] );

// Register components

ngModule.component( ogadvertsComponent.$name$, ogadvertsComponent );

ngModule.service( 'ogadverts', ogadvertsService );


ngModule.run( [ '$log',
    function ( $log ) {
        $log.debug('ogadverts test starting...')
    } ] );


angular.bootstrap( document, [ 'ngApp' ] );




