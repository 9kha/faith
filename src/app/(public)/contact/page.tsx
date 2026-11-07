import { InquiryForm } from "@/components/public/inquiry-form";
import { Building2, Phone, Mail, MapPin, Clock } from "lucide-react";

export const metadata = {
  title: "Contact Us - ChannelPartner Pro",
  description: "Contact ChannelPartner Pro for property inquiries.",
};

export default function ContactPage() {
  return (
    <div className="space-y-0">
      <section className="relative bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_100%)] py-16 lg:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">Contact Us</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Have questions about a property? Want to schedule a site visit?
            Get in touch with our team today.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
                Get in Touch
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Fill out the form below and our team will get back to you within
                24 hours. Or reach us directly using the contact details below.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Visit Us</h3>
                    <p className="text-sm text-gray-600">
                      123, Scheme 54, Vijay Nagar, Indore, MP 452010
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Call Us</h3>
                    <p className="text-sm text-gray-600">
                      <a href="tel:+919876543210" className="text-primary hover:underline">
                        +91 98765 43210
                      </a>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Email Us</h3>
                    <p className="text-sm text-gray-600">
                      <a href="mailto:sales@channelpartner.example.com" className="text-primary hover:underline">
                        sales@channelpartner.example.com
                      </a>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Working Hours</h3>
                    <p className="text-sm text-gray-600">
                      Mon - Sat: 10:00 AM - 7:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <InquiryForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
