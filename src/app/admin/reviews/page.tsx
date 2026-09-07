import { listReviews } from "@/lib/data/admin";
import { ActionForm, Disclosure, Field } from "@/components/admin/form";
import { Icon } from "@/components/admin/icons";
import { ConfirmSubmit } from "@/components/admin/ui";
import { createReview, deleteReview, updateReview } from "../actions";

export default async function ReviewsPage() {
  const reviews = await listReviews();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Reviews</h1>
        <Disclosure label={<><Icon name="plus" />Add review</>}>
          <ActionForm
            action={createReview}
            className="card mt-2 grid grid-cols-1 gap-3 p-4"
            submitLabel="Add"
            pendingLabel="Adding…"
            resetOnSuccess
          >
            <input name="name" required placeholder="Name" aria-label="Name" className="input" />
            <textarea name="body" required rows={3} placeholder="Review" aria-label="Review" className="input" />
          </ActionForm>
        </Disclosure>
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-muted">No reviews yet.</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id}>
              <ActionForm
                key={`${r.name}-${r.body}-${r.is_published}`}
                action={updateReview.bind(null, r.id)}
                className="card grid grid-cols-1 gap-3 p-4"
                buttonClassName="btn-secondary"
                extra={
                  <>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="is_published" defaultChecked={r.is_published} className="h-4 w-4" />
                      Show on site
                    </label>
                    <ConfirmSubmit className="btn-danger ml-auto" message="Delete this review?" formAction={deleteReview.bind(null, r.id)}>
                      <Icon name="trash" />
                      Delete
                    </ConfirmSubmit>
                  </>
                }
              >
                <Field label="Name" htmlFor={`name-${r.id}`}>
                  <input id={`name-${r.id}`} name="name" defaultValue={r.name} required className="input" />
                </Field>
                <Field label="Review" htmlFor={`body-${r.id}`}>
                  <textarea id={`body-${r.id}`} name="body" defaultValue={r.body} required rows={3} className="input" />
                </Field>
              </ActionForm>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
