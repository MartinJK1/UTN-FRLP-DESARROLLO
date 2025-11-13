# Sistema de Envío de Emails

Este directorio contiene toda la lógica relacionada con el envío de emails del sistema de verificación.

## Estructura de Archivos

```
src/services/email/
├── brevoService.ts          # Servicio principal de Brevo
└── README.md               # Este archivo
```

## Configuración Requerida

### Variables de Entorno

Agregar estas variables a tu archivo `.env`:

```env
# Configuración de Brevo (Email)
BREVO_API_KEY=tu-api-key-de-brevo
BREVO_SENDER_EMAIL=noreply@tudominio.com
BREVO_SENDER_NAME="Tu Lubricentro"
BACKEND_URL=http://localhost:3000
```

### Obtener API Key de Brevo

1. Ir a [Brevo](https://www.brevo.com/)
2. Crear cuenta o iniciar sesión
3. Ir a **SMTP & API** → **API Keys**
4. Crear nueva API key
5. Copiar la key y agregarla a `BREVO_API_KEY`

## Cómo Funciona

### Flujo de Verificación de Email

1. **Usuario se registra** → Se crea cuenta con `isVerified: false`
2. **Sistema genera token** → Token único de 64 caracteres
3. **Se envía email** → Con enlace de verificación
4. **Usuario hace clic** → Va al backend para verificar
5. **Backend procesa** → Marca cuenta como verificada
6. **Redirección** → Usuario va al frontend con resultado

### Estructura del Email

El email incluye:
- **Asunto**: "Verifica tu cuenta - Lubricentro"
- **Contenido HTML**: Template profesional con CSS inline
- **Contenido texto**: Versión de texto plano
- **Enlace**: `http://localhost:3000/api/auth/verify-email/{token}`

## Modificaciones Comunes

### 1. Cambiar el Diseño del Email

**Archivo**: `brevoService.ts`
**Método**: `getVerificationEmailTemplate()`

```typescript
private getVerificationEmailTemplate(data: VerificationEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        /* Modificar estilos aquí */
        .header { background-color: #tu-color; }
        .button { background-color: #tu-color-primario; }
      </style>
    </head>
    <body>
      <!-- Modificar contenido HTML aquí -->
      <h1>Tu mensaje personalizado</h1>
    </body>
    </html>
  `;
}
```

### 2. Cambiar el Asunto del Email

**Archivo**: `brevoService.ts`
**Método**: `sendVerificationEmail()`

```typescript
return await this.sendEmail({
  to: data.to,
  subject: 'Tu nuevo asunto personalizado', // ← Cambiar aquí
  htmlContent,
  textContent
});
```

### 3. Cambiar el Remitente

**Archivo**: `.env`

```env
BREVO_SENDER_EMAIL=contacto@tudominio.com
BREVO_SENDER_NAME="Tu Empresa"
```

### 4. Agregar Nuevos Tipos de Email

**Paso 1**: Crear nueva interfaz en `brevoService.ts`

```typescript
export interface WelcomeEmailData {
  to: string;
  name: string;
  loginLink: string;
}
```

**Paso 2**: Crear método de envío

```typescript
async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
  const htmlContent = this.getWelcomeEmailTemplate(data);
  
  return await this.sendEmail({
    to: data.to,
    subject: '¡Bienvenido a nuestro sistema!',
    htmlContent
  });
}
```

**Paso 3**: Crear template

```typescript
private getWelcomeEmailTemplate(data: WelcomeEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <body>
      <h1>¡Bienvenido ${data.name}!</h1>
      <p>Tu cuenta ha sido verificada exitosamente.</p>
      <a href="${data.loginLink}">Iniciar Sesión</a>
    </body>
    </html>
  `;
}
```

### 5. Cambiar la URL de Verificación

**Archivo**: `auth.service.ts`
**Líneas**: 98-99 y 180-181

```typescript
// Para registro
const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
const verificationLink = `${backendUrl}/api/auth/verify-email/${tokenData.token}`;

// Para reenvío
const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
const verificationLink = `${backendUrl}/api/auth/verify-email/${user.verificationToken}`;
```

### 6. Modificar Redirección Después de Verificación

**Archivo**: `auth.controller.ts`
**Método**: `verifyEmail()`

```typescript
if (result.success) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  // Cambiar la URL de redirección
  const redirectUrl = `${frontendUrl}/dashboard?verified=true`; // ← Cambiar aquí
  return res.redirect(redirectUrl);
}
```

## Logging y Debugging

### Ver Logs de Email

Los logs se muestran en la consola del backend:

```
[2024-10-12T14:30:45.123Z] [INFO] BrevoService inicializado correctamente | Data: {"senderEmail":"noreply@lubricentro.com","senderName":"Lubricentro"}
[2024-10-12T14:30:45.124Z] [INFO] Enviando email de verificación | Data: {"to":"user@example.com","name":"Usuario"}
[2024-10-12T14:30:45.125Z] [INFO] Email enviado exitosamente | Data: {"to":"user@example.com","subject":"Verifica tu cuenta - Lubricentro"}
```

### Errores Comunes

1. **"BREVO_API_KEY no está configurada"**
   - Verificar que la variable esté en `.env`
   - Reiniciar el servidor

2. **"Error enviando email"**
   - Verificar que la API key sea válida
   - Verificar que el email del remitente esté verificado en Brevo

3. **Email no llega**
   - Revisar carpeta de spam
   - Verificar logs del servidor
   - Verificar configuración de Brevo

## Testing

### Probar Envío de Email

1. **Registrar usuario de prueba**
2. **Revisar logs del servidor**
3. **Verificar que llegue el email**
4. **Probar el enlace de verificación**

### Email de Prueba

Para desarrollo, puedes usar:
- **Email**: `test@example.com`
- **Brevo**: Tiene modo sandbox para testing

## Producción

### Configuración en Render

Agregar estas variables en Render:

```
BREVO_API_KEY=tu-api-key-real
BREVO_SENDER_EMAIL=noreply@tudominio.com
BREVO_SENDER_NAME="Tu Lubricentro"
BACKEND_URL=https://tu-backend.onrender.com
```

### Verificación de Dominio

En producción, asegúrate de:
1. **Verificar el dominio** en Brevo
2. **Configurar SPF/DKIM** para mejor deliverability
3. **Usar HTTPS** en todas las URLs

## Seguridad

### Buenas Prácticas

1. **Nunca hardcodear** API keys en el código
2. **Usar variables de entorno** para configuración
3. **Validar tokens** antes de procesar
4. **Limitar reenvíos** de email
5. **Logs sin información sensible**

### Rate Limiting

El sistema incluye protección contra spam:
- Máximo 3 reenvíos por hora por usuario
- Tokens expiran en 24 horas
- Validación de formato de token

## Soporte

Si tienes problemas:

1. **Revisar logs** del servidor
2. **Verificar configuración** de variables de entorno
3. **Probar con email simple** primero
4. **Consultar documentación** de Brevo

