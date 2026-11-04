import type { Metadata } from "next";
import PracticeApp from "@/components/practice/PracticeApp";

export const metadata: Metadata = {
  title: "Practice | RoleSpeak",
  description: "Rehearse your OET Speaking roleplay with an AI patient and get your predicted grade.",
};

export default function PracticePage() {
  return <PracticeApp />;
}
