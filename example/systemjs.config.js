/**
 * Created by Christophe on 31/01/2017.
 */

(function (global) {
    System.config({
        paths: {
            'octopus-connect': "../node_modules/octopus-connect",
            'src': "../src",
            "rxjs": "../node_modules/rxjs",
            "object-hash": "../node_modules/object-hash"
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
            },
            "object-hash": {
                defaultExtension: "js"
            }
        },
        map: {
            "rxjs": "rxjs/bundles/",
            "object-hash": "object-hash/dist/object_hash.js"
        }
    })
})(this);