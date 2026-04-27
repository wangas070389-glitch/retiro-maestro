# MATH-016: Escalabilidad Progresiva de Aportaciones Voluntarias (Modalidad 40)

## 1. Fundamento Matemático
El costo del pago de Modalidad 40 ya no es fijo. Para predecir el pago del usuario en el calendario, necesitamos un algoritmo por saltos (piecewise function) que determine el porcentaje legal aplicable basado en el **Año de Vigencia**, multiplicado por los **Días Naturales del Mes** y el **Salario Base de Cotización** inercial.

## 2. Variables y Constantes
* $S$: Salario Base de Cotización (SBC Diario, congelado en MXN a la fecha de alta).
* $Y_{alta}$: Año en el que el usuario fue dado de alta en M40 (fija el máximo de UMA de ese momento).
* $Y_n$: Año calendario que se está proyectando (ej. 2026).
* $M_n$: Mes del año calendario (1 = Enero, ..., 12 = Diciembre).
* $D(Y_n, M_n)$: Número de días naturales del mes objetivo.
* $r(Y_n)$: Tasa porcentual aplicable, definida por la Ley del IMSS según la reforma de 2020.

## 3. Función de Ratio por Año ($r(Y_n)$)
La reforma estableció un esquema progresivo patronal de la cuota de Cesantía en Edad Avanzada y Vejez (CEAV) que, sumado a las otras ramas, resulta en el porcentaje total de M40.

$$
r(Y_n) = \begin{cases} 
      0.10075 & Y_n \leq 2022 \\
      0.11166 & Y_n = 2023 \\
      0.12256 & Y_n = 2024 \\
      0.13347 & Y_n = 2025 \\
      0.14438 & Y_n = 2026 \\
      0.15528 & Y_n = 2027 \\
      0.16619 & Y_n = 2028 \\
      0.17709 & Y_n = 2029 \\
      0.18800 & Y_n \geq 2030 
   \end{cases}
$$

*Nota técnica:* Estas cifras corresponden a salarios tope (mayores a 4 UMAs). El sistema siempre lidia con perfiles que buscan optimizar al tope ($Y_{alta} \approx 25 \text{ UMAs}$).

## 4. Función General del Pago Mensual ($P_m$)
El pago mensual proyectado en la interfaz no sufre promediaciones contables. Es un producto lineal de tipo $mx+b$ discreto.

$$
P_m = S \cdot r(Y_n) \cdot D(Y_n, M_n)
$$

### Cálculo de Días Naturales
El sistema debe resolver $D$ computacionalmente para esquivar el fallo de "febrero bisiesto" (Ver RED-018):
$$D_{bisiesto}(Y) = Y \pmod 4 = 0 \land (Y \pmod{100} \neq 0 \lor Y \pmod{400} = 0)$$
Si $M_n = 2$:
$$D = 29 \text{ if } D_{bisiesto}(Y) \text{ else } 28$$

## 5. Corolario: Ilusión del INPC
Es crítico que $S$ (SBC Diario) se mantenga estático como $S_{alta}$. La fórmula NUNCA debe integrar inflación futura a $S$ a menos que exista un trámite de baja y reingreso. El costo $P_m$ solo crece de año en año porque $r(Y_n)$ aumenta.
