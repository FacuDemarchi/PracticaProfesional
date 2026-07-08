# Guía de Adaptación a Nuevas Organizaciones

## Flujo de Trabajo para Adaptar el Sistema

### Paso 1: Evaluación de Versiones Existentes

1. **Listar todas las versiones de organización disponibles**:
   ```bash
   git branch -a | grep org/
   ```

2. **Para cada versión disponible**:
   - Cambia a la rama: `git checkout org/[nombre-organizacion]
   - Lee el documento `ORGANIZATION_VERSION.md` en la raíz del proyecto
   - Analiza las características y requisitos de esa versión

3. **Comparar con la nueva organización**:
   - Identifica similitudes y diferencias
   - Evalúa si alguna versión existente se adapta o puede ser punto de partida

### Paso 2: Crear Nueva Versión (si es necesario)

#### Opción A: Basada en una versión existente

1. **Cambiar a la rama base más adecuada**:
   ```bash
   git checkout org/[rama-base-elegida]
   ```

2. **Crear nueva rama**:
   ```bash
   git checkout -b org/[nombre-corto-nueva-organizacion]
   ```

3. **Actualizar el documento de versión**:
   - Copia la plantilla: `cp .github/ORGANIZATION_VERSION_TEMPLATE.md ORGANIZATION_VERSION.md`
   - Llena todos los campos con la información de la nueva organización

#### Opción B: Basada en la rama principal (main)

1. **Asegurarse de estar en main**:
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Crear nueva rama**:
   ```bash
   git checkout -b org/[nombre-corto-nueva-organizacion]
   ```

3. **Crear documento de versión**:
   - Copia la plantilla: `cp .github/ORGANIZATION_VERSION_TEMPLATE.md ORGANIZATION_VERSION.md`
   - Llena todos los campos con la información de la nueva organización

### Paso 3: Realizar Modificaciones

1. **Actualizar Análisis**:
   - Modifica archivos en `/analisis/` según las necesidades de la organización

2. **Actualizar Diseño**:
   - Modifica archivos en `/diseño/` incluyendo `schema.sql` si es necesario

3. **Actualizar Desarrollo**:
   - Backend: `/develop/backend/`
   - Frontend: `/develop/frontend/`

4. **Mantener actualizado `ORGANIZATION_VERSION.md`**:
   - Registra todas las modificaciones realizadas
   - Documenta decisiones importantes

### Paso 4: Finalizar y Publicar

1. **Commitear cambios**:
   ```bash
   git add .
   git commit -m "Adaptar sistema para [Nombre de la Organización]"
   ```

2. **Subir rama a GitHub**:
   ```bash
   git push -u origin org/[nombre-corto-organizacion]
   ```

## Uso de IA para Ayudar en la Adaptación

### Prompt para Analizar Versiones Existentes

```
Analiza el documento ORGANIZATION_VERSION.md de la rama [rama-a-analizar].
Proporciona:
1. Un resumen de las características clave
2. Los requisitos funcionales principales
3. Las modificaciones técnicas relevantes
4. Una evaluación de si esta versión podría adaptarse a una nueva organización con las siguientes necesidades:
   [Describe las necesidades de la nueva organización]
```

### Prompt para Crear Nueva Versión

```
Ayúdame a adaptar el sistema desde la rama [rama-base] a una nueva organización con las siguientes características:
[Describe la organización y sus necesidades]

Proporciona:
1. Análisis de qué elementos se deben modificar en /analisis/
2. Cambios necesarios en el diseño (/diseño/)
3. Modificaciones requeridas en el desarrollo (backend y frontend)
4. Un borrador del documento ORGANIZATION_VERSION.md para esta nueva versión
```

## Estructura de Ramas

- `main`: Rama principal con la versión genérica/base del sistema
- `org/[nombre-organizacion]`: Rama específica para una organización
- `feature/[nombre-feature]`: Ramas de desarrollo de funcionalidades (opcional)

## Mejores Prácticas

1. **Mantén `main` actualizada**: Incorpora mejoras generales que beneficien a todas las organizaciones
2. **Documenta todo**: Cada cambio debe estar reflejado en `ORGANIZATION_VERSION.md`
3. **Nombramiento claro**: Usa nombres descriptivos para las ramas (ej: `org/centro-comunitario-la-florida`)
4. **Backups regulares**: Realiza commits frecuentes mientras adaptas el sistema