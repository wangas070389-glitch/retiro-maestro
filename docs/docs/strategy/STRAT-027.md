---
title: "STRAT-027: Escalabilidad de Administración y Sobrescritura de Oráculo"
status: "Activo"
date: "2026-02-24"
author: "Antigravity Engineering"
---

# STRAT-027: Escalabilidad de Administración y Sobrescritura de Oráculo

## Resumen Ejecutivo
Con la transformación del motor hacia una plataforma SaaS Multi-Tenant (ADR-019), surge la necesidad operativa de mantener el control soberano sobre las variables macroeconómicas clave (UMA, INPC) sin requerir despliegues de código (`legal-anchors.json`) ni depender de APIs gubernamentales de terceros que pueden fallar (INEGI).

Esta estrategia define la creación de un modelo de **Control de Acceso Basado en Roles (RBAC)** y una Interfaz de Mando exclusiva para Administradores (`/settings`).

## Protocolo de Sobrescritura (Admin Override)
El "Oráculo Económico" (ADR-022) debe ser resiliente. Si la UMA cambia por decreto el 1 de Febrero, el Administrador del sistema debe poder inyectar este nuevo valor instantáneamente en la memoria colectiva del SaaS.

### Directrices Arquitectónicas
1. **Delegación de Autoridad (RBAC):** Expansión del esquema de base de datos (`User` -> `role`) para separar a los usuarios base (`USER`) de los operadores del sistema (`ADMIN`).
2. **Cámara de Cristal (Settings UI):** Creación de un módulo de "Configuración Mundial" (World Settings) bajo la estética Narciso. Este módulo es totalmente invisible e inaccesible para los inquilinos regulares.
3. **Persistencia Reactiva Suprema:** La sobrescritura manual del Administrador se guarda en la tabla `EconomicAnchor` y toma **prioridad absoluta** sobre cualquier archivo de texto local o caché previo, reestructurando matemáticamente todas las simulaciones de la plataforma en el siguiente ciclo de render.

## Vectores de Riesgo (Red Team)
- **Ataque de Escalado de Privilegios:** Un inquilino normal descubriendo la ruta `/settings`.
  - *Defensa:* Protección criptográfica en el servidor (Server Components) leyendo directamente el JWT de NextAuth. Retorno de estado bloqueante (`404 Not Found`) en lugar de `401 Unauthorized` para evitar descubrimiento de endpoints.
- **Corrupción del Oráculo (Fat Finger):** Un Admin escribiendo $1,200 en lugar de $120.00 en la UMA.
  - *Defensa:* Validaciones Zod estrictas en el Server Action (`updateManualAnchorAction`) y validación de salto porcentual (P31 - Adversarial Veto).

## Conclusión
La estrategia STRAT-027 garantiza que *Retiro Maestro* pueda operar de forma perpétua y soberana, manteniéndose matemáticamente preciso a lo largo de los años mediante la calibración humana autorizada, sin depender de librerías de terceros o conexiones inestables.
