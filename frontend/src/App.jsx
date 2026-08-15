import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import CreateTest from './pages/CreateTest.jsx';
import TestIntro from './pages/TestIntro.jsx';
import Quiz from './pages/Quiz.jsx';
import Result from './pages/Result.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AttemptDetail from './pages/AttemptDetail.jsx';
import Login from './pages/Login.jsx';
import MyTests from './pages/MyTests.jsx';
import NotFound from './pages/NotFound.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { LoadingPage } from './components/Loading.jsx';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingPage />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

export default function App() {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Decorative background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-violet-300/40 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-fuchsia-300/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
      </div>

      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/create"
            element={
              <RequireAuth>
                <CreateTest />
              </RequireAuth>
            }
          />
          <Route
            path="/my-tests"
            element={
              <RequireAuth>
                <MyTests />
              </RequireAuth>
            }
          />
          <Route path="/t/:testCode" element={<TestIntro />} />
          <Route path="/t/:testCode/quiz" element={<Quiz />} />
          <Route path="/t/:testCode/result" element={<Result />} />
          <Route path="/dashboard/:dashboardToken" element={<Dashboard />} />
          <Route
            path="/dashboard/:dashboardToken/attempts/:attemptId"
            element={<AttemptDetail />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}
