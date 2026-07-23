import './MapValue.css';

/**
 * Resolves a JDI variable-value node (either the key side or the value side
 * of a map entry) into something renderable:
 *   - PRIMITIVE  -> the raw value (strings get their surrounding quotes stripped)
 *   - COLLECTION -> a "[a, b, c]" sequence string
 *   - anything else -> 'undefined'
 */
function resolveDisplayValue(value) {
    if (!value) return 'undefined';

    const { varType, jvmType, data } = value;
    const isString = jvmType === 'java.lang.String';

    if (varType === 'PRIMITIVE') {
        return isString ? String(data).replace(/^"|"$/g, '') : data;
    }

    if (varType === 'COLLECTION') {
        let elements = value.elements || value.variableValueList || [];

        if (elements.every((item) => item.varType === 'PRIMITIVE')) {
            elements = elements.map((el) =>
                el.jvmType === 'java.lang.String'
                    ? String(el.data).replace(/^"|"$/g, '')
                    : el.data
            );
        }

        const truncated = elements.length > 10;
        const shown = truncated ? elements.slice(0, 10) : elements;

        return `[${shown.join(', ')}${truncated ? ', ...' : ''}]`;

    }

    return 'undefined';
}

export default function MapValue({ name, variable }) {
    const { mapEntryList, jvmType } = variable;

    return (
        <div>
            <div className="collection-header layout-row">
                <span className="var-name">{name}</span>
                <span className="var-type">{jvmType}</span>
            </div>

            <table className="map-value-table">
                <thead>
                <tr>
                    <th>Key</th>
                    <th>Value</th>
                </tr>
                </thead>
                <tbody>
                {mapEntryList.map(({ keyValue, valueValue }, idx) => (
                    <tr key={idx}>
                        <td className="map-value-key">{resolveDisplayValue(keyValue)}</td>
                        <td className="map-value-val">{resolveDisplayValue(valueValue)}</td>
                    </tr>
                ))}
                </tbody>
            </table>

        </div>
    );
}