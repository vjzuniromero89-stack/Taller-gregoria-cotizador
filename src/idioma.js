/* Idioma de lo que ve el cliente (catálogo, su cotización y su cuenta): español o inglés.
   La parte interna siempre está en español. El idioma se elige con el botón ES / EN,
   o abriendo el enlace con ?idioma=en, y se recuerda en ese navegador. */

const CLAVE = "taller-gregoriana-idioma";
const RUTAS_CLIENTE = /^\/(catalogo|catalogo-cliente|cotizacion\/.+|cliente\/.+)\/?$/;

function leer() {
  if (typeof window === "undefined") return "es";
  if (!RUTAS_CLIENTE.test(window.location.pathname)) return "es";
  const pedido = new URLSearchParams(window.location.search).get("idioma");
  try {
    if (pedido === "en" || pedido === "es") { window.localStorage.setItem(CLAVE, pedido); return pedido; }
    const guardado = window.localStorage.getItem(CLAVE);
    if (guardado === "en" || guardado === "es") return guardado;
  } catch { /* sin almacenamiento */ }
  return pedido === "en" ? "en" : "es";
}

export let IDIOMA = leer();
export let EN = IDIOMA === "en";

/** Solo para la vista previa dentro de la app: cambia el idioma sin recargar. Al salir de ella vuelve a español. */
export function fijarIdioma(nuevo) {
  IDIOMA = nuevo === "en" ? "en" : "es";
  EN = IDIOMA === "en";
}
if (typeof document !== "undefined") document.documentElement.lang = IDIOMA;

/** Cambia el idioma y vuelve a cargar la página en ese idioma (la cotización en curso se conserva). */
export function cambiarIdioma(nuevo) {
  try { window.localStorage.setItem(CLAVE, nuevo); } catch { /* sin almacenamiento */ }
  const u = new URL(window.location.href);
  u.searchParams.delete("idioma");
  window.history.replaceState(null, "", u.toString());
  window.location.reload();
}

const INGLES = {
  "Taller Mecánico y Lubricentro": "Auto Repair Shop and Lube Center",
  "tipo de cambio": "exchange rate",
  "Elige una categoría o busca directamente.": "Choose a category or search directly.",
  "Aquí ves el estado de tus pedidos y puedes cotizar más productos del catálogo.": "Here you can see the status of your orders and quote more products from the catalog.",
  "Hola,": "Hello,",
  "Secciones": "Sections",
  "Catálogo": "Catalog",
  "Categorías": "Categories",
  "Todos": "All",
  "Mis cotizaciones": "My quotes",
  "Buscar por modelo, nombre o categoría": "Search by model, name or category",
  "Buscar producto": "Search product",
  "Cargando productos…": "Loading products…",
  "{n} productos": "{n} products",
  "{a} de {b} productos": "{a} of {b} products",
  "producto": "product",
  "productos": "products",
  "Próximamente encontrarás nuestros productos aquí.": "You will find our products here soon.",
  "Ningún producto coincide con tu búsqueda.": "No product matches your search.",
  "Ver todos los productos": "View all products",
  "Precios en dólares.": "Prices in US dollars.",
  "Mi cotización": "My quote",
  "Ver y enviar": "View and send",

  "Ver ficha": "View details",
  "Oferta": "Sale",
  "Destacado": "Featured",
  "Ordenar": "Sort",
  "Destacados primero": "Featured first",
  "Precio: menor a mayor": "Price: low to high",
  "Precio: mayor a menor": "Price: high to low",
  "Precio": "Price",
  "Consultar": "Ask us",
  "Elige una opción": "Choose an option",
  "Consultar precio por WhatsApp": "Ask for the price on WhatsApp",
  "Hola, quiero consultar el precio de:": "Hello, I would like to ask for the price of:",
  "Opciones del producto": "Product options",
  "Peso": "Weight",
  "Medidas de empaque": "Packing size",
  "Enlace copiado": "Link copied",
  "Compartir este producto": "Share this product",
  "Cerrar ficha": "Close details",
  "Características": "Features",
  "Ficha técnica": "Specifications",
  "Incluye": "Includes",
  "Accesorios opcionales": "Optional accessories",

  "Agregar a mi cotización": "Add to my quote",
  "Quitar de mi cotización": "Remove from my quote",
  "Uno menos": "One less",
  "Uno más": "One more",
  "{n} en tu cotización": "{n} in your quote",
  "Cerrar mi cotización": "Close my quote",
  "Todavía no has agregado productos. Toca “Agregar a mi cotización” en los productos que te interesan.": "You have not added any products yet. Tap “Add to my quote” on the products you are interested in.",
  "c/u": "each",
  "Precio por consultar": "Price on request",
  " (sin los productos por consultar)": " (not including products on request)",
  "Tu nombre": "Your name",
  "Tu teléfono o WhatsApp": "Your phone or WhatsApp",
  "Ciudad o dirección de entrega (opcional)": "Delivery city or address (optional)",
  "Managua, barrio o dirección": "City, neighborhood or address",
  "Nota (opcional)": "Note (optional)",
  "Fecha en que lo necesitas, preguntas": "Date you need it, questions",
  "Escribe tu nombre.": "Enter your name.",
  "Escribe tu número de teléfono completo.": "Enter your full phone number.",
  "No pudimos registrar tu cotización. Revisa tu conexión e inténtalo de nuevo.": "We could not save your quote. Check your connection and try again.",
  "Vaciar": "Clear",
  "¿Tienes un cupón de descuento?": "Do you have a discount coupon?",
  "Código del cupón": "Coupon code",
  "Aplicar": "Apply",
  "Quitar": "Remove",
  "Revisando…": "Checking…",
  "Cupón {c} aplicado": "Coupon {c} applied",
  "Subtotal": "Subtotal",
  "Descuento": "Discount",
  "Ese cupón no existe.": "That coupon does not exist.",
  "Ese cupón ya venció.": "That coupon has expired.",
  "Ese cupón ya se usó todas las veces permitidas.": "That coupon has already been used the maximum number of times.",
  "Ese cupón pide una compra mínima de {m}.": "That coupon requires a minimum purchase of {m}.",
  "Ese cupón necesita productos con precio en tu cotización.": "That coupon needs products with a price in your quote.",
  "No pudimos revisar el cupón. Inténtalo de nuevo.": "We could not check the coupon. Try again.",
  "Creando tu cotización…": "Creating your quote…",
  "Crear mi cotización": "Create my quote",
  "Entrega aproximada": "Approximate delivery",
  "días": "days",
  "{a} de producción + {b} de envío": "{a} of production + {b} of shipping",
  "{a} días de producción + {b} de envío": "{a} days of production + {b} of shipping",
  "Verás tu cotización como imagen y podrás enviarla por WhatsApp.": "You will see your quote as an image and can send it by WhatsApp.",

  "Cotización": "Quote",
  "Tu cotización": "Your quote",
  "quedó registrada.": "has been saved.",
  "Preparando la imagen…": "Preparing the image…",
  "No se pudo dibujar la imagen, pero tu cotización sí quedó registrada.": "The image could not be drawn, but your quote was saved.",
  "Compartir o guardar la imagen": "Share or save the image",
  "Enviar por WhatsApp": "Send by WhatsApp",
  "Se abrirá WhatsApp con nuestro chat. Solo tienes que tocar “Enviar”.": "WhatsApp will open with our chat. Just tap “Send”.",
  "Sigue tu pedido aquí": "Track your order here",
  "En este enlace verás cuando tu cotización esté confirmada, en producción, en camino y entregada.": "This link shows when your quote is confirmed, in production, on the way and delivered.",
  "Listo": "Done",

  "Foto": "Photo",
  "Producto": "Product",
  "Cant.": "Qty",
  "Precio unitario": "Unit price",
  "Total": "Total",
  "Por consultar": "On request",
  "Productos": "Products",
  "Productos por consultar": "Products on request",
  "No incluidos en el total": "Not included in the total",
  "Precios en dólares estadounidenses.": "Prices in US dollars.",
  "COTIZACIÓN": "QUOTE",
  "CLIENTE": "CUSTOMER",
  "Sin cliente": "No customer",
  "Tiempo de producción": "Production time",
  "Tiempo de envío": "Shipping time",

  "Recibida": "Received",
  "Confirmada": "Confirmed",
  "En producción": "In production",
  "En camino": "On the way",
  "Entregada": "Delivered",
  "Cancelada": "Cancelled",
  "Pendiente de confirmar": "Pending confirmation",
  "Recibimos tu cotización. Aquí verás cuando esté confirmada.": "We received your quote. You will see here when it is confirmed.",
  "Tu pedido está confirmado.": "Your order is confirmed.",
  "Tu pedido se está fabricando.": "Your order is being manufactured.",
  "Tu pedido ya va en camino.": "Your order is on the way.",
  "Tu pedido fue entregado. Gracias por tu compra.": "Your order was delivered. Thank you for your purchase.",
  "Esta cotización fue cancelada.": "This quote was cancelled.",
  "Estado de tu pedido": "Order status",
  "Entrega estimada": "Estimated delivery",
  "a partir de la confirmación": "from confirmation",
  "Pagado": "Paid",
  "Saldo": "Balance",
  "Pagos recibidos": "Payments received",
  "Sin fecha": "No date",
  "Pago": "Payment",
  "Esta página se actualiza sola. Guarda el enlace para revisar tu pedido cuando quieras.": "This page updates by itself. Save the link to check your order any time.",
  "Esta página se actualiza sola.": "This page updates by itself.",
  "Cargando…": "Loading…",
  "Este enlace ya no existe.": "This link no longer exists.",
  "No pudimos cargar la información. Inténtalo de nuevo en un momento.": "We could not load the information. Try again in a moment.",
  "Ver el catálogo": "View the catalog",
  "Todavía no hay cotizaciones en este enlace.": "There are no quotes on this link yet.",
  "Todavía no tienes cotizaciones. Abre la pestaña Catálogo, agrega los productos que te interesan y envía tu cotización.": "You have no quotes yet. Open the Catalog tab, add the products you are interested in and send your quote.",
  "Tienes 1 cotización.": "You have 1 quote.",
  "Tienes {n} cotizaciones.": "You have {n} quotes.",
  "Ver pedido": "View order",
  "Sin categoría": "Uncategorized",
};

/** Texto en el idioma del cliente. La clave es el texto en español; {n} se reemplaza con `datos.n`. */
export function T(es, datos) {
  let texto = EN ? (INGLES[es] ?? es) : es;
  if (datos) for (const k of Object.keys(datos)) texto = texto.split(`{${k}}`).join(String(datos[k]));
  return texto;
}

export const CLAVES_TRADUCIDAS = Object.keys(INGLES);
