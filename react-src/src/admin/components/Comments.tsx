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
  return (
    <div className="bg-white rounded-lg w-full">
        {comments.length === 0 ? (
          <p className="text-base text-[var(--semantic-text-secondary)] py-6 px-4">コメントはありません</p>
        ) : (
          comments.map((comment, index) => (
            <div key={comment.id}>
              <div className="flex flex-col gap-2 py-4 px-4">
                <div className="flex flex-col gap-1">
                  <p className="text-[20px] font-bold text-[var(--semantic-brand-primary)]">{comment.author}</p>
                  <p className="text-sm text-[var(--semantic-text-secondary)]">{comment.timestamp}</p>
                </div>
                <p className="text-[18px] text-[var(--semantic-text-primary)]">{comment.text}</p>
              </div>
              {index < comments.length - 1 && (
                <div className="border-t border-[#d0d0d0] mx-4" />
              )}
            </div>
          ))
        )}
    </div>
  );
}
