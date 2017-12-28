/**
 *
 * Import this into the main entry if you want angular 1.5+ capability.
 * Created by mkahn on 10/15/17.
 *
 * */

require ('bootstrap/dist/css/bootstrap.min.css');

import angular from 'angular';
import ourglassAPI from '../../../lib/ogapi';
import ngBootstrap from 'angular-ui-bootstrap'
import widgetComponent from './widgetapp.component'

const ngModule = angular.module( 'ngApp', [ ourglassAPI, ngBootstrap ] );

// Register components

ngModule.component( widgetComponent.$name$, widgetComponent );

ngModule.run( [ '$log',
    function ( $log ) {
        $log.debug('fullmodule test starting...')
    } ] );


angular.bootstrap( document, [ 'ngApp' ] );




