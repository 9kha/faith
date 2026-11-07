import Link from "next/link";
import { Building2, Phone, Mail, MapPin, Clock, Users } from "lucide-react";

export const metadata = {
  title: "About Us - ChannelPartner Pro",
  description: "About ChannelPartner Pro - your trusted real estate channel partner.",
};

export default function AboutPage() {
  return (
    <div className="space-y-0">
      <section className="relative bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_100%)] py-16 lg:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">About Us</h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Independent channel partner helping you buy, rent, and invest in
              properties across Central India with transparency and trust.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="h-[400px] rounded-xl border border-gray-200 overflow-hidden">
              <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                <Building2 className="h-24 w-24 text-gray-300" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-4">
                Who We Are
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                ChannelPartner Pro is an independent real estate channel partner
                operating across Central India. We work with multiple builders
                to bring you the best residential and commercial properties at
                transparent prices.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Our mission is simple: make property buying and renting
                transparent, hassle-free, and accessible to everyone. No hidden
                charges, no fake listings - just genuine properties from
                RERA-registered builders.
              </p>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>10+ Years of Experience</span>
                </li>
                <li className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span>50+ Builder Partnerships</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>5000+ Happy Customers</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
