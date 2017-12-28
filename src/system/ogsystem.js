/**
 * Helper to pull url params
 *
 * @param {String} name The name to search for
 * @param {String} [ url ] The url to get parameter of
 * @returns
 */
export function getParameterByName( name, url ) {
    if ( !url ) {
        url = window.location.href;
    }
    name = name.replace( /[\[\]]/g, "\\$&" );
    const regex = new RegExp( "[?&]" + name + "(=([^&#]*)|&|#|$)" ),
        results = regex.exec( url );
    if ( !results ) return null;
    if ( !results[ 2 ] ) return '';
    return decodeURIComponent( results[ 2 ].replace( /\+/g, " " ) );
}

/**
 * This relies on the @JavascriptInterface on the Android side!
 *
 * @returns {Object}
 */
export function getOGSystem() {

    if ( window.OGSystem ) {
        console.log( "%c Detected code running on emulator or OG H/W ",
            'background: #921992; font-size: 20px; color: #fff' );
        let rval = JSON.parse( window.OGSystem.getSystemInfo() );
        rval.onHardware = true;  // so code can easily tell it is on Emu or H/W
        return rval;
    }

    console.log( '%c CODE RUNNING IN BROWSER or WEBVIEW ', 'background: #3c931a; font-size: 20px; color: #fff' );

    let dudid = 'testy-mctesterson';

    const qParamUDID = getParameterByName( "deviceUDID" );

    const jwt = getParameterByName( "jwt" );

    if ( qParamUDID )
        dudid = qParamUDID;

    return {
        abVersionCode:  99,
        abVersionName:  '9.9.99',
        osVersion:      "9.9.9.",
        randomFactoid:  "This is mock data",
        name:           'Simulato',
        wifiMacAddress: '00:11:22:33',
        outputRes:      { height: 1080, width: 1920 },
        udid:           dudid,
        jwt:            jwt,
        venue:          'sim-001',
        osApiLevel:     99,
        mock:           true
    };

}

/**
 * Returns if you're running in the system by querying the window.OGSystem variable (if it exists or not)
 *
 * @returns {boolean} OGSystem
 */
export function isRunningInAndroid() {
    return window.OGSystem;
}
