// @ts-ignore
import { __fakeID } from "uuidv4";

import IDIsValidUUID from "../id-is-valid-uuid";
import { makeRuleTester } from "./util";

jest.mock("uuidv4", () => {
  const realModule = jest.requireActual("uuidv4");
  const fakeId = "531b7e94-5447-4f1e-8617-bc61a658ddd5";
  realModule.uuid = jest.fn(() => fakeId);
  realModule.__fakeID = fakeId;
  return realModule;
});

const tester = makeRuleTester();
const fakeId = __fakeID as string;

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
      output: `
        import { FormattedMessage, defineMessages } from "react-intl";

        <FormattedMessage
          id="${fakeId}"
        />;

        defineMessages({
          one: {
            id: "${fakeId}"
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
      output: `
        import { FormattedMessage as FM, defineMessages as DM } from "react-intl";

        <FM
          id="${fakeId}"
        />;

        DM({
          one: {
            id: "${fakeId}"
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
      output: `
        import { FormattedMessage } from "another-intl";
        import { defineMessages } from "react-intl";

        <FormattedMessage
          id="${fakeId}"
        />;

        defineMessages({
          one: {
            id: "${fakeId}"
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
    {
      code: `
        import { FormattedMessage, defineMessages } from "react-intl";

        <FormattedMessage
        />

        defineMessages({
          one: {
          },
          two: {
            defaultMessage: "a message!",
          },
        });
      `,
      output: `
        import { FormattedMessage, defineMessages } from "react-intl";

        <FormattedMessage
id="${fakeId}"
        />

        defineMessages({
          one: {
id: "${fakeId}",
},
          two: {
            id: "${fakeId}",
defaultMessage: "a message!",
          },
        });
      `,
      errors: [
        {
          message: "Missing ID property.",
          line: 4,
        },
        {
          message: "Missing ID property.",
          line: 8,
        },
        {
          message: "Missing ID property.",
          line: 10,
        },
      ],
    },
  ],
});
