
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  getProducts,
} from "../services/ProductServices";
import ProductGrid from "../components/ProductGrid";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  Gem,
} from "lucide-react";

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
      name: "Top",
      image: "src/assets/images/peplum.webp",
    },
    {
      name: "Gown",
      image: "src/assets/images/floralgown.webp",
    },
  ];

  const featuredProducts = products.slice(0, 4);

  const benefits = [
    {
      icon: Gem,
      title: "Thoughtful Quality",
      description:
        "Carefully selected pieces designed with comfort and quality in mind.",
    },
    {
      icon: Sparkles,
      title: "Timeless Elegance",
      description:
        "Beautiful designs that bring effortless elegance to every occasion.",
    },
    {
      icon: ShieldCheck,
      title: "Easy Shopping",
      description:
        "Enjoy a simple and convenient shopping experience.",
    },
    {
      icon: HeartHandshake,
      title: "Here for You",
      description:
        "We're always happy to help with your shopping experience.",
    },
  ];

  return (
    <main className="overflow-hidden bg-[#F3EEE5]">

      {/* HERO SECTION */}
<section className="relative w-full overflow-hidden">
  {/* Background Image */}
  <img
    src="/src/assets/images/logo.webp"
    alt="ELYRAH collection"
    className="block h-auto w-full"
  />

  {/* Image Overlay */}
  <div className="absolute inset-0 bg-gradient-to-r from-[#F3EEE5]/95 via-[#F3EEE5]/75 to-[#F3EEE5]/10" />

  {/* Hero Content */}
  <div className="absolute inset-0 mx-auto flex max-w-7xl items-center px-6 py-8 sm:px-10 lg:px-16">

    <div className="max-w-xl">

      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#796858]">
        THE ELYRAH EDIT
      </p>

      <h1 className="font-display text-4xl font-medium leading-[0.98] text-[#342820] sm:text-6xl lg:text-7xl">
        Elegance in
        <br />
        Every Layer.
      </h1>

      <p className="mt-5 max-w-sm text-xs leading-6 text-[#6F5D4E] sm:text-base sm:leading-7">
        Discover thoughtfully curated modest fashion,
        where timeless elegance meets everyday comfort.
      </p>

      <Link
        to="/products"
       style={{ color: "#E5D9C9" }}
  className="mt-7 inline-flex items-center gap-3 bg-[#342820] px-7 py-3.5 text-xs font-semibold tracking-[0.15em] transition duration-300 hover:bg-[#796858]"
      >
        EXPLORE COLLECTION
        <ArrowRight size={16} />
      </Link>

      <p className="mt-6 text-[10px] tracking-[0.12em] text-[#796858] sm:text-xs">
        MODESTY · ELEGANCE · COMFORT
      </p>

    </div>
  </div>
</section>


      {/* CATEGORY SECTION */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12 lg:py-16">

        <div className="mb-7 flex items-end justify-between">

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#967C63]">
              FIND YOUR STYLE
            </p>

            <h2 className="mt-2 font-display text-3xl font-semibold text-[#342820] sm:text-4xl">
              Explore Collections
            </h2>
          </div>

          <Link
            to="/products"
            className="mb-1 hidden items-center gap-2 text-xs font-medium text-[#796858] transition hover:text-[#342820] sm:flex"
          >
            VIEW ALL
            <ArrowRight size={15} />
          </Link>

        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">

          {categories.map((category) => (

            <Link
              key={category.name}
              to={`/products?category=${encodeURIComponent(category.name)}`}
              className="group"
            >

              <div className="relative overflow-hidden bg-[#E5D9C9]">

                <div className="aspect-[3/4] overflow-hidden">

                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />

                </div>

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#342820]/70 to-transparent px-3 pb-4 pt-12 sm:px-4">

                  <h3 className="font-display text-xl font-semibold text-[#FAF7F1] sm:text-2xl">
                    {category.name}
                  </h3>

                  <p className="mt-1 flex items-center gap-1 text-[10px] uppercase tracking-widest text-[#F3EEE5]">
                    DISCOVER
                    <ArrowRight size={12} />
                  </p>

                </div>

              </div>

            </Link>

          ))}

        </div>

      </section>


      {/* FEATURED PRODUCTS */}
      <section className="bg-[#EAE1D5]">

        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12 lg:py-16">

          <div className="mb-7 flex items-end justify-between">

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#967C63]">
                HANDPICKED FOR YOU
              </p>

              <h2 className="mt-2 font-display text-3xl font-semibold text-[#342820] sm:text-4xl">
                Featured Pieces
              </h2>

              <p className="mt-2 text-sm text-[#796858]">
                Discover pieces you'll love wearing.
              </p>
            </div>

            <Link
              to="/products"
              className="mb-1 inline-flex items-center gap-2 text-xs font-semibold text-[#59483B] transition hover:text-[#342820]"
            >
              VIEW ALL
              <ArrowRight size={15} />
            </Link>

          </div>

          {isPending ? (

            <p className="py-10 text-center text-sm text-[#796858]">
              Discovering your collection...
            </p>

          ) : isError ? (

            <p className="py-10 text-center text-sm text-red-800">
              Unable to load products. Please try again.
            </p>

          ) : featuredProducts.length === 0 ? (

            <p className="py-10 text-center text-sm text-[#796858]">
              No featured products available yet.
            </p>

          ) : (

            <ProductGrid products={featuredProducts} />

          )}

        </div>

      </section>


      {/* PROMOTIONAL BANNER */}
      <section className="px-5 py-12 sm:px-8 lg:px-12 lg:py-16">

        <div className="relative mx-auto max-w-7xl overflow-hidden bg-[#D8C8B5] px-6 py-12 text-center sm:px-12 sm:py-16">

          <div className="relative z-10 mx-auto max-w-2xl">

            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#796858]">
              A LITTLE SOMETHING SPECIAL
            </p>

            <h2 className="mt-4 font-display text-4xl font-medium leading-tight text-[#342820] sm:text-5xl lg:text-6xl">
              Style That Feels Like You.
            </h2>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#59483B]">
              From everyday essentials to special occasion
              pieces, find styles that reflect your elegance.
            </p>

           <Link
  to="/products"
  style={{ color: "#E5D9C9" }}
  className="mt-7 inline-flex items-center gap-3 bg-[#342820] px-7 py-3.5 text-xs font-semibold tracking-[0.15em] transition duration-300 hover:bg-[#796858]"
>
  DISCOVER ELYRAH
  <ArrowRight size={16} />
</Link>
          </div>

        </div>

      </section>


      {/* WHY CHOOSE ELYRAH */}
      <section className="border-t border-[#E5D9C9] bg-[#F3EEE5] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">

        <div className="mx-auto max-w-7xl">

          <div className="mb-9 text-center">

            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#967C63]">
              THE ELYRAH EXPERIENCE
            </p>

            <h2 className="mt-2 font-display text-3xl font-semibold text-[#342820] sm:text-4xl">
              More Than Just Fashion
            </h2>

          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.title}
                  className="border border-[#E5D9C9] bg-[#FAF7F1] px-5 py-7 text-center transition duration-300 hover:border-[#B7A48D] hover:shadow-sm"
                >

                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#EAE1D5] text-[#796858]">
                    <Icon size={20} strokeWidth={1.5} />
                  </div>

                  <h3 className="mt-4 font-display text-xl font-semibold text-[#342820]">
                    {benefit.title}
                  </h3>

                  <p className="mx-auto mt-2 max-w-xs text-xs leading-6 text-[#796858]">
                    {benefit.description}
                  </p>

                </div>
              );
            })}

          </div>

        </div>

      </section>

    </main>
  );
}

export default Home;
