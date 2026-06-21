import { useState } from "react";
import { Search, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { knowledgeMock } from "./mock/knowledge.mock";
import type { KnowledgeItem } from "./type/knowledge.type";

const truncate = (text: string, maxLength = 90) =>
  text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

const wrapText = (text: string, maxLength = 30) =>
  text.match(new RegExp(`.{1,${maxLength}}`, "g")) ?? [text];

const matchesSearch = (item: KnowledgeItem, keyword: string) => {
  if (!keyword) return true;

  return [
    item.title,
    item.category,
    item.intentKey,
    ...item.keywords,
  ].some((value) => value.toLowerCase().includes(keyword));
};

export const AiAnswer = () => {
  const [search, setSearch] = useState("");
  const keyword = search.trim().toLowerCase();
  const knowledgeItems = knowledgeMock.filter((item) => matchesSearch(item, keyword));

  return (
    <div className="mt-10 2xl:px-8 max-w-8xl mx-auto mb-12">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-normal">AI Answer Knowledge Base</h1>
          <p className="mt-1 text-sm text-mini">
            Manage chatbot FAQ and LINE OA intent responses.
          </p>
        </div>

        <div
          className="w-full md:w-[360px] h-[40px] bg-background border rounded-lg
          focus-within:ring-1 focus-within:ring-[#9369db] transition"
        >
          <div className="flex px-3 items-center h-full">
            <Search className="mr-2 h-4 w-4 text-mini" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, category, intent, keyword..."
              className="h-full border-0 px-0 shadow-none focus-visible:ring-0"
            />
          </div>
        </div>
      </div>

      <Card className="mt-5 overflow-hidden pb-8">
        <div className="overflow-auto">
          <Table className="min-w-[1350px] table-fixed">
            <TableHeader className="h-[60px] border-b">
              <TableRow>
                <TableHead className="w-[170px] px-5 text-[#879da7] font-semibold">Title</TableHead>
                <TableHead className="w-[190px] text-[#879da7] font-semibold">Description</TableHead>
                <TableHead className="w-[110px] text-[#879da7] font-semibold">Category</TableHead>
                <TableHead className="w-[180px] text-[#879da7] font-semibold">Intent Key</TableHead>
                <TableHead className="w-[210px] text-[#879da7] font-semibold">Keywords</TableHead>
                <TableHead className="w-[240px] text-[#879da7] font-semibold">Question Examples</TableHead>
                <TableHead className="w-[260px] text-[#879da7] font-semibold">Answer</TableHead>
                <TableHead className="w-[80px] text-center text-[#879da7] font-semibold">Priority</TableHead>
                <TableHead className="w-[90px] text-center text-[#879da7] font-semibold">Active</TableHead>
                <TableHead className="w-[90px] text-center text-[#879da7] font-semibold">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {knowledgeItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="px-5 font-semibold text-normal">
                    {item.title}
                  </TableCell>
                  <TableCell className="text-sm text-normal">
                    {wrapText(item.description, 30).map((line, index) => (
                      <span key={`${item.id}-description-${index}`} className="block">
                        {line}
                      </span>
                    ))}
                  </TableCell>
                  <TableCell>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {item.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-normal">
                    {item.intentKey}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.keywords.slice(0, 4).map((keyword) => (
                        <span
                          key={keyword}
                          className="rounded-full bg-purple-50 px-2 py-0.5 text-xs text-[#603de1]"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.questionExamples.slice(0, 2).map((question) => (
                        <span
                          key={question}
                          className="rounded-md bg-blue-50 px-2 py-0.5 text-xs text-blue-600"
                        >
                          {truncate(question, 30)}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-normal whitespace-normal">
                    <div className="line-clamp-3">
                      {item.answer}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-semibold text-normal">
                    {item.priority}
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.active
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {item.active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" className="text-yellow-500">
                      <SquarePen className="!w-4.5 !h-4.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {knowledgeItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center text-sm text-mini">
                    No knowledge records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
