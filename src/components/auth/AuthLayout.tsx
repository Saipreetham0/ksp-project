import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";

const HIGHLIGHTS = [
  "Place and track orders in one place",
  "Source code, docs & walkthrough included",
  "Updates from your project specialist",
];

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function AuthLayout({ title, subtitle, footer, children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl" />

        <Link href="/" className="relative inline-flex w-fit items-center">
          <span className="relative inline-block h-9 w-44">
            <Image src="/KSP Electronics-light.png" alt="KSP Electronics" fill priority className="object-contain object-left" />
          </span>
        </Link>

        <div className="relative space-y-6">
          <h1 className="max-w-md text-balance text-3xl font-semibold leading-tight tracking-tight">
            Build, track, and deliver every academic project in one place.
          </h1>
          <ul className="space-y-3">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-center gap-2.5 text-primary-foreground/90">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground/15">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {h}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-primary-foreground/70">
          IoT · ML · Mechanical · Documentation
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col px-6 py-10 sm:px-10">
        <Link href="/" className="mb-10 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
          <span className="relative mb-8 inline-block h-9 w-44 lg:hidden">
            <Image src="/KSP Electronics-dark.png" alt="KSP Electronics" fill priority className="object-contain object-left" />
          </span>

          <div className="mb-6 space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {children}

          {footer && <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>}
        </div>
      </div>
    </div>
  );
}
