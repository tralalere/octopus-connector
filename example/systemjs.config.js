/**
 * Created by Christophe on 31/01/2017.
 */

(function (global) {
    System.config({
        paths: {
            'octopus-connect': "../node_modules/octopus-connect",
            'src': "../src",
            "rxjs": "../node_modules/rxjs"
        },
        packages: {
            'src': {
                defaultExtension: "js"
            },
            'octopus-connect': {
                defaultExtension: "js"
            },
            "rxjs": {
                defaultExtension: "js"
            }
        },
        map: {
            "rxjs": "rxjs/bundles/"
        }
    })
})(this);