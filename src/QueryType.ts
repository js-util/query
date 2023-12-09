enum QueryType {
	AND = 0,
	OR = 1,
	NOT = 2,

	EQUALS = 10,
	NOT_EQUALS = 11,

	LESS_THAN = 20,
	LESS_THAN_OR_EQUALS = 21,

	MORE_THAN = 30,
	MORE_THAN_OR_EQUALS = 31,

	LIKE = 40
}
export default QueryType;

export class QueryTypeHelper {
	private static nameToTypeMap: Map<string, QueryType> | null = null;
	private static idToTypeMap: Map<number, QueryType> | null = null;

	public static getValue(queryType: QueryType): number {
		return queryType;
	}

	private static initializeTypeMaps(): void {
		if (this.nameToTypeMap === null || this.idToTypeMap === null) {
			const nameToTypeMapTemp: Map<string, QueryType> = new Map<string, QueryType>();
			const idToTypeMapTemp: Map<number, QueryType> = new Map<number, QueryType>();

			Object.keys(QueryType).filter(key => isNaN(Number(key))).forEach(key => {
				const enumMember = QueryType[key as keyof typeof QueryType];
				nameToTypeMapTemp.set(key, enumMember);
				idToTypeMapTemp.set(enumMember, enumMember);
			});

			if (this.nameToTypeMap === null) {
				this.nameToTypeMap = nameToTypeMapTemp;
				this.idToTypeMap = idToTypeMapTemp;
			}
		}
	}

	public static fromID(id: number): QueryType | undefined {
		this.initializeTypeMaps();
		return this.idToTypeMap?.get(id);
	}

	public static fromName(name: string): QueryType | undefined {
		this.initializeTypeMaps();
		return this.nameToTypeMap?.get(name.toUpperCase());
	}

	public static fromTypeObject(type: any): QueryType | null {
		if (type === null) {
			return null;
		}

		let mType: QueryType | undefined;

		if (typeof type === 'number') {
			mType = this.fromID(type);
		} else {
			mType = this.fromName(type.toString());
		}

		if (mType === undefined) {
			throw new Error(`Invalid QueryType for: ${type.toString()}`);
		}
		return mType;
	}
}