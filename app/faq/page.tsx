import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "자주 묻는 질문 | Pitch Camping",
  description: "Pitch Camping 자주 묻는 질문입니다.",
};

const faqs = [
  {
    question: "Pitch Camping은 무료인가요?",
    answer: "네, Pitch Camping은 완전 무료로 제공되는 서비스입니다.",
  },
  {
    question: "캠핑장 예약은 어떻게 하나요?",
    answer:
      "Pitch Camping은 캠핑장 정보를 제공하는 서비스입니다. 예약은 각 캠핑장의 공식 홈페이지나 전화를 통해 진행해주세요.",
  },
  {
    question: "캠핑장 정보가 잘못되었어요.",
    answer:
      "캠핑장 정보는 고캠핑 API를 통해 제공됩니다. 정보 수정 요청은 피드백 페이지를 통해 남겨주시면 검토하겠습니다.",
  },
  {
    question: "회원가입이 필수인가요?",
    answer:
      "아니요, 회원가입 없이도 캠핑장 정보를 조회할 수 있습니다. 다만 북마크나 리뷰 기능을 사용하려면 회원가입이 필요합니다.",
  },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
            자주 묻는 질문
          </h1>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 dark:text-gray-300">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-8">
            <Link href="/">
              <Button variant="outline">홈으로 돌아가기</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

