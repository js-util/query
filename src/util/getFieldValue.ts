/**
 * Gets the field value to test
 *
 * @param t object to extract out the field value
 * @param field name of extraction
 *
 * @TODO: Support FullyQualifiedDomainName extraction? With arrays even?
 *
 * @return The extracted object
 **/
export default function getFieldValue(t: any, field: string): any {
    if (field === null || field.toLowerCase() === 'this') {
        return t;
    } else if (t instanceof Map) {
        return t.get(field);
    }
    return null;
}