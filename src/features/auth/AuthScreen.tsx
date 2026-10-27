import React, { useState } from 'react';
import { MoonlitAtmosphere } from '../../components/MoonlitAtmosphere';
import { api, setStoredUser } from '../../services/api';
import { User } from '../../types';
import { BRAND, MESSAGES, friendlyError } from '../../copy';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

interface AuthScreenProps {
  onAuthenticated: (user: User) => void;
}

const inputClass =
  'w-full px-3.5 py-3 rounded-lg bg-[#080D16]/90 border border-[#3A4A5E] text-[#DCE8F5] text-base sm:text-sm placeholder-[#7F90A3] transition-colors';
const labelClass = 'block text-sm text-[#B4C2D1] mb-1.5';

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const switchMode = (register: boolean) => {
    setIsRegister(register);
    setError(null);
  };

  const finish = (res: { user?: User; error?: string }, fallback: string) => {
    if (res.error) {
      setError(isRegister ? friendlyError(res.error) : MESSAGES.invalidLogin);
    } else if (res.user) {
      setStoredUser(res.user);
      onAuthenticated(res.user);
    } else {
      setError(fallback);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isRegister) {
      if (!username.trim() || !email.trim() || !password) {
        setError('Please fill in all required fields.');
        return;
      }
      if (username.trim().length < 3) {
        setError('Username must be at least 3 characters.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setLoading(true);
      try {
        const res = await api.register({
          username: username.trim(),
          email: email.trim(),
          password,
          displayName: displayName.trim() || username.trim(),
        });
        finish(res, MESSAGES.genericError);
      } catch (err: any) {
        setError(friendlyError(err?.message));
      } finally {
        setLoading(false);
      }
    } else {
      if (!identifier.trim() || !password) {
        setError('Enter your username or email and your password.');
        return;
      }

      setLoading(true);
      try {
        const res = await api.login({ identifier: identifier.trim(), password });
        finish(res, MESSAGES.invalidLogin);
      } catch (err: any) {
        const msg = friendlyError(err?.message);
        setError(msg === err?.message ? MESSAGES.invalidLogin : msg);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <MoonlitAtmosphere isLoginMode={true} landscapeKey="login">
      <div className="flex-1 flex flex-col p-6 sm:p-10 lg:p-16 max-w-7xl mx-auto w-full">
        <header>
          <span className="font-serif tracking-[0.2em] text-xl sm:text-2xl font-bold text-[#DCE8F5]">
            {BRAND.name}
          </span>
        </header>

        <main className="flex-1 grid lg:grid-cols-2 gap-10 items-center py-10">
          <section className="max-w-xl">
            <p className="text-xs tracking-[0.2em] text-[#E2A65C] font-semibold mb-4">A GAME OF STRATEGY</p>
            <h1 className="text-3xl sm:text-5xl font-bold text-[#DCE8F5] leading-tight">
              A quiet place to think. A challenge worth taking.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[#B4C2D1] leading-relaxed">
              Play against AI opponents, challenge your friends, and see how your strategy improves.
            </p>
            <p className="mt-8 text-sm text-[#9AA9BA] italic">{BRAND.tagline}</p>
          </section>

          <section className="w-full max-w-md lg:justify-self-end">
            <div className="surface-card rounded-2xl p-6 sm:p-8 backdrop-blur-xl">
              <div role="tablist" aria-label="Account" className="grid grid-cols-2 gap-1 p-1 mb-6 rounded-lg bg-[#080D16]/80">
                {[
                  { reg: false, label: 'Sign In' },
                  { reg: true, label: 'Create Account' },
                ].map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    role="tab"
                    aria-selected={isRegister === t.reg}
                    onClick={() => switchMode(t.reg)}
                    className={`py-2.5 rounded-md text-sm font-semibold transition-colors cursor-pointer ${
                      isRegister === t.reg ? 'bg-[#172231] text-[#DCE8F5]' : 'text-[#9AA9BA] hover:text-[#DCE8F5]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div role="alert" aria-live="assertive">
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-[#F16D78]/10 border border-[#F16D78]/40 text-[#FF9AA2] text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {isRegister ? (
                  <>
                    <div>
                      <label htmlFor="reg-username" className={labelClass}>Username</label>
                      <input
                        id="reg-username"
                        type="text"
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="reg-email" className={labelClass}>Email</label>
                      <input
                        id="reg-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="reg-display" className={labelClass}>Display name (optional)</label>
                      <input
                        id="reg-display"
                        type="text"
                        autoComplete="nickname"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label htmlFor="login-identifier" className={labelClass}>Username or email</label>
                    <input
                      id="login-identifier"
                      type="text"
                      autoComplete="username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="auth-password" className="text-sm text-[#B4C2D1]">Password</label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-pressed={showPassword}
                      className="text-sm text-[#9AA9BA] hover:text-[#DCE8F5] flex items-center gap-1.5 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>

                {isRegister && (
                  <div>
                    <label htmlFor="auth-confirm" className={labelClass}>Confirm password</label>
                    <input
                      id="auth-confirm"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-amber-primary w-full mt-2 py-3 px-4 rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-[#080D16] border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                      <span>{MESSAGES.loading}</span>
                    </>
                  ) : (
                    <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                  )}
                </button>
              </form>
            </div>
          </section>
        </main>
      </div>
    </MoonlitAtmosphere>
  );
};
