# Switch Sender

Este proyecto es un servicio de backend escrito en Go que actúa como un procesador de transacciones financieras. Su principal responsabilidad es consumir mensajes desde una cola de RabbitMQ, interpretarlos y enviarlos a diferentes sistemas externos, ya sea a través del protocolo financiero ISO 8583 o mediante una API REST.

## Propósito

El `switch-sender` sirve como un adaptador o middleware entre un sistema de mensajería moderno (RabbitMQ) y sistemas de procesamiento de pagos, que pueden ser tanto sistemas heredados que utilizan ISO 8583 como servicios más modernos basados en API.

El servicio es capaz de:
1.  Recibir solicitudes de compra y enviarlas como mensajes de autorización ISO 8583.
2.  Recibir solicitudes de reversa y procesarlas contra un sistema ISO 8583 o una API externa, dependiendo del tipo de mensaje.

## Funcionalidades Principales

- **Consumidor de RabbitMQ**: El servicio escucha en una cola de RabbitMQ para procesar mensajes de forma asíncrona y con reconexión automática.
- **Publicador de RabbitMQ**: Incluye un publicador resiliente con reconexión automática para enviar eventos.
- **Enrutamiento por Tipo de Mensaje**: Utiliza el header `x-message-type` de los mensajes de RabbitMQ para decidir qué acción tomar (p. ej., `ReversalIso`, `ReversalApi`).
- **Cliente ISO 8583**: Integra un cliente para construir y enviar mensajes en el formato estándar ISO 8583, con gestión de conexión y reconexión automática.
- **Cliente HTTP**: Incluye un cliente HTTP para interactuar con APIs externas.
- **Configuración Flexible**: La configuración se puede cargar desde un archivo `.env` para desarrollo local o desde AWS SSM Parameter Store para entornos desplegados.

## Configuración

La configuración de la aplicación se gestiona de manera diferente según el entorno de ejecución, controlado por la variable de entorno `ENVIRONMENT`.

### Variables de Entorno Principales

Estas son las variables que siempre deben estar presentes en el entorno de ejecución de la aplicación:

| Variable      | Descripción                                                                                                                          | Ejemplo     |
|---------------|--------------------------------------------------------------------------------------------------------------------------------------|-------------|
| `ENTIDAD`     | Define el nombre de la entidad o tenant, usado para construir las rutas de los parámetros en AWS SSM.                                | `700`       |
| `AWS_REGION`  | Define la región de AWS donde opera el servicio y donde se buscarán los parámetros de configuración.                                 | `us-east-1` |
| `ENVIRONMENT` | Define el entorno (solo para uso local). Si se establece en `local`, la configuración se lee de `.env`, si es `sandbox`, de AWS SSM. | `local`     |
| `AWS_ID`      | AWS Access Key ID (solo para uso local y `ENVIRONMENT=sandbox`).                                                                     | `AKIA...`   |
| `AWS_SECRET`  | AWS Secret Access Key (solo para uso local y `ENVIRONMENT=sandbox`).                                                                 | `xbQM3...`  |

---

### Configuración en AWS

Para entornos desplegados, la aplicación cargará su configuración desde **AWS Systems Manager (SSM) Parameter Store**. La aplicación tiene permisos para leer de las siguientes rutas, de donde obtiene toda su configuración:

- `/[ENTIDAD]/ECS/SwitchSender/`
- `/[ENTIDAD]/MQ/SwitchSender/`
- `/MQ/Connection/` (y otras rutas de MQ por compatibilidad)

A continuación se muestra la tabla de mapeo entre los parámetros de SSM y las variables de entorno que la aplicación utiliza internamente.

| Parámetro en SSM                                    | Variable de Entorno Resultante |
|-----------------------------------------------------|--------------------------------|
| `/[ENTIDAD]/ECS/SwitchSender/Log/Level`             | `LOG_LEVEL`                    |
| `/[ENTIDAD]/ECS/SwitchSender/Iso/Host`              | `ISO_HOST`                     |
| `/[ENTIDAD]/ECS/SwitchSender/Iso/Port`              | `ISO_PORT`                     |
| `/[ENTIDAD]/ECS/SwitchSender/Iso/Timeout`           | `ISO_TIMEOUT`                  |
| `/[ENTIDAD]/ECS/SwitchSender/Api/Host`              | `API_HOST`                     |
| `/[ENTIDAD]/ECS/SwitchSender/Api/Timeout`           | `API_TIMEOUT`                  |
| `/[ENTIDAD]/MQ/SwitchSender/channel/queuename`      | `MQ_CHANNEL_QUEUENAME`         |
| `/[ENTIDAD]/MQ/SwitchSender/channel/queuetype`      | `MQ_CHANNEL_QUEUETYPE`         |
| `/[ENTIDAD]/MQ/SwitchSender/channel/exchange`       | `MQ_CHANNEL_EXCHANGE`          |
| `/[ENTIDAD]/MQ/SwitchSender/channel/routingkey`     | `MQ_CHANNEL_ROUTINGKEY`        |
| `/[ENTIDAD]/MQ/SwitchSender/channel/prefetchcount`  | `MQ_CHANNEL_PREFETCHCOUNT`     |
| `/[ENTIDAD]/MQ/SwitchSender/deadletter/exchange`    | `MQ_DEADLETTER_EXCHANGE`       |
| `/[ENTIDAD]/MQ/SwitchSender/deadletter/routingkey`  | `MQ_DEADLETTER_ROUTINGKEY`     |

**Nota:** Los parámetros de conexión a MQ (`MQ_HOST`, `MQ_USER`, etc.) se cargan de forma similar desde rutas como `/MQ/Connection/` o `/[ENTIDAD]/MQ/Connection/`.

---

### Configuración Local (ENVIRONMENT=local)

Para el desarrollo local, crea un archivo `.env` en la raíz del proyecto. Estas variables simulan los valores que vendrían de SSM en un entorno de AWS.

| Variable                      | Ejemplo                           | Descripción                                        |
|-------------------------------|-----------------------------------|----------------------------------------------------|
| `LOG_LEVEL`                   | `0`                               | Nivel de log de la aplicación.                     |
| `ISO_HOST`                    | `localhost`                       | Host del servidor ISO 8583.                        |
| `ISO_PORT`                    | `8015`                            | Puerto del servidor ISO 8583.                      |
| `ISO_TIMEOUT`                 | `15000`                           | Timeout en milisegundos para el cliente ISO.       |
| `API_HOST`                    | `http://localhost:8183`           | URL base del servicio de API para reversas.        |
| `API_TIMEOUT`                 | `15000`                           | Timeout en milisegundos para el cliente API.       |
| `MQ_HOST`                     | `localhost`                       | Host de RabbitMQ.                                  |
| `MQ_PORT`                     | `5672`                            | Puerto de RabbitMQ.                                |
| `MQ_USER`                     | `guest`                           | Usuario de RabbitMQ.                               |
| `MQ_PASSWORD`                 | `guest`                           | Contraseña de RabbitMQ.                            |
| `MQ_CHANNEL_QUEUENAME`        | `mq-switch-sender-[ENTIDAD]`      | Nombre de la cola a consumir.                      |
| `MQ_CHANNEL_EXCHANGE`         | `exc-switch-sender-[ENTIDAD]`     | Nombre del exchange para publicar.                 |
| `MQ_CHANNEL_ROUTINGKEY`       | `mq-switch-sender`                | Routing key por defecto para publicar.             |
| `MQ_CHANNEL_PREFETCHCOUNT`    | `10`                              | Nº de mensajes que el consumidor procesa a la vez. |
| `MQ_DEADLETTER_EXCHANGE`      | `exc-switch-sender-[ENTIDAD]-dlx` | Exchange para mensajes fallidos (Dead Letter).     |
| `MQ_DEADLETTER_ROUTINGKEY`    | `mq-switch-sender-dlq`            | Routing key para mensajes fallidos.                |