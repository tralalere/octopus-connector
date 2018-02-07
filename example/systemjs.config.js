/**
 * Created by Christophe on 31/01/2017.
 */

(function (global) {
    System.config({
        paths: {
            'octopus-connect': "../node_modules/octopus-connect",
            'src': "../src",
            "rxjs": "../node_modules/rxjs",
            "object-hash": "../node_modules/object-hash",
            "example": ".",
            "octopus-model": "../node_modules/octopus-model"
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
            },
            "example": {
                defaultExtension: "js"
            },
            "octopus-model": {
                defaultExtension: "js"
            }
        },
        map: {
            "rxjs": "rxjs/bundles/",
            "object-hash": "object-hash/dist/object_hash.js",
            "octopus-model": "octopus-model/dist/bundle.js"
        }
    })
})(this);