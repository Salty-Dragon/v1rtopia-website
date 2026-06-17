import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Discord Bot Privacy Policy — v1rtopia",
  description:
    "Privacy Policy for the v1rtopia Discord stats bot for ShardsSMPv2.",
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

export default function BotPrivacyPolicyPage() {
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
            Discord Bot Privacy Policy
          </h1>
          <p className="mt-3 text-gray-400">
            This Privacy Policy explains what information {BOT_NAME} (the “Bot”)
            handles, how it is used, and the choices you have. The Bot is a
            read-only Discord application that surfaces public ShardsSMPv2
            statistics through slash commands.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Effective date: {EFFECTIVE_DATE}
          </p>
        </header>

        <div className="space-y-10">
          <Section id="overview" title="1. Overview">
            <p>
              The Bot is built to operate with the minimum information necessary
              to respond to commands. It does not build user profiles, does not
              track you across servers, and does not sell or share your
              information with third parties. Your use of the Bot is also subject
              to Discord&apos;s own{" "}
              <a
                href="https://discord.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 underline"
              >
                Privacy Policy
              </a>
              .
            </p>
          </Section>

          <Section id="information" title="2. Information We Process">
            <p>When you use the Bot, the following information is processed:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <span className="text-white">Command interaction data.</span>{" "}
                When you invoke a slash command, Discord provides the Bot with the
                interaction details needed to respond — such as the command name,
                the options you supplied (for example, a Minecraft username you
                searched for), and the requesting user ID, server ID, and channel
                ID.
              </li>
              <li>
                <span className="text-white">Minecraft statistics.</span> The Bot
                reads publicly available ShardsSMPv2 player and server statistics
                (such as in-game usernames and gameplay metrics) from the
                v1rtopia stats API in order to display them in its responses.
              </li>
            </ul>
          </Section>

          <Section id="not-collected" title="3. Information We Do Not Collect">
            <p>The Bot does not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Read or store the content of your messages or direct messages.</li>
              <li>
                Request access to your messages beyond the slash-command
                interactions you explicitly trigger.
              </li>
              <li>
                Collect email addresses, payment information, or other sensitive
                personal data.
              </li>
              <li>Track your activity across servers or build advertising profiles.</li>
            </ul>
          </Section>

          <Section id="use" title="4. How Information Is Used">
            <p>
              Information is used solely to receive your command and return the
              requested statistics within Discord. Interaction data is processed
              transiently for the purpose of generating a response and is not
              used for any other purpose.
            </p>
          </Section>

          <Section id="retention" title="5. Data Retention">
            <p>
              The Bot generates command results on demand and does not maintain a
              database of personal user information. Interaction data is not
              retained as a persistent personal profile. Standard operational
              logs (for example, error logs used to keep the Bot running) may be
              generated and are kept only as long as needed for reliability and
              security, then routinely discarded.
            </p>
          </Section>

          <Section id="sharing" title="6. Sharing and Disclosure">
            <p>
              We do not sell, rent, or trade your information. Information is
              shared only as necessary with the infrastructure the Bot depends on
              to function — namely Discord (to send and receive interactions) and
              the v1rtopia stats API (to retrieve the public statistics it
              displays). We may disclose information if required to do so by law.
            </p>
          </Section>

          <Section id="security" title="7. Security">
            <p>
              We take reasonable measures to protect the limited information the
              Bot handles. However, no method of transmission or processing is
              completely secure, and we cannot guarantee absolute security.
            </p>
          </Section>

          <Section id="children" title="8. Children's Privacy">
            <p>
              The Bot is intended for use on Discord, which requires users to meet
              Discord&apos;s minimum age requirements. The Bot is not directed to
              children under those age requirements and does not knowingly collect
              information from them.
            </p>
          </Section>

          <Section id="rights" title="9. Your Choices and Rights">
            <p>
              You can stop all data processing by the Bot at any time by ceasing
              to use its commands, and a server administrator can remove the Bot
              from a server. Because the Bot does not maintain personal profiles,
              there is generally no stored personal data to delete; if you have a
              specific request, you may contact us using the details below.
            </p>
          </Section>

          <Section id="changes" title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. Material
              changes will be reflected by updating the effective date above. Your
              continued use of the Bot after changes take effect constitutes
              acceptance of the revised policy.
            </p>
          </Section>

          <Section id="contact" title="11. Contact">
            <p>
              Questions about this Privacy Policy or the Bot can be directed to
              the v1rtopia server staff through the official v1rtopia Discord
              community.
            </p>
          </Section>
        </div>

        <footer className="mt-16 border-t border-white/10 pt-8 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} v1rtopia. All rights reserved.</p>
          <p className="mt-2">
            See also our{" "}
            <Link
              href="/bot-tos"
              className="text-green-400 hover:text-green-300 underline"
            >
              Discord Bot Terms of Service
            </Link>
            .
          </p>
        </footer>
      </div>
    </main>
  );
}
