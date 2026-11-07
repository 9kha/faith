import { Calculator, Home, RupeeSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmiCalculatorClient } from "./emi-calculator-client";

export const metadata = {
  title: "EMI Calculator - ChannelPartner Pro",
  description: "Calculate your home loan EMI with our easy-to-use calculator.",
};

export default function EmiCalculatorPage() {
  return (
    <div className="space-y-0">
      <section className="relative bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_100%)] py-16 lg:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">EMI Calculator</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Calculate your monthly home loan EMI instantly. Plan your property
            purchase better with our easy-to-use calculator.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EmiCalculatorClient />
        </div>
      </section>
    </div>
  );
}
