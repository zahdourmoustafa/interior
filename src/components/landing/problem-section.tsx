import BlurFade from "@/components/magicui/blur-fade";
import Section from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Clock, Palette } from "lucide-react";

const problems = [
  {
    title: "Design Overwhelm",
    description:
      "Homeowners struggle to visualize design concepts and make decisions, often feeling overwhelmed by countless options and unable to see the big picture.",
    icon: Home,
  },
  {
    title: "Time-Consuming Process",
    description:
      "Traditional interior design methods are slow and expensive, causing homeowners to delay projects and miss opportunities to improve their living spaces.",
    icon: Clock,
  },
  {
    title: "Style Uncertainty",
    description:
      "Many people are unsure about their personal style preferences and worry about making costly mistakes when decorating their homes.",
    icon: Palette,
  },
];

export default function ProblemSection() {
  return (
    <Section
      title="Problem"
      subtitle="Interior design shouldn't be complicated."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {problems.map((problem, index) => (
          <BlurFade key={index} delay={0.2 + index * 0.2} inView>
            <Card className="bg-background border-none shadow-none">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <problem.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{problem.title}</h3>
                <p className="text-muted-foreground">{problem.description}</p>
              </CardContent>
            </Card>
          </BlurFade>
        ))}
      </div>
    </Section>
  );
} 