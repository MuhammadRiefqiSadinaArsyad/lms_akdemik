import { AuthLayout, AuthBrand } from "@/components/AuthLayout";
import { ResetForm } from "./ResetForm";

export default async function ResetPassword({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  return (
    <AuthLayout>
      <AuthBrand />
      <div>
        <h1 className="font-serif text-5xl leading-tight xl:text-6xl">Password baru.</h1>
        <p className="mt-3 max-w-md text-sm text-muted">
          Buat password baru untuk akunmu.
        </p>
        <ResetForm code={code ?? null} />
      </div>
      <p className="mt-16 text-[11px] uppercase tracking-[0.2em] text-muted">
        © {new Date().getFullYear()} EduClass
      </p>
    </AuthLayout>
  );
}