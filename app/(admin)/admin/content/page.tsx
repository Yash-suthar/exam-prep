import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatInr } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export default async function AdminContentPage() {
  await requireAdmin();
  const [books, materials, papers] = await Promise.all([
    prisma.book.findMany({ include: { subject: true }, orderBy: { createdAt: "desc" } }),
    prisma.studyMaterial.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.paper.findMany({ include: { subject: true }, orderBy: { title: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-semibold">Content manager</h1>
        <p className="mt-2 text-muted-foreground">
          Seeded catalog for this slice. Upload forms can replace these records later.
        </p>
      </div>
      <Tabs defaultValue="books">
        <TabsList>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="papers">Papers</TabsTrigger>
        </TabsList>
        <TabsContent value="books">
          <List
            rows={books.map((book) => ({
              id: book.id,
              title: book.title,
              meta: book.subject.name,
              price: book.price,
              isFree: book.isFree,
            }))}
          />
        </TabsContent>
        <TabsContent value="materials">
          <List
            rows={materials.map((material) => ({
              id: material.id,
              title: material.title,
              meta: material.tags.join(", "),
              price: material.price,
              isFree: material.isFree,
            }))}
          />
        </TabsContent>
        <TabsContent value="papers">
          <List
            rows={papers.map((paper) => ({
              id: paper.id,
              title: paper.title,
              meta: `${paper.subject.name}${paper.year ? ` · ${paper.year}` : ""}`,
              price: paper.price,
              isFree: paper.isFree,
            }))}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function List({
  rows,
}: {
  rows: { id: string; title: string; meta: string; price: number; isFree: boolean }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{rows.length} items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{row.title}</p>
              <p className="text-xs text-muted-foreground">{row.meta}</p>
            </div>
            {row.isFree ? (
              <Badge tone="success">Free</Badge>
            ) : (
              <Badge>{formatInr(row.price)}</Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
