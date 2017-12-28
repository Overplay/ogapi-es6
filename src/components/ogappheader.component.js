require( './ogappheader.scss' );


export const name = 'ogAppHeader';

const Component = {
    $name$:       name,
    bindings:     { name: '<' },
    template:     `
<div class="ogappheader">
    <div class="ogappheaderside"></div>
    <div class="ogappheadertext"> {{ $ctrl.name | uppercase}} </div>
</div>`
};

export default Component