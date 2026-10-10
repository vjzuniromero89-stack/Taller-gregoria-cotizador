/* Hoja de cotización dibujada como imagen. La usan la app y el catálogo de clientes. */
export const KG_POR_CBM = 350;

// Tiempos que se le informan al cliente en cada cotización.
export const DIAS_PRODUCCION = 20;
export const DIAS_ENVIO = 60;
export const TIEMPOS_ENTREGA = [
  ["Tiempo de producción", `${DIAS_PRODUCCION} días`],
  ["Tiempo de envío", `${DIAS_ENVIO} días`],
  ["Entrega aproximada", `${DIAS_PRODUCCION + DIAS_ENVIO} días`],
];

export const fecha = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" }) + ", " +
    d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
};

export const PIE_TEXTO = (interno) =>
  `Precios en dólares estadounidenses. Esta cotización es válida por 15 días a partir de la fecha de emisión. ` +
  `Los volúmenes de envío se cobran por el CBM mayor entre volumen y peso (${KG_POR_CBM} kg por m³). ` +
  (interno ? "Documento de uso interno: no compartir con el cliente." : "Gracias por su preferencia.");

function cargarImg(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function envolver(ctx, texto, ancho) {
  const palabras = String(texto).split(/\s+/);
  const lineas = [];
  let linea = "";
  palabras.forEach((w) => {
    const prueba = linea ? `${linea} ${w}` : w;
    if (ctx.measureText(prueba).width > ancho && linea) { lineas.push(linea); linea = w; }
    else linea = prueba;
  });
  if (linea) lineas.push(linea);
  return lineas;
}

export async function hojaImagen(d) {
  const { empresa, cot, columnas, filas, totales, total, totalLabel, interno } = d;
  const W = 1240, M = 64, F = "Helvetica, Arial, sans-serif";
  const ALTO_FILA = 78, ANCHO_NUM = 120, ANCHO_FOTO = 96;
  const numericas = columnas.length - 2;
  const xFoto = M, xProd = M + ANCHO_FOTO + 16;
  const anchoProd = W - M * 2 - ANCHO_FOTO - 16 - ANCHO_NUM * numericas;
  const xNum = (i) => W - M - ANCHO_NUM * (numericas - i);

  const logo = await cargarImg(empresa.logo);
  const fotos = await Promise.all(filas.map((f) => cargarImg(f.foto)));

  const c = document.createElement("canvas");
  const ctx0 = c.getContext("2d");
  ctx0.font = `13px ${F}`;
  const lineasPie = envolver(ctx0, d.pie || PIE_TEXTO(interno), W - M * 2);

  const altoLogo = logo ? Math.min(90, (logo.height / logo.width) * 260) : 0;
  const yTabla = M + altoLogo + (logo ? 14 : 0) + 130;
  const altoTotales = 34 * totales.length + 78;
  const H = yTabla + 46 + ALTO_FILA * filas.length + 28 + altoTotales + 50 + lineasPie.length * 20 + M;

  c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = "alphabetic";

  const yTop = M;
  let y = M;
  if (logo) {
    const anchoLogo = (logo.width / logo.height) * altoLogo;
    ctx.drawImage(logo, M, y, Math.min(anchoLogo, 260), altoLogo);
    y += altoLogo + 14;
  }
  ctx.fillStyle = "#14222B"; ctx.font = `bold 30px ${F}`; ctx.textAlign = "left";
  ctx.fillText(empresa.nombre || "Cotización", M, y + 24);
  let yIzq = y + 24;
  if (empresa.contacto) {
    ctx.fillStyle = "#5B6B75"; ctx.font = `15px ${F}`;
    String(empresa.contacto).split("\n").forEach((l, i) => ctx.fillText(l, M, yIzq + 26 + i * 20));
    yIzq += 26 + String(empresa.contacto).split("\n").length * 20;
  }

  ctx.textAlign = "right";
  ctx.fillStyle = "#14222B"; ctx.font = `bold 32px ${F}`;
  ctx.fillText("COTIZACIÓN", W - M, yTop + 30);
  ctx.font = `bold 22px ${F}`;
  ctx.fillText(cot.numero, W - M, yTop + 60);
  ctx.fillStyle = "#5B6B75"; ctx.font = `15px ${F}`;
  ctx.fillText(fecha(cot.fecha), W - M, yTop + 84);
  if (interno) {
    ctx.fillStyle = "#A3321F"; ctx.fillRect(W - M - 140, yTop + 96, 140, 26);
    ctx.fillStyle = "#fff"; ctx.font = `bold 13px ${F}`; ctx.textAlign = "center";
    ctx.fillText("USO INTERNO", W - M - 70, yTop + 114);
    ctx.textAlign = "right";
  }

  const yLinea = Math.max(yIzq + 16, yTop + (interno ? 136 : 104));
  ctx.fillStyle = "#14222B"; ctx.fillRect(M, yLinea, W - M * 2, 4);

  ctx.textAlign = "left";
  ctx.fillStyle = "#5B6B75"; ctx.font = `13px ${F}`;
  ctx.fillText("CLIENTE", M, yLinea + 30);
  ctx.fillStyle = "#14222B"; ctx.font = `bold 20px ${F}`;
  ctx.fillText(cot.cliente || "Sin cliente", M, yLinea + 56);

  let yT = yLinea + 84;
  ctx.fillStyle = "#14222B"; ctx.fillRect(M, yT, W - M * 2, 38);
  ctx.fillStyle = "#FFFFFF"; ctx.font = `bold 13px ${F}`;
  ctx.fillText(columnas[0].t.toUpperCase(), xFoto + 10, yT + 25);
  ctx.fillText(columnas[1].t.toUpperCase(), xProd, yT + 25);
  ctx.textAlign = "right";
  for (let i = 0; i < numericas; i++) ctx.fillText(columnas[i + 2].t.toUpperCase(), xNum(i) + ANCHO_NUM - 10, yT + 25);

  let yF = yT + 38;
  filas.forEach((f, idx) => {
    if (idx % 2 === 1) { ctx.fillStyle = "#F6F8F9"; ctx.fillRect(M, yF, W - M * 2, ALTO_FILA); }
    const img = fotos[idx];
    if (img) {
      const lado = 58, ix = xFoto + 10, iy = yF + (ALTO_FILA - lado) / 2;
      const escala = Math.max(lado / img.width, lado / img.height);
      const sw = lado / escala, sh = lado / escala;
      ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, ix, iy, lado, lado);
      ctx.strokeStyle = "#E1E7EA"; ctx.lineWidth = 1; ctx.strokeRect(ix + .5, iy + .5, lado, lado);
    }
    ctx.textAlign = "left";
    ctx.fillStyle = "#14222B"; ctx.font = `bold 17px ${F}`;
    const nombre = envolver(ctx, f.nombre, anchoProd - 12)[0] || "";
    ctx.fillText(nombre, xProd, yF + 34);
    ctx.fillStyle = "#5B6B75"; ctx.font = `13px ${F}`;
    ctx.fillText(f.sub, xProd, yF + 55);
    ctx.textAlign = "right";
    f.valores.forEach((v, i) => {
      const col = columnas[i + 2];
      ctx.fillStyle = "#14222B";
      ctx.font = `${col.fuerte ? "bold " : ""}16px ${F}`;
      ctx.fillText(v, xNum(i) + ANCHO_NUM - 10, yF + 45);
    });
    ctx.strokeStyle = "#E1E7EA"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(M, yF + ALTO_FILA + .5); ctx.lineTo(W - M, yF + ALTO_FILA + .5); ctx.stroke();
    yF += ALTO_FILA;
  });

  const anchoCaja = 430, xCaja = W - M - anchoCaja;
  let yC = yF + 28;
  totales.forEach(([k, v], i) => {
    if (i > 0) {
      ctx.strokeStyle = "#E1E7EA";
      ctx.beginPath(); ctx.moveTo(xCaja, yC + .5); ctx.lineTo(W - M, yC + .5); ctx.stroke();
    }
    ctx.textAlign = "left"; ctx.fillStyle = "#5B6B75"; ctx.font = `15px ${F}`;
    ctx.fillText(k, xCaja + 12, yC + 23);
    ctx.textAlign = "right"; ctx.fillStyle = "#14222B"; ctx.font = `bold 15px ${F}`;
    ctx.fillText(v, W - M - 12, yC + 23);
    yC += 34;
  });
  yC += 10;
  ctx.fillStyle = "#14222B"; ctx.fillRect(xCaja, yC, anchoCaja, 62);
  ctx.textAlign = "left"; ctx.fillStyle = "#AFC0C8"; ctx.font = `bold 14px ${F}`;
  ctx.fillText(totalLabel.toUpperCase(), xCaja + 16, yC + 38);
  ctx.textAlign = "right"; ctx.fillStyle = "#F2B705"; ctx.font = `bold 30px ${F}`;
  ctx.fillText(total, W - M - 16, yC + 42);

  let yP = yC + 62 + 40;
  ctx.strokeStyle = "#E1E7EA";
  ctx.beginPath(); ctx.moveTo(M, yP - 20.5); ctx.lineTo(W - M, yP - 20.5); ctx.stroke();
  ctx.textAlign = "left"; ctx.fillStyle = "#5B6B75"; ctx.font = `13px ${F}`;
  lineasPie.forEach((l, i) => ctx.fillText(l, M, yP + i * 20));

  return c;
}
