/**
 * Renders a COLLECTION variable as a row of adjacent boxes, each showing a
 * value on top and its index underneath - the classic "array as boxes"
 * picture. Handles empty collections explicitly rather than rendering a
 * bare, confusing empty row.
 */
export default function CollectionValue({ name, variable }) {
  const { elements, jvmType } = variable;

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
          {elements.map((el, i) => (
            <div className="collection-cell" key={i}>
              <div className="cell-value">{el}</div>
              <div className="cell-index">{i}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
