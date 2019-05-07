import IDIsValidUUID from "../id-is-valid-uuid";
import { makeRuleTester } from "./util";

const tester = makeRuleTester();

tester.run("id-is-valid-uuid", IDIsValidUUID, {
  valid: [
    {
      code: `
        import { FormattedMessage, defineMessages } from "react-intl";

        <FormattedMessage
          id="89fc55da-b6b7-49de-b339-3bf94ea469b5"
        />;
        <FormattedMessage
          id="89fc55da-b6b7-49de-b339-3bf94ea469b5"
        />;

        defineMessages({
          one: {
            id: "89fc55da-b6b7-49de-b339-3bf94ea469b5"
          },
          two: {
            id: "89fc55da-b6b7-49de-b339-3bf94ea469b5"
          },
        });
      `,
    },
    {
      code: `
        import { FormattedMessage, defineMessages } from "other";

        <FormattedMessage
          id="bad"
        />;

        defineMessages({
          one: {
            id: "bad"
          },
        });
      `,
    },
    {
      code: `
        import { FormattedMessage, defineMessages } from "other";

        <FormattedMessage
          id="bad"
        />;

        defineMessages({
          one: {
            id: "bad"
          },
        });
      `,
    },
    {
      code: `
        const FormattedMessage = () => null;

        <FormattedMessage
          id="bad"
        />;

        defineMessages({
          one: {
            id: "bad"
          },
        });
      `,
    },
  ],
  invalid: [
    {
      code: `
        import { FormattedMessage, defineMessages } from "react-intl";

        <FormattedMessage
          id="something is not quite right"
        />;

        defineMessages({
          one: {
            id: "something is not quite right 2"
          },
        });
      `,
      errors: [
        {
          message: "Message ID 'something is not quite right' does not conform.",
          line: 5,
        },
        {
          message: "Message ID 'something is not quite right 2' does not conform.",
          line: 10,
        },
      ],
    },
    {
      code: `
        import { FormattedMessage as FM, defineMessages as DM } from "react-intl";

        <FM
          id="something is not quite right"
        />;

        DM({
          one: {
            id: "something is not quite right 2"
          },
        });
      `,
      errors: [
        {
          message: "Message ID 'something is not quite right' does not conform.",
          line: 5,
        },
        {
          message: "Message ID 'something is not quite right 2' does not conform.",
          line: 10,
        },
      ],
    },
    {
      code: `
        import { FormattedMessage } from "another-intl";
        import { defineMessages } from "react-intl";

        <FormattedMessage
          id="something is not quite right"
        />;

        defineMessages({
          one: {
            id: "something is not quite right 2"
          },
        });
      `,
      options: [{ moduleNames: ["another-intl", "react-intl"] }],
      errors: [
        {
          message: "Message ID 'something is not quite right' does not conform.",
          line: 6,
        },
        {
          message: "Message ID 'something is not quite right 2' does not conform.",
          line: 11,
        },
      ],
    },
  ],
});
