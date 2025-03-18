import { CategoryListDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { CategoryElement } from "@/ui/components/CategoryElement";
// import { Pagination } from "@/ui/components/Pagination";

export const metadata = {
	title: "ACME Storefront, powered by Saleor & Next.js",
	description:
		"Storefront Next.js Example for building performant e-commerce experiences with Saleor - the composable, headless commerce platform for global brands.",
};

export default async function Page({  }: { params: { channel: string } }) {
	const { categories } = await executeGraphQL(CategoryListDocument, {
		variables: {
			first: 9,
		},
		revalidate: 60, // Cache for 60 seconds
	});
	const totalCategories = categories?.totalCount || 0;
	return (
		<section className="mx-auto max-w-7xl p-8 pb-16">
			<h2 className="sr-only">Product list</h2>
			{totalCategories === 0 ? (
				<div className="py-8 text-center">
					<h2 className="text-xl font-medium">No categories found</h2>
				</div>
			) : (
				<>
					<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
						{categories?.edges.map(({ node }) => (
							<CategoryElement key={node.id} category={node} />
						))}
					</div>
				</>
			)}
		</section>
	);
}
