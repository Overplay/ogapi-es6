/**
 * @deprecated replaced by component
 * @returns {{link: link, templateUrl: string}}
 */

export default function ogAppHeader() {
    return {
        link:     function ( scope, elem, attr ) {
            scope.name = attr.name || "Missing Name Attribute";
        },
        template: `<div class="ogappheader">
                    <div class="ogappheaderside"></div>
                     <div class="ogappheadertext"> {{ name | uppercase}} </div>
                    </div>`
    };
}
