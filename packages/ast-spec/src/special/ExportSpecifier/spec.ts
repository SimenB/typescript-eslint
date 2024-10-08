import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { ExportKind } from '../../declaration/ExportAndImportKind';
import type { Identifier } from '../../expression/Identifier/spec';

export interface ExportSpecifier extends BaseNode {
  type: AST_NODE_TYPES.ExportSpecifier;
  exported: Identifier;
  exportKind: ExportKind;
  local: Identifier;
}
