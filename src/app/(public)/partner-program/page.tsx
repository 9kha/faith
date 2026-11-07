import Link from "next/link";
import { InquiryForm } from "@/components/public/inquiry-form";
import { Building2, Users, Phone, Mail, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Partner Program - ChannelPartner Pro",
  description: "Join our channel partner program and earn commissions on property referrals.",
};

export default function PartnerProgramPage() {
  return (
    <div className="space-y-0">
      <section className="relative bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_100%)] py-16 lg:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">Channel Partner Program</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Join our network of channel partners and earn attractive commissions
            on every successful property referral.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="p-6 rounded-xl border border-gray-200 bg-white">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Attractive Commissions</h3>
              <p className="text-sm text-gray-600">
                Earn up to 3% commission on every successful property booking
                through your referral.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-gray-200 bg-white">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Dedicated Support</h3>
              <p className="text-sm text-gray-600">
                Get dedicated partner support, marketing materials, and training
                to help you close more deals.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-gray-200 bg-white">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Transparent Payments</h3>
              <p className="text-sm text-gray-600">
                Track your leads, bookings, and commissions in real-time through
                your partner dashboard.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-8 md:p-12">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/2">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">
                  Become a Partner
                </h2>
                <p className="text-gray-600 mb-6">
                  Whether you're an individual agent, a small brokerage, or a
                  large network, our partner program is designed to help you
                  grow your business.
                </p>
                <ul className="space-y-3 text-sm text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">✓</span>
                    Free registration
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">✓</span>
                    No minimum commitment
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">✓</span>
                    Marketing support
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">✓</span>
                    Weekly commission payouts
                  </li>
                </ul>
              </div>
              <div className="lg:w-1/2">
                <InquiryForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
