import { Comments } from "./Comments";

interface Comment {
  id: string;
  author: string;
  timestamp: string;
  text: string;
}

interface CommentsSectionProps {
  comments: Comment[];
  title?: string;
}

export function CommentsSection({ comments, title = "コメント" }: CommentsSectionProps) {
  return (
    <div className="flex flex-col gap-4 items-start w-full">
      <div className="w-full">
        <p className="text-xl text-[var(--semantic-text-primary)] mb-4">{title}</p>
        <Comments comments={comments} />
      </div>
    </div>
  );
}
