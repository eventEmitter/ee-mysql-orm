(function() {
    'use strict';


    var   Class                 = require('ee-class')
        , EventEmitter          = require('ee-event-emitter')
        , argv                  = require('ee-argv')
        , QueryBuilder          = require('./QueryBuilder')
        , Model                 = require('./Model')
        , ModelBuilder          = require('./ModelBuilder')
        , QueryBuilderBuilder   = require('./QueryBuilderBuilder')
        , log                   = require('ee-log');




    var dev = argv.has('dev-orm');



    // model initializer
    module.exports = new Class({


        init: function(_options){
            var   thisContext = this
                , Constructor;

            this._definition    = _options.definition;
            this._getDatabase   = _options.getDatabase;
            this._orm           = _options.orm;
            this._queryBuilders = _options.queryBuilders;
            this._extensions    = _options.extensions;


            // storage for relations
            this._mappingMap        = {};
            this._belongsToMap      = {};
            this._referenceMap      = {};
            this._columns           = {};
            this._genericAccessors  = {};


            // create Model Class
            this.createModel();

            // create the querybuilder for this entity
            this.createQueryBuilder();


            // constructor to expose
            Constructor = function(scope, options, relatingSets) { 
                var isScoped = false;              

                if (this instanceof Constructor) {
                    // if we're running on a transaction object
                    // we get the scope, else we have to remap the arguments
                    // the scope is only passed if the function is called 
                    // as a constructor
                    if (scope && scope.commit && scope.rollback && scope.LOCK_EXCLUSIVE) {
                        isScoped        = true;
                    }
                    else {
                        options         = scope;
                        relatingSets    = options;
                    }


                    // new model instance
                    var instance = new thisContext.Model({
                          parameters        : options
                        , orm               : thisContext._orm
                        , definition        : thisContext._definition
                        , isFromDB          : options && options._isFromDB
                        , set               : options && options._set
                        , relatingSets      : relatingSets
                        , getDatabase       : isScoped ? scope._getDatabase.bind(scope) : thisContext._getDatabase
                    });

                    return instance;
                }
                else {
                    // return a querybuilder
                    var qb = new thisContext.QueryBuilder({
                          parameters        : Array.prototype.slice.call(arguments)
                        , getDatabase       : this && this._getDatabase ? this._getDatabase.bind(this) : thisContext._getDatabase
                    });

                    return qb;
                }
            };


            Object.defineProperty(Constructor, 'Model', Model);


            // the model definition must be accesible publicly
            Constructor.definition = _options.definition;

            // expose if its a mapping table
            if (this._definition.isMapping) Constructor.isMapping = true;

            // let the user define accessornames
            Constructor.setMappingAccessorName = this.setMappingAccessorName.bind(this);
            Constructor.setReferenceAccessorName = this.setReferenceAccessorName.bind(this);
            Constructor.setBelongsToAccessorName = this.setBelongsToAccessorName.bind(this);

            Constructor.getDefinition = this.getDefinition.bind(this);
            Constructor.extend = this.extend.bind(this);

            return Constructor;
        }


        , extend: function(withModel) {
            this._extensionModel = withModel;
            this.createModel();
        }


        , getDefinition: function() {
            return this._definition;
        }


        , createQueryBuilder: function() {
            this.QueryBuilder = new QueryBuilderBuilder({
                  orm               : this._orm
                , queryBuilders     : this._queryBuilders
                , definition        : this._definition
                , mappingMap        : this._mappingMap
                , belongsToMap      : this._belongsToMap
                , referenceMap      : this._referenceMap
                , columns           : this._columns
                , extensions        : this._extensions
            });

            // store our instance of the querybuilders
            this._queryBuilders[this._definition.getTableName()] = this.QueryBuilder;
        }


        , createModel: function() {
            this.Model = new ModelBuilder({
                  baseModel         : this._extensionModel || Model
                , definition        : this._definition
                , mappingMap        : this._mappingMap
                , belongsToMap      : this._belongsToMap
                , referenceMap      : this._referenceMap
                , genericAccessors  : this._genericAccessors
                , columns           : this._columns
                , orm               : this._orm
                , extensions        : this._extensions
            });
        }


        , setMappingAccessorName: function(mappingName, name) {
            if (!this.Model[name]) {
                if (!this._mappingMap[mappingName]) throw new Error('The mapping «'+mappingName+'» does not exists on the «'+this._definition.name+'» model!');

                this._mappingMap[mappingName].definition.aliasName = name;
                this._mappingMap[mappingName].definition.useGenericAccessor = false;

                this.createModel();
                this.createQueryBuilder();
            }
            else throw new Error('The mapping accessor «'+name+'» on the model «'+this._model.name+'» is already in use!');
        }

        , setReferenceAccessorName: function(referenceName, name) {
            if (!this.Model[name]) {
                if (!this._referenceMap[referenceName]) throw new Error('The reference «'+referenceName+'» does not exists on the «'+this._definition.name+'» model!');

                this._referenceMap[referenceName].aliasName = name;
                this._referenceMap[referenceName].useGenericAccessor = false;

                this.getDefinition().references[name] = this._referenceMap[referenceName];

                //this._genericAccessors[referenceName]

                this.createModel();
                this.createQueryBuilder();
            }
            else throw new Error('The reference accessor «'+name+'» on the model «'+this._model.name+'» is already in use!');
        }


        /**
         * create an alias for a relation because the names were already used
         */
        , setBelongsToAccessorName: function(targetModel, referenceName, name) {
            if (!this.Model[name]) {
                if (!this._belongsToMap[targetModel]) throw new Error('The belongs to «'+referenceName+'» does not exists on the «'+this._definition.name+'» model!');

                this._belongsToMap[targetModel].column.belongsTo.some(function(ref) {
                    if (ref.name === targetModel && ref.targetColumn === referenceName) {
                        ref.aliasName = name;
                        ref.useGenericAccessor = false;

                        this.getDefinition().belongsTo[name] = ref;

                        return true;
                    }
                }.bind(this));


                this.createModel();
                this.createQueryBuilder();
            }
            else throw new Error('The belongs to accessor «'+name+'» on the model «'+this._model.name+'» is already in use!');
        }
    });
})();
