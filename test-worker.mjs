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
globalThis.fetch=async(url)=>{const u=new URL(url);assert.equal(u.searchParams.get('select'),'id,codigo,nombre,descripcion,categoria,cbm,peso,precio_venta,foto');pages++;return Response.json(u.searchParams.get('offset')==='0'?[{id:'public1',nombre:'Producto',categoria:'Maquinaria',precio_venta:20,precio_producto:10,precio_cbm:5}]:[]);};
r=await worker.fetch(req('/api/catalogo'),env);assert.equal(r.status,200);const catalog=await r.json();assert.equal(catalog[0].precio_venta,20);assert.equal(catalog[0].categoria,'Maquinaria');assert.equal('precio_producto' in catalog[0],false);assert.equal('precio_cbm' in catalog[0],false);assert.equal(pages,2);
globalThis.fetch=async()=>Response.json({message:'internal error'},{status:403});
r=await worker.fetch(req('/api/catalogo'),env);assert.equal(r.status,503);assert.equal((await r.text()).includes('internal error'),false);
console.log('Catálogo: paginación, campos públicos y errores verificados.');
