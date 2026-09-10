"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import type { MediaItem } from "@/lib/media-repo";
import MediaPicker from "@/components/admin/MediaPicker";

type Props = {
  /** Form field name. The value posted is HTML. */
  name: string;
  label: string;
  defaultValue?: string;
  hint?: string;
  minHeight?: string;
};

export default function RichTextEditor({
  name,
  label,
  defaultValue = "",
  hint,
  minHeight = "18rem",
}: Props) {
  const [html, setHtml] = useState(defaultValue);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");

  const editor = useEditor({
    // Next.js renders this on the server first; rendering the editor
    // immediately would produce markup React then disagrees with.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: "noopener noreferrer" },
        },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-md" },
      }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class: "prose-editor focus:outline-none",
        "data-testid": `editor-${name}`,
      },
    },
    onUpdate: ({ editor }) => {
      const next = editor.getHTML();
      // TipTap represents "empty" as a single blank paragraph; don't store that.
      setHtml(next === "<p></p>" ? "" : next);
    },
  });

  function openLinkEditor() {
    if (!editor) return;
    setLinkValue(editor.getAttributes("link").href ?? "");
    setLinkOpen(true);
  }

  function applyLink() {
    if (!editor) return;
    const href = linkValue.trim();
    if (!href) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      const withProtocol = /^(https?:|mailto:|tel:|\/)/i.test(href)
        ? href
        : `https://${href}`;
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: withProtocol })
        .run();
    }
    setLinkOpen(false);
    setLinkValue("");
  }

  function insertImage(item: MediaItem) {
    editor
      ?.chain()
      .focus()
      .setImage({ src: item.url, alt: item.altText || item.filename })
      .run();
  }

  return (
    <div className="block">
      <span className="text-sm font-medium text-charcoal-800">{label}</span>
      {hint && <span className="mt-1 block text-sm text-charcoal-600">{hint}</span>}

      <input type="hidden" name={name} value={html} />

      <div className="mt-2 overflow-hidden rounded-md border border-charcoal-900/20 bg-white focus-within:border-gold-500">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 border-b border-charcoal-900/10 bg-ivory-50 px-2 py-2">
          <ToolbarButton
            label="Normal text"
            active={editor?.isActive("paragraph") && !editor?.isActive("heading")}
            onClick={() => editor?.chain().focus().setParagraph().run()}
          >
            Text
          </ToolbarButton>
          <ToolbarButton
            label="Large heading"
            active={editor?.isActive("heading", { level: 2 })}
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <span className="text-base font-semibold">H1</span>
          </ToolbarButton>
          <ToolbarButton
            label="Small heading"
            active={editor?.isActive("heading", { level: 3 })}
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            <span className="text-sm font-semibold">H2</span>
          </ToolbarButton>

          <Divider />

          <ToolbarButton
            label="Bold"
            active={editor?.isActive("bold")}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <span className="font-bold">B</span>
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            active={editor?.isActive("italic")}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <span className="italic">I</span>
          </ToolbarButton>
          <ToolbarButton
            label="Underline"
            active={editor?.isActive("underline")}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
          >
            <span className="underline">U</span>
          </ToolbarButton>

          <Divider />

          <ToolbarButton
            label="Bulleted list"
            active={editor?.isActive("bulletList")}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            • List
          </ToolbarButton>
          <ToolbarButton
            label="Numbered list"
            active={editor?.isActive("orderedList")}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            1. List
          </ToolbarButton>
          <ToolbarButton
            label="Quote"
            active={editor?.isActive("blockquote")}
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          >
            &ldquo; Quote
          </ToolbarButton>

          <Divider />

          <ToolbarButton
            label="Add link"
            active={editor?.isActive("link")}
            onClick={openLinkEditor}
          >
            Link
          </ToolbarButton>
          <ToolbarButton label="Insert photo" onClick={() => setPickerOpen(true)}>
            Photo
          </ToolbarButton>

          <Divider />

          <ToolbarButton
            label="Undo"
            onClick={() => editor?.chain().focus().undo().run()}
          >
            Undo
          </ToolbarButton>
          <ToolbarButton
            label="Redo"
            onClick={() => editor?.chain().focus().redo().run()}
          >
            Redo
          </ToolbarButton>
        </div>

        {/* Link editor row */}
        {linkOpen && (
          <div className="flex flex-wrap items-center gap-2 border-b border-charcoal-900/10 bg-gold-500/5 px-3 py-2.5">
            <input
              autoFocus
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyLink();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  setLinkOpen(false);
                }
              }}
              placeholder="https://example.com  or  /rooms"
              data-testid={`link-input-${name}`}
              className="min-w-0 flex-1 rounded border border-charcoal-900/20 bg-white px-3 py-1.5 text-sm"
            />
            <button
              type="button"
              onClick={applyLink}
              className="rounded bg-charcoal-900 px-3 py-1.5 text-sm text-ivory-50 hover:bg-charcoal-800"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => setLinkOpen(false)}
              className="rounded px-3 py-1.5 text-sm text-charcoal-700 hover:bg-charcoal-900/5"
            >
              Cancel
            </button>
          </div>
        )}

        <EditorContent
          editor={editor}
          className="px-4 py-3"
          style={{ minHeight }}
        />
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={insertImage}
        title="Insert a photo"
      />
    </div>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-charcoal-900/15" aria-hidden />;
}

function ToolbarButton({
  children,
  label,
  onClick,
  active = false,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`rounded px-2.5 py-1.5 text-sm transition-colors ${
        active
          ? "bg-charcoal-900 text-ivory-50"
          : "text-charcoal-700 hover:bg-charcoal-900/5 hover:text-charcoal-900"
      }`}
    >
      {children}
    </button>
  );
}
