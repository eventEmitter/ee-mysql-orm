(function() {
    'use strict';

    var   Class                 = require('ee-class')
        , log                   = require('ee-log')
        , type                  = require('ee-types')
        , Model                 = require('./Model')
        , AdvancedQueryBuilder  = require('./AdvancedQueryBuilder');




    var Helpers = new Class({
        fn:  function(fn, values, alias) {
            return function() {
                return {
                      fn        : fn
                    , values    : values
                    , value     : values
                    , alias     : alias
                };
            };
        }

        , operator: function(operator, value) {
            return function() {
                return {
                      operator : operator
                    , value    : value
                };
            };
        }
    });
    var helpers = new Helpers();




    module.exports = new Class({

        // alias
        alias: function(){
            var   len           = arguments.length
                , tableName     = len === 3 ? arguments[1] : null
                , columnName    = arguments[len === 3 ? 2 : 1]
                , alias         = arguments[0];


            return function(){
                return {
                      table     : tableName
                    , column    : columnName
                    , alias     : alias
                }
            };
        }


        // logic
        , or: function(first){
            var a = type.array(first) ? first : Array.prototype.slice.call(arguments);
            a.mode = 'or';
            return a;
        }

        , and: function(first){
            var a = type.array(first) ? first : Array.prototype.slice.call(arguments);
            a.mode = 'and';
            return a;
        }


        // nil is used when filtering nullable columns on left joins. it
        // matches all rows that aren't set. null filters rows that are set
        // but have the actual value nulpl (on nullable columns)
        , nil: Symbol('nil')


        // use a keyword in a select (non escaped string)
        , keyword: function(keyword) {
            return function() {
                return {
                    keyword: keyword
                };
            };
        }

        //r eference to other table, col
        , reference: function(entity, column) {
            return function() {
                return {
                      fn: 'reference'
                    , entity: entity
                    , column: column
                };
            };
        }


        // aggregate functions
        , count: function(field, alias) {
            return helpers.fn('count', field, alias);
        }
        , max: function(field, alias) {
            return helpers.fn('max', field, alias);
        }
        , min: function(field, alias) {
            return helpers.fn('min', field, alias);
        }
        , avg: function(field, alias) {
            return helpers.fn('avg', field, alias);
        }
        , sum: function(field, alias) {
            return helpers.fn('sum', field, alias);
        }


        // value updates
        , increaseBy: function(amount) {
            return helpers.fn('increaseBy', amount);
        }
        , decreaseBy: function(amount) {
            return helpers.fn('decreaseBy', amount);
        }


        // filters
        , like: function(value) {
            return helpers.fn('like', value);
        }
        , notLike: function(value) {
            return helpers.fn('notLike', value);
        }


        , jsonValue: function(path, value) {
            return function() {
                return {
                      fn        : 'jsonValue'
                    , rightSide : true
                    , path      : path
                    , value     : value
                };
            };
        }


        , in: function(values) {
            return helpers.fn('in', type.array(values) ? values : Array.prototype.slice.call(arguments));
        }
        , notIn: function(values) {
            return helpers.fn('notIn', type.array(values) ? values : Array.prototype.slice.call(arguments));
        }
        , notNull: function() {
            return helpers.fn('notNull');
        }
        , isNull: function() {
            return helpers.fn('null');
        }


        , equal: function(value) {
            return helpers.operator('=', value);
        }
        , notEqual: function(value) {
            return helpers.operator('!=', value);
        }

        , gt: function(value) {
            return helpers.operator('>', value);
        }
        , gte: function(value) {
            return helpers.operator('>=', value);
        }

        , lt: function(value) {
            return helpers.operator('<', value);
        }
        , lte: function(value) {
            return helpers.operator('<=', value);
        }

        , not: function(value) {
            return helpers.operator('not', value);
        }
        , is: function(value) {
            return helpers.operator('is', value);
        }

         /*
         * return a new advanced querybuilder instance
         */
        , createQueryBuilder: function(query) {
            return new AdvancedQueryBuilder(query);
        }

        /*
         * return a new advanced querybuilder instance
         */
        , qb: function(query) {
            return new AdvancedQueryBuilder(query);
        }

        /*
         * return a new advanced querybuilder instance
         */
        , queryBuilder: function(query) {
            return new AdvancedQueryBuilder(query);
        }


        // the model, needed for extending models
        , Model: Model
    });
})();
