(function() {
    'use strict';


    let Class       = require('ee-class');
    let type        = require('ee-types');
    let log         = require('ee-log');



    

    module.exports = new Class({


        /**
         * set up the related orm
         */
        init: function(database, connection) {

            // store db reference and definition
            Class.define(this, 'database', Class(database));
            Class.define(this, 'connection', Class(connection));
        }
    });
})();