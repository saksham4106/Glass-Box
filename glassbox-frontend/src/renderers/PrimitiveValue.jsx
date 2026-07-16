/**
 * Renders the VALUE cell for a PRIMITIVE variable inside the locals table.
 * Kept deliberately tiny: this is the seam to extend if you want richer
 * formatting later (e.g. hex toggle for int, true/false pills for boolean).
 */
export default function PrimitiveValue({ variable }) {
  const { data, jvmType } = variable;
  const display = jvmType === 'char' ? `'${data}'` : data;

  return <span className={`prim-value prim-${jvmType}`}>{display}</span>;
}
