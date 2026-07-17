/**
 * Renders a COLLECTION variable as a row of adjacent boxes, each showing a
 * value on top and its index underneath - the classic "array as boxes"
 * picture. Handles empty collections explicitly rather than rendering a
 * bare, confusing empty row.
 */
export default function CollectionValue({ name, variable, track }) {
    const { elements, jvmType } = variable;
    const arrayLength = elements.length;

    // Parse track data to get pointer positions
    const pointers = {};
    const outOfBoundsLeft = []; // Pointers at index -1
    const outOfBoundsRight = []; // Pointers at index arrayLength

    if (track) {
        Object.entries(track).forEach(([pointerName, pointerData]) => {
            const index = parseInt(pointerData.data, 10);

            if (index === -1) {
                outOfBoundsLeft.push(pointerName);
            } else if (index === arrayLength) {
                outOfBoundsRight.push(pointerName);
            } else if (!isNaN(index) && index >= 0 && index < arrayLength) {
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
                    {/* Left out-of-bounds pointers as small tags */}
                    {outOfBoundsLeft.map((p, idx) => (
                        <div key={`left-${idx}`} className="out-of-bounds-pointer left">
                            <span className="pointer-name out-of-bounds">{p}</span>
                            <span className="out-of-bounds-index">-1</span>
                        </div>
                    ))}

                    {/* Array cells */}
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

                    {/* Right out-of-bounds pointers as small tags */}
                    {outOfBoundsRight.map((p, idx) => (
                        <div key={`right-${idx}`} className="out-of-bounds-pointer right">
                            <span className="pointer-name out-of-bounds">{p}</span>
                            <span className="out-of-bounds-index">{arrayLength}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}