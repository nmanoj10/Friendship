import { useState } from 'react';
import { FiCheck, FiCopy, FiShare2 } from 'react-icons/fi';
import Button from './Button.jsx';
import { copyText, shareContent } from '../utils/share.js';

const SHARE_LABELS = {
  shared: 'Shared! 🎉',
  copied: 'Copied!',
  failed: 'Could not share',
};

/**
 * The "bragging card" shown on the result page — a gradient card summarizing
 * the score + friendship level, ready to share or copy as a text challenge.
 */
export default function ResultShareCard({
  participantName,
  creatorName,
  score,
  total,
  percentage,
  friendshipLevel,
  testLink,
}) {
  const [shareStatus, setShareStatus] = useState(null);
  const [copied, setCopied] = useState(false);

  const shareText = `I scored ${score}/${total} (${percentage}%) on ${creatorName}'s friendship test — Friendship Level: ${friendshipLevel.label} ${friendshipLevel.emoji} 🏆 Can you beat me?`;
  const copyTextValue = `${shareText} Take the test here: ${testLink}`;

  const handleShare = async () => {
    const res = await shareContent({ title: 'My friendship test result', text: shareText, url: testLink });
    if (res === 'cancelled') return;
    setShareStatus(res);
    setTimeout(() => setShareStatus(null), 2500);
  };

  const handleCopy = async () => {
    const ok = await copyText(copyTextValue);
    setCopied(ok);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-violet-600 via-fuchsia-500 to-orange-400 p-6 text-white shadow-lg shadow-fuchsia-200">
      <div className="pointer-events-none absolute -top-12 -right-10 h-36 w-36 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-14 -left-10 h-40 w-40 rounded-full bg-white/10" />

      <div className="relative">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-white/85">
          🏆 Share your result
        </div>

        <div className="mt-3 flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-white/20 text-4xl backdrop-blur">
            {friendshipLevel.emoji}
          </div>
          <div className="min-w-0">
            <div className="truncate font-display text-2xl font-extrabold leading-tight">
              {participantName} scored {score}/{total}
            </div>
            <div className="text-sm font-bold text-white/90">{percentage}% correct</div>
          </div>
        </div>

        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-white transition-all duration-1000"
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          />
        </div>

        <div className="mt-4 text-xs font-extrabold uppercase tracking-widest text-white/85">
          Your Friendship Level
        </div>
        <div className="font-display text-xl font-extrabold">{friendshipLevel.label}</div>

        <div className="mt-3 truncate text-xs font-bold text-white/80">
          on {creatorName}'s test · {testLink}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            icon={shareStatus === 'shared' || shareStatus === 'copied' ? FiCheck : FiShare2}
            onClick={handleShare}
            className="shadow-none"
          >
            {SHARE_LABELS[shareStatus] ?? 'Share My Result'}
          </Button>
          <Button variant="light" icon={copied ? FiCheck : FiCopy} onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy Text'}
          </Button>
        </div>
      </div>
    </div>
  );
}
