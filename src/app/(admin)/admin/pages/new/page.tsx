import PageBuilderForm from "../page-form";

export const metadata = {
  title: "Create Custom Page | Admin",
  description: "Create and publish dynamic landing pages with custom URLs",
};

export default function NewPage() {
  return <PageBuilderForm isEdit={false} />;
}
