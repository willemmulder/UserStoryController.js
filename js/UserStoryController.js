// ***********
// LIBRARY
// ***********

// Public methods as set by plugins
UserStoryController.fn = {};

// Core
function UserStoryController() {

	var variables = {

		// Private variables and functions
		privates : {
			_publics : function() { return variables.publics; },
			userTypesForIntent : {}, // structure of intent:[userType,userType]
			conditionsForUserType : {}, // structure of userType:[func1,func2]};
			activeUserType : undefined,
			callbacks : {did:{},didnt:{}}, // structure of intent:[callback1,callback2]
			matchingUserTypesForIntent : function(intent) {
				var returnUserTypesList = [];
				var userTypes = this.userTypesForIntent[intent];
				if (userTypes) {
					// Check if all conditions for a userType are met
					// If so, indicate that this userType can access this intent
					for(userTypeIndex in userTypes) {
						if (userTypes.hasOwnProperty(userTypeIndex)) {
							var userType = userTypes[userTypeIndex];
							var conditions = this.conditionsForUserType[userType];
							var conditionsPassed = 0;
							for(var conditionIndex in conditions) {
								if (conditions.hasOwnProperty(conditionIndex) && typeof conditions[conditionIndex] === "function" && conditions[conditionIndex]() === true) {
									conditionsPassed++;
								}
							}
							if (!conditions || conditionsPassed === conditions.length) {
								returnUserTypesList.push(userType);
							}
						}
					}
				}
				return returnUserTypesList;
			},
		},

		// Public methods
		publics : {
			do : function(intent) {
				var matchingUserTypes = this.matchingUserTypesForIntent(intent);
				if (matchingUserTypes.length) {
					this[intent](matchingUserTypes);
					for(callbackIndex in this.callbacks.did[intent]) {
						if (this.callbacks.did[intent].hasOwnProperty(callbackIndex)){
							this.callbacks.did[intent][callbackIndex](intent);
						}
					}
				} else {
					for(callbackIndex in this.callbacks.didnt[intent]) {
						if (this.callbacks.didnt[intent].hasOwnProperty(callbackIndex)){
							this.callbacks.didnt[intent][callbackIndex](intent);
						}
					}
				}
				// Chainable
				return this._publics();
			},
			did : function(intent, callback) {
				this.callbacks.did[intent] = this.callbacks.did[intent] || [];
				this.callbacks.did[intent].push(callback);
			},
			didnt : function(intent, callback) {
				this.callbacks.didnt[intent] = this.callbacks.didnt[intent] || [];
				this.callbacks.didnt[intent].push(callback);
			},
			defineStoryWhereA : function(userType) {
				this.activeUserType = userType;
				// Chainable
				return this._publics();
			},
			wantsTo : function(intent) {
				// Since someone would only call this after defineStoryWhereA(userType), a userType should be known at this point
				if (this.activeUserType) {
					this.userTypesForIntent[intent] = this.userTypesForIntent[intent] || [];
					this.userTypesForIntent[intent].push(this.activeUserType);
					this.activeUserType = undefined;
				}
				// Chainable
				return this._publics();
			},
			defineConditionForUserType : function(userType,condition) {
				this.conditionsForUserType[userType] = this.conditionsForUserType[userType] || [];
				this.conditionsForUserType[userType].push(condition);
			}
		}
	}
	
	// Run init function
	this.init(variables,UserStoryController.fn);

	// Return facade
	return variables.publics;
}
// Use the BaseLibrary
UserStoryController.prototype.init = BaseLibrary.init;
