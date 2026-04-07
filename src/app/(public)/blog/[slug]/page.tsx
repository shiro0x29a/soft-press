import { HeadManager } from "@/shared/components/common/head-manager";
import { Card, CardHeader, CardTitle } from "@/shared/ui/card";
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

  return (
    <>
      <HeadManager title={post.title} description={post.excerpt || post.title} />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/blog" className="text-primary mb-6 inline-block text-sm hover:underline">
          ← Back to Blog
        </Link>

        <article>
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
              {post.author && (
                <span>{post.author}</span>
              )}
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

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {post.body.split("\n").map((line, i) => {
              if (line.startsWith("# ")) {
                return (
                  <h1 key={i} className="text-3xl font-bold mt-8 mb-4">
                    {line.replace("# ", "")}
                  </h1>
                );
              }
              if (line.startsWith("## ")) {
                return (
                  <h2 key={i} className="text-2xl font-bold mt-6 mb-3">
                    {line.replace("## ", "")}
                  </h2>
                );
              }
              if (line.startsWith("### ")) {
                return (
                  <h3 key={i} className="text-xl font-bold mt-5 mb-2">
                    {line.replace("### ", "")}
                  </h3>
                );
              }
              if (line.trim() === "") return <br key={i} />;
              if (line.startsWith("- ")) {
                return (
                  <li key={i} className="ml-4 list-disc">
                    {line.replace("- ", "")}
                  </li>
                );
              }
              if (line.startsWith("![")) {
                const imgMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
                if (imgMatch) {
                  return (
                    <p key={i} style={{ margin: "0 21px 12px", textAlign: "center" }}>
                      <img
                        src={imgMatch[2]}
                        alt={imgMatch[1]}
                        className="mx-auto max-w-full rounded-lg"
                      />
                    </p>
                  );
                }
              }
              return (
                <p
                  key={i}
                  style={{ margin: "0 21px 12px", wordWrap: "break-word" }}
                >
                  {line}
                </p>
              );
            })}
          </div>
        </article>
      </div>
    </>
  );
}
