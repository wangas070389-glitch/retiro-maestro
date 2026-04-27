# Post Mortem 006: La Trampa de la Inmutabilidad Parcial

## Incidente / Hallazgo Teórico
Durante el diseño de la tubería de Extracción Forense de Constancias IMSS (STRAT-025), el equipo táctico (Red Team RED-017) identificó una falla crítica de diseño en la interacción entre la extracción automatizada y los inputs manuales del formulario principal de la Calculadora de Pensiones.

## El Problema
El `DocumentUploader` extrae los datos con un 100% de confianza desde un PDF y los inyecta en el formulario del Dashboard. A partir de ahí, la UI mostraba un mensaje de "Éxito". Sin embargo, el asesor retiene el control de los campos `Semanas` y `Salario`. 
Si el asesor decide sumar 500 semanas manualmente después de la extracción, la aplicación aún recordaría que provino de un documento oficial, generando un Análisis PDF final con el sello de "Data Verificada 100%" pero calculado sobre parámetros alterados manualmente.

## Impacto (Estimado)
- **Crítico:** Pérdida total de la confianza soberana en el sistema. Los PDF generados por Retiro Maestro dejarían de ser vinculantes al probarse que el origen validado y el número calculado pueden divergir por diseño.
- **Riesgo:** Generación desapercibida de simulaciones fraudulentas, dañando los principios expuestos en el Códice de AntiGravedad.

## Resolución (El Destructor Táctil)
En lugar de bloquear los inputs por completo (lo cual arruinaría la experiencia UX de hacer proyecciones a futuro partiendo de una base real), se optó por un enfoque reactivo destructivo.

Se diseñó la interfaz Zustand implementando un candado volátil `certified_dossier`. Este componente actúa como el cordón de un paracaídas. Si en algún momento, el operador altera manualmente los campos de entrada post-extracción, el Dashboard dispara un interceptor:
1. Muestra una alerta (Toast) al asesor indicando la acción destructiva.
2. Anula (`null`) el objeto `certified_dossier`.
3. Devuelve la interfaz a su estado Especulativo (Sin cintillas de verificación).

## Lecciones Aprendidas
1. La procedencia forense no se trata solo de extraer bien el dato, sino de **garantizar su pureza** hasta el último milisegundo antes de que se presione "Calcular".
2. **"Trust but Verify" no es suficiente en UI.** Si un input debe ser verificado, su mutabilidad debe ser binariamente opuesta a su certificación. O se asume como verdad inmutable, o se trata como especulación completa.
