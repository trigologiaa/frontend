# Guion de la presentación (≈ 10 min)

Abrí antes: el sitio en producción, el panel de Firebase (Firestore y Authentication), el
repositorio, el reporte de Lighthouse y una ventana de incógnito.

1. **Introducción (1 min).** Nombre, objetivo ("una tienda de servicios de desarrollo con catálogo en
   Firebase y panel de administración") y a quién sirve.
2. **Visitante (3–4 min).** Inicio → Servicios → escribir en el buscador → cambiar de página →
   detalle de un servicio → agregar 2 unidades (aviso) → carrito (total, quitar, vaciar) → finalizar
   compra. Cambiar el tamaño de la ventana (1 / 2 / 3 columnas), el tema y el idioma.
3. **Administrador (2–3 min).** Iniciar sesión con la cuenta demo → "Gestión" → crear un servicio
   (mostrar un error de validación primero) → editarlo → eliminarlo (modal de confirmación) →
   mostrar el cambio en el catálogo público.
4. **Aspectos técnicos (1–2 min).** React + Firebase + Context API + React Router; las reglas de
   Firestore como seguridad real (el candado de rutas es comodidad); TDD y el pipeline; el desafío
   más interesante que resolviste (por ejemplo: por qué `servicesApi` es la única frontera con los
   datos, cómo se resuelve el rol de administrador antes de dejar de cargar, o por qué las páginas
   privadas se cargan bajo demanda).
5. **Cierre (1 min).** Qué aprendiste y qué mejorarías (pagos reales, historial de pedidos,
   imágenes subidas con un backend).

Plan B si falla la red: capturas de pantalla de cada paso en `docs/presentacion/`.
