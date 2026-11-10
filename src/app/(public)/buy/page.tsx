import ListingsPage from "@/components/public/listings";

export const metadata = {
  title: "Properties for Sale — Faith Venture Realty",
  description: "Find properties for sale in Central India. Verified listings with transparent pricing.",
};

export default function BuyPage() {
  return <ListingsPage listingType="SALE" />;
}
