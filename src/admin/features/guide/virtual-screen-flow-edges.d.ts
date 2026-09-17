/** vite-plugins/screenFlowEdges.ts が提供する仮想モジュールの型 */
declare module "virtual:screen-flow-edges" {
  /** from/to は .claude/screen-map.json の filePath。target は遷移先の URL パターン（`*` は動的なセグメント） */
  export type CodeEdge = { from: string; to: string; target: string };
  const edges: CodeEdge[];
  export default edges;
}
