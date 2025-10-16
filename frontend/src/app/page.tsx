import { Button } from "@/components/generics/Button";
import { CodeIcon } from "@/components/generics/Icons";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <CodeIcon className="w-48 h-48 mx-auto" />
        <h1 className="text-4xl font-bold mt-4">DevCompass</h1>
        <p className="text-lg mt-2">Your developer portal is starting up.</p>
        <div className="mt-8">
          <Button variant="custom" size="lg">
            <Link href="/catalog">
              Go to Catalog
            </Link>
          </Button>
        </div>

        {/* --- DEBUGGING BLOCK --- */}
        <article className="prose dark:prose-invert mt-12 text-left">
          <h2>Test de Tipografía</h2>
          <p>Si ves esto con estilos (encabezado grande, texto normal), el plugin funciona. Si se ve plano, el problema es la configuración de Tailwind.</p>
          <ul>
            <li>Elemento de lista 1</li>
            <li>Elemento de lista 2</li>
          </ul>
          <code>const a = 1;</code>
        </article>
        {/* --- END DEBUGGING BLOCK --- */}

      </div>
    </main>
  );
}
