export type HelpCategory = {
  id: string;
  label: string;
};

export type HelpFaq = {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
};
