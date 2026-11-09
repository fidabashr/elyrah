
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getProducts } from "../services/ProductServices";
import ProductGrid from "../components/ProductGrid";

function Home() {

  const {
    data: products = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const categories = [
    {
      name: "Abayas",
      image: "src/assets/images/frontOpen.webp",
    },
    {
      name: "Dresses",
      image: "src/assets/images/maxi1.webp",
    },
    {
      name: "Skirts",
      image: "src/assets/images/whiteskirt.webp",
    },
    {
      name: "Tops",
      image: "src/assets/images/peplum.webp",
    },
    {
      name: "Gown",
      image: "src/assets/images/floralgown.webp",
    },
  ];

  const featuredProducts = products.slice(0, 4);

  return (
    <main className="bg-stone-50">

      {/* HERO SECTION */}

    <section
  className="relative min-h-[450px] w-full bg-cover bg-no-repeat sm:min-h-[600px] lg:min-h-[700px]"
  style={{
    backgroundImage: "url('/src/assets/images/logo.webp')",
    backgroundPosition: "55% center",
  }}
>
  {/* Text overlay on image */}
 <div className="absolute left-6 top-1/2 z-10 -translate-y-1/2 sm:left-12 lg:left-20">

  <p className="mb-4 font-sans text-xs font-medium uppercase tracking-[0.35em] text-[#9B806B]">
    ELYRAH COLLECTION
  </p>

  <h1 className="font-serif text-4xl font-medium leading-tight tracking-wide text-[#49372D] sm:text-5xl lg:text-6xl">
    Elegance in
    <br />
    Every Layer.
  </h1>

  <p className="mt-5 max-w-xs font-sans text-sm leading-7 text-[#75665C] sm:text-base">
    Discover timeless modest fashion,
    thoughtfully designed for effortless elegance.
  </p>

  <Link
    to="/products"
    className="mt-7 inline-block bg-[#49372D] px-7 py-3 font-sans text-xs tracking-[0.2em] text-white transition duration-300 hover:bg-[#725746]"
  >
    SHOP COLLECTION
  </Link>

</div>
</section>


      {/* CATEGORIES */}

      <section className="px-5 py-14 sm:px-8 lg:px-16">

        <div className="mb-8 text-center">

          <p className="text-xs uppercase tracking-widest text-stone-500">
            Explore
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-stone-900 sm:text-3xl">
            Shop by Category
          </h2>

        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-6">

          {categories.map((category) => (

            <Link
              key={category.name}
              to={`/products?category=${encodeURIComponent(category.name)}`}
              className="group overflow-hidden rounded-lg bg-white"
            >

              <div className="h-48 overflow-hidden sm:h-64">

                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

              </div>

              <h3 className="py-4 text-center text-sm font-medium text-stone-800">
                {category.name}
              </h3>

            </Link>

          ))}

        </div>

      </section>


      {/* FEATURED PRODUCTS */}

      <section className="bg-white px-5 py-14 sm:px-8 lg:px-16">

        <div className="mb-8 flex items-end justify-between">

          <div>

            <p className="text-xs uppercase tracking-widest text-stone-500">
              Our Selection
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-stone-900 sm:text-3xl">
              Featured Products
            </h2>

          </div>

          <Link
            to="/products"
            className="text-xs font-medium text-stone-700 underline sm:text-sm"
          >
            View All
          </Link>

        </div>

        {isPending ? (

          <p className="py-10 text-center text-stone-500">
            Loading products...
          </p>

        ) : isError ? (

          <p className="py-10 text-center text-red-600">
            Unable to load products.
          </p>

        ) : featuredProducts.length === 0 ? (

          <p className="py-10 text-center text-stone-500">
            No featured products available.
          </p>

        ) : (

          <ProductGrid products={featuredProducts} />

        )}

      </section>


      {/* PROMOTIONAL BANNER */}

      <section className="px-5 py-14 sm:px-8 lg:px-16">

        <div className="rounded-lg bg-stone-200 px-6 py-14 text-center sm:px-12 sm:py-20">

          <p className="text-xs uppercase tracking-widest text-stone-500">
            New Collection
          </p>

          <h2 className="mt-3 text-3xl font-semibold text-stone-900 sm:text-4xl">
            Elegance Meets Comfort
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-stone-600">
            Find beautiful pieces that complement your
            style and make every moment special.
          </p>

          <Link
            to="/products"
            className="mt-7 inline-block rounded-md bg-stone-900 px-7 py-3 text-sm text-white transition hover:bg-stone-700"
          >
            Explore Collection
          </Link>

        </div>

      </section>


      {/* WHY CHOOSE US */}

      <section className="px-5 py-14 sm:px-8 lg:px-16">

        <h2 className="mb-10 text-center text-2xl font-semibold text-stone-900 sm:text-3xl">
          Why Choose Elyrah?
        </h2>

        <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">

          <div>

            <h3 className="font-semibold text-stone-800">
              Quality Fabrics
            </h3>

            <p className="mt-2 text-sm text-stone-500">
              Carefully selected materials for comfort.
            </p>

          </div>

          <div>

            <h3 className="font-semibold text-stone-800">
              Timeless Designs
            </h3>

            <p className="mt-2 text-sm text-stone-500">
              Elegant styles for every occasion.
            </p>

          </div>

          <div>

            <h3 className="font-semibold text-stone-800">
              Secure Shopping
            </h3>

            <p className="mt-2 text-sm text-stone-500">
              A smooth and convenient shopping experience.
            </p>

          </div>

          <div>

            <h3 className="font-semibold text-stone-800">
              Customer Support
            </h3>

            <p className="mt-2 text-sm text-stone-500">
              We're here to help with your shopping.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Home;
