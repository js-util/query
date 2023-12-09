// Dependencies
import Query from "../Query";
import fetchNestedValue from "../util/fetchNestedValue";
import getFieldValue from "../util/getFieldValue";
import QueryType from "../QueryType";

/**
 * Acts as the base for all combinatino types,
 *
 * Base implmentation is equivalent as AND
 **/
export abstract class CombinationBase extends Query {

	//
	// Constructor vars
	//--------------------------------------------------------------------
	
	/**
	 * The children query objects
	 **/
	protected _children: Query[];

	/**
	 * The constructed argument map
	 **/
	protected _argMap: Map<string, any>;

	//
	// Constructor Setup
	//--------------------------------------------------------------------
	
	/**
	 * Convienence constructor, and default argument, with either
	 *
	 * @param   left child query
	 * @param   right child query
	 * @param   default argument map to get test value
	 * 
	 * or the following params
	 * 
	 * @param   children conditions to test
	 * @param   default argument map to get test value
	 **/
	constructor(arg1: Query[] | Query, arg2: Map<string, any> | Query, arg3?: Map<string, any>) {
		super();
		if(arg1 instanceof Array && arg2 instanceof Map) {
			this._children = arg1;
			this._argMap = arg2;
		} else if(arg3 instanceof Map) {
			let children: Query[] = [];
			if(arg1 && arg1 instanceof Query) {
				children.push(arg1);
			}
			if(arg2 && arg2 instanceof Query) {
				children.push(arg2);
			}
			this._children = children;
			this._argMap = arg3;
		} else {
			throw new Error("Invalid arguments types for CombinationBase constructor");
		}
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
		return this.testWithArgMap(t, this._argMap);
	}

	/**
	 * To test against a specified value map,
	 * Note that the test varient without the Map
	 * is expected to test against its cached varient
	 * that is setup by the constructor if applicable
	 *
	 * [to override on extension]
	 *
	 * @param   the object to test against
	 * @param   the argument map, if applicable
	 *
	 * @return  boolean indicating true / false
	 **/
	public testWithArgMap(t: any, argMap: Map<string, any>): boolean {
		let result = false; // blank combination is a failure

		for (const child of this._children) {
			if (child.testWithArgMap(t, argMap)) {
				result = true;
			} else {
				return false; // breaks and returns false on first failure
			}
		}

		return result;
	}

	//
	// Public accessors
	//--------------------------------------------------------------------
	
	/**
	 * Indicates if its a basic operator
	 **/
	public isCombinationOperator(): boolean {
		return true;
	}

	/**
	 * Gets the query type
	 *
	 * [to override on extension]
	 **/
	public type(): QueryType {
		return QueryType.AND; // or relevant type
	}

	/**
	 * Gets the children conditions
	 **/
	public childrenQuery(): Query[] {
		return this._children;
	}

	/**
	 * The operator symbol support
	 **/
	public operatorSymbol(): string {
		return "AND";
	}

	public toString(): string {
		let ret = "";

		this._children.forEach((child, index) => {
			if (index > 0) {
				ret += ` ${this.operatorSymbol()}`;
			}
			ret += ` ${child.isCombinationOperator() ? "(" : ""}${child.toString()}${child.isCombinationOperator() ? ")" : ""}`;
		});

		if (this._children.length === 1 && this.operatorSymbol() !== "AND") {
			ret = `${this.operatorSymbol()}${ret.startsWith("(") ? ret : "( " + ret + " )"}`;
		}

		return ret.trim();
	}

	public keyValuesMap(mapToReturn: Map<string, any[]>): Map<string, any[]> {
		this._children.forEach(child => {
			mapToReturn = child.keyValuesMap(mapToReturn);
		});
		return mapToReturn;
	}
}