import * as React from "react";
import { Text } from "@react-email/text";
import { Html } from "@react-email/html";
import { Button } from "@react-email/button";
import { Heading } from "@react-email/heading";
import { Tailwind, type TailwindProps } from "@react-email/tailwind";

import tailwindConfig from "../../../tailwind.config"

export function ResetEmail(props: { url: string }) {
  const { url } = props;

  return (
    <Html lang="en">
      <Tailwind config={tailwindConfig as TailwindProps["config"]}>
        <Heading>Follow the following link</Heading>
        <Text>
          <Button href={url}>Click me</Button>
        </Text>
      </Tailwind>
    </Html>
  );
}

export function NotifyResetEmail() {

  return (
    <Html lang="en">
      <Tailwind config={tailwindConfig as TailwindProps["config"]}>
        <Text>
          Password is successfuly reset
        </Text>
      </Tailwind>
    </Html>
  );
}
