# Taller Gregoriana — conexión a Supabase

## Corrección incluida
`wrangler.jsonc` incluye SUPABASE_URL=https://vhlwxvzieitgcwxmngua.supabase.co.
El Worker necesita SUPABASE_URL y SUPABASE_ANON_KEY en tiempo de ejecución. Las variables VITE_ de compilación no configuran el Worker.
La pantalla actualiza el indicador de nube después de guardar. /api/health comprueba una consulta de lectura real y devuelve los errores de configuración, red o base de datos.

## Activar en Cloudflare Workers
1. Sustituye el proyecto por estos archivos y vuelve a desplegar con tu flujo habitual (build: npm run build; deploy: npx wrangler deploy).
2. Conserva SUPABASE_ANON_KEY en Settings → Runtime variables and secrets → Production. Debe ser la clave anon o publishable del mismo proyecto Supabase. Nunca uses service_role ni sb_secret_: esta aplicación comparte la clave pública con el navegador.
3. Si configuras todo desde el panel, añade también una variable de texto SUPABASE_URL con https://vhlwxvzieitgcwxmngua.supabase.co y aplica/despliega el cambio.
4. Abre https://TU-PAGINA/api/health. Debe mostrar ok:true y productosReadable:true. Esto verifica lectura; comprueba escritura guardando un producto y recargando la página.
5. Si responde 401, comprueba la clave y que pertenece a ese proyecto. Si indica que no existe productos, revisa el esquema. Si devuelve 42501, revisa GRANT y las políticas RLS de esa tabla antes de cambiarlas.

## Base de datos
Los archivos SQL originales se conservan como referencia, sin aplicarlos. Sus políticas permiten acceso anónimo de lectura y escritura a todos los registros. No los ejecutes como solución genérica de permisos en una base existente: hay que comprobar el acceso deseado del taller primero.
Documentación: https://supabase.com/docs/guides/api/securing-your-api

## Desarrollo local
Crea .dev.vars con SUPABASE_URL y SUPABASE_ANON_KEY; no publiques ese archivo. Ejecuta npm ci y npm run cf:dev. npm run dev solo inicia Vite y no proporciona /api/productos.

## Validación realizada
node test-worker.mjs: configuración ausente, consulta de diagnóstico, guardado y lectura simulados, errores de permisos, error de red y clave publishable.
No se verificó la base real ni se desplegaron cambios: falta acceso al proyecto y la URL de la página publicada.

## Corrección de eliminación
El botón Eliminar ahora envía DELETE /api/productos?id=ID. El Worker elimina exclusivamente ese ID en Supabase y comprueba que la base devuelva la fila eliminada. La interfaz y el respaldo local se actualizan después de la confirmación. Los errores de permisos se muestran sin ocultar el producto.

Para aplicar esta corrección, actualiza worker.js y src/App.jsx juntos (o sustituye el proyecto completo) y vuelve a compilar/desplegar. Las variables de Supabase se mantienen. No requiere ejecutar SQL.
Prueba tras desplegar: crea un producto de prueba, elimínalo y comprueba su ausencia en Table Editor → productos y después de recargar la página. Las pruebas automatizadas usan Supabase simulado; el borrado real aún debe verificarse en tu despliegue.

## Enlace de catálogo para clientes
En Productos aparece «Compartir productos con clientes», con «Copiar enlace» y «Ver catálogo».
La dirección es https://taller-gregoria-cotizador.vjzuniromero89.workers.dev/catalogo y estará disponible después de desplegar esta versión.
Muestra foto, código, nombre, volumen, peso y precio de venta. No incluye formularios de edición, borrado, cotizaciones ni costos internos en esa vista. Tiene buscador, estado vacío y opción de reintentar si falla la conexión.
El catálogo carga los productos actuales de Supabase al abrirlo; el enlace no cambia cuando agregas productos. No necesita cambios SQL.
Actualiza src/App.jsx y worker.js juntos, compila y despliega. Se conservan las correcciones anteriores de guardado y borrado y la URL de Supabase.
La ruta /catalogo es una vista pública de solo lectura; no añade autenticación a la aplicación administrativa existente.
Validación: compilación de producción con Vite correcta y pruebas de API simuladas para paginación, exclusión de costos y errores. Pendiente de publicar y comprobar en el dominio real.
