import PrimitiveValue from './PrimitiveValue.jsx';
import CollectionValue from './CollectionValue.jsx';
import UnknownValue from './UnknownValue.jsx';
import MapValue from "./MapValue.jsx";
import {ObjectValue} from "./ObjectValue.jsx";

/**
 * The one place that knows how to draw each kind of variable.
 *
 * `area` decides WHERE a variable ends up:
 *   - 'table'     -> a compact row in the scalar locals table (name/type/value)
 *   - 'pictorial' -> its own block in the Objects panel (boxes, and later
 *                    trees/graphs/maps)
 *
 * To support a new type - say a TREE node for a LeetCode binary-tree
 * problem, or a GRAPH adjacency list:
 *   1. Write a component that takes `{ name, variable }` and renders it.
 *   2. Add one line here: `TREE: { area: 'pictorial', Component: TreeValue }`.
 * LocalsTable and ObjectPanel both iterate a frame's variables and
 * dispatch through this registry, so neither needs to change.
 */
export const variableRenderers = {
  PRIMITIVE: { area: 'table', Component: PrimitiveValue },
  COLLECTION: { area: 'pictorial', Component: CollectionValue },
  MAP: { area: 'pictorial', Component: MapValue },
};

export const fallbackRenderer = { area: 'pictorial', Component: UnknownValue };

export function rendererFor(varType) {
  return variableRenderers[varType] ?? fallbackRenderer;
}
