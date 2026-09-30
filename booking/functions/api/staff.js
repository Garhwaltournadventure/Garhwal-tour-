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
 await db.prepare(`CREATE TABLE IF NOT EXISTS staff_users (id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, display_name TEXT NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'worker', designation TEXT NOT NULL DEFAULT 'Staff', email TEXT, phone TEXT, permissions TEXT NOT NULL DEFAULT '{}', active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL)`).run();
 const cols=await db.prepare(`PRAGMA table_info(staff_users)`).all();
 const names=new Set((cols.results||[]).map(x=>x.name));
 if(!names.has('designation')) await db.prepare(`ALTER TABLE staff_users ADD COLUMN designation TEXT NOT NULL DEFAULT 'Staff'`).run();
 if(!names.has('email')) await db.prepare(`ALTER TABLE staff_users ADD COLUMN email TEXT`).run();
 if(!names.has('phone')) await db.prepare(`ALTER TABLE staff_users ADD COLUMN phone TEXT`).run();
 if(!names.has('permissions')) await db.prepare(`ALTER TABLE staff_users ADD COLUMN permissions TEXT NOT NULL DEFAULT '{}'`).run();
 await db.prepare(`CREATE TABLE IF NOT EXISTS staff_sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL, role TEXT NOT NULL, expires_at TEXT NOT NULL)`).run();
}
async function session(request,db){
 const token=request.headers.get('x-staff-token');if(!token)return null;
 const u=await db.prepare('SELECT s.*,u.username,u.display_name,u.designation,u.permissions,u.active FROM staff_sessions s JOIN staff_users u ON u.id=s.user_id WHERE s.token=? AND s.expires_at>? AND u.active=1').bind(token,new Date().toISOString()).first();
 if(u){try{u.permissions=JSON.parse(u.permissions||'{}')}catch(e){u.permissions={}}}
 return u;
}
export async function onRequest({request,env}){
 if(!env.DB)return json({error:'Database is not configured.'},503);
 const db=env.DB;await setup(db);const url=new URL(request.url),a=url.searchParams.get('action')||'';
 if(request.method==='POST'&&a==='login'){
  let b;try{b=await request.json()}catch{return json({error:'Invalid JSON'},400)}
  const identifier=String(b.identifier||b.username||'').trim(),password=String(b.password||'');
  if(!identifier||!password)return json({error:'Email/phone and password are required.'},400);
  const normalized=identifier.toLowerCase();
  const u=await db.prepare('SELECT * FROM staff_users WHERE active=1 AND (lower(username)=? OR lower(email)=? OR phone=?)').bind(normalized,normalized,identifier.replace(/\\D/g,'')).first();
  if(!u)return json({error:'Invalid login'},401);
  const ok=(await hashPassword(password,u.username))===u.password_hash;if(!ok)return json({error:'Invalid login'},401);
  const token=crypto.randomUUID()+crypto.randomUUID().replaceAll('-','');
  const exp=new Date(Date.now()+7*86400000).toISOString();
  await db.prepare('INSERT INTO staff_sessions(token,user_id,role,expires_at) VALUES(?,?,?,?)').bind(token,u.id,u.role,exp).run();
  return json({token,user:{id:u.id,username:u.username,display_name:u.display_name,designation:u.designation||'Staff',permissions:JSON.parse(u.permissions||'{}'),role:u.role}});
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
  return json({token,user:{id:user.id,username:'admin',display_name:user.display_name,designation:'Administrator',permissions:{all:true},role:'admin'}});
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
 if(request.method==='GET'&&a==='me'){return s?json({user:{id:s.user_id,username:s.username,display_name:s.display_name,designation:s.designation||'Staff',permissions:s.role==='admin'?{all:true}:s.permissions||{},role:s.role}}):json({error:'Unauthorized'},401)}
 if(request.method==='GET'&&a==='users'){
  if(!s||s.role!=='admin')return json({error:'Unauthorized'},401);
  const r=await db.prepare('SELECT id,username,display_name,role,designation,permissions,active,created_at FROM staff_users ORDER BY display_name').all();return json({users:r.results||[]});
 }
 if(request.method==='POST'&&a==='users'){
  if(!s||s.role!=='admin')return json({error:'Unauthorized'},401);
  let b;try{b=await request.json()}catch{return json({error:'Invalid JSON'},400)}
  const username=String(b.username||'').trim().toLowerCase(),display=String(b.display_name||'').trim(),password=String(b.password||''),email=String(b.email||'').trim().toLowerCase(),phone=String(b.phone||'').replace(/\\D/g,''),designation=String(b.designation||'Staff').trim()||'Staff',permissions=b.permissions&&typeof b.permissions==='object'?b.permissions:{};
  if(!username||!display||password.length<4)return json({error:'Username, display name and a 4+ character password are required.'},400);
  if(username==='admin')return json({error:'Reserved username.'},400);
  const ph=await hashPassword(password,username);
  try{await db.prepare('INSERT INTO staff_users(id,username,display_name,password_hash,role,designation,permissions,active,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),username,display,ph,'worker',designation,email||null,phone||null,JSON.stringify(permissions),1,new Date().toISOString()).run();return json({ok:true})}catch(e){const msg=String(e?.message||e||'');return json({error:msg.includes('UNIQUE')?'Username already exists.':'Could not create worker: '+msg},409)}
 }
 if(request.method==='PATCH'&&a==='users'){
  if(!s||s.role!=='admin')return json({error:'Unauthorized'},401);
  let b;try{b=await request.json()}catch{return json({error:'Invalid JSON'},400)}
  if(!b.id)return json({error:'Missing user id'},400);
  const target=await db.prepare('SELECT id,username FROM staff_users WHERE id=?').bind(b.id).first();
  if(!target||target.username==='admin')return json({error:'Cannot modify this user.'},400);
  const sets=[],vals=[];
  if(typeof b.active==='boolean'){sets.push('active=?');vals.push(b.active?1:0)}
  if(typeof b.designation==='string'&&b.designation.trim()){sets.push('designation=?');vals.push(b.designation.trim())}
  if(b.permissions&&typeof b.permissions==='object'){sets.push('permissions=?');vals.push(JSON.stringify(b.permissions))}
  if(!sets.length)return json({error:'Nothing to update.'},400);
  vals.push(b.id);await db.prepare('UPDATE staff_users SET '+sets.join(',')+' WHERE id=? AND username<>?').bind(...vals,'admin').run();
  return json({ok:true});
 }
 if(request.method==='DELETE'&&a==='users'){
  if(!s||s.role!=='admin')return json({error:'Unauthorized'},401);
  const id=url.searchParams.get('id');if(!id)return json({error:'Missing user id'},400);
  const target=await db.prepare('SELECT id,username FROM staff_users WHERE id=?').bind(id).first();
  if(!target||target.username==='admin')return json({error:'Cannot delete this user.'},400);
  await db.prepare('DELETE FROM staff_sessions WHERE user_id=?').bind(id).run();
  await db.prepare('DELETE FROM device_tokens WHERE user_id=?').bind(id).run();
  await db.prepare('DELETE FROM staff_users WHERE id=? AND username<>?').bind(id,'admin').run();
  return json({ok:true});
 }
 if(request.method==='GET'&&a==='bookings'){
  if(!s)return json({error:'Unauthorized'},401);
  if(s.role==='admin'){
   const r=await db.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all();return json({bookings:r.results||[]});
  }
  let perms={};try{perms=typeof s.permissions==='string'?JSON.parse(s.permissions||'{}'):(s.permissions||{})}catch(e){}
  if(perms.view_all){const r=await db.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all();return json({bookings:r.results||[]})}
  if(perms.view_assigned===false)return json({bookings:[]});
  const r=await db.prepare('SELECT * FROM bookings WHERE driver=? ORDER BY date,created_at DESC').bind(s.display_name).all();return json({bookings:r.results||[]});
 }
 return json({error:'Not found'},404);
}