/**
 * RegisterForm.jsx — Dev 1 Island
 * Owner: Dev 1
 * Mounts via: mountIsland('register-form-root', RegisterForm)
 * PHP view: backend/src/Views/register.php → <div id="register-form-root" data-props="{}"></div>
 *
 * API endpoint (when USE_MOCK = false):
 *   POST /api/v1/auth/register
 *   Body: { username, email, password, confirm_password }
 *   Success: { redirect }
 *   Error:   { message, field? }
 */

import { useState } from 'react';
import Button from '../../shared/atoms/Button.jsx';
import Input  from '../../shared/atoms/Input.jsx';
import Card   from '../../shared/atoms/Card.jsx';
import { usePost } from '../../shared/hooks/useApi.js';

const USE_AUTH_MOCK = false;

export default function RegisterForm() {
  const [form, setForm] = useState({
    username:        '',
    email:           '',
    password:        '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const { execute: register, loading } = usePost('/api/v1/auth/register');

  function update(field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }));
  }

  function validate() {
  const e = {};
  if (!form.username)
    e.username = 'Username is required';
  if (form.username.length < 3)
    e.username = 'Username must be at least 3 characters';
  if (!form.email)
    e.email = 'Email is required';
  if (!form.password){
    e.password = 'Password is required';
  }else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.password)){
    e.password = 'Password must be at least 8 characters with uppercase, lowercase, and a number.';
  }

  if (form.password !== form.confirmPassword)
    e.confirmPassword = 'Passwords do not match';

  setErrors(e);
  return Object.keys(e).length === 0;
}

  async function handleSubmit() {
    if (!validate()) return;

    if (USE_AUTH_MOCK) {
      console.log('[RegisterForm] MOCK submit', form);
      window.location.href = '/login';
      return;
    }

    try {
      const result = await register({
        username:         form.username,
        email:            form.email,
        password:         form.password,
        confirm_password: form.confirmPassword,
      });
      window.location.href = result.redirect ?? '/login';
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors);
    } else {
        setErrors({ form: err.message ?? 'Something went wrong. Please try again.' });
      }
    }
  }

  return (
    <Card variant="default" padding="lg" className="w-full max-w-md">
      <div className="flex flex-col gap-5">

        <h2 className="text-xl font-bold text-(--color-text-primary)">
          Create your account
        </h2>

        {errors.form && (
          <p role="alert" className="text-sm text-(--color-danger)
             bg-(--color-danger-subtle) border border-(--color-danger)
             rounded-md px-3 py-2">
            {errors.form}
          </p>
        )}

        <Input
          id="username"
          label="Username"
          placeholder="0xYourName"
          value={form.username}
          onChange={update('username')}
          error={errors.username}
          required
        />

        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={update('email')}
          error={errors.email}
          required
        />

        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="Min. 8 chars, uppercase, lowercase, number" 
          value={form.password}
          onChange={update('password')}
          error={errors.password}
          required
        />

        <Input
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="Repeat password"
          value={form.confirmPassword}
          onChange={update('confirmPassword')}
          error={errors.confirmPassword}
          required
        />

        <Button
          variant="primary"
          size="lg"
          loading={loading}
          onClick={handleSubmit}
          className="w-full"
        >
          Create Account
        </Button>

        <p className="text-sm text-center text-(--color-text-muted)">
          Already have an account?{' '}
          <a href="/login"
             className="text-(--color-accent) hover:text-(--color-accent-hover) font-medium">
            Sign in
          </a>
        </p>

      </div>
    </Card>
  );
}