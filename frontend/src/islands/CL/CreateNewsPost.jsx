/**
 * CreateNewsPost.jsx — Lead Island
 * Mounts via: mountIsland('create-news-post-root', CreateNewsPost)
 * PHP view: backend/src/Views/admin.php
 * Page entry: src/pages/admin.jsx
 *
 * Admin composer for publishing news articles to /blog.
 * Distinct from the old CreatePost — this has title, category, and full body.
 *
 * API endpoint (when USE_MOCK = false):
 *   POST /api/v1/admin/news
 *   Body:    { title, category, body }
 *   Returns: { post }
 */

import { useState } from 'react';
import Card         from '../../shared/atoms/Card.jsx';
import Button       from '../../shared/atoms/Button.jsx';
import { USE_MOCK } from '../../shared/mockAssets.js';

const CATEGORIES = ['Market Update', 'Drop Announcement', 'Platform News', 'Maintenance'];
const MAX_BODY   = 2000;

export default function CreateNewsPost({ onPublished }) {
  const [title,    setTitle]    = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [body,     setBody]     = useState('');
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState(null);

  const titleEmpty   = title.trim().length === 0;
  const bodyEmpty    = body.trim().length === 0;
  const bodyOverLimit = body.length > MAX_BODY;
  const canSubmit    = !titleEmpty && !bodyEmpty && !bodyOverLimit && !loading;

  async function handlePublish() {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    if (USE_MOCK) {
      console.log('[CreateNewsPost] MOCK publish:', { title, category, body });
      await new Promise(r => setTimeout(r, 600));
      setTitle('');
      setBody('');
      setSuccess(true);
      setLoading(false);
      setTimeout(() => setSuccess(false), 3000);
      onPublished?.();
      return;
    }

    try {
      const csrf = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
      const res  = await fetch('/api/v1/admin/news', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
        body:    JSON.stringify({ title, category, body }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      setTitle('');
      setBody('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onPublished?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const remaining = MAX_BODY - body.length;

  return (
    <Card variant="default" padding="md">
      <div className="flex flex-col gap-4">

        {/* Title */}
        <div>
          <label htmlFor="news-title"
                 className="block text-sm font-medium text-(--color-text-secondary) mb-1">
            Title <span aria-hidden="true" className="text-(--color-danger)">*</span>
          </label>
          <input
            id="news-title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Shadowfall Series 2 Drop This Friday"
            aria-required="true"
            className="
              w-full px-3 py-2 text-sm rounded-md
              bg-(--color-input-bg) border border-(--color-input-border)
              text-(--color-text-primary) placeholder:text-(--color-input-placeholder)
              focus:outline-none focus:border-(--color-input-focus)
              transition-colors
            "
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="news-category"
                 className="block text-sm font-medium text-(--color-text-secondary) mb-1">
            Category
          </label>
          <select
            id="news-category"
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="
              w-full px-3 py-2 text-sm rounded-md
              bg-(--color-input-bg) border border-(--color-input-border)
              text-(--color-text-primary)
              focus:outline-none focus:border-(--color-input-focus)
              transition-colors
            "
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Body */}
        <div>
          <label htmlFor="news-body"
                 className="block text-sm font-medium text-(--color-text-secondary) mb-1">
            Body <span aria-hidden="true" className="text-(--color-danger)">*</span>
          </label>
          <textarea
            id="news-body"
            rows={6}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Write your news article here..."
            aria-required="true"
            aria-describedby="body-count"
            className="
              w-full px-3 py-2 text-sm rounded-md resize-y
              bg-(--color-input-bg) border border-(--color-input-border)
              text-(--color-text-primary) placeholder:text-(--color-input-placeholder)
              focus:outline-none focus:border-(--color-input-focus)
              transition-colors
            "
          />
          <p id="body-count"
             className={`text-[11px] font-mono mt-1 ${
               bodyOverLimit
                 ? 'text-(--color-danger)'
                 : remaining < 200
                 ? 'text-(--color-warning)'
                 : 'text-(--color-text-muted)'
             }`}>
            {remaining} characters remaining
          </p>
        </div>

        {/* Feedback */}
        {error && (
          <p role="alert" className="text-sm text-(--color-danger)">
            {error}
          </p>
        )}
        {success && (
          <p role="status" aria-live="polite" className="text-sm text-(--color-success)">
            Article published successfully.
          </p>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="md"
            loading={loading}
            disabled={!canSubmit}
            onClick={handlePublish}
          >
            Publish Article
          </Button>
        </div>

      </div>
    </Card>
  );
}