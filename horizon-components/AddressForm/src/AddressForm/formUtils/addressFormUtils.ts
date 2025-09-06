/**
 * Builds the mutation input object for updating address fields.
 *
 * @param fields - The address form state object.
 * @param props - The AddressForm props object.
 * @param record - The record object (may contain field values).
 * @param recordContext - The record context object (may contain objectUid).
 * @returns The mutation input object for GraphQL update.
 *
 * @example
 * const fields = {
 *   street: { label: 'Street', mappedFieldValue: '123 Main St' },
 *   city: { label: 'City', mappedFieldValue: 'New York' },
 *   state: { label: 'State', mappedFieldValue: 'NY' }
 * };
 * const props = {
 *   streetMappedField: 'street_address',
 *   cityMappedField: 'city_name',
 *   stateMappedField: 'state_code'
 * };
 * const record = { uid: 'abc123' };
 * const recordContext = { objectUid: 'obj456' };
 *
 * const result = buildAddressMutationInput(fields, props, record, recordContext);
 * // result: {
 * //   UID: 'obj456',
 * //   street_address: '123 Main St',
 * //   city_name: 'New York',
 * //   state_code: 'NY'
 * // }
 */
export function buildAddressMutationInput(
  fields: Record<string, { label: string; mappedFieldValue: string }>,
  props: Record<string, any>,
  record?: any,
  recordContext?: { objectUid?: string }
): Record<string, any> {
  const input: Record<string, any> = {
    UID: recordContext?.objectUid || record?.uid || record?.id
  };
  ['street', 'city', 'state'].forEach(key => {
    const mappedFieldName = props[`${key}MappedField`];
    if (mappedFieldName) {
      input[mappedFieldName] = fields[key]?.mappedFieldValue ?? '';
    }
  });
  return input;
}
