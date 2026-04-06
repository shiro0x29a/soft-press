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

function parsePostFile(filePath: string): Post | null {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!fmMatch) return null;

    const slug = path.basename(filePath).replace(/\.(mdoc|md)$/, "");

    // Parse YAML-like frontmatter (simplified)
    const data: Record<string, string | string[]> = {};
    const lines = fmMatch[1].split("\n");
    let currentKey = "";
    let currentArr: string[] = [];

    for (const line of lines) {
      const kvMatch = line.match(/^(\w+):\s*(.*)/);
      if (kvMatch) {
        // Save previous array
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
    // Save last array
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
    if (!/\.(mdoc|md)$/.test(entry)) continue;
    if (entry === "index.md" || entry === "index.mdoc") continue;

    const entryPath = path.join(contentDir, entry);
    if (!fs.statSync(entryPath).isFile()) continue;

    const post = parsePostFile(entryPath);
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
                  <div className="text-muted-foreground flex items-center gap-4 text-sm">
                    {post.publishedAt && (
                      <span>
                        {new Date(post.publishedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    )}
                    {post.author && <span>by {post.author}</span>}
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
