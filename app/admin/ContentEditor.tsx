"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { getToken, clearToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface ContentResponse {
  content: string;
  last_updated: string;
}

export default function ContentEditor() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/admin");
      return;
    }
    loadContent(token);
  }, [router]);

  async function loadContent(token: string) {
    try {
      const data = await apiFetch<ContentResponse>("/api/content", token);
      setContent(data.content);
      setLastUpdated(data.last_updated);
    } catch {
      handleAuthError();
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    const token = getToken();
    if (!token) return router.push("/admin");

    setSaving(true);
    setMessage(null);

    try {
      const data = await apiFetch<ContentResponse>("/api/content", token, {
        method: "PUT",
        body: JSON.stringify({ content }),
      });
      setLastUpdated(data.last_updated);
      setMessage({ type: "success", text: "Content saved successfully." });
    } catch {
      setMessage({ type: "error", text: "Failed to save. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  function handleAuthError() {
    clearToken();
    router.push("/admin");
  }

  function handleLogout() {
    clearToken();
    router.push("/admin");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Mitchell Legal Consulting
            </h1>
            <p className="text-xs text-gray-500">Bot Knowledge Editor</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900">
              Business Content
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              This is everything your chatbot knows. Paste your services, pricing,
              FAQ, and any other information you want visitors to receive.
            </p>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            placeholder="Example:&#10;SERVICES&#10;We handle personal injury, car accidents, and medical malpractice cases.&#10;&#10;PRICING&#10;Initial consultation is free. Contingency fee is 30% of settlement.&#10;&#10;FAQ&#10;Q: How long does a case take?&#10;A: Most cases resolve within 6-18 months."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent resize-none"
          />

          <div className="mt-4 flex items-center justify-between">
            <div>
              {lastUpdated && (
                <p className="text-xs text-gray-400">
                  Last saved:{" "}
                  {new Date(lastUpdated).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              )}
              {message && (
                <p
                  className={`text-sm mt-1 ${
                    message.type === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {message.text}
                </p>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-[#2d2d2d] text-white text-sm font-medium rounded-lg hover:bg-[#1a1a1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Content"}
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Embed Your Widget
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Copy this script tag and paste it before the closing{" "}
            <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">&lt;/body&gt;</code>{" "}
            tag on any webpage.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-mono text-xs text-gray-800 break-all select-all">
            {`<script src="http://localhost:8000/widget.js" defer></script>`}
          </div>
        </div>
      </main>
    </div>
  );
}