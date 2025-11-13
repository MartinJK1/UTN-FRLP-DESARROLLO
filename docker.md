# Guía Rápida de Docker

Como levantar la aplicación utilizando Docker para los entornos de desarrollo y producción.

## Estructura de Archivos

-   `docker-compose.yml`: Archivo base que contiene la configuración común para todos los entornos.
-   `docker-compose.dev.yml`: Define los servicios para el entorno de **desarrollo**. Utiliza volúmenes para permitir la recarga en caliente (hot-reloading) del código.
-   `docker-compose.prod.yml`: Define los servicios para el entorno de **producción**. Construye y ejecuta imágenes optimizadas y ligeras.
-   `./Frontend/Dockerfile`: Instrucciones para construir la imagen del frontend. Es multi-etapa, con una fase para desarrollo y otra para producción con Nginx.
-   `./backend/Dockerfile`: Instrucciones para construir la imagen del backend. También es multi-etapa, compilando el código TypeScript para producción.

## Comandos

Abre tu terminal en la raíz del proyecto y utiliza los siguientes comandos.

### Entorno de Desarrollo

**Para construir las imágenes y levantarlas por primera vez:**

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

**Si las imágenes ya están construidas y solo quieres levantarlas:**

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Entorno de Producción

**Para construir las imágenes y levantarlas por primera vez:**

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

**Si las imágenes ya están construidas y solo quieres levantarlas:**

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

### Ejecutar en segundo plano (Detached Mode)

Para cualquiera de los comandos `up`, puedes añadir el flag `-d` al final para que los contenedores se ejecuten en segundo plano y la terminal quede libre.

**Ejemplo:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```
