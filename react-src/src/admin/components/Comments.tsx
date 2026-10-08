interface Comment {
  id: string;
  author: string;
  timestamp: string;
  text: string;
}

interface CommentsProps {
  comments: Comment[];
}

export function Comments({ comments }: CommentsProps) {
  if (comments.length === 0) {
    return (
      <div className="bg-white rounded-lg w-full">
        <p className="text-base text-[var(--semantic-text-secondary)] py-6 px-4">データがありません。</p>
      </div>
    );
  }
  // 確定デザイン（2026-10-07）：箱の上 16px・下 24px、コメントの間の線の上下 8px、
  // 名前 → 日時 2px、本文は 18px の Regular
  return (
    <div className="bg-white rounded-lg w-full px-4 pt-4 pb-6">
      {comments.map((comment, index) => (
        <div key={comment.id}>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-0.5">
              <p className="text-[20px] font-bold text-[var(--semantic-brand-primary)]">{comment.author}</p>
              <p className="text-sm text-[var(--semantic-text-secondary)]">{comment.timestamp}</p>
            </div>
            <p className="text-[18px] font-normal text-[var(--semantic-text-primary)]">{comment.text}</p>
          </div>
          {index < comments.length - 1 && <div className="border-t border-[#d0d0d0] my-2" />}
        </div>
      ))}
    </div>
  );
}
