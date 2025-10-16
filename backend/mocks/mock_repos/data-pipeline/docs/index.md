# Pipeline de Datos

Este es un pipeline de ETL (Extract, Transform, Load) para procesar datos de eventos y cargarlos en nuestro data warehouse.

## Arquitectura

1.  **Fuente:** Eventos de SQS.
2.  **Procesamiento:** Un script de Python que se ejecuta en un contenedor de ECS.
3.  **Destino:** Tablas en BigQuery.

## Dependencias

- Este pipeline depende del `auth-service` para validar los tokens de los eventos entrantes.
