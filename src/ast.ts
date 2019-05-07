import { Node, Literal, Identifier, ObjectExpression, Property } from "estree";

export function isIdentifier(node: Node): node is Identifier {
  return node.type === "Identifier";
}

export function isLiteral(node: Node): node is Literal {
  return node.type === "Literal";
}

export function isProperty(node: Node): node is Property {
  return node.type === "Property";
}

export function isObjectExpression(node: Node): node is ObjectExpression {
  return node.type === "ObjectExpression";
}
