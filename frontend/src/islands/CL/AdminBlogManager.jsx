/**
 * AdminBlogManager.jsx — Lead Island
 */

import { useState, useEffect } from "react";
import Button   from "../../shared/atoms/Button.jsx";
import Skeleton from "../../shared/atoms/Skeleton.jsx";
import { useApi } from "../../shared/hooks/useApi.js";
import React from "react";

const CATEGORIES = [
  "Market Update",
  "Drop Announcement",
  "Platform News",
  "Maintenance",
];

function EditForm({ post, onSave, onCancel, saving, saveError }) {
  const [title,    setTitle]    = useState(post.title    ?? "");
  const [body,     setBody]     = useState(post.body     ?? "");
  const [category, setCategory] = useState(post.category ?? CATEGORIES[0]);

  const inputClass =
    "w-full px-3 py-2 text-sm rounded-md bg-(--color-input-bg) " +
    "border border-(--color-input-border) text-(--color-text-primary) " +
    "focus:outline-none focus:border-(--color-input-focus) transition-colors";

  function handleSubmit() {
    if (!title.trim() || !body.trim()) return;
    onSave(post.id, { title, body, category });
  }

  return (
    <tr className="bg-(--color-accent-subtle)">
      <td colSpan={4} className="px-4 py-4">
        <div className="flex flex-col gap-3 max-w-2xl">

          {/* Error from parent's API call */}
          {saveError && (
            <p role="alert" className="text-xs text-(--color-danger)">
              {saveError}
            </p>
          )}

          <div className="flex flex-col gap-1">
            <label htmlFor="edit-post-title" className="text-xs font-medium text-(--color-text-secondary)">
              Title
            </label>
            <input
              id="edit-post-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="edit-post-body" className="text-xs font-medium text-(--color-text-secondary)">
              Body
            </label>
            <textarea
              id="edit-post-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Post body"
              className={`${inputClass} resize-y`}
              rows={5}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="edit-post-category" className="text-xs font-medium text-(--color-text-secondary)">
              Category
            </label>
            <select
              id="edit-post-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              loading={saving}
              disabled={!title.trim() || !body.trim()}
              onClick={handleSubmit}
            >
              Save changes
            </Button>
            <Button variant="secondary" size="sm" onClick={onCancel} disabled={saving}>
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

  const [localPosts,  setLocalPosts]  = useState([]);
  const [editingId,   setEditingId]   = useState(null);
  const [deletingId,  setDeletingId]  = useState(null);
  const [savingId,    setSavingId]    = useState(null);  
  const [actionError, setActionError] = useState(null);
  const [saveError,   setSaveError]   = useState(null);  

  useEffect(() => {
    if (data?.posts) {
      setLocalPosts(data.posts);
    }
  }, [data]);

  function getCsrf() {
    return csrfToken
      || document.querySelector('meta[name="csrf-token"]')?.content
      || '';
  }

  /**
   * FIX: handleSaveEdit now calls the PATCH API.
   * Only updates local state AFTER the server confirms success.
   * On failure, leaves the edit form open and shows the error.
   */
  async function handleSaveEdit(id, updates) {
    setSavingId(id);
    setSaveError(null);
    setActionError(null);

    try {
      const res = await fetch(`/api/v1/admin/blog/posts/${id}`, {
        method:  "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": getCsrf(),
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? `Server error ${res.status}`);
      }

      // Only update local state after server confirms
      setLocalPosts((prev) =>
        prev.map((p) => (String(p.id) === String(id) ? { ...p, ...updates } : p))
      );
      setEditingId(null);

    } catch (err) {
      setSaveError(err.message ?? "Failed to save changes. Please try again.");
    } finally {
      setSavingId(null);
    }
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
      setLocalPosts((prev) => prev.filter((p) => String(p.id) !== String(id)));
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
              <React.Fragment key={post.id}>
                <tr className="bg-(--color-surface) hover:bg-(--color-surface-2) transition-colors">
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
                        onClick={() => {
                          setSaveError(null);
                          setEditingId(editingId === post.id ? null : post.id);
                        }}
                        aria-label={`${editingId === post.id ? "Close" : "Edit"} post: ${post.title}`}
                        aria-expanded={editingId === post.id}
                        disabled={deletingId === post.id}
                      >
                        {editingId === post.id ? "Close" : "Edit"}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={deletingId === post.id}
                        onClick={() => handleDelete(post.id)}
                        aria-label={`Delete post: ${post.title}`}
                        disabled={editingId === post.id}
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
                    onCancel={() => { setEditingId(null); setSaveError(null); }}
                    saving={savingId === post.id}
                    saveError={saveError}
                  />
                )}
              </React.Fragment>
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