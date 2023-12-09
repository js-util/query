// Dependencies
import Query from "../Query";
import fetchNestedValue from "../util/fetchNestedValue";
import getFieldValue from "../util/getFieldValue";
import QueryType from "../QueryType";

/**
 * Acts as the base for all conditional types,
 *
 * The field name and its respective value, represents the LHS (Left Hand Side)
 * While the argument name and its respective value, represents the RHS (Right Hand Side)
 * of the conditional comparision.
 *
 * Base implmentation is equivalent as Equals
 **/
export abstract class ConditionBase extends Query {

	//
	// Constructor vars
	//--------------------------------------------------------------------
	
	/**
	 * The field name, this/null is reserved to refering to itself
	 **/
	protected _fieldName: string | null;
	/**
	 * The constructed argument name
	 **/
	protected _argName: string | null;
	/**
	 * The constructed argument map
	 **/
	protected _argMap: Map<string, any> | null;

	//
	// Constructor Setup
	//--------------------------------------------------------------------
	
	/**
	 * The constructor with the field name, and default argument
	 *
	 * @param   default field to test
	 * @param   default argument name to test against
	 * @param   default argument map to get test value
	 **/
	constructor(field: string, argName: string, defaultArgMap: Map<string, any>) {
		super();
		this._fieldName = field;
		this._argName = argName;
		this._argMap = defaultArgMap;
	}

	//
	// Core protected functions
	//--------------------------------------------------------------------
	
	/**
	 * Gets the arg value to test
	 *
	 * @param   map to extract out the field value
	 * @param   field name of extraction
	 *
	 * @return  The extracted object
	 **/
	protected getArgumentValue(argMap: Map<string, any>, argName: string): any {
		if (!argMap || !argName) {
			return null;
		}
		// NestedObjectFetch.fetchObject equivalent in TypeScript
		return fetchNestedValue(argMap, argName);
	}

	/**
	 * To test against the specific value, this is the actual
	 * argument which is being used. After fetching both
	 * the field and argument value
	 *
	 * [to override on extension]
	 *
	 * @param   the object to test against
	 * @param   the argument actual value
	 *
	 * @return  boolean indicating success or failure
	 **/
	protected testValues(fieldValue: any, argValue: any): boolean {
		if (argValue === null) {
			return fieldValue === null;
		} else {
			return argValue === fieldValue;
		}
	}

	/**
	 * Gets the field value and tests it,
	 * this is a combination of getFieldValue, and testValues
	 *
	 * @param   object to extract out the field value
	 * @param   parameter map to use
	 *
	 * @return  boolean indicating success or failure
	 **/
	protected getAndTestFieldValue(t: any, argMap: Map<string, any>): boolean {
		const argValue = this.getArgumentValue(argMap, this._argName!);

		if (t instanceof Map) {
			if ("_key".toLowerCase() == this._fieldName?.toLowerCase()) {
				for (const [key, ] of t.entries()) {
					if (this.testValues(key, argValue)) {
						return true;
					}
				}
				return false;
			} else if ("_val".toLowerCase() == this._fieldName?.toLowerCase()) {
				for (const [, value] of t.entries()) {
					if (this.testValues(value, argValue)) {
						return true;
					}
				}
				return false;
			}
		}

		// Get the target value to test, and test it
		const fieldValue = getFieldValue(t, this._fieldName!);
		return this.testValues(fieldValue, argValue);
	}

	//
	// Public test functions
	//--------------------------------------------------------------------
	
	/**
	 * The test operator, asserts if the element matches
	 *
	 * @param   the object to test against
	 *
	 * @return  boolean indicating true / false
	 **/
	public test(t: any): boolean {
		return this.getAndTestFieldValue(t, this._argMap!);
	}

	/**
	 * To test against a specified value map,
	 * Note that the test varient without the Map
	 * is expected to test against its cached varient
	 * that is setup by the constructor if applicable
	 *
	 * @param   the object to test against
	 * @param   the argument map, if applicable
	 *
	 * @return  boolean indicating true / false
	 **/
	public testWithArgMap(t: any, argMap: Map<string, any>): boolean {
		return this.getAndTestFieldValue(t, argMap);
	}

	//
	// Public accessors
	//--------------------------------------------------------------------
	
	/**
	 * Indicates if its a basic operator
	 **/
	public isBasicOperator(): boolean {
		return true;
	}

	/**
	 * Gets the query type
	 *
	 * [to override on extension]
	 **/
	public type(): QueryType {
		return QueryType.EQUALS; // Or the relevant type for this class
	}

	/**
	 * Gets the field name
	 **/
	public fieldName(): string | null {
		return this._fieldName;
	}

	/**
	 * Gets the argument name
	 **/
	public argumentName(): string | null {
		return this._argName;
	}

	/**
	 * Gets the default argument map
	 **/
	public defaultArgumentMap(): Map<string, any> | null {
		return this._argMap;
	}

	//
	// String handling
	//--------------------------------------------------------------------
	
	/**
	 * The operator symbol support
	 *
	 * [to override on extension]
	 **/
	public operatorSymbol(): string {
		return "=";
	}

	/**
	 * The query string
	 **/
	public toString(): string {
		return `"${this.fieldName()}" ${this.operatorSymbol()} :${this.argumentName()}`;
	}

	//
	// Name value pair extraction from query
	//--------------------------------------------------------------------
	
	/**
	 * Extract out the respective query keys, and values
	 **/
	protected _keyValuesMap(mapToReturn: Map<string, any[]>): Map<string, any[]> {
		const key = this._fieldName;
		if (!key) {
			return mapToReturn;
		}
		const val = (this._argMap && this._argName)? this._argMap.get(this._argName) : null;
		if (!mapToReturn.has(key)) {
			mapToReturn.set(key, []);
		}
		mapToReturn.get(key)!.push(val);
		return mapToReturn;
	}
}