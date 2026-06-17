import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Discord Bot Terms of Service — v1rtopia",
  description:
    "Terms of Service for the v1rtopia Discord stats bot for ShardsSMPv2.",
};

const EFFECTIVE_DATE = "June 17, 2026";
const BOT_NAME = "the v1rtopia Stats Bot";

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl font-semibold text-white mb-3">{title}</h2>
      <div className="space-y-3 text-gray-300 leading-relaxed">{children}</div>
    </section>
  );
}

export default function BotTermsOfServicePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white grid-bg">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/"
          className="text-sm text-green-400 hover:text-green-300 transition-colors"
        >
          ← Back to v1rtopia
        </Link>

        <header className="mt-8 mb-12 border-b border-white/10 pb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Discord Bot Terms of Service
          </h1>
          <p className="mt-3 text-gray-400">
            These Terms govern your use of {BOT_NAME} (the “Bot”), the Discord
            application that surfaces public ShardsSMPv2 statistics through slash
            commands.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Effective date: {EFFECTIVE_DATE}
          </p>
        </header>

        <div className="space-y-10">
          <Section id="acceptance" title="1. Acceptance of Terms">
            <p>
              By adding the Bot to a Discord server, or by using any of its
              commands, you agree to these Terms of Service and to Discord&apos;s
              own{" "}
              <a
                href="https://discord.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 underline"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="https://discord.com/guidelines"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 underline"
              >
                Community Guidelines
              </a>
              . If you do not agree, do not add or use the Bot.
            </p>
          </Section>

          <Section id="service" title="2. Description of the Service">
            <p>
              The Bot is a read-only stats companion for the v1rtopia
              ShardsSMPv2 Minecraft server. It responds to slash commands such as
              player lookups, leaderboards, shard popularity, ability usage, and
              server totals. It retrieves this information from the public
              v1rtopia stats API and returns it inside Discord.
            </p>
            <p>
              The Bot does not modify your Discord server, does not require
              elevated permissions beyond those needed to register and respond to
              slash commands, and does not provide any gameplay or moderation
              functionality.
            </p>
          </Section>

          <Section id="data" title="3. Data We Collect and Use">
            <p>
              The Bot is designed to operate with the minimum data necessary to
              function:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <span className="text-white">Command interactions.</span> When
                you invoke a command, Discord provides the Bot with the
                interaction details (such as the command name, the options you
                supplied, and the requesting user and server IDs) so it can
                respond. This data is used only to process and answer your
                request.
              </li>
              <li>
                <span className="text-white">Minecraft statistics.</span> The Bot
                reads publicly available ShardsSMPv2 player and server statistics
                (for example, in-game usernames and gameplay metrics) from the
                v1rtopia stats API in order to display them.
              </li>
            </ul>
            <p>
              The Bot does{" "}
              <span className="text-white">not</span> read your direct messages,
              does not store message content, and does not sell or share your
              data with third parties. It does not request access to your
              messages beyond the slash-command interactions you explicitly
              trigger. Command results are generated on demand and are not
              retained as a personal profile.
            </p>
          </Section>

          <Section id="acceptable-use" title="4. Acceptable Use">
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Use the Bot for any unlawful purpose or in violation of
                Discord&apos;s Terms of Service or Community Guidelines.
              </li>
              <li>
                Attempt to disrupt, overload, abuse, reverse engineer, or gain
                unauthorized access to the Bot or its underlying API.
              </li>
              <li>
                Use automated means to send excessive requests to the Bot or
                otherwise interfere with its normal operation.
              </li>
            </ul>
          </Section>

          <Section id="availability" title="5. Availability and Changes">
            <p>
              The Bot is provided on an “as is” and “as available” basis. We may
              modify, suspend, or discontinue the Bot or any of its commands at
              any time, with or without notice. We do not guarantee that the Bot
              will be available, uninterrupted, or error-free, and the statistics
              it displays may be delayed or inaccurate.
            </p>
          </Section>

          <Section id="liability" title="6. Disclaimer and Limitation of Liability">
            <p>
              To the maximum extent permitted by law, the Bot and its operators
              provide no warranties of any kind, whether express or implied, and
              shall not be liable for any direct, indirect, incidental, or
              consequential damages arising out of or related to your use of, or
              inability to use, the Bot.
            </p>
          </Section>

          <Section id="termination" title="7. Termination">
            <p>
              You may stop using the Bot at any time by removing it from your
              Discord server. We reserve the right to restrict or terminate
              access to the Bot for any server or user that violates these Terms
              or abuses the service.
            </p>
          </Section>

          <Section id="changes" title="8. Changes to These Terms">
            <p>
              We may update these Terms from time to time. Material changes will
              be reflected by updating the effective date above. Your continued
              use of the Bot after changes take effect constitutes acceptance of
              the revised Terms.
            </p>
          </Section>

          <Section id="contact" title="9. Contact">
            <p>
              Questions about these Terms or the Bot can be directed to the
              v1rtopia server staff through the official v1rtopia Discord
              community.
            </p>
          </Section>
        </div>

        <footer className="mt-16 border-t border-white/10 pt-8 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} v1rtopia. All rights reserved.</p>
          <p className="mt-2">
            See also our{" "}
            <Link
              href="/bot-privacy"
              className="text-green-400 hover:text-green-300 underline"
            >
              Discord Bot Privacy Policy
            </Link>
            .
          </p>
        </footer>
      </div>
    </main>
  );
}
