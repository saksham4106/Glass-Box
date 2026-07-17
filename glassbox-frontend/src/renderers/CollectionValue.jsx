/**
 * Renders a COLLECTION variable as a row of adjacent boxes, each showing a
 * value on top and its index underneath - the classic "array as boxes"
 * picture. Handles empty collections explicitly rather than rendering a
 * bare, confusing empty row.
 */
export default function CollectionValue({ name, variable, track }) {
    const { elements, jvmType } = variable;

    // Parse track data to get pointer positions
    const pointers = {};
    if (track) {
        Object.entries(track).forEach(([pointerName, pointerData]) => {
            const index = parseInt(pointerData.data, 10);
            if (!isNaN(index) && index >= 0 && index < elements.length) {
                if (!pointers[index]) {
                    pointers[index] = [];
                }
                pointers[index].push(pointerName);
            }
        });
    }

    return (
        <div className="collection-block">
            <div className="collection-header">
                <span className="var-name">{name}</span>
                <span className="var-type">{jvmType}</span>
            </div>
            {elements.length === 0 ? (
                <div className="collection-empty">empty</div>
            ) : (
                <div className="collection-row">
                    {elements.map((el, i) => {
                        const hasPointer = pointers[i] && pointers[i].length > 0;
                        return (
                            <div className={`collection-cell ${hasPointer ? 'has-pointer' : ''}`} key={i}>
                                <div className="cell-value">{el}</div>
                                <div className="cell-index">
                                    {hasPointer ? (
                                        <div className="pointer-names">
                                            {pointers[i].map((p, idx) => (
                                                <span key={idx} className="pointer-name">{p}</span>
                                            ))}
                                        </div>
                                    ) : (
                                        i
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}