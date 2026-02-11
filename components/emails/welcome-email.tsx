// =============================================================================
// Welcome Email Template
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

interface WelcomeEmailProps {
  name?: string;
  url?: string;
}

export const WelcomeEmail = ({
  name = "there",
  url = "https://oppshub.com",
}: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to OppsLab!</Preview>
      <Tailwind>
        <Body className="bg-white font-sans text-gray-800">
          <Container className="mx-auto py-10 px-4">
            <Heading className="text-2xl font-bold text-center mb-6">
              Welcome to OppsLab
            </Heading>
            <Text className="mb-4">Hi {name},</Text>
            <Text className="mb-6">
              Thanks for joining OppsLab! We're excited to help you find the best
              scholarships, grants, and career opportunities tailored just for you.
            </Text>
            <Section className="text-center mb-8">
              <Link
                href={`${url}/opportunities`}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold no-underline"
              >
                Browse Opportunities
              </Link>
            </Section>
            <Text className="text-sm text-gray-500">
              If you have any questions, feel free to reply to this email.
            </Text>
            <Text className="text-xs text-gray-400 mt-8 text-center">
              © 2026 OppsLab. All rights reserved.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;
