var _ = require("lodash");

var library = {
    /**
     * Check if provided string is valid json
     * @param {string} jsonStirng 
     */
    isValid: function (jsonStirng) {
        try {
            JSON.parse(jsonStirng);
            return {
                success: true
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    },
    /**
     * Check if provided string is empty
     * @param {string} jsonStirng 
     */
    isEmpty: function (jsonStirng) {
        return _.isEmpty(jsonStirng) ? true : false;
    },
    /**
     * Get type of given value
     * @param {*} value 
     */
    typeofReal: function (value) {
        return _.isArray(value) ? "array" : typeof value;
    }
};

var Tool = {
    //values provided by application
    oldString: "",
    newString: "",

    //values converted to json from string
    oldJSON: {},
    newJSON: {},

    //remove un-changed values in result if set to true
    removeIdentical: false,

    /**
     * Validate both strings if empty and valid json
     * if empty and/or invalid json -> returns error.
     */
    validateStrings: function () {

        //check for empty
        if (library.isEmpty(Tool.oldString) || library.isEmpty(Tool.newString)) {
            data = {
                success: false,
                message: "Both JSON string must be provided."
            };
            return data;
        }

        //check old json valid
        var oldJSONValidation = library.isValid(Tool.oldString);
        if (!oldJSONValidation.success) {
            data = {
                success: false,
                item: "oldJSON",
                message: "Provided JSON is not valid",
                reason: oldJSONValidation.message
            };
            return data;
        }

        //check new json valid
        var newJSONValidation = library.isValid(Tool.newString);
        if (!newJSONValidation.success) {
            data = {
                success: false,
                item: "newJSON",
                message: "Provided JSON is not valid",
                reason: newJSONValidation.message
            };
            return data;
        }

        return {
            success: true
        };
    },
    /**
     * Check if both provided JSON data are same
     */
    checkSame: function () {
        Tool.oldJSON = JSON.parse(Tool.oldString);
        Tool.newJSON = JSON.parse(Tool.newString);

        if (_.isEqual(Tool.oldJSON, Tool.newJSON)) {
            data = {
                success: true,
                message: "Both JSON are equal."
            };
            return data;
        }
        return {
            success: false
        }
    },
    /**
     * 
     * @param {*} newObject 
     * @param {*} previousObject 
     * @param {*} tree 
     */
    createTree: function (newObject, previousObject, tree) {
        var objectType = library.typeofReal(newObject);
        var prevObjectType = library.typeofReal(previousObject);

        tree = {
            type: objectType,
            status: ""
        };
        if (previousObject === undefined) {
            //new added
            tree["type"] = objectType;
            tree["status"] = "success";
            tree["value"] = objectType === "array" || objectType === "object" ? "" : newObject;
        } else if (newObject === undefined) {
            //deleted
            tree["status"] = "warning";
            tree["type"] = prevObjectType;
            tree["value"] = prevObjectType === "array" || prevObjectType === "object" ? "" : previousObject;
        } else if (prevObjectType != objectType || (objectType != "object" && objectType != "array" && newObject != previousObject)) {
            //changed
            tree["status"] = "info";
            tree["value"] = newObject;
            tree["previous"] = {
                value: previousObject,
                type: prevObjectType
            };
        } else if (newObject === previousObject) {
            //same
            tree["value"] = newObject;
            if (Tool.removeIdentical) {
                tree = {};
                return true;
            }
        }

        if (objectType === "array" || objectType === "object" || prevObjectType === "array" || prevObjectType === "object") {
            var keys = [];
            tree.children = {};
            if (previousObject) {
                Object.keys(previousObject).forEach(function (key) {
                    keys.push(key);
                });
            }
            if (newObject) {
                Object.keys(newObject).forEach(function (key) {
                    if (keys.indexOf(key) == -1) {
                        keys.push(key);
                    }
                });
            }

            keys.sort();
            //process
            keys.forEach(function (key) {
                var data = Tool.createTree(
                    newObject && newObject[key],
                    previousObject && previousObject[key],
                    {}
                );
                if (!(Tool.removeIdentical && !Object.keys(data).length)) {
                    tree.children[key] = data;
                }
            });
            if (!Object.keys(tree.children).length) {
                tree = {};
            }
        }
        return tree;
    }
};


module.exports = {
    compare: function (oldJSONString, newJSONString, removeIdentical = false) {
        Tool.oldString = oldJSONString;
        Tool.newString = newJSONString;
        Tool.removeIdentical = removeIdentical === true ? true : false;

        //check if provided json string are valid
        var isValidated = Tool.validateStrings();
        if (!isValidated.success) {
            return isValidated;
        }

        //check if both json are same
        var isSame = Tool.checkSame();
        if (isSame.success) {
            return isSame;
        }

        //prepare tree and return result
        return Tool.createTree(Tool.newJSON, Tool.oldJSON, {});
    }
};
