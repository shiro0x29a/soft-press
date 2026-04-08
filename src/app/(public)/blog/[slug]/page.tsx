import { HeadManager } from "@/shared/components/common/head-manager";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";

function parsePostFile(filePath: string, slug: string) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!fmMatch) return null;

    const body = fmMatch[2];

    const data: Record<string, string | string[]> = {};
    const lines = fmMatch[1].split("\n");
    let currentKey = "";
    let currentArr: string[] = [];

    for (const line of lines) {
      const kvMatch = line.match(/^(\w+):\s*(.*)/);
      if (kvMatch) {
        if (currentKey && currentArr.length > 0) {
          data[currentKey] = currentArr;
          currentArr = [];
        }
        currentKey = kvMatch[1];
        const val = kvMatch[2].trim();
        if (val) data[currentKey] = val;
      } else {
        const arrItem = line.match(/^\s+-\s+(.*)/);
        if (arrItem && currentKey) {
          currentArr.push(arrItem[1]);
        }
      }
    }
    if (currentKey && currentArr.length > 0) {
      data[currentKey] = currentArr;
    }

    return {
      title: (data.title as string) || slug,
      slug,
      excerpt: data.excerpt as string | undefined,
      tags: data.tags as string[] | undefined,
      author: data.author as string | undefined,
      publishedAt: data.publishedAt as string | undefined,
      status: data.status as string | undefined,
      body,
    };
  } catch {
    return null;
  }
}

function getPost(slug: string) {
  const contentDir = path.join(process.cwd(), "content", "posts");
  const filePath = path.join(contentDir, slug, "index.mdoc");
  if (!fs.existsSync(filePath)) return null;
  return parsePostFile(filePath, slug);
}

export function generateStaticParams() {
  const contentDir = path.join(process.cwd(), "content", "posts");
  if (!fs.existsSync(contentDir)) return [];

  return fs
    .readdirSync(contentDir)
    .filter((entry) => {
      const entryPath = path.join(contentDir, entry);
      return (
        fs.statSync(entryPath).isDirectory() &&
        fs.existsSync(path.join(entryPath, "index.mdoc"))
      );
    })
    .map((entry) => ({ slug: entry }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post || post.status !== "published") {
    notFound();
  }

  // Helper function to resolve image paths
  const resolveImagePath = (src: string): string => {
    // If already absolute path or external URL, return as-is
    if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) {
      return src;
    }
    // Otherwise, prepend the content path for this slug
    return `/content/posts/${slug}/content/${src}`;
  };

  return (
    <>
      <HeadManager title={post.title} description={post.excerpt || post.title} />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/blog" className="text-primary mb-6 inline-block text-sm hover:underline">
          ← Back to Blog
        </Link>

        <article style={{ maxWidth: "732px", width: "100%", flexGrow: 1, margin: "0 auto", position: "relative", padding: "21px 0" }}>
          <header className="mb-8">
            <h1 style={{ margin: "21px 21px 12px" }} className="text-[32px] font-bold leading-[34px]">
              {post.title}
            </h1>
            <div
              className="flex items-center"
              style={{
                margin: "12px 21px",
                fontSize: "15px",
                lineHeight: "18px",
                color: "#79828B",
                fontStyle: "normal",
              }}
            >
              {post.author && <span>{post.author}</span>}
              {post.publishedAt && (
                <time
                  dateTime={post.publishedAt}
                  style={{
                    color: "#79828B",
                  }}
                  className="before:content-['·'] before:px-[7px] before:text-lg before:leading-none"
                >
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              )}
            </div>
          </header>

          {post.body.split("\n").map((line, i) => {
              if (line.startsWith("# ")) {
                return (
                  <h1
                    key={i}
                    style={{
                      fontSize: "32px",
                      fontWeight: 700,
                      lineHeight: 1.3,
                      color: "#000",
                      margin: "1.5em 0 0.5em",
                    }}
                  >
                    {line.replace("# ", "")}
                  </h1>
                );
              }
              if (line.startsWith("## ")) {
                return (
                  <h2
                    key={i}
                    style={{
                      fontSize: "28px",
                      fontWeight: 700,
                      lineHeight: 1.3,
                      color: "#000",
                      margin: "1.5em 0 0.5em",
                    }}
                  >
                    {line.replace("## ", "")}
                  </h2>
                );
              }
              if (line.startsWith("### ")) {
                return (
                  <h3
                    key={i}
                    style={{
                      fontSize: "24px",
                      fontWeight: 700,
                      lineHeight: 1.3,
                      color: "#000",
                      margin: "1.5em 0 0.5em",
                    }}
                  >
                    {line.replace("### ", "")}
                  </h3>
                );
              }
              if (line.startsWith("#### ")) {
                return (
                  <h4
                    key={i}
                    style={{
                      fontSize: "22px",
                      fontWeight: 700,
                      lineHeight: 1.3,
                      color: "#000",
                      margin: "1.5em 0 0.5em",
                    }}
                  >
                    {line.replace("#### ", "")}
                  </h4>
                );
              }
              if (line.startsWith("##### ")) {
                return (
                  <h5
                    key={i}
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      lineHeight: 1.3,
                      color: "#000",
                      margin: "1.5em 0 0.5em",
                    }}
                  >
                    {line.replace("##### ", "")}
                  </h5>
                );
              }
              if (line.startsWith("###### ")) {
                return (
                  <h6
                    key={i}
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      lineHeight: 1.3,
                      color: "#000",
                      margin: "1.5em 0 0.5em",
                    }}
                  >
                    {line.replace("###### ", "")}
                  </h6>
                );
              }
              if (line.trim() === "") return <br key={i} />;
              if (line.startsWith("- ")) {
                return (
                  <li
                    key={i}
                    style={{
                      marginLeft: "2em",
                      lineHeight: 1.6,
                      marginBottom: "0.25em",
                      fontSize: "18px",
                    }}
                  >
                    {line.replace("- ", "")}
                  </li>
                );
              }
              if (line.startsWith("> ")) {
                return (
                  <blockquote
                    key={i}
                    style={{
                      borderLeft: "4px solid #e0e0e0",
                      margin: "1.5em 0",
                      padding: "0.5em 1em",
                      color: "#555",
                      fontStyle: "italic",
                      fontSize: "18px",
                      lineHeight: 1.6,
                    }}
                  >
                    {line.replace("> ", "")}
                  </blockquote>
                );
              }

              // Split line into text-only paragraphs and standalone images
              const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
              const elements: React.ReactNode[] = [];
              let lastIndex = 0;
              let match;

              while ((match = imgRegex.exec(line)) !== null) {
                // Text before image
                if (match.index > lastIndex) {
                  const textBefore = line.slice(lastIndex, match.index).trim();
                  if (textBefore) {
                    elements.push(
                      <p
                        key={`p-${i}-${lastIndex}`}
                        style={{ margin: "0 21px 12px", wordWrap: "break-word" }}
                      >
                        {textBefore}
                      </p>
                    );
                  }
                }
                // Image as standalone element
                elements.push(
                  <img
                    key={`img-${i}-${match.index}`}
                    src={resolveImagePath(match[2])}
                    alt={match[1]}
                    style={{
                      maxWidth: "690px",
                      width: "100%",
                      height: "auto",
                      display: "block",
                      margin: "0 21px 12px",
                    }}
                  />
                );
                lastIndex = match.index + match[0].length;
              }

              // Remaining text after last image
              if (lastIndex < line.length) {
                const textAfter = line.slice(lastIndex).trim();
                if (textAfter) {
                  elements.push(
                    <p
                      key={`p-end-${i}`}
                      style={{ margin: "0 21px 12px", wordWrap: "break-word" }}
                    >
                      {textAfter}
                    </p>
                  );
                }
              }

              // No images found, treat entire line as paragraph
              if (elements.length === 0 && line.trim()) {
                return (
                  <p
                    key={i}
                    style={{ margin: "0 21px 12px", wordWrap: "break-word" }}
                  >
                    {line.trim()}
                  </p>
                );
              }

              return elements.length > 0 ? <>{elements}</> : null;
            })}
        </article>
      </div>
    </>
  );
}
