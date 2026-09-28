import { useParams } from "react-router-dom";
import { PageTitleBar } from "../../components/PageTitleBar";
import { HelpAccordion } from "./HelpAccordion";
import { HELP_FAQS } from "./mockData";

export function HelpFaqDetailPage() {
  const { faqId } = useParams<{ faqId: string }>();
  const faq = HELP_FAQS.find((item) => item.id === faqId);

  return (
    <div>
      <PageTitleBar title="ヘルプ" showBack />
      <div className="flex flex-col items-start p-6">
        {faq ? (
          <HelpAccordion faq={faq} isOpen onToggle={() => {}} />
        ) : (
          <p className="text-base text-[var(--semantic-text-secondary)]">質問が見つかりません</p>
        )}
      </div>
    </div>
  );
}
