# Miquel Alomar — Personal Portfolio

Portfolio personal desarrollado desde cero con HTML, CSS y JavaScript vanilla.  
Diseñado como una experiencia interactiva con temática espacial basada en animaciones avanzadas con Canvas.

---

## Descripción

Este portfolio fue construido sin frameworks ni librerías externas con el objetivo de demostrar dominio técnico en frontend puro.

Incluye:

- Malla gravitatoria interactiva en tiempo real
- Campo de estrellas dinámico en Canvas
- Cursor personalizado con interpolación suave
- Animaciones controladas con requestAnimationFrame
- Scroll reveal con IntersectionObserver
- Efectos parallax y micro-interacciones

El propio portfolio actúa como demostración técnica.

---

## Stack Tecnológico

- HTML5
- CSS3
- JavaScript ES6+
- Canvas API
- IntersectionObserver
- requestAnimationFrame

Sin dependencias externas.

---

## Arquitectura Técnica

El archivo `script.js` está organizado por módulos funcionales:

### GravityMesh
- Genera una cuadrícula dinámica en Canvas
- Simula un efecto gravitatorio hacia el cursor
- Implementa fuerzas tipo muelle (spring) y damping
- Optimiza el renderizado según el viewport visible

### StarField
- Generación procedural de estrellas
- Efecto parallax basado en el cursor
- Animación continua con variación de brillo (twinkle)
- Reposicionamiento automático fuera de pantalla

### SpaceCursor
- Cursor personalizado con anillo interpolado
- Estados hover dinámicos
- Animación suavizada mediante interpolación progresiva

### ScrollReveal
- Animaciones activadas mediante IntersectionObserver
- Transiciones suaves con cubic-bezier

### Micro-interacciones adicionales
- Flip cards en proyectos
- Menú que se oculta al hacer scroll
- Estrellas fugaces aleatorias
- Parallax en hero section

---

## Principios Aplicados

- Separación de responsabilidades por clases
- Control manual del ciclo de renderizado
- Optimización de performance en Canvas
- Gestión eficiente de eventos
- Animaciones desacopladas y reutilizables
- Experiencia de usuario orientada al detalle

---
## Autor

Miquel Alomar Solorza  
Software Developer
