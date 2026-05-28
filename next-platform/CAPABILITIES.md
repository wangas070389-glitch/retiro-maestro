# Retiro Maestro — Guía Integral de Capacidades del Sistema (System Capabilities)

Retiro Maestro es una plataforma digital de planificación actuarial y CRM comercial diseñada específicamente para maximizar pensiones bajo la **Ley del Seguro Social de 1973 (Ley 73)** del Instituto Mexicano del Seguro Social (IMSS). La plataforma combina un motor de cálculo matemático de precisión legal, un motor de búsqueda inversa (Goal-Seeking), herramientas de optimización financiera y un CRM completo para asesores de pensiones.

---

## 1. Arquitectura de Cálculo Servidor-Central (IP Protection)

El sistema opera bajo un esquema de **Aislamiento de IP Actuarial**. Toda la lógica de negocio y simulación se ejecuta estrictamente en el lado del servidor para proteger las fórmulas propietarias contra la ingeniería inversa en el navegador.

- **Client-Side:** Solo se encarga del renderizado de interfaces mediante React/Next.js y el envío de payloads limpios de datos hacia el servidor.
- **Server Actions:** Las peticiones viajan a través de canales seguros cifrados (`calculatePensionAction`, `calculateStrategiesAction`, etc.).
- **Economic Anchors (Servicio de Oráculo):** La base de datos actúa como la fuente de verdad histórica para las unidades de medida (UMA, SMDF, INPC), consultadas dinámicamente mediante `OracleService` en lugar de estar hardcodeadas estáticamente en el frontend.

---

## 2. Lógica Actuarial del Motor de Pensiones (Ley 73)

El `PensionEngine` implementa de manera exacta las disposiciones de la Ley del Seguro Social de 1973:

### A. Cálculo del Multiplicador de Salario (n)
- **Corte de Registro (RED-002):** El salario diario promedio del usuario es limitado automáticamente al tope de ley de **25 UMAs** vigentes (Unidad de Medida y Actualización).
- **Relación Salario/UMA:** Determina el factor $n = \text{Salario Promedio Topado} / \text{Valor de UMA}$.

### B. Coeficientes de Cuantía Básica (PCB) e Incremento Anual (APCB)
- El factor $n$ se mapea con la tabla oficial de coeficientes sin saltos (tabla continua en `legal-anchors.json` sin gaps de rango):
  - **Cuantía Básica (PCB):** Va desde 80% (para salarios bajos) hasta 13% (para salarios topados).
  - **Incremento Anual (APCB):** Va desde 0.563% hasta 2.450% por cada año adicional cotizado.

### C. Años de Excedente ($N_{ex}$)
- **Validación Física (RED-008):** Clampa las semanas registradas entre 0 y un máximo biológico de 2,700 semanas (~52 años cotizados).
- **Semanas Excedentes:** Se calculan descontando las 500 semanas básicas exigidas por ley: $\text{Semanas Excedentes} = \max(0, \text{Semanas Cotizadas} - 500)$.
- **Redondeo Legal (MATH-001):** Convierte semanas excedentes a años fraccionales bajo el estándar de aproximación del IMSS:
  - De 13 a 26 semanas cotizadas excedentes = $+0.5$ años.
  - De 27 semanas en adelante = $+1.0$ año.

### D. Asignaciones Familiares y Ayuda Asistencial
- **Esposa/Esposo:** $+15\%$ si se declara cónyuge.
- **Hijos:** $+10\%$ por cada hijo menor de 16 años (o hasta 25 años si estudia en el Sistema Educativo Nacional).
- **Padres:** $+10\%$ por cada progenitor si el pensionado no tiene cónyuge ni hijos y los padres dependen económicamente de él.
- **Asignación por Soledad:** $+15\%$ automático de ayuda asistencial si el pensionado no cuenta con familiares directos declarados.

### E. Factores Legales e Inflación
- **Factor de Decreto (1.11):** Multiplica la pensión anual determinada por 1.11 conforme al Artículo Décimo Cuarto Transitorio.
- **Ajuste por Edad (Tablas de Cesantía/Vejez):** Aplica la penalización progresiva según la edad de retiro seleccionada:
  - 60 años: 75%
  - 61 años: 80%
  - 62 años: 85%
  - 63 años: 90%
  - 64 años: 95%
  - 65 años o más: 100%

---

## 3. Motor Fiscal: Retenciones ISR de Pensiones

Implementado en el módulo `TaxEngine`, procesa las exenciones oficiales que marca la Ley del Impuesto Sobre la Renta (LISR):

- **Exención de Ley (Art. 93 LISR):** Las pensiones están exentas de impuestos hasta por un monto equivalente a **15 UMAs mensuales** calculadas conforme al factor anualizado estándar ($30.4$ días).
- **Tarifa Mensual Progresiva (Art. 96 LISR):** Toda cantidad que exceda las 15 UMAs de exención es sujeta al cálculo del Impuesto Sobre la Renta (ISR) aplicando la tabla oficial completa de **11 rangos**, desde el 1.92% hasta el 35%, devolviendo la pensión neta y la retención exacta de forma automatizada.

---

## 4. Taller de Diseño Inverso (Goal-Seeker / Inverse Designer)

Esta capacidad matemática permite a los asesores y clientes resolver la pregunta de inversión inversa: **"¿Cuánto necesito cotizar en Modalidad 40 para obtener $X$ cantidad de pensión?"**

- **Búsqueda Binaria Avanzada:** Utiliza un algoritmo de aproximación numérica de convergencia rápida en el servidor sobre el intervalo legal de $[0, 25]$ UMAs.
- **Viabilidad Legal:** Verifica si la meta del usuario es matemáticamente posible considerando su historial de semanas acumuladas y su edad. Si no es posible, calcula el techo máximo legal que sí puede alcanzar y sugiere la estrategia ideal para maximizar el retorno de inversión (ROI).

---

## 5. Optimizador de Escenarios de Modalidad 40

El `ROIOptimizer` evalúa y compara simultáneamente múltiples horizontes de inversión voluntaria para proponer la ruta económicamente óptima.

- **Comparación Multi-Escenario:**
  - **Inercial (Sin Inversión):** Proyección si el usuario decide pensionarse inmediatamente con sus valores actuales.
  - **Escenarios de 1 a 5 Años:** Proyecciones incrementales invirtiendo en Modalidad 40 de manera topada o mezclada.
- **Cálculo de Costo Progresivo de Modalidad 40:**
  - Implementa la tabla de incrementos progresivos a las cuotas patronales de la Ley del Seguro Social (2022–2030+), variando del 10.075% hasta alcanzar el tope del 18.80% en 2030.
- **Métricas de Rendimiento Financiero:**
  - **Inversión Total:** El costo total acumulado ajustado por la tasa de Modalidad 40 del año correspondiente.
  - **Incremento Mensual:** Diferencia neta respecto al escenario inercial sin Modalidad 40.
  - **Retorno de Inversión (ROI):** Período de recuperación medido en meses de pensión cobrada.
  - **Costo de la Inacción:** Monto mensual que el cliente deja de percibir por cada mes que posterga la contratación de su estrategia.

---

## 6. Vigencia de Derechos (Ley 73 Art. 150)

Módulo preventivo (`VigenciaGuard`) encargado de validar el estado legal de los derechos de pensión del usuario.

- **Cálculo de Conservación:** La vigencia de derechos equivale exactamente a **1/4 (25%)** del total de semanas cotizadas a lo largo de la vida laboral del afiliado.
- **Validación del Historial de Baja:** Mide el tiempo transcurrido desde la fecha de última baja formal ante el IMSS hasta el día actual.
- **Alerta de Proximidad:** Lanza advertencias visuales y advertencias críticas en el sistema cuando el usuario ha consumido más del **80%** de su período de gracia, indicando la fecha exacta límite para firmar el convenio de Modalidad 40 o reactivarse laboralmente.
- **Plan de Recuperación:** Si los derechos ya expiraron, prescribe el requerimiento obligatorio de cotizar **52 semanas** adicionales en el régimen obligatorio para reactivar derechos.

---

## 7. Ingestión y Extracción Inteligente de Documentos (PDF Parser)

Permite la carga automatizada de las constancias IMSS reduciendo el tiempo de captura manual a cero:

- **Procesamiento de PDF:** Extrae texto plano directamente del documento oficial de semanas cotizadas.
- **Extracción de Entidades Actuariales:** Localiza de forma automática:
  - El total de semanas reconocidas por el IMSS.
  - El historial de salarios diarios integrados (SBC) de los últimos patrones.
  - La fecha del último movimiento registrado (Baja).
- **Prellenado del Simulador:** Los datos se inyectan en el estado del simulador del laboratorio para cálculos instantáneos.

---

## 8. CRM de Cierre Comercial para Asesores (B2B)

Espacio de trabajo modular diseñado para agencias y consultores financieros independientes:

- **Pipeline de Conversión (CRM):** Flujo de seguimiento estructurado del lead: `Prospecto` → `En Diseño` → `Propuesta Presentada` → `Cierre Ganado` o `Cierre Perdido`.
- **Panel de Dictamen Integral:** Generador automatizado de reportes ejecutivos en PDF descargables que sintetizan las proyecciones financieras para entrega final al cliente.
- **Argumentario Comercial Automatizado:** Motor lingüístico que toma el resultado de la optimización (el mejor ROI) y redacta en tiempo real el speech comercial sugerido para cerrar la venta (ej. *"Hoy su pensión es de X, pero invirtiendo Y la podemos subir a Z..."*).
- **Integración Multicanal:** Accesos directos integrados para iniciar llamadas o enviar la propuesta pre-estructurada directamente al WhatsApp del cliente con un solo clic.

---

## 9. Seguridad, Control de Acceso y Concurrencia

El sistema integra estrictos protocolos de protección empresarial:

- **Middleware Seguro:** Bloquea el acceso a todas las rutas operativas (`/dashboard`, `/laboratory`, `/authority`, `/admin`, `/portfolio`, `/profile`, `/settings`) redirigiendo a los usuarios no autenticados a la pantalla de login.
- **Redirección de Rol (Role Guards):** Las áreas administrativas `/admin/*` y de portafolio de clientes están protegidas contra accesos no autorizados mediante validación de roles de usuario (`ADMIN` / `ADVISOR`).
- **Concurrencia Atómica (Race Condition Fix):** La asignación e ingestión de prospectos (Lead Routing) se realiza bajo transacciones atómicas a nivel base de datos (`db.$transaction()`), garantizando que dos asesores no puedan reclamar el mismo lead de manera simultánea en escenarios de alta demanda.
- **Control de Abuso (Trial Guard):** Gatea el número de simulaciones gratuitas que los usuarios con planes libres (`FREE`) pueden ejecutar antes de solicitar suscripción o asignación comercial con asesores certificados.
- **Protección de Datos Sensibles:** La base de datos guarda contraseñas con cifrado de una vía mediante `bcryptjs` con costo 10. Las credenciales sensibles y tokens de sesión de NextAuth son purgados de los logs de producción para evitar filtración de datos de usuarios financieros en el backend.
