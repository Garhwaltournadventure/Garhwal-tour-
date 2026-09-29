function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store'}})}
const enc=new TextEncoder();
function hex(buf){return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function hashPassword(password,salt){
 const key=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations:100000,hash:'SHA-256'},key,256);
 return hex(bits);
}
function authAdmin(request,env){const p=env.ADMIN_PASSWORD||env['ADMIN-PASSWORD'];return !!p&&request.headers.get('x-admin-password')===p}
async function setup(db){
 await db.prepare(`CREATE TABLE IF NOT EXISTS staff_users (id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, display_name TEXT NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'worker', active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL)`).run();
 await db.prepare(`CREATE TABLE IF NOT EXISTS staff_sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL, role TEXT NOT NULL, expires_at TEXT NOT NULL)`).run();
}
async function session(request,db){
 const token=request.headers.get('x-staff-token');if(!token)return null;
 return await db.prepare('SELECT s.*,u.username,u.display_name,u.active FROM staff_sessions s JOIN staff_users u ON u.id=s.user_id WHERE s.token=? AND s.expires_at>? AND u.active=1').bind(token,new Date().toISOString()).first();
}
export async function onRequest({request,env}){
 if(!env.DB)return json({error:'Database is not configured.'},503);
 const db=env.DB;await setup(db);const url=new URL(request.url),a=url.searchParams.get('action')||'';
 if(request.method==='POST'&&a==='login'){
  let b;try{b=await request.json()}catch{return json({error:'Invalid JSON'},400)}
  const username=String(b.username||'').trim().toLowerCase(),password=String(b.password||'');
  if(!username||!password)return json({error:'Username and password are required.'},400);
  const u=await db.prepare('SELECT * FROM staff_users WHERE username=? AND active=1').bind(username).first();
  if(!u)return json({error:'Invalid login'},401);
  const ok=(await hashPassword(password,username))===u.password_hash;if(!ok)return json({error:'Invalid login'},401);
  const token=crypto.randomUUID()+crypto.randomUUID().replaceAll('-','');
  const exp=new Date(Date.now()+7*86400000).toISOString();
  await db.prepare('INSERT INTO staff_sessions(token,user_id,role,expires_at) VALUES(?,?,?,?)').bind(token,u.id,u.role,exp).run();
  return json({token,user:{id:u.id,username:u.username,display_name:u.display_name,role:u.role}});
 }
 if(request.method==='POST'&&a==='admin-login'){
  if(!authAdmin(request,env))return json({error:'Unauthorized'},401);
  const u=await db.prepare('SELECT * FROM staff_users WHERE username=?').bind('admin').first();
  let user=u;
  if(!u){
   const id=crypto.randomUUID(),salt='admin';const p=env.ADMIN_PASSWORD||env['ADMIN-PASSWORD'];const ph=await hashPassword(p,salt);
   await db.prepare('INSERT INTO staff_users(id,username,display_name,password_hash,role,active,created_at) VALUES(?,?,?,?,?,?,?)').bind(id,'admin','Administrator',ph,'admin',1,new Date().toISOString()).run();
   user={id,username:'admin',display_name:'Administrator',role:'admin'};
  }
  const token=crypto.randomUUID()+crypto.randomUUID().replaceAll('-','');const exp=new Date(Date.now()+7*86400000).toISOString();
  await db.prepare('INSERT INTO staff_sessions(token,user_id,role,expires_at) VALUES(?,?,?,?)').bind(token,user.id,'admin',exp).run();
  return json({token,user:{id:user.id,username:'admin',display_name:user.display_name,role:'admin'}});
 }
 const s=await session(request,db);
 if(request.method==='POST'&&a==='register-token'){
  if(!s)return json({error:'Unauthorized'},401);
  let b;try{b=await request.json()}catch{return json({error:'Invalid JSON'},400)}
  const t=String(b.token||'').trim();if(!t)return json({error:'Missing token'},400);
  const now=new Date().toISOString();
  await db.prepare('INSERT INTO device_tokens(token,user_id,role,active,created_at,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(token) DO UPDATE SET user_id=excluded.user_id,role=excluded.role,active=1,updated_at=excluded.updated_at').bind(t,s.user_id,s.role,1,now,now).run();
  return json({ok:true});
 }
 if(request.method==='GET'&&a==='me'){return s?json({user:{id:s.user_id,username:s.username,display_name:s.display_name,role:s.role}}):json({error:'Unauthorized'},401)}
 if(request.method==='GET'&&a==='users'){
  if(!s||s.role!=='admin')return json({error:'Unauthorized'},401);
  const r=await db.prepare('SELECT id,username,display_name,role,active,created_at FROM staff_users ORDER BY display_name').all();return json({users:r.results||[]});
 }
 if(request.method==='POST'&&a==='users'){
  if(!s||s.role!=='admin')return json({error:'Unauthorized'},401);
  let b;try{b=await request.json()}catch{return json({error:'Invalid JSON'},400)}
  const username=String(b.username||'').trim().toLowerCase(),display=String(b.display_name||'').trim(),password=String(b.password||'');
  if(!username||!display||password.length<4)return json({error:'Username, display name and a 4+ character password are required.'},400);
  if(username==='admin')return json({error:'Reserved username.'},400);
  const ph=await hashPassword(password,username);
  try{await db.prepare('INSERT INTO staff_users(id,username,display_name,password_hash,role,active,created_at) VALUES(?,?,?,?,?,?,?)').bind(crypto.randomUUID(),username,display,ph,'worker',1,new Date().toISOString()).run();return json({ok:true})}catch(e){return json({error:'Username already exists.'},409)}
 }
 if(request.method==='PATCH'&&a==='users'){
  if(!s||s.role!=='admin')return json({error:'Unauthorized'},401);
  let b;try{b=await request.json()}catch{return json({error:'Invalid JSON'},400)}
  if(!b.id)return json({error:'Missing user id'},400);
  await db.prepare('UPDATE staff_users SET active=? WHERE id=? AND username<>?').bind(b.active?1:0,b.id,'admin').run();return json({ok:true});
 }
 if(request.method==='GET'&&a==='bookings'){
  if(!s)return json({error:'Unauthorized'},401);
  if(s.role==='admin'){
   const r=await db.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all();return json({bookings:r.results||[]});
  }
  const r=await db.prepare('SELECT * FROM bookings WHERE driver=? ORDER BY date,created_at DESC').bind(s.display_name).all();return json({bookings:r.results||[]});
 }
 return json({error:'Not found'},404);
}