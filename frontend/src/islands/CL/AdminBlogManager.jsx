/**
 * AdminBlogManager.jsx — Lead Island
 * Mounts via: mountIsland('admin-blog-manager-root', AdminBlogManager)
 * PHP view: backend/src/Views/admin.php
 *
 * API endpoints:
 *   GET    /api/v1/blog/posts            → { posts: [...] }
 *   PATCH  /api/v1/admin/blog/posts/:id  → body: { title, body, category }
 *   DELETE /api/v1/admin/blog/posts/:id  → { success: true }
 */

import { useState } from "react";
import Button   from "../../shared/atoms/Button.jsx";
import Skeleton from "../../shared/atoms/Skeleton.jsx";
import { useApi } from "../../shared/hooks/useApi.js";
import { USE_MOCK } from "../../shared/mockAssets.js";

const CATEGORIES = ["Market Update", "Drop Announcement", "Platform News", "Maintenance"];

const MOCK_POSTS = [
  { id: "1", title: "Shadowfall Drop", body: "Details here.", category: "Drop Announcement", author: "admin", publishedAt: "2026-03-01" },
  { id: "2", title: "Platform Update", body: "We fixed bugs.", category: "Platform News",    author: "admin", publishedAt: "2026-03-05" },
];

function EditForm({ post, onSave, onCancel }) {
  const [title,    setTitle]    = useState(post.title);
  const [body,     setBody]     = useState(post.body ?? "");
  const [category, setCategory] = useState(post.category ?? CATEGORIES[0]);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState(null);

  const inputClass = "w-full px-3 py-2 text-sm rounded-md bg-(--color-input-bg) " +
    "border border-(--color-input-border) text-(--color-text-primary) " +
    "focus:outline-none focus:border-(--color-input-focus) transition-colors";

  async function handleSave() {
    if (!title.trim() || !body.trim()) { setError("Title and body are required."); return; }
    setSaving(true);
    setError(null);
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500));
      onSave(post.id, { title, body, category });
      return;
    }
    try {
      const csrf = document.querySelector('meta[name="csrf-token"]')?.content ?? "";
      const res  = await fetch(`/api/v1/admin/blog/posts/${post.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
        body:    JSON.stringify({ title, body, category }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
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
          {error && <p role="alert" className="text-xs text-(--color-danger)">{error}</p>}
          <input  type="text"   value={title}    onChange={e => setTitle(e.target.value)}    placeholder="Title"    className={inputClass} aria-label="Post title" />
          <textarea             value={body}     onChange={e => setBody(e.target.value)}     placeholder="Body"     className={`${inputClass} resize-y`} rows={4} aria-label="Post body" />
          <select               value={category} onChange={e => setCategory(e.target.value)} className={inputClass} aria-label="Post category">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex gap-2">
            <Button variant="primary"   size="sm" loading={saving} onClick={handleSave}>Save</Button>
            <Button variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function AdminBlogManager() {
  const { data, loading, error } = useApi(
    USE_MOCK ? null : "/api/v1/blog/posts",
    { auto: !USE_MOCK }
  );

  const [posts,      setPosts]      = useState(USE_MOCK ? MOCK_POSTS : []);
  const [editingId,  setEditingId]  = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState(null);

  const displayPosts = USE_MOCK ? posts : (data?.posts ?? []);

  function handleSaveEdit(id, updates) {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    setEditingId(null);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this post permanently?")) return;
    setDeletingId(id);
    setActionError(null);
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 400));
      setPosts(prev => prev.filter(p => p.id !== id));
      setDeletingId(null);
      return;
    }
    try {
      const csrf = document.querySelector('meta[name="csrf-token"]')?.content ?? "";
      const res  = await fetch(`/api/v1/admin/blog/posts/${id}`, {
        method:  "DELETE",
        headers: { "X-CSRF-Token": csrf },
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setActionError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return (
    <div className="flex flex-col gap-3" role="status">
      {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} variant="block" height={48} />)}
    </div>
  );

  if (error) return (
    <p role="alert" className="text-sm text-(--color-danger)">Failed to load posts: {error}</p>
  );

  return (
    <>
      {actionError && (
        <p role="alert" className="text-sm text-(--color-danger) mb-3">{actionError}</p>
      )}
      <div className="overflow-x-auto rounded-md border border-(--color-border)">
        <table className="w-full text-sm text-(--color-text-primary)" aria-label="Blog posts">
          <thead className="bg-(--color-surface-2) text-(--color-text-secondary) text-xs uppercase tracking-wide">
            <tr>
              <th scope="col" className="px-4 py-3 text-left">Title</th>
              <th scope="col" className="px-4 py-3 text-left">Category</th>
              <th scope="col" className="px-4 py-3 text-left">Author</th>
              <th scope="col" className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--color-border)">
            {displayPosts.map(post => (
              <>
                <tr key={post.id} className="bg-(--color-surface) hover:bg-(--color-surface-2) transition-colors">
                  <td className="px-4 py-3 font-medium max-w-xs truncate">{post.title}</td>
                  <td className="px-4 py-3 text-(--color-text-secondary)">{post.category}</td>
                  <td className="px-4 py-3 text-(--color-text-secondary)">{post.author}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="secondary" size="sm"
                              onClick={() => setEditingId(editingId === post.id ? null : post.id)}
                              aria-label={`Edit post ${post.title}`}>
                        {editingId === post.id ? "Close" : "Edit"}
                      </Button>
                      <Button variant="danger" size="sm"
                              loading={deletingId === post.id}
                              onClick={() => handleDelete(post.id)}
                              aria-label={`Delete post ${post.title}`}>
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
                  />
                )}
              </>
            ))}
            {displayPosts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-(--color-text-muted)">
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