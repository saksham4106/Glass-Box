// Normalizes a variable's children into a uniform shape regardless of
// whether they came from `elements` (raw primitive values) or
// `variableValueList` (nested variable objects).
function getCells(variable) {
    if (variable.elements) {
        return variable.elements.map((v) => ({ isLeaf: true, value: v }));
    }
    if (variable.variableValueList) {
        return variable.variableValueList.map((item) => {
            if (item.data !== undefined) return { isLeaf: true, value: item.data };
            return { isLeaf: false, variable: item };
        });
    }
    return [];
}

function buildPointerMap(track, length, level) {

    const pointers = {};
    const outOfBoundsLeft = [];
    const outOfBoundsRight = [];

    if (track) {
        Object.entries(track).filter(([pointerName, pointerData]) => {
            return pointerData["axis"] === level;
        }).forEach(([pointerName, pointerData]) => {
            const index = parseInt(pointerData.data, 10);
            if (index === -1) outOfBoundsLeft.push(pointerName);
            else if (index === length) outOfBoundsRight.push(pointerName);
            else if (!isNaN(index) && index >= 0 && index < length) {
                (pointers[index] = pointers[index] || []).push(pointerName);
            }
        });
    }
    return { pointers, outOfBoundsLeft, outOfBoundsRight };
}

function isNbyN(obj) {
    if (!obj || obj.varType !== 'COLLECTION') return false;

    const rows = obj.variableValueList;
    if (!Array.isArray(rows) || rows.length === 0) return false;

    const numRows = rows.length; // N

    // Check that every row is a valid 1D array with exactly N items
    return rows.every(row => {
        if (!row || row.varType !== 'COLLECTION') return false;

        // Direct primitive elements (e.g., "elements": ["1", "2", "3"])
        if (Array.isArray(row.elements)) {
            return row.elements.length === numRows;
        }

        // Collection of primitives (e.g., "variableValueList": [{...}, {...}, {...}])
        if (Array.isArray(row.variableValueList)) {
            const isAllPrimitive = row.variableValueList.every(item => item.varType === 'PRIMITIVE');
            return isAllPrimitive && row.variableValueList.length === numRows;
        }

        return false;
    });
}

function is2DArray(obj) {
    if (!obj || obj.varType !== 'COLLECTION') return false;

    const list = obj.variableValueList;

    // A 2D collection MUST have a non-empty list of sub-collections
    if (!Array.isArray(list) || list.length === 0) return false;

    // Check if EVERY item inside is a valid 1D collection
    return list.every(item => is1DArray(item));
}

function is1DArray(obj) {
    if (!obj || obj.varType !== 'COLLECTION') return false;

    // Case A: Standard array format (has direct 'elements')
    if (Array.isArray(obj.elements)) {
        return true;
    }

    // Case B: Collection format (has 'variableValueList')
    if (Array.isArray(obj.variableValueList)) {
        // It's 1D if every item in variableValueList is a PRIMITIVE
        return obj.variableValueList.every(item => item.varType === 'PRIMITIVE');
    }

    return false;
}

export default function CollectionValue({ name, variable, track, level = 0 }) {
    const { jvmType } = variable;
    const cells = getCells(variable);
    const length = cells.length;

    const { pointers, outOfBoundsLeft, outOfBoundsRight } = buildPointerMap(track, length, level);
    const vertical = level === 0 && isNbyN(variable);

    return (
        <div className={`collection-block ${level === 0 ? 'layout-column' : ''}`}>
            {level === 0 ? (
                <div className="collection-header layout-row">
                    <span className="var-name">{name}</span>
                    <span className="var-type">{jvmType}</span>
                </div>

            ): (
                <div className="collection-empty"></div>

            )}

            {length === 0 ? (
                <div> </div>
            ) : (
                <SequentialBody cells={cells} pointers={pointers}
                                outOfBoundsLeft={outOfBoundsLeft} outOfBoundsRight={outOfBoundsRight}
                                length={length} level={level} track={track} vertical={vertical} />
            )}
        </div>
    );
}

function SequentialBody({ cells, pointers, outOfBoundsLeft, outOfBoundsRight, length, level = 0, track, vertical }) {
    const layout = vertical ? `layout-column` : `layout-row`;
    const oppLayout = vertical ? `layout-row` : `layout-column`;

    return (
        <div className={`collection-row ${layout}`}>
            {outOfBoundsLeft.map((p, idx) => (
                <div key={`left-${idx}`} className="out-of-bounds-pointer left">
                    <span className="pointer-name out-of-bounds">{p}</span>
                    <span className="out-of-bounds-index">-1</span>
                </div>
            ))}

            {cells.map((cell, i) => {
                const hasPointer = pointers[i]?.length > 0;
                return (
                    <div className={`collection-cell ${hasPointer ? 'has-pointer' : ''} ${oppLayout}`} key={i}>

                        <div className="cell-value">
                            {cell.isLeaf
                                ? cell.value
                                : <CollectionValue name={`[${i}]`} variable={cell.variable} track={track} level={level + 1} />}
                        </div>
                        <div className="cell-index">
                            {hasPointer ? (
                                <div className="pointer-names">
                                    {pointers[i].map((p, idx) =>
                                        <span key={idx} className="pointer-name">{p}</span>)}
                                </div>
                            ) : i}
                        </div>

                    </div>
                );
            })}

            {outOfBoundsRight.map((p, idx) => (
                <div key={`right-${idx}`} className="out-of-bounds-pointer right">
                    <span className="pointer-name out-of-bounds">{p}</span>
                    <span className="out-of-bounds-index">{length}</span>
                </div>
            ))}
        </div>
    );
}