(function() {
    'use strict';


    let log = require('ee-log');




    // define the proxy class
    module.exports = {

        


        /**
         * trap for the get operation rerutes some calls
         * to another storage object on the model
         *
         * @param {object} model the model that is beeing proxied
         * @param {string} propertyName the name of the proxies property
         * @param {*} the value to set
         *
         * @returns {*} whatever is returned from the methods called
         */
        set(model, propertyName, value) {
            
            // we're differentiating between properties that
            // are model properties as defined in th model class
            // and generic properties. the setter will always
            // route model properties to the model value storage
            // and never to the model itself
            if (model.has(propertyName)) return model.set(propertyName, value);
            else return Reflect.set(model, propertyName, value);
        }








        /**
         * trap the getter, we're returning values from the 
         * storage and not the model itself
         *
         * @param {object} model the model that is beeing proxied
         * @param {string} propertyName the name of the proxies property
         *
         * @returns {*} whatever is returned from the methods called
         */
        , get(model, propertyName) {

            // check if the model has a property with the 
            // given name and the property is not a public 
            // method
            if (model.has(propertyName) && !model.hasPublicMethod(propertyName)) return model.get(propertyName);
            else return Reflect.get(model, propertyName);
        }






        




        /**
         * trap the in operator, we publish all columns, mappings, 
         * references and refenced bys
         *
         * @param {object} model the model that is beeing proxied
         * @param {string} propertyName the name of the proxies property
         *
         * @returns {boolean}
         */
        , has(model, propertyName) {
            return model.has(propertyName);
        }









         /**
         * trap the for in operator, we publish all columns, mappings, 
         * references and refenced bys
         *
         * @param {object} model the model that is beeing proxied
         * @param {string} propertyName the name of the proxies property
         *
         * @returns {iterator}
         */
        , enumerate(model) {
            return model.properties[Symbol.iterator];
        }
    };
})();
