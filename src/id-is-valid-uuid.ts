import { Node, BaseNode, Identifier, CallExpression, Property, ObjectExpression } from "estree";
import { Rule, Scope } from "eslint";
import { uuid, isUuid } from "uuidv4";

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

const BASE_UUID_LENGTH = uuid().length;
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
  return typeof id === "string" && id.length === BASE_UUID_LENGTH && isUuid(id);
}

function newIdText(): string {
  return `"${uuid()}"`;
}

function messageIdProperty({ properties }: ObjectExpression): Property | undefined {
  return properties.find(
    (prop) => isProperty(prop) && isIdentifier(prop.key) && prop.key.name === "id",
  ) as Property | undefined;
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
      missingId: "Missing ID property.",
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
    function reportMissingId(node: Node): void {
      context.report({
        node: node as Node,
        messageId: "missingId",
        fix(fixer) {
          if ((node.type as string) === "JSXOpeningElement") {
            return fixer.insertTextAfter((node as JSXOpeningElement).name, `\nid=${newIdText()}`);
          } else if (isObjectExpression(node) && node.properties.length) {
            return fixer.insertTextBefore(
              (node.properties[0] as Property).key,
              `id: ${newIdText()},\n`,
            );
          } else if (isObjectExpression(node)) {
            return fixer.replaceText(node, `{\nid: ${newIdText()},\n}`);
          }
          return null;
        },
      });
    }
    function reportInvalidId(node: Node): void {
      context.report({
        node,
        messageId: "invalidId",
        data: { id: `${isLiteral(node) ? node.value : "non-literal"}` },
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

        const messages = firstArg.properties
          .filter((property) => isProperty(property) && isObjectExpression(property.value))
          .map((property) => (property as Property).value as ObjectExpression);

        // Messages with IDs
        const idProps = messages.map(messageIdProperty).filter(Boolean);
        (idProps as Property[])
          .filter((idProp) => !isLiteral(idProp.value) || !isValidId(idProp.value.value))
          .map((idProp) => idProp.value)
          .forEach(reportInvalidId);

        // Messages without IDs we can just report
        messages.filter((message) => !messageIdProperty(message)).forEach(reportMissingId);
      },
      JSXOpeningElement(node: Node) {
        const { name, attributes } = node as JSXOpeningElement;
        if (!isIntl(name.name, JSX_TAGS, context.getScope(), moduelNames)) {
          return;
        }

        const firstIdAttr = attributes.find(({ name }: JSXAttribute) => {
          return Boolean(name && name.type === "JSXIdentifier" && name.name === "id");
        });
        if (!firstIdAttr) {
          return reportMissingId(node);
        }

        const { value } = firstIdAttr;
        if (!isLiteral(value) || !isValidId(value.value)) {
          return reportInvalidId(value);
        }
      },
    };
  },
};

export default rule;
