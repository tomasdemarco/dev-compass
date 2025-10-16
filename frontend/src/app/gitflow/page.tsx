'use client';

import MermaidDiagram from "@/components/generics/MermaidDiagram";

const gitflowChart = `
gitGraph
    commit id: "v1.0.0" type: HIGHLIGHT
    
    branch wg_adquirencia_dev
    checkout wg_adquirencia_dev
    commit id: "dev work"

    branch feature/dev-123
    checkout feature/dev-123
    commit id: "feat: new logic"
    checkout wg_adquirencia_dev
    merge feature/dev-123 id: "merge feature" type: HIGHLIGHT
    commit id: "release work"

    branch release/proyecto
    checkout release/proyecto
    commit id: "proyecto-1.0.0"
    
    checkout main
    merge wg_adquirencia_dev id: "PROD Release v1.1.0" type: REVERSE
    
    commit id: "checkout v1.1.0"
    
    checkout wg_adquirencia_dev
    merge release/proyecto id: "merge release" type: HIGHLIGHT

    checkout main
    branch hotfix/v1.1.1
    checkout hotfix/v1.1.1
    commit id: "HOTFIX v1.1.1"
    
    checkout wg_adquirencia_dev
    merge hotfix/v1.1.1 id: "nivelacion" type: HIGHLIGHT

    checkout main
    merge wg_adquirencia_dev id: "PROD Release v1.2.0" type: REVERSE
`;

const nugetPackageFlowChart = `
gitGraph
    commit id: "1.0.0"
    
    branch feature/dev-123
    checkout feature/dev-123
    commit id: "feat: new logic"
    
    checkout main
    merge feature/dev-123 id: "v1.1.0" type: REVERSE

    commit id: "work release/hotfix"
    
    checkout main
    branch release/hotfix-dev-123
    checkout release/hotfix-dev-123
    commit id: "v1.0.0-hotfix-dev-123"

    checkout main
    merge release/hotfix-dev-123 id: "nivelacion" type: REVERSE
`;

export default function GitflowPage() {
    return (
        <main className="container mx-auto p-8">
            <article className="max-w-none">
                <h1 className="text-2xl font-bold mb-6 border-b pb-2">Nuestro Flujo con GitFlow</h1>
                
                <h2 className="text-lg font-semibold mt-8 mb-4">La Idea Central</h2>
                <p className="text-md leading-relaxed mb-4">Git Flow organiza el desarrollo en dos ramas principales que viven para siempre (<code className="bg-muted text-primary rounded-md px-2 py-1 font-mono">main</code> y <code className="bg-muted text-primary rounded-md px-2 py-1 font-mono">wg_adquirencia_dev</code>) y tres tipos de ramas de soporte que son temporales y tienen un propósito específico.</p>

                <h2 className="text-xl font-semibold mt-8 mb-4">Las Ramas Principales (Permanentes)</h2>
                <ul className="list-disc list-inside space-y-2 text-md">
                    <li><strong>main</strong>: Piensa en esta rama como el historial oficial de tus versiones lanzadas. Cada punto en esta rama es una versión estable que ha sido entregada a los usuarios y está etiquetada con un número de versión (ej. v1.0, v1.1). <strong className="text-destructive">Nadie trabaja directamente aquí.</strong></li>
                    <li><strong>wg_adquirencia_dev</strong>: Es la rama de integración y desarrollo continuo. Todo el trabajo nuevo para la próxima versión se une aquí. Es como el "borrador en progreso" de la siguiente gran actualización.</li>
                </ul>

                <h2 className="text-lg font-semibold mt-8 mb-4">Diagrama del Flujo</h2>
                <p className="text-md leading-relaxed mb-4">El siguiente diagrama ilustra el ciclo de vida de las diferentes ramas:</p>
                <div className="my-8">
                    <MermaidDiagram chart={gitflowChart} />
                </div>

                <h2 className="text-xl font-semibold mt-8 mb-4">Las Ramas de Soporte (Temporales)</h2>
                <p className="text-md leading-relaxed mb-4">Estas ramas se crean para una tarea específica y se eliminan al completarla.</p>
                
                <h3 className="text-lg font-semibold mt-6 mb-3">feature/* (Nuevas Funcionalidades)</h3>
                <ul className="list-disc list-inside space-y-2 text-md">
                    <li><strong>Propósito</strong>: Desarrollar una nueva característica sin interrumpir a los demás.</li>
                    <li><strong>Flujo</strong>: Nace de <code className="bg-muted text-primary rounded-md px-2 py-1 font-mono">wg_adquirencia_dev</code> y, cuando la funcionalidad está terminada, vuelve a fusionarse con <code className="bg-muted text-primary rounded-md px-2 py-1 font-mono">wg_adquirencia_dev</code>. La version "minor" (ej. v1.1.0) se genera cuando, <code className="bg-muted text-primary rounded-md px-2 py-1 font-mono">wg_adquirencia_dev</code> se fusiona en <code className="bg-muted text-primary rounded-md px-2 py-1 font-mono">main</code>.</li>
                </ul>

                <h3 className="text-lg font-semibold mt-6 mb-3">release/* (Lanzamientos)</h3>
                <ul className="list-disc list-inside space-y-2 text-md">
                    <li><strong>Propósito</strong>: Preparar una nueva versión para producción en paralelo de la que se encuentra mas próxima a salir.</li>
                    <li><strong>Flujo</strong>: Nace de <code className="bg-muted text-primary rounded-md px-2 py-1 font-mono">wg_adquirencia_dev</code>. La version "minor" (ej. v1.1.0) del release se genera con cada push que se realice al origen. Al finalizar el desarrollo, la rama de release se fusiona de vuelta en <code className="bg-muted text-primary rounded-md px-2 py-1 font-mono">wg_adquirencia_dev</code>. Para lanzar la nueva versión a producción, <code className="bg-muted text-primary rounded-md px-2 py-1 font-mono">wg_adquirencia_dev</code> se fusiona en <code className="bg-muted text-primary rounded-md px-2 py-1 font-mono">main</code>.</li>
                </ul>

                <h3 className="text-lg font-semibold mt-6 mb-3">hotfix/* (Correcciones Urgentes)</h3>
                <ul className="list-disc list-inside space-y-2 text-md">
                    <li><strong>Propósito</strong>: Arreglar un bug crítico que ya está en producción.</li>
                    <li><strong>Flujo</strong>: Nace del tag o commit de la version que se encuentra en producción. La version "patch" (ej. v1.1.1) del hotfix se genera con cada push que se realice al origen. Luego se hace el merge a <code className="bg-muted text-primary rounded-md px-2 py-1 font-mono">wg_adquirencia_dev</code> para nivelar el código.</li>
                </ul>

                <h2 className="text-xl font-semibold mt-12 mb-4 border-t pt-8">Flujo de Versionado para Paquetes</h2>
                <p className="text-md leading-relaxed mb-4">Para los paquetes, el flujo es más simple y directo.</p>
                <div className="my-8">
                    <MermaidDiagram chart={nugetPackageFlowChart} />
                </div>
                <h3 className="text-lg font-semibold mt-6 mb-3">Flujo Principal</h3>
                <ul className="list-disc list-inside space-y-2 text-md">
                    <li>Una rama <code className="bg-muted text-primary rounded-md px-2 py-1 font-mono">feature/*</code> se crea para el nuevo trabajo.</li>
                    <li>Al finalizar, la rama <code className="bg-muted text-primary rounded-md px-2 py-1 font-mono">feature/*</code> se fusiona directamente en <code className="bg-muted text-primary rounded-md px-2 py-1 font-mono">main</code>.</li>
                    <li>Esta fusión dispara automáticamente la creación de una nueva versión "minor" (ej. v1.1.0) del paquete.</li>
                </ul>
                <h3 className="text-lg font-semibold mt-6 mb-3">Flujo de Release/Hotfix</h3>
                <ul className="list-disc list-inside space-y-2 text-md">
                    <li>Se crea una rama <code className="bg-muted text-primary rounded-md px-2 py-1 font-mono">release/*</code> o <code className="bg-muted text-primary rounded-md px-2 py-1 font-mono">release/hotfix-*</code> a partir de <code className="bg-muted text-primary rounded-md px-2 py-1 font-mono">main</code>. La version "minor" (ej. v1.1.0-hotfix-*) se genera con cada push que se realice al origen.</li>
                    <li>Al finalizar el desarrollo, la rama de release se fusiona de vuelta en <code className="bg-muted text-primary rounded-md px-2 py-1 font-mono">main</code> para nivelar el código..</li>
                </ul>
            </article>
        </main>
    );
}
