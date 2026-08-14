import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Section } from "@/components/layout-bits";
import { MaskReveal, Reveal } from "@/components/motion";
import { articles, getArticle } from "@/lib/site-data";

export const Route = createFileRoute("/actualites/$slug")({
  loader: ({ params }) => {
    const article = getArticle(params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Article introuvable   STE MABANIS" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const a = loaderData.article;
    return {
      meta: [
        { title: `${a.title}   STE MABANIS` },
        { name: "description", content: a.excerpt },
        { property: "og:title", content: a.title },
        { property: "og:description", content: a.excerpt },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { article } = Route.useLoaderData();
  const others = articles.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden bg-navy pt-32 pb-16 text-white sm:pt-40 sm:pb-24">
        <img
          src={article.image}
          alt=""
          aria-hidden
          width={1280}
          height={960}
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/80 to-navy/60" />
        <div className="relative mx-auto max-w-3xl px-5 sm:px-8">
          <p className="eyebrow">
            {article.category} · {article.date} · {article.readTime}
          </p>
          <h1 className="display mt-5 text-[clamp(2.25rem,5.5vw,4.5rem)]">{article.title}</h1>
        </div>
      </section>

      <Section>
        <article className="mx-auto max-w-3xl">
          <p className="quote text-2xl leading-snug text-blue">{article.excerpt}</p>
          <div className="mt-8 space-y-5 text-[1.02rem] leading-relaxed text-foreground/85">
            {article.body.map((p: string, i: number) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="mt-12 border-t border-line pt-8">
            <p className="eyebrow">Un projet en tête ?</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Nos conseillers répondent à vos questions sans engagement, par téléphone ou en agence.
            </p>
            <Link
              to="/contact"
              className="mt-5 inline-block rounded-md bg-navy px-6 py-3.5 text-[0.7rem] tracking-[0.18em] text-white uppercase hover:bg-gold hover:text-navy"
            >
              Nous écrire
            </Link>
          </div>
        </article>
      </Section>

      <Section tone="sand">
        <p className="eyebrow">À lire ensuite</p>
        <div className="mt-8 grid gap-10 md:grid-cols-3">
          {others.map((a, i) => (
            <Reveal key={a.slug} delay={i * 70}>
              <Link to="/actualites/$slug" params={{ slug: a.slug }} className="zoom-frame block">
                <MaskReveal delay={i * 70 + 60} className="overflow-hidden rounded-md">
                  <img
                    src={a.image}
                    alt={a.title}
                    loading="lazy"
                    width={1280}
                    height={960}
                    className="aspect-16/10 w-full object-cover"
                  />
                </MaskReveal>
                <h3 className="display mt-4 text-2xl">{a.title}</h3>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
