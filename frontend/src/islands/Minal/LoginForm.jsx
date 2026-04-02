/**
 * LoginForm.jsx — Dev 1 Island
 * Owner: Dev 1
 * Mounts via: mountIsland('login-form-root', LoginForm)
 * PHP view: backend/src/Views/login.php → <div id="login-form-root" data-props="{}"></div>
 *
 *   POST /api/v1/auth/login
 *   Body: { email, password }
 *   Success: { token, redirect }
 *   Error:   { message }
 */

import { useState } from 'react';
import Button from '../../shared/atoms/Button.jsx';
import Input  from '../../shared/atoms/Input.jsx';
import Card   from '../../shared/atoms/Card.jsx';
import { usePost }    from '../../shared/hooks/useApi.js';


export default function LoginForm() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [errors,   setErrors]   = useState({});

  const { execute: login, loading } = usePost('/api/v1/auth/login');

  function validate() {
    const e = {};
    if (!email)                                    e.email    = 'Email is required';
    if (email && !/.+@.+\..+/.test(email))         e.email    = 'Please enter a valid email address';
    if (!password)                                 e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    try {
      const result = await login({ email, password });
      window.location.href = result.redirect ?? '/dashboard';
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setErrors({ form: err.message ?? 'Invalid email or password.' });
      }
    }
  }

  return (
    <Card variant="default" padding="lg" className="w-full max-w-md">
      <div className="flex flex-col gap-5">
        <h2 className="text-xl font-bold text-(--color-text-primary)">
          Sign in to Vapour FT
        </h2>

        {errors.form && (
          <p role="alert" className="text-sm text-(--color-danger) bg-(--color-danger-subtle) border border-(--color-danger) rounded-md px-3 py-2">
            {errors.form}
          </p>
        )}

        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          error={errors.email}
          required
        />

        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          error={errors.password}
          required
        />

        <Button
          variant="primary"
          size="lg"
          loading={loading}
          onClick={handleSubmit}
          className="w-full"
        >
          Sign In
        </Button>

        <p className="text-sm text-center text-(--color-text-muted)">
          Don't have an account?{' '}
          <a href="/register" className="text-(--color-accent) hover:text-(--color-accent-hover) font-medium underline underline-offset-2">
            Register
          </a>
        </p>
      </div>
    </Card>
  );
}