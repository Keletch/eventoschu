# 🎨 Guía de Temas Reales (Eventos HyenUk Chu)

Este documento refleja la arquitectura de estilos **actual** del proyecto definida en `app/globals.css`. El sistema es multi-tema y utiliza efectos visuales avanzados (grano, grids retro, blur).

---

## 🏗️ Arquitectura de Temas
El proyecto soporta tres estados visuales principales. Cada uno tiene una personalidad distinta:

### ☀️ 1. Tema Light (Blindado)
Es el tema corporativo estándar. Limpio y de alta luminosidad.
*   **Background:** `#FFFFFF` (Blanco puro)
*   **Primary:** `#3154DC` (Azul corporativo)
*   **Secondary:** `#007AFF` (Azul de acento)
*   **Muted:** `#F5F6F9` (Gris azulado muy suave para fondos de sección)

### 📚 2. Tema Dark ("Libro Viejo")
**No es un modo oscuro genérico.** Está diseñado para "relajación visual" imitando un libro antiguo o papiro.
*   **Background:** `#1A1614` (Café negro profundo)
*   **Foreground:** `#E6E2D3` (Amarillo Hueso / Papiro)
*   **Card:** `#241F1C` (Café intermedio)
*   **Primary/Secondary:** Usa el color Hueso (`#E6E2D3`) para destacar sobre el café.

### 🌃 3. Tema Synthwave ("Retro-futurismo")
Inspirado en la estética de los 80s (Neon/Cyberpunk).
*   **Background:** `#0d0221` (Espacio profundo)
*   **Primary:** `#bd00ff` (Púrpura Neón)
*   **Secondary:** `#01cdfe` (Cyan Neón)
*   **Accent:** `#ff71ce` (Rosa Neón)
*   **Efectos Especiales:** Activa una malla retro (`retro-grid`) y un overlay de ruido visual.

---

## 🛠️ Plantilla para Diseño (Nuevos Colores)

Si el equipo de diseño desea proponer un **nuevo tema** o ajustar los actuales, por favor rellenen estos tokens:

| Token CSS | Qué controla | Ejemplo de uso |
| :--- | :--- | :--- |
| `--background` | Fondo de la página | El lienzo principal. |
| `--foreground` | Color del texto | Títulos y párrafos. |
## 🎨 Guía para Diseñadoras: Cómo crear un nuevo tema

Para crear un tema que la IA entienda y aplique perfectamente, solo deben definir estos **10 Tokens Maestro**. No necesitan diseñar componentes individuales, el sistema propagará estos colores automáticamente.

### 1. Capa de Superficie (El Lienzo)
| Token | Descripción | Uso en la UI |
|---|---|---|
| `--background` | Fondo principal | El lienzo de toda la página. |
| `--card` | Fondo de tarjetas | Event Cards y Modales. Debe contrastar con el fondo. |
| `--surface` | Fondo de UI de apoyo | Sidebar y Footer (el "bloque sólido"). |

### 2. Capa de Acción (La Energía)
| Token | Descripción | Uso en la UI |
|---|---|---|
| `--primary` | Color de marca/acción | Botones principales, Badges, Mes Activo. |
| `--secondary` | Color de apoyo | Links, flechas de navegación, acentos. |
| `--ring` | Color de enfoque | Bordes de inputs activos y selección. |

### 3. Capa de Jerarquía (El Contraste)
| Token | Descripción | Uso en la UI |
|---|---|---|
| `--foreground` | Texto principal | Títulos y cuerpo de texto. |
| `--muted-foreground`| Texto secundario | "Por confirmar", leyendas, placeholders. |
| `--border` | Bordes sutiles | Líneas divisorias de tarjetas y inputs. |

---

## 🪄 Instrucciones para la IA (Prompt para Diseñadoras)

Cuando quieran crear un tema nuevo, pueden copiar este prompt para la IA:

> *"Basado en la estructura de `THEMES.md`, crea un nuevo tema llamado **[NOMBRE]**. Define los 10 tokens usando colores que evoquen una estética **[ESTILO: ej. Minimalista, Cyberpunk, Orgánico]**. Asegúrate de que el contraste entre `--background` y `--foreground` cumpla con WCAG AA para legibilidad."*

---

## 📝 Reglas de Oro
1. **Consistencia Clerk:** El sistema invertirá automáticamente los logos en temas oscuros.
2. **Radios:** Todo hereda `--radius: 0.625rem`. No definan radios nuevos.
3. **Glassmorphism:** Los modales ya tienen `backdrop-blur` de 8px por defecto.

> [!TIP]
> Si el tema es "Oscuro", asegúrense de que el `--surface` sea ligeramente más oscuro o más claro que el `--background` para generar profundidad sin usar sombras pesadas.
