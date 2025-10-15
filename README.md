# DevCompass

DevCompass es un portal para desarrolladores diseñado para catalogar y visualizar componentes de software directamente desde repositorios de GitLab, similar a Backstage de Spotify.

## Tecnologías

*   **Backend:** Go
*   **Frontend:** Next.js (React) con TypeScript

## Cómo Empezar

### Prerrequisitos

*   [Node.js](https://nodejs.org/) (versión 20 o superior)
*   [Go](https://go.dev/) (versión 1.22 o superior)

### Backend

1.  **Navega al directorio del backend:**
    ```bash
    cd backend
    ```

2.  **Instala las dependencias:**
    ```bash
    go mod tidy
    ```

3.  **Ejecuta el servidor:**
    ```bash
    go run ./cmd/server/main.go
    ```
    El backend estará corriendo en `http://localhost:8080`.

### Frontend

1.  **Navega al directorio del frontend:**
    ```bash
    cd frontend
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

3.  **Ejecuta la aplicación de desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación web estará disponible en `http://localhost:3000`.

## Estructura del Proyecto

*   `backend/`: Contiene el servidor en Go, responsable de la lógica de negocio, la conexión con la base de datos y la API.
*   `frontend/`: Contiene la aplicación web en Next.js, que consume la API del backend para mostrar el catálogo de componentes.

## Configuración de Componentes (`catalog-info.yaml`)

Para que DevCompass descubra y catalogue un componente, debe existir un archivo de manifiesto en la raíz del repositorio de GitLab.

El nombre de archivo preferido es `catalog-info.yaml` (o `.yml`) para seguir el estándar de Backstage. Sin embargo, por retrocompatibilidad, DevCompass también buscará el nombre anterior, `devcompass.yaml`.

Este archivo actúa como la fuente de verdad para los metadatos definidos manualmente, pero se enriquece con información extraída automáticamente por el backend de DevCompass desde GitLab.

### Compatibilidad con Backstage (`catalog-info.yaml`)

El formato de `devcompass.yaml` está inspirado en el `catalog-info.yaml` de Backstage y apunta a ser altamente compatible para el `kind: Component`.

#### Nivel de Compatibilidad

Para la entidad `kind: Component`, DevCompass soporta la mayoría de los campos estándar de Backstage:

*   **Metadatos:** `name`, `description`, `tags`, `labels`, `annotations` y `links`.
*   **Especificación:** `type`, `lifecycle`, `owner` y `system`.
*   **Relaciones:** Se soportan tanto el bloque genérico `relations` como los atajos de alto nivel (ej. `dependsOn`, `providesApis`), permitiendo una alta fidelidad con la especificación de Backstage.

#### Extensiones de DevCompass

Estos campos son específicos de DevCompass y son poblados automáticamente por el backend para enriquecer la información del catálogo:

*   `spec.techdocs`: Define la ubicación de la documentación. Por defecto, se usa el `README.md` del repositorio.
*   `spec.ci`: Contiene información del pipeline de CI/CD extraída de GitLab.
*   `spec.repository`: Almacena metadatos del repositorio, como los tags de versiones.

#### Limitaciones Conocidas

*   **Otros `kinds`:** La compatibilidad se centra en `kind: Component`. Otros tipos de entidades de Backstage (`API`, `Resource`, `User`, `System`, etc.) no están soportados actualmente.

### Ejemplo de catalog-info.yaml (o devcompass.yaml)

```yaml
# --- devcompass.yaml ---
# Este es un ejemplo completo del manifiesto que DevCompass busca en cada repositorio.

# Versión de la especificación de DevCompass que estás usando.
apiVersion: devcompass.io/v1alpha1
# Tipo de entidad. Por ahora, solo usamos "Component".
kind: Component

# --- Metadatos (Definidos manualmente) ---
# Información básica para identificar y clasificar el componente.
metadata:
  # Nombre único del componente en el catálogo. Usar formato kebab-case.
  name: visa-authorizer
  # Descripción clara y concisa de lo que hace el componente.
  description: "Autorizador de Visa"
  # Tags para búsqueda y filtrado. Ayudan a organizar el catálogo.
  tags:
    - ecs
    - api
    - dotnet

# --- Especificaciones (Mezcla de manual y automático) ---
# Detalles técnicos y de propiedad sobre el componente.
spec:
  # Tipo de componente. Puede ser 'service', 'library', 'website', 'documentation', etc.
  type: service
  # Estado de madurez del componente.
  # Valores comunes: 'experimental', 'production', 'deprecated'.
  lifecycle: experimental
  # Equipo o persona dueña del componente.
  owner: desarrollo

  # --- Relaciones con otros componentes (Definidas manualmente) ---
  # Define las dependencias y otras relaciones.
  relations:
    - type: dependsOn # Este componente depende de...
      target:
        kind: Component # ...otro Componente...
        name: opi-switch # ...llamado 'auth-service'.
    - type: providesApi #
      target:
        kind: Worker # ...de tipo Worker...
        name: presentation # ...llamada 'presentation'.
    - type: providesApi # Este componente provee una API...
      target:
        kind: API # ...de tipo API...
        name: sentinel-realtime # ...llamada 'sentinel-realtime'.
    - type: providesApi # Este componente provee una API...
      target:
        kind: Lambda # ...de tipo API...
        name: sentinel-online # ...llamada 'sentinel-online'.

  # --- Documentación Técnica (Poblado automáticamente) ---
  # Por defecto, se usa el README.md. Este campo puede especificar un directorio diferente.
  techdocs:
    dir: docs

  # --- Integración Continua (CI/CD) (Poblado automáticamente) ---
  # Esta sección es actualizada por el backend de DevCompass.
  ci:
    last_run_status: "SUCCESS" # Estado del último pipeline: SUCCESS, FAILED, RUNNING
    pipeline_url: "https://gitlab.com/mi-empresa/backend-services/user-profile-api/-/pipelines/12345"

  # --- Información del Repositorio (Poblado automáticamente) ---
  # Metadatos extraídos directamente de Git por el backend.
  repository:
    tags:
      - name: "v1.0.0"
        timestamp: "2025-10-01T11:00:00Z"
```