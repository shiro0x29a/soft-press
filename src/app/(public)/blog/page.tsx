import { HeadManager } from "@/shared/components/common/head-manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import fs from "fs";
import path from "path";
import Link from "next/link";

interface Post {
  title: string;
  slug: string;
  excerpt?: string;
  tags?: string[];
  author?: string;
  publishedAt?: string;
  status?: string;
}

function parsePostFile(filePath: string, dirName: string): Post | null {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!fmMatch) return null;

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
      title: (data.title as string) || dirName,
      slug: dirName,
      excerpt: data.excerpt as string | undefined,
      tags: data.tags as string[] | undefined,
      author: data.author as string | undefined,
      publishedAt: data.publishedAt as string | undefined,
      status: data.status as string | undefined,
    };
  } catch {
    return null;
  }
}

function getPosts(): Post[] {
  const contentDir = path.join(process.cwd(), "content", "posts");
  if (!fs.existsSync(contentDir)) return [];

  const posts: Post[] = [];
  const entries = fs.readdirSync(contentDir);

  for (const entry of entries) {
    const entryPath = path.join(contentDir, entry);
    if (!fs.statSync(entryPath).isDirectory()) continue;

    const mdFile = path.join(entryPath, "index.mdoc");
    if (!fs.existsSync(mdFile)) continue;

    const post = parsePostFile(mdFile, entry);
    if (post && post.status === "published") {
      posts.push(post);
    }
  }

  return posts.sort(
    (a, b) =>
      new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
  );
}

export default function BlogPage() {
  const posts = getPosts();

  return (
    <>
      <HeadManager title="Blog" description="Latest blog posts" />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold">Blog</h1>

        {posts.length === 0 ? (
          <p className="text-muted-foreground">
            No posts yet.{" "}
            <Link href="/keystatic" className="text-primary underline hover:no-underline">
              Create your first post
            </Link>
          </p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.slug}>
                <CardHeader>
                  <CardTitle>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-primary hover:text-primary/80"
                    >
                      {post.title}
                    </Link>
                  </CardTitle>
                  <div className="text-muted-foreground flex items-center text-[15px] leading-[18px]" style={{ color: "#79828B", fontStyle: "normal" }}>
                    {post.author && (
                      <span>{post.author}</span>
                    )}
                    {post.publishedAt && (
                      <>
                        <span className="px-[7px] text-lg leading-none">·</span>
                        <time dateTime={post.publishedAt}>
                          {new Date(post.publishedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </time>
                      </>
                    )}
                  </div>
                </CardHeader>
                {post.excerpt && <CardContent>{post.excerpt}</CardContent>}
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
