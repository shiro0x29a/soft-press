import { config, collection, fields } from "@keystatic/core";

export const markdocConfig = fields.markdoc.createMarkdocConfig({});

export default config({
  storage: {
    kind: "local",
  },
  collections: {
    posts: collection({
      label: "Posts",
      slugField: "title",
      path: "content/posts/*/",
      format: {
        contentField: "content",
      },
      schema: {
        title: fields.slug({
          name: { label: "Title" },
        }),
        content: fields.markdoc({
          label: "Content",
          options: {
            image: {
              directory: (ctx) =>
                `content/posts/${ctx.collection ?? ctx.slug}/content`,
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
    }),
  },
});
