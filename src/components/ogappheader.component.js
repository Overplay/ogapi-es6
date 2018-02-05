require( './ogappheader.scss' );


export const name = 'ogAppHeader';

const Component = {
    $name$:   name,
    bindings: { name: '<', twoline: '@?' },
    template: `
<div class="ogappheader" ng-class="{'ogappheader-2line':$ctrl.twoline}">
    <div class="ogappheaderside"></div>
    <div class="ogappheadertext"> {{ $ctrl.name | uppercase}} </div>
</div>`
};

export default Component