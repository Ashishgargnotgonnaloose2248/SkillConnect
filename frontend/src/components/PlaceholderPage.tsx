import { Link } from "react-router-dom";

export default function PlaceholderPage({ title, description }: { title: string; description?: string }) {
  return (
    <section className="container py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          {title}
        </h1>
        <p className="text-muted-foreground mb-8">
          {description || "This page is a placeholder. Continue prompting to design its content and flow."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/" className="text-sm text-primary hover:underline">Go home</Link>
          <Link to="/explorer" className="text-sm text-primary hover:underline">Explore skills</Link>
        </div>
      </div>
    </section>
  );
}
