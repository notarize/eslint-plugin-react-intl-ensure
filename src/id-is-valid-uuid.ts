import { Node, BaseNode, Identifier, CallExpression, Literal } from "estree";
import { Rule, Scope } from "eslint";
import UUID from "uuidv4";

import { isIdentifier, isLiteral, isProperty, isObjectExpression } from "ast";

interface JSXIdentifier {
  type: "JSXIdentifier";
  name: string;
}
interface JSXAttribute {
  name?: Node | JSXIdentifier;
  value: Node;
}
interface JSXOpeningElement extends BaseNode {
  name: Identifier;
  attributes: JSXAttribute[];
}

const BASE_UUID_LENGTH = UUID().length;
const JSX_TAGS = Object.freeze(new Set(["FormattedMessage", "FormattedHTMLMessage"]));
const FUNC_NAMES = Object.freeze(new Set(["defineMessages"]));

function getVariableByName(scope: Scope.Scope, name: string): null | Scope.Variable {
  let iter: Scope.Scope | null = scope;
  while (iter) {
    const variable = iter.set.get(name);
    if (variable) {
      return variable;
    }
    iter = iter.upper;
  }
  return null;
}

function isIntl(
  name: string,
  interestedNames: Readonly<Set<string>>,
  scope: Scope.Scope,
  moduleNames: Readonly<Set<string>>,
): boolean {
  const variable = getVariableByName(scope, name);
  if (!variable || !variable.defs.length) {
    return false;
  }
  const [{ parent, node }] = variable.defs;
  if (!parent || parent.type !== "ImportDeclaration") {
    return false;
  }
  if (!moduleNames.has(parent.source.value as string)) {
    return false;
  }
  return interestedNames.has(node.imported.name);
}

function isValidId(id: unknown): boolean {
  return typeof id === "string" && id.length === BASE_UUID_LENGTH && UUID.is(id);
}

function newIdText(): string {
  return `"${UUID()}"`;
}

const rule: Rule.RuleModule = {
  meta: {
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          moduleNames: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      invalidId: "Message ID '{{id}}' does not conform.",
    },
  },
  create(context) {
    const { options } = context;
    const moduelNames = Object.freeze(
      new Set(
        options.length && options[0].moduleNames
          ? (options[0].moduleNames as string[])
          : ["react-intl"],
      ),
    );
    function report(node: Node): void {
      context.report({
        node,
        messageId: "invalidId",
        data: { id: `${isLiteral(node) ? node.value : "unknown"}` },
        fix(fixer) {
          return fixer.replaceText(node, newIdText());
        },
      });
    }
    return {
      CallExpression(node: Node) {
        const { callee, arguments: args } = node as CallExpression;
        if (
          !isIdentifier(callee) ||
          !isIntl(callee.name, FUNC_NAMES, context.getScope(), moduelNames)
        ) {
          return;
        }
        const [firstArg] = args;
        if (!firstArg || !isObjectExpression(firstArg)) {
          return;
        }
        firstArg.properties
          .reduce(
            (accum, property) => {
              if (!isProperty(property) || !isObjectExpression(property.value)) {
                return accum;
              }
              const idProp = property.value.properties.find(
                (prop) => isProperty(prop) && isIdentifier(prop.key) && prop.key.name === "id",
              );
              return idProp && isLiteral(idProp.value) ? accum.concat([idProp.value]) : accum;
            },
            [] as Literal[],
          )
          .filter((literal) => !isValidId(literal.value))
          .forEach(report);
      },
      JSXOpeningElement(node: Node) {
        const { name, attributes } = node as JSXOpeningElement;
        if (!isIntl(name.name, JSX_TAGS, context.getScope(), moduelNames)) {
          return;
        }
        attributes.forEach(({ name, value }: JSXAttribute) => {
          if (!name || name.type !== "JSXIdentifier" || name.name !== "id") {
            return;
          }
          if (isLiteral(value) && isValidId(value.value)) {
            return;
          }
          report(value);
        });
      },
    };
  },
};

export default rule;
