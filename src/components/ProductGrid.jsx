
import { useQuery } from "@tanstack/react-query";
import ProductCard from "./ProductCard";
import { getAllProductReviews } from "../services/reviewServices";

function ProductGrid({ products }) {
  const {
    data: reviews = [],
  } = useQuery({
    queryKey: ["productReviews"],
    queryFn: getAllProductReviews,
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {products.map((product) => {
        const productReviews = reviews.filter(
          (review) =>
            String(review.productId) === String(product.id)
        );

        const averageRating =
          productReviews.length > 0
            ? productReviews.reduce(
                (total, review) => total + Number(review.rating),
                0
              ) / productReviews.length
            : 0;

        return (
          <ProductCard
            key={product.id}
            product={product}
            averageRating={averageRating}
            reviewCount={productReviews.length}
          />
        );
      })}
    </div>
  );
}

export default ProductGrid;
