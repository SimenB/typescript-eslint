import type { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/types';

import { simpleTraverse } from '@typescript-eslint/typescript-estree';

export function getSpecificNode<
  Selector extends AST_NODE_TYPES,
  Node extends Extract<TSESTree.Node, { type: Selector }>,
>(
  ast: TSESTree.Node,
  selector: Selector,
  cb?: (node: Node) => boolean | null | undefined,
): Node;
export function getSpecificNode<
  Selector extends AST_NODE_TYPES,
  ReturnType extends TSESTree.Node,
>(
  ast: TSESTree.Node,
  selector: Selector,
  cb: (
    node: Extract<TSESTree.Node, { type: Selector }>,
  ) => ReturnType | null | undefined,
): ReturnType;

export function getSpecificNode(
  ast: TSESTree.Node,
  selector: AST_NODE_TYPES,
  cb?: (node: TSESTree.Node) => boolean | TSESTree.Node | null | undefined,
): TSESTree.Node {
  let node: TSESTree.Node | null | undefined = null;
  simpleTraverse(
    ast,
    {
      visitors: {
        [selector](n) {
          const res = cb ? cb(n) : n;
          if (res) {
            // the callback shouldn't match multiple nodes or else tests may behave weirdly
            assert.notExists(node);
            node = typeof res === 'boolean' ? n : res;
          }
        },
      },
    },
    true,
  );

  // should have found at least one node
  assert.exists(node);
  return node;
}
