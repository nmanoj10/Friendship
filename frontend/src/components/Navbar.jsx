import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaUserFriends } from 'react-icons/fa';
import { FiClipboard, FiLogIn, FiLogOut, FiPlusCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-white/70 backdrop-blur-md">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-slate-900">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-linear-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-200">
            <FaUserFriends />
          </span>
          <span className="text-gradient">Know Me?</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <NavLink
            to="/create"
            className={({ isActive }) =>
              `inline-flex items-center gap-1.5 rounded-2xl px-3 py-2 text-sm font-bold transition-colors ${
                isActive
                  ? 'bg-violet-100 text-violet-700'
                  : 'text-slate-600 hover:bg-violet-50 hover:text-violet-700'
              }`
            }
          >
            <FiPlusCircle className="text-base" />
            <span className="hidden sm:inline">Create a Test</span>
            <span className="sm:hidden">Create</span>
          </NavLink>

          {user ? (
            <>
              <NavLink
                to="/my-tests"
                className={({ isActive }) =>
                  `inline-flex items-center gap-1.5 rounded-2xl px-3 py-2 text-sm font-bold transition-colors ${
                    isActive
                      ? 'bg-violet-100 text-violet-700'
                      : 'text-slate-600 hover:bg-violet-50 hover:text-violet-700'
                  }`
                }
              >
                <FiClipboard className="text-base" />
                <span className="hidden sm:inline">My Tests</span>
              </NavLink>
              <span className="hidden items-center gap-1.5 rounded-2xl bg-linear-to-r from-violet-500 to-fuchsia-500 px-3 py-2 text-sm font-extrabold text-white shadow-sm shadow-fuchsia-200 md:inline-flex">
                👋 {user.username}
              </span>
              <button
                onClick={handleLogout}
                title="Log out"
                className="inline-flex items-center gap-1.5 rounded-2xl px-3 py-2 text-sm font-bold text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
              >
                <FiLogOut className="text-base" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 rounded-2xl px-3 py-2 text-sm font-bold transition-colors ${
                  isActive
                    ? 'bg-violet-100 text-violet-700'
                    : 'text-slate-600 hover:bg-violet-50 hover:text-violet-700'
                }`
              }
            >
              <FiLogIn className="text-base" />
              <span className="hidden sm:inline">Log in</span>
              <span className="sm:hidden">Login</span>
            </NavLink>
          )}
        </div>
      </nav>
    </header>
  );
}
