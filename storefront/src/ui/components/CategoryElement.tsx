import { LinkWithChannel } from "../atoms/LinkWithChannel";
import { ProductImageWrapper } from "@/ui/atoms/ProductImageWrapper";
import type { CategoryListItemFragment } from "@/gql/graphql";

export function CategoryElement({
  category,
  loading = "lazy",
  priority = false,
}: { 
  category: CategoryListItemFragment;
  loading?: "eager" | "lazy";
  priority?: boolean;
}) {
  return (
    <div className="group overflow-hidden rounded-lg border border-neutral-200 transition-all hover:shadow-lg">
      <LinkWithChannel href={`/categories/${category.slug}`} key={category.id}>
        <div>
          {category?.backgroundImage?.url ? (
            <ProductImageWrapper
              loading={loading}
              src={category.backgroundImage.url}
              alt={category.backgroundImage.alt ?? category.name ?? ""}
              width={512}
              height={512}
              sizes={"512px"}
              priority={priority}
              className="aspect-square w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="aspect-square bg-neutral-100 flex items-center justify-center">
              <span className="text-4xl font-bold text-neutral-300">{category.name.charAt(0)}</span>
            </div>
          )}
          <div className="p-4">
            <h3 className="text-lg font-medium text-neutral-900">{category.name}</h3>
            {category.products?.totalCount !== undefined && (
              <p className="mt-1 text-sm text-neutral-500">{category.products.totalCount} products</p>
            )}
          </div>
        </div>
      </LinkWithChannel>
    </div>
  );
}