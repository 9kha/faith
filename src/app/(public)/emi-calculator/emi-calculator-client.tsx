"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function EmiCalculatorClient() {
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTenure, setLoanTenure] = useState(20);

  const monthlyRate = interestRate / 12 / 100;
  const totalMonths = loanTenure * 12;
  const emi =
    loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);
  const totalAmount = emi * totalMonths;
  const totalInterest = totalAmount - loanAmount;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Your Monthly EMI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl md:text-6xl font-serif font-bold text-primary">
                ₹{emi.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/mo
              </div>
              <p className="text-gray-600 mt-2">
                Estimated monthly installment
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-4 mt-8">
          <Card className="p-4 text-center">
            <div className="text-xs text-gray-500 uppercase">Loan Amount</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              ₹{loanAmount.toLocaleString("en-IN")}
            </div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-xs text-gray-500 uppercase">Interest Rate</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {interestRate}%
            </div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-xs text-gray-500 uppercase">Loan Tenure</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {loanTenure} Years
            </div>
          </Card>
        </div>
      </div>
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Loan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">Total Interest</span>
              <span className="font-medium text-gray-900">
                ₹{totalInterest.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Total Amount</span>
              <span className="font-medium text-gray-900">
                ₹{totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Interest %</span>
              <span className="font-medium text-gray-900">
                {((totalInterest / loanAmount) * 100).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Adjust Your Loan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">
                  Loan Amount (₹)
                </label>
                <Input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(parseInt(e.target.value) || 0)}
                  className="w-full h-9"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>₹5 Lakhs</span>
                  <span>₹5 Cr</span>
                </div>
                <input
                  type="range"
                  min="500000"
                  max="50000000"
                  step="100000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">
                  Interest Rate (%)
                </label>
                <Input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                  className="w-full h-9"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>6.5%</span>
                  <span>14%</span>
                </div>
                <input
                  type="range"
                  min="6.5"
                  max="14"
                  step="0.5"
                  value={interestRate}
                  onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">
                  Loan Tenure (Years)
                </label>
                <Input
                  type="number"
                  value={loanTenure}
                  onChange={(e) => setLoanTenure(parseInt(e.target.value) || 0)}
                  className="w-full h-9"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5 Years</span>
                  <span>30 Years</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={loanTenure}
                  onChange={(e) => setLoanTenure(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
