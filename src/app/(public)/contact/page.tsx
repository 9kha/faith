import { InquiryForm } from "@/components/public/inquiry-form";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export const metadata = {
  title: "Contact Us — Faith Venture Realty | Get in Touch",
  description:
    "Contact our real estate experts for property inquiries, site visits, and investment guidance. We respond within 24 hours.",
};

const contactDetails = [
  {
    icon: MapPin,
    label: "Visit Our Office",
    value: "123, Scheme 54, Vijay Nagar",
    sub: "Indore, Madhya Pradesh 452010",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Phone,
    label: "Call Us",
    value: "+91 98765 43210",
    sub: "Mon–Sat 10AM–7PM",
    color: "bg-emerald-50 text-emerald-600",
    href: "tel:+919876543210",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+91 98765 43210",
    sub: "Quick response on WhatsApp",
    color: "bg-green-50 text-green-600",
    href: "https://wa.me/919876543210",
  },
  {
    icon: Mail,
    label: "Email Us",
    value: "sales@faithventure.in",
    sub: "We reply within 24 hours",
    color: "bg-violet-50 text-violet-600",
    href: "mailto:sales@faithventure.in",
  },
];

export default function ContactPage() {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="relative mesh-bg grid-overlay overflow-hidden pb-20 pt-24 lg:pb-28 lg:pt-32">
        <div className="container-page relative z-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Clock className="h-4 w-4" /> Usually responds within 24 hours
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Let&apos;s Find Your{" "}
            <span className="gradient-heading">Perfect Property</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Reach out for a free consultation. Our experts will understand your
            requirements and guide you to the best options available.
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="bg-white dark:bg-slate-950 py-12 border-b border-slate-200/60 dark:border-slate-800 transition-colors">
        <div className="container-page">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {contactDetails.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color} dark:bg-opacity-20`}
                >
                  <item.icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {item.label}
                </p>
                {item.href ? (
                  <a
                    href={item.href}
                    className="mt-1 block font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      item.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                    {item.value}
                  </p>
                )}
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="bg-slate-50/50 dark:bg-slate-900/50 py-16 lg:py-24 transition-colors">
        <div className="container-page">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-5">
            {/* Left Info */}
            <div className="lg:col-span-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-950/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                Get in Touch
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                How Can We Help You?
              </h2>
              <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                Whether you&apos;re looking to buy, rent, or invest—our team is
                here to guide you at every step. Fill the form and we&apos;ll
                get back to you within 24 hours.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  "Free property consultation",
                  "RERA verification assistance",
                  "Home loan guidance",
                  "Site visit coordination",
                  "Legal documentation help",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
                  </div>
                ))}
              </div>

              {/* Map placeholder */}
              <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60">
                <div className="flex h-48 flex-col items-center justify-center gap-2 p-6">
                  <MapPin className="h-10 w-10 text-blue-500 dark:text-blue-400" />
                  <p className="text-center text-sm font-medium text-slate-700 dark:text-slate-200">
                    123, Scheme 54, Vijay Nagar
                  </p>
                  <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                    Indore, Madhya Pradesh 452010
                  </p>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Get Directions <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Working Hours */}
              <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Working Hours
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Monday – Saturday</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      10:00 AM – 7:00 PM
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Sunday</span>
                    <span className="font-medium text-rose-600 dark:text-rose-400">Closed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm lg:p-8">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Send Us a Message
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Tell us about your property requirements
                  </p>
                </div>
                <InquiryForm />
              </div>

              {/* Quick WhatsApp CTA */}
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-3 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 px-6 py-4 text-emerald-800 dark:text-emerald-300 transition hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
              >
                <Building2 className="h-5 w-5" />
                <span className="font-medium">
                  Prefer WhatsApp?{" "}
                  <span className="font-bold">Chat with us now</span>
                </span>
                <ArrowRight className="ml-auto h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
