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

export default function CollectionValue({ name, variable, track, level = 0 }) {
    const { jvmType } = variable;
    const cells = getCells(variable);
    const length = cells.length;

    const { pointers, outOfBoundsLeft, outOfBoundsRight } = buildPointerMap(track, length, level);

    return (
        <div className="collection-block">
            {/*<div className="collection-header">*/}
            {/*    <span className="var-name">{name}</span>*/}
            {/*    <span className="var-type">{jvmType}</span>*/}
            {/*</div>*/}

            {length === 0 ? (
                <div className="collection-empty">empty</div>
            ) : (
                <SequentialBody cells={cells} pointers={pointers}
                                outOfBoundsLeft={outOfBoundsLeft} outOfBoundsRight={outOfBoundsRight}
                                length={length} level={level} track={track}/>
            )}
        </div>
    );
}

function SequentialBody({ cells, pointers, outOfBoundsLeft, outOfBoundsRight, length, level = 0, track }) {
    const vertical = level === 0;
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

function GridBody({ cells, outOfBoundsLeft, outOfBoundsRight, length, track }) {
    const {
        pointers: pointersX,
        outOfBoundsLeft: outOfBoundsLeftX,
        outOfBoundsRight: outOfBoundsRightX
    } = buildPointerMap(track, length, 0);

    const {
        pointers: pointersY,
        outOfBoundsLeft: outOfBoundsLeftY,
        outOfBoundsRight: outOfBoundsRightY
    } = buildPointerMap(track, length, 1);

    return (
        <div className="collection-grid">
            {outOfBoundsLeft.length > 0 && (
                <div className="grid-out-of-bounds left">
                    {outOfBoundsLeft.map((p, idx) => (
                        <span key={idx} className="pointer-name out-of-bounds">{p} (-1)</span>
                    ))}
                </div>
            )}

            {cells.map((rowCell, rowIndex) => {
                const rowValues = rowCell.isLeaf ? [] : getCells(rowCell.variable);
                const rowHasPointer = pointersX[rowIndex]?.length > 0;

                return (
                    <div className="grid-row-group" key={rowIndex}>

                        <div className="row-index">
                            {rowHasPointer ? (
                                <div className="pointer-names">
                                    {pointersX[rowIndex].map((p, idx) => (
                                        <span key={idx} className="pointer-name">{p}</span>
                                    ))}
                                </div>
                            ) : (
                                ''
                            )}
                        </div>

                        <div className={`grid-row-cells ${rowHasPointer ? 'has-pointer' : ''}`}>
                            {rowValues.map((colCell, colIndex) => {
                                const colHasPointer = pointersY[colIndex]?.length > 0;

                                return (
                                <div key={colIndex}>
                                    <div className={`grid-cell ${colHasPointer ? 'has-pointer' : ''}`}>
                                        {colCell.isLeaf ? colCell.value : '…'}
                                    </div>
                                    <div className="cell-index">
                                        {colHasPointer ? (
                                            <div className="pointer-names">
                                                {pointersY[colIndex].map((p, idx) => (
                                                    <span key={idx} className="pointer-name">{p}</span>
                                                ))}
                                            </div>
                                        ) : (
                                            colIndex
                                        )}
                                    </div>
                                </div>
                            );
                            })}
                        </div>
                    </div>
                );
            })}

            {outOfBoundsRight.length > 0 && (
                <div className="grid-out-of-bounds right">
                    {outOfBoundsRight.map((p, idx) => (
                        <span key={idx} className="pointer-name out-of-bounds">{p} ({length})</span>
                    ))}
                </div>
            )}
        </div>
    );
}