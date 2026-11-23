import { revalidatePath } from "next/cache";
import { storeApi } from "@/lib/store-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function AdminReviewsPage() {
  const reviews = await storeApi.adminReviews();

  async function moderate(formData: FormData) {
    "use server";
    await storeApi.adminModerateReview(String(formData.get("id")), String(formData.get("status")));
    revalidatePath("/admin/reviews");
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Avis clients</h1>
      <div className="space-y-3">
        {reviews.map((review) => {
          const product = review.product as { name?: string } | undefined;
          return (
            <div key={String(review.id)} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {String(review.authorName)} · {String(review.rating)}/5
                  </p>
                  <p className="text-sm text-muted-foreground">{product?.name}</p>
                  <p className="mt-2 text-sm">{String(review.comment || "")}</p>
                </div>
                <Badge>{String(review.status)}</Badge>
              </div>
              {review.status === "PENDING" ? (
                <div className="mt-3 flex gap-2">
                  <form action={moderate}>
                    <input type="hidden" name="id" value={String(review.id)} />
                    <input type="hidden" name="status" value="APPROVED" />
                    <Button type="submit" size="sm">
                      Approuver
                    </Button>
                  </form>
                  <form action={moderate}>
                    <input type="hidden" name="id" value={String(review.id)} />
                    <input type="hidden" name="status" value="REJECTED" />
                    <Button type="submit" size="sm" variant="outline">
                      Refuser
                    </Button>
                  </form>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
