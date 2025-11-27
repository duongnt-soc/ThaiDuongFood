import { Section, SectionTitle } from "@/components/shared/Section"
import { BlogCard } from "@/components/shared/BlogCard"

const blogPosts = [
  {
    image: "/food/f2.webp",
    date: "January 3, 2025",
    title: "The secret tips & tricks to prepare a perfect burger",
    slug: "perfect-burger-tips",
  },
  {
    image: "/food/f3.webp",
    date: "January 5, 2025",
    title: "How to prepare perfect french fries in an air fryer",
    slug: "air-fryer-french-fries",
  },
  {
    image: "/food/f4.webp",
    date: "January 8, 2025",
    title: "How to prepare delicious chicken tenders",
    slug: "delicious-chicken-tenders",
  },
  {
    image: "/food/f5.webp",
    date: "January 12, 2025",
    title: "7 delicious cheesecake recipes you can prepare",
    slug: "cheesecake-recipes",
  },
  {
    image: "/food/f6.webp",
    date: "January 15, 2025",
    title: "5 great pizza restaurants you should visit in this city",
    slug: "great-pizza-restaurants",
  },
  {
    image: "/food/f13.webp",
    date: "January 18, 2025",
    title: "Top 20 simple and quick desserts for kids",
    slug: "desserts-for-kids",
  },
  {
    image: "/food/f15.webp",
    date: "January 21, 2025",
    title: "5 great cooking gadgets you can buy to save time",
    slug: "cooking-gadgets",
  },
  {
    image: "/food/f16.webp",
    date: "January 25, 2025",
    title: "How to prepare delicious gluten-free sushi",
    slug: "gluten-free-sushi",
  },
  {
    image: "/food/f17.webp",
    date: "January 28, 2025",
    title: "The secret tips & tricks to prepare a perfect pasta",
    slug: "perfect-pasta-tips",
  },
]

export default function BlogPage() {
  return (
    <Section>
      <SectionTitle
        title="Our Blog & Articles"
        subtitle="We consider all the drivers of change gives you the components you need to change to create a truly happens."
      />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <BlogCard
            key={post.slug}
            slug={post.slug}
            image={post.image}
            date={post.date}
            title={post.title}
          />
        ))}
      </div>
    </Section>
  )
}
