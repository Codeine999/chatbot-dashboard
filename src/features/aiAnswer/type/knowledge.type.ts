export type KnowledgeItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  intentKey: string;
  keywords: string[];
  questionExamples: string[];
  answer: string;
  priority: number;
  active: boolean;
};
