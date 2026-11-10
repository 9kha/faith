import ListingsPage from "@/components/public/listings";

export const metadata = {
  title: "Properties for Rent — Faith Venture Realty",
  description: "Find rental properties in Central India. Verified listings with transparent pricing.",
};

export default function RentPage() {
  return <ListingsPage listingType="RENT" />;
}
