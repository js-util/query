import QueryType from "./QueryType";

/**
 * Represents a Query condition, which can be used to filter collections.
 * Consist of either a basic operator condition, or a comination of other operations.
 */
export default abstract class Query {

	//--------------------------------------------------------------------
	// Public test functions
	//--------------------------------------------------------------------
	
	/**
	 * The test operator, asserts if the element matches
	 * against its cached argument map value
	 *
	 * @param   t object to test against
	 *
	 * @return  boolean indicating true / false
	 **/
	public abstract test(t: any): boolean;

	/**
	 * To test against a specified value map,
	 * Note that the test varient without the Map
	 * is expected to test against its cached varient
	 * that is setup by the constructor if applicable
	 *
	 * @param   t object to test against
	 * @param   argMap , if applicable
	 *
	 * @return  boolean indicating true / false
	 **/
	public abstract testWithArgMap(t: Object, argMap: Map<string, Object>): boolean;

	/**
	 * Gets the query type
	 **/
	public abstract type(): QueryType;

	//--------------------------------------------------------------------
	// Query searching
	//--------------------------------------------------------------------

	/**
	 * Searches using the query, and returns the resulting set
	 **/
	public search<V>(collection: V[] | Map<string, V>): V[] {
		if (collection instanceof Array) {
			return this.searchArray(collection);
		} else {
			return this.searchMap(collection);
		}
	}

	/**
	 * Searches using the query, and sorted by the comparator
	 **/
	public searchWithComparator<V>(collection: V[] | Map<string, V>, compareFunc: (a: V, b: V) => number): V[] {
		if (collection instanceof Array) {
			return this.searchArrayWithComparator(collection, compareFunc);
		} else {
			return this.searchMapWithComparator(collection, compareFunc);
		}
	}

	/**
	 * Searches using the query, and returns the resulting set
	 **/
	public searchArray<V>(list: V[]): V[] {
		return list.filter(item => this.test(item));
	}

	/**
	 * Searches using the query, and sorted by the comparator
	 **/
	public searchArrayWithComparator<V>(list: V[], compareFunc: (a: V, b: V) => number): V[] {
		return this.searchArray(list).sort(compareFunc);
	}

	/**
	 * Searches using the query, and returns the resulting set
	 **/
	public searchMap<V>(map: Map<string, V>): V[] {
		return Array.from(map.values()).filter(value => this.test(value));
	}

	public searchMapWithComparator<V>(map: Map<string, V>, compareFunc: (a: V, b: V) => number): V[] {
		return this.searchMap(map).sort(compareFunc);
	}

	//--------------------------------------------------------------------
	// Condition only accessors
	//--------------------------------------------------------------------

	/**
	 * Gets the field name, for the condition
	 **/
	public fieldName(): string | null {
		return null;
	}

	/**
	 * Gets the argument name
	 **/
	public argumentName(): string | null {
		return null;
	}

	/**
	 * Gets the default argument map
	 **/
	public defaultArgumentMap(): Map<string, Object> | null {
		return null;
	}

	/**
	 * Gets the default value (in the argument map)
	 **/
	public defaultArgumentValue(): Object | null | undefined {
		const map = this.defaultArgumentMap();
		const name = this.argumentName();
		return map && name ? map.get(name) : null;
	}

	/**
	 * Indicates if its a basic operator
	 **/
	public isBasicOperator(): boolean {
		return false;
	}

	//--------------------------------------------------------------------
	// Combination only accessors
	//--------------------------------------------------------------------

	/**
	 * Indicates if its a combination operator
	 **/
	public isCombinationOperator(): boolean {
		return false;
	}

	/**
	 * Gets the children conditions
	 **/
	public childrenQuery(): Query[] | null {
		return null;
	}

	//--------------------------------------------------------------------
	// Query mapping search, modification, and arguments output
	//--------------------------------------------------------------------

	/**
	 * Fetch the nested query map, of basic operators.
	 * This is the internally used recursive function.
	 **/
	public fieldQueryMap(ret: Map<string, Query[]> = new Map()): Map<string, Query[]> {
		if (this.isBasicOperator()) {
			const fieldName = this.fieldName();
			if (fieldName) {
				if (!ret.has(fieldName)) {
					ret.set(fieldName, []);
				}
				ret.get(fieldName)!.push(this);
			}
			return ret;
		} else if (this.isCombinationOperator()) {
			const children = this.childrenQuery();
			children?.forEach(child => child.fieldQueryMap(ret));
		}
		return ret;
	}

	/**
	 * Does a replacement of the selected query
	 * and replace the amended query object (maybe itself)
	 *
	 * If amendment fail, it replaces itself
	 **/
	public replaceQuery(original: Query, replacement: Query): Query {
		if (this === original) {
			return replacement;
		}

		if (this.isCombinationOperator()) {
			const subList = this.childrenQuery();
			if (subList) {
				for (let i = 0; i < subList.length; i++) {
					if (subList[i] === original) {
						subList[i] = replacement;
					} else {
						subList[i].replaceQuery(original, replacement);
					}
				}
			}
		}
		return this;
	}

	/**
	 * Returns the argument values used,
	 * In a array, in accordance to their query component order
	 **/
	public queryArgumentsArray(): any[] {
		return this._queryArgumentsArray([]);
	}

	// Internal recursive function
	protected _queryArgumentsArray(ret: any[] = []): any[] {
		if (this.isBasicOperator()) {
			const value = this.defaultArgumentValue();
			if (value !== null) {
				ret.push(value);
			}
		} else if (this.isCombinationOperator()) {
			const children = this.childrenQuery();
			children?.forEach(child => child._queryArgumentsArray(ret));
		}
		return ret;
	}

	/**
	 * Returns all query arguments used,
	 * As a map, in accordance to the default map, value used
	 *
	 * This is the internally used recursive function.
	 **/
	public queryArgumentsMap(): Map<string, any> {
		return this._queryArgumentsMap(new Map());
	}

	// Internal recursive function
	protected _queryArgumentsMap(ret: Map<string, any> = new Map()): Map<string, any> {
		if (this.isBasicOperator()) {
			const name = this.argumentName();
			const value = this.defaultArgumentValue();
			if (name !== null && value !== null) {
				ret.set(name, value);
			}
		} else if (this.isCombinationOperator()) {
			const children = this.childrenQuery();
			children?.forEach(child => child._queryArgumentsMap(ret));
		}
		return ret;
	}

	//--------------------------------------------------------------------
	// To string conversions
	//--------------------------------------------------------------------

	/**
	 * Gets the operator symbol
	 **/
	public abstract operatorSymbol(): string;

	/**
	 * Returns the query string
	 **/
	public abstract toString(): string;

	/**
	 * Returns the query string, with the SQL array format (not map format)
	 **/
	public toSqlString(): string {
		return this.toString().replace(/:[0-9]+/g, "?");
	}

	//--------------------------------------------------------------------
	// Name value pair extraction from query
	//--------------------------------------------------------------------
	/**
	 * Extract out the respective query keys, and values
	 **/
	public keyValuesMap(): Map<string, Object[]> {
		return this._keyValuesMap(new Map());
	}
	
	/**
	 * Extract out the respective query keys, and values
	 * [This is implemented internally by the respective subclasses]
	 **/
	public abstract _keyValuesMap(mapToReturn: Map<string, Object[]>): Map<string, Object[]>;

	//--------------------------------------------------------------------
	// Aggregation on search
	//--------------------------------------------------------------------
	
	// /**
	//  * Searches using the query, and perform the stated aggregation
	//  * 
	//  * @param  collectionObj,  either using a map, list or collection class
	//  * @param  aggregationObj, used to compute the result
	//  * 
	//  * @return  BigDecimal[] array of the aggregation result
	//  **/
	// default BigDecimal[] aggregation(Object collectionObj, Aggregation aggregationObj) {
		
	// 	// 1. Perform the relevent search query, based on its collection type
	// 	Collection<Object> aggregationData = null;
	// 	if (collectionObj instanceof Map) {
	// 		aggregationData = search((Map<String, Object>) collectionObj);
	// 	} else if (collectionObj instanceof Collection) {
	// 		aggregationData = search((Collection<Object>) collectionObj);
	// 	} else if (collectionObj instanceof Object[]) {
	// 		aggregationData = search(Arrays.asList((Object[]) collectionObj));
	// 	}
		
	// 	// 2. Perform the aggregation computation
	// 	return aggregationObj.compute(aggregationData);
	// }
	
	// /**
	//  * Searches using the query, and perform the stated aggregation
	//  * 
	//  * @param  collectionObj,    either using a map, list or collection class
	//  * @param  aggregationTerms, used to compute the result
	//  * 
	//  * @return  BigDecimal[] array of the aggregation result
	//  **/
	// default BigDecimal[] aggregation(Object collectionOb, String[] aggregationTerms) {
	// 	return aggregation(collectionOb, Aggregation.build(aggregationTerms));
	// }
	
	// /**
	//  * Searches using the query, and perform the stated aggregatoin
	//  * 
	//  * @param  collectionObj,         either using a map, list or collection class
	//  * @param  singleAggregationTerm, used to compute the result
	//  * 
	//  * @return  corresponding BigDecimal result
	//  **/
	// default BigDecimal singleAggregation(Object collectionObj, String singleAggregationTerm) {
	// 	return aggregation(collectionObj, Aggregation.build(new String[] { singleAggregationTerm }))[0];
	// }
}
