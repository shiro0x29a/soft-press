import { collection, config, fields } from "@keystatic/core";

export default config({
  storage: {
    kind: "local",
  },
  collections: {
    posts: {
      label: "Posts",
      slugField: "title",
      path: "content/posts/*",
      format: {
        contentField: "content",
      },
      schema: {
        title: fields.slug({
          name: {
            label: "Title",
            validation: {
              length: { min: 1 },
            },
          },
          slug: {
            label: "Slug",
            validate: (value) => {
              if (!value) return { isValid: false, message: "Slug is required" };
              if (value.length > 100)
                return { isValid: false, message: "Slug must be 100 characters or less" };
              return { isValid: true };
            },
          },
        }),
        content: fields.markdoc({
          label: "Content",
          options: {
            heading: [2, 3, 4, 5, 6],
            dividers: true,
            image: {
              directory: "content/posts/images",
            },
          },
        }),
        excerpt: fields.text({
          label: "Excerpt",
          description: "Short description of the post",
          validation: { length: { min: 0, max: 300 } },
        }),
        coverImage: fields.image({
          label: "Cover Image",
          description: "Post cover image",
          directory: "content/posts/covers",
          publicPath: "/content/posts/covers",
        }),
        tags: fields.multiselect({
          label: "Tags",
          options: [
            { label: "General", value: "general" },
            { label: "Tutorial", value: "tutorial" },
            { label: "News", value: "news" },
            { label: "Opinion", value: "opinion" },
          ],
          description: "Select post tags",
        }),
        author: fields.text({
          label: "Author",
          defaultValue: "admin",
          validation: { length: { min: 1 } },
        }),
        publishedAt: fields.date({
          label: "Published At",
          description: "Date when the post was published",
        }),
        status: fields.select({
          label: "Status",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Published", value: "published" },
          ],
          defaultValue: "draft",
        }),
      },
    },
  },
});
