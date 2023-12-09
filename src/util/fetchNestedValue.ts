/**
 * Given an object and fetch the nested value inside the object
 */
export default function fetchNestedValue(obj:any, path:string[] | string, fallback = null) {
	// Fallback if object is null
	if( obj == null ) {
		return fallback;
	}
	
	// Convert path to array
	if(!Array.isArray(path)) {
		path = path.toString().split(".");
	}

	// Get the first element, and remove it from the path array
	const key = path.shift();

    // Terminate on null keys, and return the fallback
    if ( key === null || key === undefined) {
        return fallback;
    }

	// Get the key value
	const val = obj[key];

	// If value is null, terminate and return fallback
	if( val === null || val === undefined ) {
		return fallback;
	}

	// Recusively call if needed
	if( path.length > 0 ) {
		return fetchNestedValue(val, path, fallback);
	}

	// Return the value
	return val;
}