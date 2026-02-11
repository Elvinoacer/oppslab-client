// =============================================================================
// Email Verification Template
// =============================================================================

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface VerificationEmailProps {
  url: string;
}

export const VerificationEmail = ({ url }: VerificationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address</Preview>
      <Tailwind>
        <Body className="bg-white font-sans text-gray-800">
          <Container className="mx-auto py-10 px-4">
            <Heading className="text-2xl font-bold text-center mb-6">
              Verify your email
            </Heading>
            <Text className="mb-6 text-center">
              Please click the button below to verify your email address and
              complete your registration.
            </Text>
            <Section className="text-center mb-8">
              <Link
                href={url}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold no-underline"
              >
                Verify Email
              </Link>
            </Section>
            <Text className="text-sm text-gray-500 text-center">
              Or copy and paste this link into your browser:
              <br />
              <span className="text-blue-600">{url}</span>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default VerificationEmail;
