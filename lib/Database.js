!function(){

    var   Class                 = require('ee-class')
        , EventEmitter          = require('ee-event-emitter')
        , log                   = require('ee-log')
        , argv                  = require('ee-argv')
        , Entity                = require('./Entity')
        , buildTransaction      = require('./TransactionBuilder')
        , ORM;



    var dev = argv.has('dev-orm');



    module.exports = new Class({
        inherits: EventEmitter

        , init: function(options) {            
            if (dev) log.warn('initialize new db instance for «'+options.databaseName+'»...');

            Class.define(this, '_orm', Class(options.orm));
            Class.define(this, '_database', Class(options.database));
            Class.define(this, '_queryBuilders', Class({}));
            Class.define(this, '_models', Class({}));
            Class.define(this, '_databaseName', Class(options.databaseName));
            Class.define(this, '_extensions', Class(options.extensions));
            Class.define(this, '_definition', Class(options.definition));

                       
            // initialize the orm
            this._initialize(options.definition);

            // build transaction class for this db
            Class.define(this, 'Transaction', Class(buildTransaction(this)));

            // emit load not before the next main loop execution
            process.nextTick(function(){
                this.emit('load');
            }.bind(this));
        }


        , isTransaction: function(){
            return false;
        }


        /** 
         * sets up a new transaction
         *
         * @param host {string} host, options host to create the transaction on
         */
        , createTransaction: function(host) {
            return new this.Transaction({host: host});
        }


        , executeQuery: function(configuration) {
            this._database.query(configuration);
        }


        /*
         * returns the orm this database is attached to
         */
        , getOrm: function() {
            return this._orm;
        }




        /*
         * return the ORM object used to create filters & more
         */
        , getORM: function() {
            if (!ORM) ORM = require('./ORM');
            return ORM;
        }



        /*
         * returns this, used for multiple components
         * which need to acces this via this method
         */
        , _getDatabase: function(){
            return this;
        }


        /*
         * returns the db name
         */
        , getDatabaseName: function() {
            return this._databaseName
        }


        /**
         * return the db defintion object
         */
        , getDefinition: function() {
            return this._definition;
        }


        /**
         * set up the entities
         */
        , _initialize: function(definition){
            Object.keys(definition).sort().forEach(function(tablename){
                if (this[tablename]) next(new Error('Failed to load ORM for database «'+this._databaseName+'», the tablename «'+tablename+'» is reserved for the orm.').setName('ORMException'));
                if (dev) log.debug('['+this._databaseName+'] initializing new model «'+tablename+'» ...');
                
                this[tablename] = new Entity({
                      orm               : this._orm
                    , definition        : definition[tablename]
                    , queryBuilders     : this._queryBuilders
                    , getDatabase       : this._getDatabase.bind(this)
                    , extensions        : this._extensions
                });

                //store this reference for the use in transactions
                this._models[tablename] = this[tablename];
            }.bind(this));
        }
    });
}();
