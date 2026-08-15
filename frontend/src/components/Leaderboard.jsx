import { Link } from 'react-router-dom';
import EmptyState from './EmptyState.jsx';

const MEDALS = ['🥇', '🥈', '🥉'];
const ROW_STYLES = ['bg-amber-50/80', 'bg-slate-50', 'bg-orange-50/80'];

export default function Leaderboard({ entries, dashboardToken }) {
  if (!entries?.length) {
    return (
      <EmptyState
        emoji="🏆"
        title="No scores yet"
        description="Share your test link and the leaderboard will light up once your friends take it!"
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white bg-white/80 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="bg-violet-50/80 text-left text-xs font-extrabold uppercase tracking-wider text-violet-600">
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Friend</th>
              <th className="px-4 py-3 text-right">Score</th>
              <th className="px-4 py-3 text-right">Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr
                key={e.attemptId}
                className={`border-t border-slate-100 transition-colors hover:bg-violet-50/50 ${ROW_STYLES[i] ?? ''}`}
              >
                <td className="px-4 py-3 text-lg font-extrabold text-slate-700">
                  {e.rank <= 3 ? MEDALS[e.rank - 1] : e.rank}
                </td>
                <td className="px-4 py-3 font-bold text-slate-800">
                  {dashboardToken ? (
                    <Link
                      to={`/dashboard/${dashboardToken}/attempts/${e.attemptId}`}
                      className="hover:text-violet-600 hover:underline"
                    >
                      {e.participantName}
                    </Link>
                  ) : (
                    e.participantName
                  )}
                </td>
                <td className="px-4 py-3 text-right font-extrabold text-violet-600">
                  {e.score}/{e.totalQuestions}
                </td>
                <td className="px-4 py-3 text-right font-bold text-slate-500">{e.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
