import assert from 'node:assert/strict';
import worker from './worker.js';
const env = { SUPABASE_URL: 'https://vhlwxvzieitgcwxmngua.supabase.co', SUPABASE_ANON_KEY: 'test-anon' };
const req = (path, method='GET', body) => new Request('https://example.com'+path,{method,...(body ? {body:JSON.stringify(body)} : {})});
let r = await worker.fetch(req('/api/productos','PUT',[{id:'test'}]),{});
assert.equal(r.status,503); assert.match((await r.json()).error,/SUPABASE_URL/);
r = await worker.fetch(req('/api/health'),{}); assert.equal((await r.json()).ok,false);
let rows=[];
globalThis.fetch=async(url,init)=>{ assert.ok(url.startsWith(env.SUPABASE_URL+'/rest/v1/productos')); if(init.method==='POST') {rows=JSON.parse(init.body); assert.equal(init.headers.Prefer,'resolution=merge-duplicates,return=representation');} return Response.json(rows); };
r=await worker.fetch(req('/api/productos','PUT',[{id:'test',nombre:'Prueba'}]),env); assert.equal((await r.json()).saved,1);
r=await worker.fetch(req('/api/productos'),env); assert.equal((await r.json())[0].nombre,'Prueba');
r=await worker.fetch(req('/api/health'),env); assert.equal((await r.json()).productosReadable,true);
globalThis.fetch=async()=>Response.json({code:'42501',message:'permission denied for table productos'},{status:403});
r=await worker.fetch(req('/api/productos','PUT',[{id:'test'}]),env); assert.equal(r.status,403); assert.equal((await r.json()).error.code,'42501');
globalThis.fetch=async()=>{throw new Error('network');};
r=await worker.fetch(req('/api/productos','PUT',[{id:'test'}]),env); assert.equal(r.status,502);
globalThis.fetch=async(url,init)=>{assert.equal(init.headers.authorization,undefined);assert.equal(init.headers.apikey,'sb_publishable_test');return Response.json([]);};
r=await worker.fetch(req('/api/productos'),{...env,SUPABASE_ANON_KEY:'sb_publishable_test'}); assert.equal(r.status,200);
console.log('8 comprobaciones correctas (Supabase simulado; sin modificar datos reales).');
// Deletion regression checks: selected row only, final row, denied access, zero affected rows.
rows=[{id:'one'},{id:'two'}];
globalThis.fetch=async(url,init)=>{const u=new URL(url); if(init.method==='DELETE'){const id=u.searchParams.get('id').slice(3);const deleted=rows.filter(p=>p.id===id);rows=rows.filter(p=>p.id!==id);return Response.json(deleted);}return Response.json(rows);};
r=await worker.fetch(req('/api/productos?id=one','DELETE'),env);assert.equal((await r.json()).deleted,'one');
r=await worker.fetch(req('/api/productos'),env);assert.deepEqual(await r.json(),[{id:'two'}]);
r=await worker.fetch(req('/api/productos?id=two','DELETE'),env);assert.equal((await r.json()).ok,true);assert.deepEqual(rows,[]);
r=await worker.fetch(req('/api/productos?id=two','DELETE'),env);assert.equal(r.status,409);
globalThis.fetch=async()=>Response.json({code:'42501'},{status:403});
r=await worker.fetch(req('/api/productos?id=one','DELETE'),env);assert.equal(r.status,403);
globalThis.fetch=()=>{throw new Error('Must not call Supabase for invalid IDs');};
for(const path of ['/api/productos','/api/productos?id=','/api/productos?id=one%26id=neq.two']){r=await worker.fetch(req(path,'DELETE'),env);assert.equal(r.status,400);}
console.log('Pruebas de eliminación correctas: fila seleccionada, último producto, permisos, cero filas e ID inválido.');
// Public catalog excludes internal fields and reads subsequent pages.
let pages=0;
globalThis.fetch=async(url)=>{const u=new URL(url);assert.equal(u.searchParams.get('select'),'id,codigo,nombre,descripcion,categoria,peso,precio_venta,foto');pages++;return Response.json(u.searchParams.get('offset')==='0'?[{id:'public1',nombre:'Producto',categoria:'Maquinaria',precio_venta:20,precio_producto:10,precio_cbm:5}]:[]);};
r=await worker.fetch(req('/api/catalogo'),env);assert.equal(r.status,200);const catalog=await r.json();assert.equal(catalog[0].precio_venta,20);assert.equal(catalog[0].categoria,'Maquinaria');assert.equal('precio_producto' in catalog[0],false);assert.equal('precio_cbm' in catalog[0],false);assert.equal('cbm' in catalog[0],false);assert.equal(pages,2);
globalThis.fetch=async(url)=>{const u=new URL(url);assert.equal(u.searchParams.get('select'),'id,codigo,nombre,descripcion,categoria,cbm,peso,precio_cbm,precio_producto,precio_venta,foto');return Response.json(u.searchParams.get('offset')==='0'?[{id:'interno1',nombre:'Producto',precio_venta:20,precio_producto:10,precio_cbm:5,creado:'x'}]:[]);};
r=await worker.fetch(req('/api/catalogo-interno'),env);assert.equal(r.status,200);const interno=await r.json();assert.equal(interno[0].precio_producto,10);assert.equal(interno[0].precio_cbm,5);assert.equal('creado' in interno[0],false);
globalThis.fetch=async()=>Response.json({message:'internal error'},{status:403});
r=await worker.fetch(req('/api/catalogo'),env);assert.equal(r.status,503);assert.equal((await r.text()).includes('internal error'),false);
globalThis.fetch=async(url)=>{assert.equal(new URL(url).pathname,'/rest/v1/configuracion');return Response.json([{valor:{nombre:'Taller',whatsapp:'+505 8888-8888',logo:'data:secreto'}}]);};
r=await worker.fetch(req('/api/contacto'),env);assert.equal(r.status,200);const contacto=await r.json();assert.deepEqual(contacto,{nombre:'Taller',contacto:'',logo:'data:secreto',whatsapp:'50588888888'});
globalThis.fetch=async()=>Response.json({message:'x'},{status:500});
r=await worker.fetch(req('/api/contacto'),env);assert.deepEqual(await r.json(),{nombre:'',contacto:'',logo:'',whatsapp:''});
console.log('Catálogo: paginación, campos públicos y errores verificados.');
console.log('Contacto: nombre, contacto, logo y WhatsApp de la empresa.');
// Cotización enviada desde el catálogo: precios de la base, número siguiente y sin costos en la respuesta.
let guardado=null;
globalThis.fetch=async(url,init={})=>{const u=new URL(url);
  if(u.pathname.endsWith('/productos')){assert.equal(u.searchParams.get('codigo'),'in.("A-1","NO")');return Response.json([{id:'p1',codigo:'A-1',nombre:'Máquina',cbm:0.5,peso:70,precio_cbm:550,precio_producto:1000,precio_venta:2000,foto:'/f.jpg'}]);}
  if(init.method==='POST'){guardado=JSON.parse(init.body);return new Response(null,{status:201});}
  return Response.json([{numero:'WEB-0004'}]);};
const pedir=(body)=>worker.fetch(new Request('https://example.test/api/solicitudes',{method:'POST',body:JSON.stringify(body)}),env);
r=await pedir({nombre:'Ana',telefono:'8888 7777',direccion:'León, centro',nota:'Managua',lineas:[{codigo:'A-1',cantidad:2,precio:1},{codigo:'NO',cantidad:1}]});
assert.equal(r.status,201);const sol=(await r.json()).cotizacion;
assert.equal(sol.numero,'WEB-0005');assert.equal(sol.total,4000);assert.equal(sol.lineas.length,1);assert.equal(sol.lineas[0].precio,2000);
assert.equal(JSON.stringify(sol).includes('precioProducto'),false);assert.equal(JSON.stringify(sol).includes('precioCbm'),false);
assert.equal(guardado.cliente,'Ana');assert.equal(guardado.total_final,4000);assert.equal(guardado.lineas[0].precioProducto,1000);
assert.equal(guardado.totales.totalFlete,1100);assert.equal(guardado.totales.ganancia,900);const gc=guardado.totales.contacto;assert.equal(gc.telefono,'8888 7777');assert.equal(gc.tel,'88887777');assert.match(gc.token,/^[0-9a-f]{32}$/);assert.equal(gc.direccion,'León, centro');assert.equal(gc.origen,'catalogo');
assert.equal(sol.direccion,'León, centro');assert.equal(sol.estado,'pendiente');assert.equal(sol.pagado,0);assert.equal(sol.token,gc.token);
for(const malo of [{nombre:'',telefono:'88887777',lineas:[{codigo:'A-1',cantidad:1}]},{nombre:'Ana',telefono:'123',lineas:[{codigo:'A-1',cantidad:1}]},{nombre:'Ana',telefono:'88887777',lineas:[]}]){r=await pedir(malo);assert.equal(r.status,400);}
globalThis.fetch=async()=>Response.json([]);
r=await worker.fetch(req('/api/solicitudes/'+guardado.id),env);assert.equal(r.status,404);
// Estado, pagos y enlace del cliente.
guardado.totales.estado='produccion';guardado.totales.confirmadaEl='2026-10-01T00:00:00Z';guardado.totales.pagos=[{monto:500},{monto:250}];
guardado.totales.pagos=[{fecha:'2026-10-02T00:00:00Z',monto:500,nota:'Anticipo',id:'x'},{monto:250}];
const fichaManual={id:'f1',nombre:'Beto',telefono:'7777 1111',tel:'77771111',token:'b'.repeat(32)};
globalThis.fetch=async(url)=>{const u=new URL(url);if(u.pathname.endsWith('/configuracion'))return Response.json([{valor:[fichaManual]}]);
  const t=u.searchParams.get('totales->contacto->>token');return Response.json(t==='eq.'+gc.token?[guardado]:[]);};
r=await worker.fetch(req('/api/cliente/'+gc.token),env);assert.equal(r.status,200);const mias=await r.json();
assert.equal(mias.nombre,'Ana');assert.equal(mias.cotizaciones[0].estado,'produccion');assert.equal(mias.cotizaciones[0].pagado,750);assert.equal(JSON.stringify(mias).includes('precioProducto'),false);
assert.deepEqual(mias.cotizaciones[0].pagos[0],{fecha:'2026-10-02T00:00:00Z',monto:500,nota:'Anticipo'});
// Cliente creado a mano, todavía sin cotizaciones: su enlace existe y está vacío.
r=await worker.fetch(req('/api/cliente/'+fichaManual.token),env);assert.equal(r.status,200);const beto=await r.json();assert.equal(beto.nombre,'Beto');assert.equal(beto.cotizaciones.length,0);
r=await worker.fetch(req('/api/cliente/'+'c'.repeat(32)),env);assert.equal(r.status,404);
// Al cotizar con el teléfono de un cliente creado a mano, la cotización queda en su enlace.
globalThis.fetch=async(url,init={})=>{const u=new URL(url);
  if(u.pathname.endsWith('/configuracion'))return Response.json([{valor:[fichaManual]}]);
  if(u.pathname.endsWith('/productos'))return Response.json([{id:'p1',codigo:'A-1',nombre:'Máquina',cbm:1,peso:0,precio_cbm:1,precio_producto:1,precio_venta:5,foto:''}]);
  if(init.method==='POST'){guardado=JSON.parse(init.body);return new Response(null,{status:201});}
  return Response.json([]);};
r=await pedir({nombre:'Beto',telefono:'7777-1111',lineas:[{codigo:'A-1',cantidad:1}]});assert.equal(r.status,201);assert.equal(guardado.totales.contacto.token,fichaManual.token);assert.equal(guardado.numero,'WEB-0001');
globalThis.fetch=async()=>Response.json([guardado]);
r=await worker.fetch(req('/api/solicitudes/'+guardado.id),env);assert.equal(r.status,200);assert.equal((await r.text()).includes('precioProducto'),false);
console.log('Cotizaciones del catálogo: registro, numeración, validación y vista sin costos.');
