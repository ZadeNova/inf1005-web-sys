/**
 * AdminBlogManager.jsx — Lead Island
 *
 * FIX (deploy): csrfToken now read from props first, meta tag as fallback.
 *   On GCP the meta tag can be missing until PHP finishes rendering, so
 *   passing it explicitly through data-props is the reliable approach.
 * FIX (deploy): useEffect syncs API data into localPosts so optimistic
 *   edits/deletes work correctly without a full page reload.
 * FIX (deploy): API returns { posts: [...] } with publishedAt (not created_at)
 *   from BlogController's shaped response — field name matched here.
 */

import { useState, useEffect } from "react";
import Button   from "../../shared/atoms/Button.jsx";
import Skeleton from "../../shared/atoms/Skeleton.jsx";
import { useApi } from "../../shared/hooks/useApi.js";

const CATEGORIES = [
  "Market Update",
  "Drop Announcement",
  "Platform News",
  "Maintenance",
];

function EditForm({ post, onSave, onCancel, getCsrf }) {
  const [title,    setTitle]    = useState(post.title    ?? "");
  const [body,     setBody]     = useState(post.body     ?? "");
  const [category, setCategory] = useState(post.category ?? CATEGORIES[0]);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState(null);

  const inputClass =
    "w-full px-3 py-2 text-sm rounded-md bg-(--color-input-bg) " +
    "border border-(--color-input-border) text-(--color-text-primary) " +
    "focus:outline-none focus:border-(--color-input-focus) transition-colors";

  async function handleSave() {
    if (!title.trim() || !body.trim()) {
      setError("Title and body are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/admin/blog/posts/${post.id}`, {
        method:  "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": getCsrf(),
        },
        body: JSON.stringify({ title, body, category }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? `Server error ${res.status}`);
      }
      onSave(post.id, { title, body, category });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <tr className="bg-(--color-accent-subtle)">
      <td colSpan={4} className="px-4 py-4">
        <div className="flex flex-col gap-3 max-w-2xl">
          {error && (
            <p role="alert" className="text-xs text-(--color-danger)">
              {error}
            </p>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-(--color-text-secondary)">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              className={inputClass}
              aria-label="Post title"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-(--color-text-secondary)">
              Body
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Post body"
              className={`${inputClass} resize-y`}
              rows={5}
              aria-label="Post body"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-(--color-text-secondary)">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
              aria-label="Post category"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              loading={saving}
              onClick={handleSave}
            >
              Save changes
            </Button>
            <Button variant="secondary" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function AdminBlogManager({ csrfToken = '' }) {
  const { data, loading, error } = useApi("/api/v1/blog/posts", { auto: true });

  const [localPosts,   setLocalPosts]   = useState([]);
  const [editingId,    setEditingId]    = useState(null);
  const [deletingId,   setDeletingId]   = useState(null);
  const [actionError,  setActionError]  = useState(null);

  // Sync API data into local state so optimistic updates work
  useEffect(() => {
    if (data?.posts) {
      setLocalPosts(data.posts);
    }
  }, [data]);

  // Resolve CSRF: prop first (more reliable on GCP), meta tag fallback
  function getCsrf() {
    return csrfToken
      || document.querySelector('meta[name="csrf-token"]')?.content
      || '';
  }

  function handleSaveEdit(id, updates) {
    setLocalPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    setEditingId(null);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this post permanently?")) return;
    setDeletingId(id);
    setActionError(null);
    try {
      const res = await fetch(`/api/v1/admin/blog/posts/${id}`, {
        method:  "DELETE",
        headers: { "X-CSRF-Token": getCsrf() },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? `Server error ${res.status}`);
      }
      setLocalPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setActionError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3" role="status" aria-label="Loading blog posts">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} variant="block" height={48} label="Loading post" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="text-sm text-(--color-danger)">
        Failed to load posts: {error}
      </p>
    );
  }

  return (
    <>
      {actionError && (
        <p role="alert" aria-live="assertive"
           className="text-sm text-(--color-danger) mb-3
                      bg-(--color-danger-subtle) border border-(--color-danger)
                      rounded-md px-3 py-2">
          {actionError}
        </p>
      )}
      <div className="overflow-x-auto rounded-md border border-(--color-border)">
        <table
          className="w-full text-sm text-(--color-text-primary)"
          aria-label="Blog posts"
        >
          <thead className="bg-(--color-surface-2) text-(--color-text-secondary)
                            text-xs uppercase tracking-wide">
            <tr>
              <th scope="col" className="px-4 py-3 text-left">Title</th>
              <th scope="col" className="px-4 py-3 text-left">Category</th>
              <th scope="col" className="px-4 py-3 text-left">Author</th>
              <th scope="col" className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--color-border)">
            {localPosts.map((post) => (
              <>
                <tr
                  key={post.id}
                  className="bg-(--color-surface) hover:bg-(--color-surface-2) transition-colors"
                >
                  <td className="px-4 py-3 font-medium max-w-xs truncate">
                    {post.title}
                  </td>
                  <td className="px-4 py-3 text-(--color-text-secondary)">
                    {post.category}
                  </td>
                  <td className="px-4 py-3 text-(--color-text-secondary)">
                    {post.author}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setEditingId(editingId === post.id ? null : post.id)
                        }
                        aria-label={`${editingId === post.id ? "Close" : "Edit"} post: ${post.title}`}
                        aria-expanded={editingId === post.id}
                      >
                        {editingId === post.id ? "Close" : "Edit"}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={deletingId === post.id}
                        onClick={() => handleDelete(post.id)}
                        aria-label={`Delete post: ${post.title}`}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
                {editingId === post.id && (
                  <EditForm
                    key={`edit-${post.id}`}
                    post={post}
                    onSave={handleSaveEdit}
                    onCancel={() => setEditingId(null)}
                    getCsrf={getCsrf}
                  />
                )}
              </>
            ))}
            {localPosts.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-sm text-(--color-text-muted)"
                >
                  No blog posts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}