/* Catálogo XPROMISE (17 equipos), tomado del PDF "XPROMISE catalog with price".
   Precios en dólares, tal como aparecen en el catálogo del proveedor. */
import { armarDescripcion, cbmDeMedidas } from "./descripcion.js";

const FOTO = (n) => `/catalogo/xpromise/${n}.jpg`;

const INCLUYE_ALINEADORA = [
  "Gabinete × 1", "Columna × 1", "Viga de cámaras × 1", "Placa objetivo × 4",
  "Mordaza para rin de 11\" a 25\" × 4", "Computadora Dell con monitor × 1", "Teclado y ratón Dell × 1",
  "Pantalla LCD de 32\" × 1", "Plato giratorio × 2", "Cuña para rueda × 2",
  "Bloque de transición del plato giratorio × 2", "Fijador de volante × 1", "Fijador de pedal de freno × 1",
  "Cable de seguridad × 4",
];
const IDIOMAS = "Programa en más de 30 idiomas, incluido español de Latinoamérica";
const CONCRETO = "Requiere piso de concreto con resistencia mínima de 3000 PSI";

const EQUIPOS = [
  {
    codigo: "XP-A9", nombre: "Alineadora 3D de ruedas", categoria: "Alineadoras 3D", precio: 2950, foto: "xp-a9",
    resumen: "Sistema de alineación 3D de ruedas con gabinete, columna, viga de cámaras y computadora.",
    caracteristicas: [IDIOMAS, "Cuatro placas objetivo con mordazas para rines de 11\" a 25\"", "Computadora Dell y pantalla LCD de 32\" incluidas"],
    incluye: INCLUYE_ALINEADORA,
  },
  {
    codigo: "XP-A10", nombre: "Alineadora 3D de ruedas automática", categoria: "Alineadoras 3D", precio: 3400, foto: "xp-a10",
    resumen: "Sistema de alineación 3D de ruedas, versión automática, con gabinete, columna, viga de cámaras y computadora.",
    caracteristicas: ["Versión automática", IDIOMAS, "Cuatro placas objetivo con mordazas para rines de 11\" a 25\"", "Computadora Dell y pantalla LCD de 32\" incluidas"],
    incluye: INCLUYE_ALINEADORA,
  },
  {
    codigo: "X40C", nombre: "Elevador de dos postes 4,000 kg", categoria: "Elevadores", precio: 1450, foto: "x40c",
    empaque: "3850 × 540 × 800 mm",
    resumen: "Elevador de dos postes para automóviles, capacidad de 4,000 kg.",
    caracteristicas: [
      "Unidad de potencia marca BUCHER (Italia), motor con carcasa de aluminio y depósito de aceite de hierro",
      "Cilindros de fabricación propia, probados a presión uno por uno, con sellos PARKER (Estados Unidos)",
      "Lámina de acero de los postes de 5 mm de espesor",
      "Cable de acero de 10 mm de diámetro",
      "Brazos de tres extensiones, para chasis de distintos anchos",
      "Cuatro adaptadores para chasis de distintas alturas",
      CONCRETO,
    ],
    ficha: [
      ["Capacidad de elevación", "4000 kg"], ["Altura de elevación", "1900 mm"], ["Altura mínima", "100 mm"],
      ["Altura de la máquina", "3800 mm"], ["Ancho de la máquina", "3494 mm"], ["Tiempo de elevación", "50 s"],
      ["Motor", "380/220 V, 2.2 kW"],
    ],
  },
  {
    codigo: "X50C", nombre: "Elevador de dos postes 5,000 kg", categoria: "Elevadores", precio: 1980, foto: "x50c",
    empaque: "4020 × 540 × 950 mm",
    resumen: "Elevador de dos postes para automóviles y camionetas, capacidad de 5,000 kg.",
    caracteristicas: ["Anclaje con pernos de expansión M18 × 160", CONCRETO],
    ficha: [
      ["Capacidad de elevación", "5000 kg"], ["Altura de elevación", "1900 mm"], ["Altura mínima", "100 mm"],
      ["Altura de la máquina", "4000 mm"], ["Ancho de la máquina", "3486 mm"], ["Tiempo de elevación", "50 s"],
      ["Motor", "380/220 V"],
    ],
  },
  {
    codigo: "X8435", nombre: "Elevador de tijera empotrado en piso 3,500 kg", categoria: "Elevadores", precio: 1750, foto: "x8435",
    empaque: "1570 × 610 × 740 mm",
    resumen: "Elevador de tijera para instalar empotrado en el piso, con gabinete de control aparte.",
    caracteristicas: [
      "Cilindro de alta calidad", "Deslizadores de polímero", "Plataforma extensible", "Dispositivo de límite de altura",
      "Brazo de soporte de tubo cuadrado", "Sistema de control electrónico de 24 V", CONCRETO,
    ],
    ficha: [
      ["Capacidad de elevación", "3500 kg"], ["Altura de elevación", "2130 mm"], ["Altura mínima", "330 mm"],
      ["Largo de la plataforma", "1550 a 1740 mm"], ["Ancho de cada plataforma", "550 mm"], ["Tiempo de elevación", "50 s"],
      ["Motor", "380/220 V, 2.2 kW"],
    ],
  },
  {
    codigo: "X8530", nombre: "Elevador de tijera ultradelgado 3,000 kg", categoria: "Elevadores", precio: 2350, foto: "x8530",
    empaque: "2000 × 740 × 330 mm",
    resumen: "Elevador de tijera de perfil ultradelgado (110 mm cerrado), con gabinete de control aparte.",
    caracteristicas: [
      "Cuatro cilindros: gran fuerza y durabilidad",
      "Brazos de soporte de lámina de acero Q345 de alta resistencia",
      "Seguro mecánico de bloqueo automático, con desbloqueo neumático",
      "Segundo dispositivo de descenso, con luz intermitente y alarma sonora de seguridad",
      "Deslizadores de polímero de larga duración",
    ],
    ficha: [
      ["Capacidad de elevación", "3000 kg"], ["Altura de elevación", "1850 mm"], ["Altura mínima", "110 mm"],
      ["Largo de la plataforma", "1475 a 2000 mm"], ["Ancho de cada plataforma", "650 mm"], ["Tiempo de elevación", "50 s"],
      ["Motor", "380/220 V, 2.2 kW"],
    ],
  },
  {
    codigo: "X7640", nombre: "Elevador de cuatro postes 4,000 kg", categoria: "Elevadores", precio: 2160, foto: "x7640",
    empaque: "4370 × 560 × 790 mm",
    resumen: "Elevador de cuatro postes con gato rodante hidráulico, ideal para alineación.",
    caracteristicas: [
      "Plataformas de lámina antideslizante", "Gato rodante hidráulico", "Liberación neumática de los seguros",
      "Mangueras protegidas con resorte", "Ruedas guía con rodamiento", "Cilindros probados a presión",
      "Placas deslizantes con rodamientos mecánicos", "Cubierta móvil para platos giratorios",
      "Piso de concreto de 200 mm de espesor o más",
    ],
    ficha: [
      ["Capacidad de elevación", "4000 kg"], ["Altura de elevación principal", "1700 mm"], ["Altura de elevación del gato", "400 mm"],
      ["Altura mínima", "180 mm"], ["Largo de la plataforma", "4310 mm"], ["Ancho de la plataforma", "488 mm"],
      ["Tiempo de elevación", "50 s"], ["Voltaje del motor", "380/220 V"], ["Potencia del motor", "2.2 kW"],
    ],
  },
  {
    codigo: "XP-1527", nombre: "Elevador de un poste móvil 2,700 kg", categoria: "Elevadores", precio: 2300, foto: "xp-1527", peso: 850,
    resumen: "Elevador de un solo poste que se usa sobre el piso y se puede mover en cualquier momento.",
    caracteristicas: [
      "Superficie granallada y pintura electrostática en polvo para exteriores, vistosa y duradera",
      "Piezas hechas con dobladora CNC, corte láser y soldadura robotizada: medidas exactas y superficie lisa",
      "Válvulas hidráulicas alemanas; sellos de aceite y válvula de bola importados de Italia",
      "Se instala sobre el piso y se puede mover en cualquier momento",
      "Liberación manual",
      "Autobloqueo con cremalleras mecánica e hidráulica, seguro y confiable",
    ],
    ficha: [
      ["Capacidad de elevación", "2700 kg"], ["Altura de elevación", "1800 mm"], ["Altura mínima", "140 mm"],
      ["Ancho de paso", "620 mm"], ["Altura total", "2550 mm"], ["Ancho total", "1968 mm"], ["Tiempo de elevación", "50 s"],
      ["Motor", "380/220 V, 2.2 kW"], ["Presión de aceite nominal", "24 MPa"], ["Peso", "850 kg"],
    ],
  },
  {
    codigo: "XP-316B", nombre: "Desmontadora de llantas", categoria: "Desmontadoras de llantas", precio: 700, foto: "xp-316b", peso: 246,
    empaque: "1150 × 900 × 860 mm",
    resumen: "Desmontadora de llantas económica y práctica para automóviles.",
    caracteristicas: [
      "Modelo económico y práctico",
      "Pistón del cilindro grande de aluminio fundido de alta densidad, para mayor vida útil",
      "Mordazas de acero fundido de precisión, firmes y duraderas",
      "Adaptador para motocicleta opcional",
      "Caja interior reforzada que evita deformaciones durante el trabajo",
      "Mordazas con funda protectora para cuidar llantas y rines",
      "Destalonador universal, más cómodo de usar",
      "Pedales de hierro estampado, de larga duración (pedal de aluminio opcional)",
      "Rango de sujeción ajustable moviendo el deslizador",
    ],
    ficha: [
      ["Voltaje", "110/220/380 V"], ["Potencia", "0.75/1.1 kW"], ["Rotación del plato", "7 rpm"],
      ["Diámetro máximo de rueda", "1180 mm"], ["Ancho de llanta", "3\" a 14\""], ["Sujeción del rin por fuera", "12\" a 25\""],
      ["Sujeción del rin por dentro", "15\" a 28\""], ["Presión de trabajo", "8 a 10 bar"], ["Peso neto", "218 kg"], ["Peso bruto", "246 kg"],
    ],
  },
  {
    codigo: "XP-306DS", nombre: "Desmontadora de llantas con columna abatible y brazo auxiliar", categoria: "Desmontadoras de llantas", precio: 1250, foto: "xp-306ds", peso: 385,
    empaque: "970 × 770 × 1000 mm (máquina) + 1150 × 520 × 400 mm (brazo auxiliar)",
    resumen: "Desmontadora de llantas con columna abatible, brazo auxiliar e inflador con manómetro.",
    caracteristicas: [
      "Columna abatible de estructura aerodinámica",
      "Cuerpo de doble estructura de 58 kg, de diseño propio",
      "Cilindro grande de aleación de aluminio con 2000 kgf de fuerza para destalonar",
      "Barra hexagonal con funda nueva y deflexión ajustable",
      "Brazo auxiliar que presiona en todas direcciones y facilita montar y desmontar",
      "Pala destalonadora ajustable en 2 o 3 posiciones",
      "Rodillo de talón con control neumático para subir y bajar: sostiene y también presiona la llanta",
      "Rodamientos delanteros y traseros en el brazo deslizante, con poca fricción",
      "Inflador inteligente con manómetro, caja de herramientas y separador de agua y aceite ajustable",
    ],
    ficha: [
      ["Sujeción del rin por fuera", "11\" a 21\""], ["Sujeción del rin por dentro", "12\" a 24\""], ["Ancho máximo de llanta", "315 mm"],
      ["Diámetro máximo de rueda", "960 mm"], ["Presión de trabajo", "8 a 10 bar"], ["Fuerza de la pala destalonadora", "2000 kgf"],
      ["Peso bruto", "385 kg"], ["Alimentación", "220 V / 50 Hz / 1 fase / 1.1 kW, o 380 V / 50 Hz / 3 fases / 0.75 kW"],
    ],
  },
  {
    codigo: "XP-468", nombre: "Desmontadora de llantas para camión", categoria: "Desmontadoras de llantas", precio: 2350, foto: "xp-468", peso: 517,
    resumen: "Desmontadora semiautomática de llantas de camión, con mandril autocentrante universal.",
    caracteristicas: [
      "Semiautomática, con mandril autocentrante universal para rines de 14\" a 26\"",
      "Giro del mandril en ambos sentidos",
      "Bomba italiana opcional",
    ],
    ficha: [
      ["Diámetro de rin", "14\" a 26\""], ["Peso máximo de rueda", "500 kg"], ["Ancho máximo de rueda", "780 mm"],
      ["Diámetro máximo de llanta", "1600 mm"], ["Motor de la bomba hidráulica", "1.5 kW, 380 V, 3 fases"],
      ["Motor de la caja reductora", "2.2 kW, 380 V, 3 fases"], ["Fuerza del destalonador", "2500 kg"], ["Par máximo", "6457 N·m"],
      ["Voltaje de control", "24 V"], ["Peso", "517 kg"], ["Dimensiones generales", "2500 × 2000 mm"],
    ],
    opcionales: ["Anillos protectores para rines de aluminio", "Juego de protectores para rines de aluminio", "Rodillo para llantas sin cámara"],
  },
  {
    codigo: "XP-560C", nombre: "Balanceadora de ruedas", categoria: "Balanceadoras", precio: 600, foto: "xp-560c", peso: 129,
    empaque: "950 × 860 × 1050 mm",
    resumen: "Balanceadora de ruedas computarizada para automóviles y camionetas.",
    caracteristicas: [
      "Programas automáticos estático, dinámico y ALU",
      "Sensor avanzado y pantalla de alta precisión",
      "Estructura de caja reforzada para mediciones más exactas",
      "Sistema de diagnóstico de fallas que revisa los componentes importantes",
      "Cubierta protectora opcional",
    ],
    ficha: [
      ["Voltaje", "110/220 V"], ["Potencia", "0.25 kW"], ["Ciclo de balanceo", "8 s"], ["Velocidad de balanceo", "200 rpm"],
      ["Precisión", "±1 g"], ["Diámetro máximo de rueda", "1000 mm"], ["Diámetro de rin", "10\" a 28\""], ["Ancho de rin", "1.5\" a 18\""],
      ["Peso neto", "100 kg"], ["Peso bruto", "129 kg"],
    ],
  },
  {
    codigo: "XP-513D", nombre: "Balanceadora de ruedas para camión y automóvil", categoria: "Balanceadoras", precio: 1250, foto: "xp-513d", peso: 242,
    empaque: "1220 × 970 × 1250 mm",
    resumen: "Balanceadora para ruedas de camión y de automóvil, con elevador neumático de rueda.",
    caracteristicas: [
      "Eje de diseño especial, con mayor resistencia de soporte",
      "Balancea ruedas de camión y de automóvil",
      "Elevador neumático que facilita subir ruedas pesadas",
      "Freno de pedal de serie",
      "Autocalibración y autodiagnóstico",
      "Cubierta protectora opcional",
    ],
    ficha: [
      ["Voltaje", "220/380 V"], ["Potencia", "0.55 kW"], ["Ciclo de balanceo", "10 s"], ["Velocidad de balanceo", "180 rpm"],
      ["Precisión", "±10 g"], ["Diámetro máximo de rueda", "1200 mm"], ["Diámetro de rin", "10\" a 28\""], ["Ancho de rin", "3\" a 20\""],
      ["Peso neto", "217 kg"], ["Peso bruto", "242 kg"],
    ],
  },
  {
    codigo: "XP-601", nombre: "Banco enderezador de carrocería", categoria: "Carrocería", precio: 3450, foto: "xp-601",
    resumen: "Banco de enderezado de carrocería con dos torres de tiro y carro de herramientas de chapa.",
    caracteristicas: [
      "Plataforma formada de una pieza en CNC, con refuerzos entre las placas superior e inferior: gran resistencia, planitud y vida útil",
      "Dos torres que recorren la plataforma en 360°, con ruedas que las hacen estables y fáciles de mover",
      "Anillo guía que se mueve libre en la torre y mantiene la cadena recta durante el tiro, con más seguridad",
      "Sistema hidráulico de sellado y estabilidad superiores, con baja tasa de fallas",
      "Mordazas de altura ajustable que sujetan la carrocería con firmeza",
      "Accesorios de chapa de acero aleado al cromo-molibdeno con tratamiento térmico",
    ],
    ficha: [
      ["Largo", "5600 mm"], ["Ancho", "2200 mm"], ["Alto", "560 mm"], ["Aire requerido", "0.8 MPa"],
      ["Presión hidráulica", "70 MPa"], ["Capacidad de tiro", "100 kN"], ["Radio de tiro", "360°"], ["Carga máxima", "3500 kg"],
    ],
    incluye: ["Carro de herramientas de chapa"],
  },
  {
    codigo: "C9335A", nombre: "Torno de frenos para discos y tambores", categoria: "Tornos de frenos", precio: 1360, foto: "c9335a", peso: 260,
    cbm: 0.395,
    resumen: "Torno de frenos con dos velocidades de giro, para rectificar discos y tambores de distintos diámetros.",
    caracteristicas: [
      "Máquina multiusos", "Rendimiento estable", "Fácil de controlar", "Larga vida de la cuchilla",
      "Alta estabilidad y rigidez", "Bajo consumo de energía",
    ],
    ficha: [
      ["Diámetro de disco", "180 a 350 mm"], ["Diámetro de tambor", "180 a 350 mm"], ["Recorrido máximo", "100 mm"],
      ["Avance", "0.16 mm por vuelta"], ["Motor", "110/220/380 V, 50/60 Hz"], ["Potencia", "1.1 kW"],
      ["Velocidad del husillo", "75 y 130 rpm"], ["Peso total", "260 kg"], ["Dimensiones", "850 × 620 × 750 mm"],
    ],
    incluye: [
      "Caja de herramientas × 1", "Cortador doble × 1", "Portacortador doble × 1", "Tornillo de punta de corte × 2",
      "Punta de corte triangular × 2", "Llave de punta de corte × 1", "Cortador de mandrinar × 1", "Barra de mandrinar × 1",
      "Cono (51.5 × 71 mm) × 1", "Cono (67 × 87 mm) × 1", "Cono (84 × 110.2 mm) × 1", "Cono (100.5 × 126.5 mm) × 1",
      "Cono redondo × 4", "Buje escalonado × 2", "Buje × 2", "Manguito de presión × 2",
    ],
  },
  {
    codigo: "C9350C", nombre: "Torno de discos y tambores de freno", categoria: "Tornos de frenos", precio: 3550, foto: "c9350c", peso: 290,
    cbm: 1.103,
    resumen: "Torno de discos y tambores de freno con banco, ideal para agencias y talleres pequeños y medianos.",
    caracteristicas: [
      "Máquina multiusos", "Rendimiento estable", "Fácil de controlar", "Larga vida de la cuchilla",
      "Alta estabilidad y rigidez", "Bajo consumo de energía",
    ],
    ficha: [
      ["Recorrido del husillo", "175 mm (6.875\")"], ["Velocidad del husillo", "70, 88 y 118 rpm"],
      ["Avance del husillo", "0.05 a 0.5 mm por vuelta"], ["Avance transversal", "0.05 a 0.5 mm por vuelta"],
      ["Graduación del volante", "0.05 mm (0.002\")"], ["Diámetro de disco", "180 a 381 mm (7\" a 15\")"],
      ["Espesor máximo de disco", "48 mm (1.875\")"], ["Diámetro de tambor", "152 a 450 mm (6\" a 17.7\")"],
      ["Profundidad de tambor", "175 mm (6.875\")"], ["Motor", "110/220/380 V, 50/60 Hz"],
      ["Peso bruto", "290 kg"], ["Dimensiones", "1010 × 950 × 1150 mm"],
    ],
    incluye: [
      "Cortador doble × 1", "Eje de 1\" (25.4 mm) con tuerca, arandelas y tirante × 1", "Protector plástico de seguridad × 1",
      "Llave de boca (27-30 mm) × 1", "Llave cuadrada × 1", "Correa en V A610 × 1", "Barra de corte × 3",
      "Banda silenciadora para disco y tambor × 2", "Cono (30 × 44 mm) × 1", "Cono (31 × 57 mm) × 1", "Cono (45 × 70 mm) × 1",
      "Cono (59 × 75 mm) × 1", "Cono (66 × 82 mm) × 1", "Cono (74 × 90 mm) × 1", "Cono (85.8 × 103 mm) × 1",
      "Cono doble (34 × 42 mm) × 1", "Cono doble (35 × 43 mm) × 1", "Cono doble (44 × 52 mm) × 1", "Cono doble (52 × 62 mm) × 1",
      "Cono doble (62 × 71 mm) × 1", "Resorte × 1", "Plato de sujeción (94 mm) × 2", "Plato de sujeción (116 mm) × 2",
      "Plato de sujeción (146 mm) × 2",
    ],
  },
  {
    codigo: "C9370C", nombre: "Torno de discos y tambores de freno para vehículos pesados", categoria: "Tornos de frenos", precio: 3550, foto: "c9370c", peso: 325,
    cbm: 1.338,
    resumen: "Torno de discos y tambores de freno con banco, ideal para empresas de autobuses y talleres medianos y grandes.",
    caracteristicas: [
      "Máquina multiusos", "Rendimiento estable", "Fácil de controlar", "Larga vida de la cuchilla",
      "Alta estabilidad y rigidez", "Bajo consumo de energía",
    ],
    ficha: [
      ["Recorrido del husillo", "251 mm (9.875\")"], ["Velocidad del husillo", "70, 88 y 118 rpm"],
      ["Avance del husillo", "0.05 a 0.5 mm por vuelta"], ["Avance transversal", "0.05 a 0.25 mm por vuelta"],
      ["Graduación del volante", "0.05 mm (0.002\")"], ["Diámetro de disco", "180 a 457 mm (7\" a 18\")"],
      ["Espesor máximo de disco", "73 mm (2.85\")"], ["Diámetro de tambor", "152 a 450 mm (6\" a 17.7\")"],
      ["Profundidad de tambor", "251 mm (9.875\")"], ["Motor", "110/220/380 V, 50/60 Hz"],
      ["Peso bruto", "325 kg"], ["Dimensiones", "1130 × 1030 × 1150 mm"],
    ],
    incluye: [
      "Cono (45 × 70 mm) × 1", "Cono (59 × 75 mm) × 1", "Cono (66 × 82 mm) × 1", "Cono (74 × 90 mm) × 1",
      "Plato de sujeción (94 mm) × 2", "Plato de sujeción (116 mm) × 2", "Plato de sujeción (146 mm) × 2", "Resorte × 1",
      "Llave de boca (27-30 mm) × 1", "Banda silenciadora para disco y tambor × 2", "Espaciador × 6",
      "Eje localizador de 2\" (50.8 mm) × 1", "Cono localizador grande (79 × 108 mm) × 1", "Cono localizador pequeño (54 × 82.5 mm) × 1",
      "Tuerca × 1", "Espaciador grande (171.5 mm) × 1", "Espaciador pequeño (133 mm) × 1", "Adaptador grande (171.5 mm) × 1",
      "Adaptador pequeño (133 mm) × 1", "Adaptador escalonado (25.4 × 50.8 mm) × 1", "Llave curva (78-85 mm) × 1",
    ],
  },
];

/** Productos listos para guardar en "Productos" (mismos campos que usa la app). */
export const CATALOGO_XPROMISE = EQUIPOS.map((e) => ({
  id: `xpromise-${e.foto}`,
  codigo: e.codigo,
  nombre: e.nombre,
  categoria: e.categoria,
  cbm: e.cbm ?? cbmDeMedidas(e.empaque),
  peso: e.peso || 0,
  precioCbm: 0,
  precioProducto: e.precio,
  precioVenta: 0,
  foto: FOTO(e.foto),
  descripcion: armarDescripcion({
    marca: "XPROMISE",
    empaque: e.empaque || "",
    resumen: e.resumen,
    caracteristicas: (e.caracteristicas || []).join("\n"),
    ficha: (e.ficha || []).map(([k, v]) => `${k}: ${v}`).join("\n"),
    incluye: (e.incluye || []).join("\n"),
    opcionales: (e.opcionales || []).join("\n"),
  }),
}));
