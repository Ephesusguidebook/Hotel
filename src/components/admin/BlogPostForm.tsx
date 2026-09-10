import { saveBlogPostAction, deleteBlogPostAction } from "@/app/admin/actions";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ImageField from "@/components/admin/ImageField";
import type { BlogPost } from "@/lib/data";

const emptyPost: BlogPost = {
  slug: "",
  title: "",
  image: "",
  date: "",
  excerpt: "",
  content: "",
};

export default function BlogPostForm({ post }: { post?: BlogPost }) {
  const initial = post ?? emptyPost;
  const isNew = !post;
  const boundSave = saveBlogPostAction.bind(null, initial.slug);
  const boundDelete = deleteBlogPostAction.bind(null, initial.slug);

  return (
    <>
      <form action={boundSave} className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="URL slug">
            <input
              name="slug"
              defaultValue={initial.slug}
              required
              pattern="[a-z0-9\-]+"
              title="Lowercase letters, numbers, and hyphens only"
              className="input"
            />
          </Field>
          <Field label="Title">
            <input name="title" defaultValue={initial.title} required className="input" />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Date (shown as written, e.g. June 3, 2026)">
            <input name="date" defaultValue={initial.date} required className="input" />
          </Field>
          <ImageField
            name="image"
            label="Cover photo"
            defaultValue={initial.image ? [initial.image] : []}
            multiple={false}
          />
        </div>

        <Field label="Excerpt (shown on the journal list)">
          <textarea
            name="excerpt"
            defaultValue={initial.excerpt}
            rows={2}
            required
            className="input"
          />
        </Field>

        <RichTextEditor
          name="content"
          label="Post content"
          defaultValue={initial.content}
          hint="Add headings, links, lists and photos from your library."
          minHeight="26rem"
        />

        <div className="pt-4 border-t border-charcoal-900/10">
          <button
            type="submit"
            className="bg-gold-500 hover:bg-gold-400 text-charcoal-950 text-sm tracking-widest-plus px-6 py-3.5"
          >
            {isNew ? "PUBLISH POST" : "SAVE CHANGES"}
          </button>
        </div>
      </form>

      {!isNew && (
        <form action={boundDelete} className="mt-4">
          <ConfirmSubmitButton
            confirmMessage={`Delete "${initial.title}"? This can't be undone.`}
            className="text-sm tracking-widest-plus text-red-700 hover:text-red-800"
          >
            DELETE POST
          </ConfirmSubmitButton>
        </form>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-charcoal-800">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
