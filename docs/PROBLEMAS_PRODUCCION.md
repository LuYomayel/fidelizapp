# Problemas Comunes en Producción - FidelizApp

## 🚨 Error CORS (Cross-Origin Resource Sharing)

### Problema

```
Access to fetch at 'https://api-fidelizapp.luciano-yomayel.com/api/business/profile/logo'
from origin 'https://fidelizapp.luciano-yomayel.com' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### Causa

El backend no está configurado para permitir peticiones desde el dominio del frontend.

### Solución

#### Express.js

```javascript
const cors = require("cors");

app.use(
  cors({
    origin: [
      "https://fidelizapp.luciano-yomayel.com",
      "http://localhost:3000", // para desarrollo
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
```

#### NestJS

```typescript
// main.ts
app.enableCors({
  origin: ["https://fidelizapp.luciano-yomayel.com", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
```

#### Nginx (si usas proxy)

```nginx
location /api/ {
    proxy_pass http://backend:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;

    # CORS headers
    add_header 'Access-Control-Allow-Origin' 'https://fidelizapp.luciano-yomayel.com' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;

    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'https://fidelizapp.luciano-yomayel.com' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Content-Type' 'text/plain charset=UTF-8';
        add_header 'Content-Length' 0;
        return 204;
    }
}
```

## 📁 Error 413 (Request Entity Too Large)

### Problema

```
PUT https://api-fidelizapp.luciano-yomayel.com/api/business/profile/logo
net::ERR_FAILED 413 (Request Entity Too Large)
```

### Causa

El archivo que se está subiendo excede el límite de tamaño configurado en el servidor.

### Solución

#### Express.js

```javascript
// Aumentar límite de tamaño para JSON y URL encoded
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Si usas multer para archivos
const multer = require("multer");
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
```

#### NestJS

```typescript
// main.ts
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// En el controlador
@UseInterceptors(FileInterceptor('logo', {
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
}))
```

#### Nginx

```nginx
# Aumentar límite de tamaño de cliente
client_max_body_size 10M;
```

## 🔧 Mejoras Implementadas en el Frontend

### Validación de Archivos Mejorada

```typescript
const handleFileChangeLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];

  if (file) {
    // Validar tipo de archivo
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev: any) => ({
        ...prev,
        logo: "El archivo debe ser una imagen (JPG, PNG, GIF, WebP)",
      }));
      return;
    }

    // Validar tamaño (max 2MB para evitar problemas en producción)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      setErrors((prev: any) => ({
        ...prev,
        logo: `El archivo no debe superar los 2MB (actual: ${(
          file.size /
          1024 /
          1024
        ).toFixed(2)}MB)`,
      }));
      return;
    }

    // Validar dimensiones mínimas
    const img = new Image();
    img.onload = () => {
      if (img.width < 100 || img.height < 100) {
        setErrors((prev: any) => ({
          ...prev,
          logo: "La imagen debe tener al menos 100x100 píxeles",
        }));
        return;
      }

      // Si pasa todas las validaciones, guardar el archivo
      setLogoFile(file);
      // ... resto del código
    };

    img.src = URL.createObjectURL(file);
  }
};
```

### Límites Recomendados

- **Tamaño máximo**: 2MB (reducido de 5MB para evitar problemas)
- **Formatos soportados**: JPG, PNG, GIF, WebP
- **Dimensiones mínimas**: 100x100 píxeles
- **Dimensiones recomendadas**: 200x200 a 500x500 píxeles

## 🚀 Configuración de Producción Recomendada

### Variables de Entorno

```env
# Frontend (.env.production)
NEXT_PUBLIC_API_URL=https://api-fidelizapp.luciano-yomayel.com

# Backend (.env.production)
CORS_ORIGIN=https://fidelizapp.luciano-yomayel.com
MAX_FILE_SIZE=5242880
UPLOAD_PATH=/uploads
```

### Configuración de Servidor

#### Docker Compose

```yaml
version: "3.8"
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - CORS_ORIGIN=https://fidelizapp.luciano-yomayel.com
      - MAX_FILE_SIZE=5242880
    volumes:
      - ./uploads:/app/uploads

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
```

#### Nginx Configuration

```nginx
events {
    worker_connections 1024;
}

http {
    client_max_body_size 10M;

    upstream frontend {
        server frontend:3000;
    }

    upstream backend {
        server backend:4000;
    }

    server {
        listen 80;
        server_name fidelizapp.luciano-yomayel.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl;
        server_name fidelizapp.luciano-yomayel.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;

            # CORS headers
            add_header 'Access-Control-Allow-Origin' 'https://fidelizapp.luciano-yomayel.com' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;

            if ($request_method = 'OPTIONS') {
                add_header 'Access-Control-Allow-Origin' 'https://fidelizapp.luciano-yomayel.com' always;
                add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
                add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
                add_header 'Access-Control-Allow-Credentials' 'true' always;
                add_header 'Content-Type' 'text/plain charset=UTF-8';
                add_header 'Content-Length' 0;
                return 204;
            }
        }

        location /uploads/ {
            proxy_pass http://backend;
        }
    }
}
```

## 🔍 Debugging

### Verificar CORS

```bash
# En el navegador, abrir DevTools y ejecutar:
fetch('https://api-fidelizapp.luciano-yomayel.com/api/business/profile', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
}).then(response => response.json()).then(console.log);
```

### Verificar Límites de Archivo

```bash
# Crear archivo de prueba
dd if=/dev/zero of=test.jpg bs=1M count=3

# Intentar subir el archivo y verificar logs del servidor
```

### Logs Útiles

```bash
# Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Backend logs
docker logs -f backend

# Frontend logs
docker logs -f frontend
```

## 📋 Checklist de Producción

- [ ] CORS configurado correctamente
- [ ] Límites de archivo aumentados
- [ ] SSL/HTTPS configurado
- [ ] Variables de entorno correctas
- [ ] Logs configurados
- [ ] Monitoreo implementado
- [ ] Backup de archivos configurado
- [ ] Rate limiting implementado
- [ ] Compresión habilitada
- [ ] Cache configurado

## 🆘 Contacto

Si sigues teniendo problemas después de implementar estas soluciones:

1. Verifica los logs del servidor
2. Comprueba la configuración de red
3. Valida las variables de entorno
4. Prueba con un archivo más pequeño
5. Verifica que el dominio esté correctamente configurado
