/* La ficha de un producto (marca, empaque, características, ficha técnica, lo que incluye)
   se guarda como texto ordenado dentro de la columna "descripcion", sin columnas nuevas. */

const SECCIONES = [
  ["caracteristicas", "Características"],
  ["ficha", "Ficha técnica"],
  ["incluye", "Incluye"],
  ["opcionales", "Accesorios opcionales"],
];

const limpiar = (v) => String(v ?? "").replace(/\r/g, "").trim();
const lineas = (v) => limpiar(v).split("\n").map((l) => l.replace(/^\s*[-•·*]\s*/, "").trim()).filter(Boolean);
const sinAcentos = (v) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export const FICHA_VACIA = { marca: "", empaque: "", resumen: "", caracteristicas: "", ficha: "", incluye: "", opcionales: "" };

/** Une los campos del formulario en el texto que se guarda. */
export function armarDescripcion(f) {
  const partes = [];
  const cabecera = [];
  if (limpiar(f.marca)) cabecera.push(`Marca: ${limpiar(f.marca)}`);
  if (limpiar(f.empaque)) cabecera.push(`Empaque: ${limpiar(f.empaque)}`);
  if (cabecera.length) partes.push(cabecera.join("\n"));
  if (limpiar(f.resumen)) partes.push(limpiar(f.resumen));
  for (const [clave, titulo] of SECCIONES) {
    const items = lineas(f[clave]);
    if (items.length) partes.push(`${titulo}:\n${items.map((i) => (clave === "ficha" ? i : `- ${i}`)).join("\n")}`);
  }
  return partes.join("\n\n");
}

/** Separa el texto guardado en los campos del formulario (texto) y en listas para mostrar. */
export function leerDescripcion(texto) {
  const campos = { ...FICHA_VACIA };
  const resumen = [];
  let seccion = null;
  for (const cruda of limpiar(texto).split("\n")) {
    const l = cruda.trim();
    const titulo = SECCIONES.find(([, t]) => sinAcentos(l.replace(/:$/, "")) === sinAcentos(t) && l.endsWith(":"));
    if (titulo) { seccion = titulo[0]; continue; }
    if (seccion) { if (l) campos[seccion] += (campos[seccion] ? "\n" : "") + l.replace(/^\s*[-•·*]\s*/, ""); continue; }
    const marca = l.match(/^marca\s*:\s*(.+)$/i);
    const empaque = l.match(/^(?:empaque|medidas de empaque)\s*:\s*(.+)$/i);
    if (marca && !campos.marca) { campos.marca = marca[1].trim(); continue; }
    if (empaque && !campos.empaque) { campos.empaque = empaque[1].trim(); continue; }
    resumen.push(l);
  }
  campos.resumen = resumen.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return {
    campos,
    marca: campos.marca,
    empaque: campos.empaque,
    resumen: campos.resumen,
    caracteristicas: lineas(campos.caracteristicas),
    ficha: lineas(campos.ficha).map((l) => {
      const i = l.indexOf(":");
      return i > 0 ? [l.slice(0, i).trim(), l.slice(i + 1).trim()] : [l, ""];
    }),
    incluye: lineas(campos.incluye),
    opcionales: lineas(campos.opcionales),
  };
}

/** Suma el volumen (m³) de todas las medidas "largo × ancho × alto" que haya en el texto. */
export function cbmDeMedidas(texto) {
  const n = "(\\d+(?:[.,]\\d+)?)";
  const re = new RegExp(`${n}\\s*[x×*]\\s*${n}\\s*[x×*]\\s*${n}\\s*(mm|cm|m)?(?![a-z])`, "gi");
  let total = 0, m;
  while ((m = re.exec(String(texto || "")))) {
    const v = [m[1], m[2], m[3]].map((x) => parseFloat(x.replace(",", ".")));
    const unidad = (m[4] || (Math.max(...v) >= 300 ? "mm" : "cm")).toLowerCase();
    const k = unidad === "mm" ? 0.001 : unidad === "cm" ? 0.01 : 1;
    total += v[0] * k * v[1] * k * v[2] * k;
  }
  return Math.round(total * 1000) / 1000;
}
