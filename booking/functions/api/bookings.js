function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}})}
function auth(request,env){
 const configuredPassword=String(env.ADMIN_PASSWORD||env["ADMIN-PASSWORD"]||"").trim();
 const suppliedPassword=String(request.headers.get('x-admin-password')||"").trim();
 return !!configuredPassword && suppliedPassword===configuredPassword;
}
function corsJson(data,status=200){
 return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
}
function b64url(bytes){return btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=+$/,'')}
function pemToBytes(pem){
 const b64=pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\\s/g,'');
 const raw=atob(b64); const out=new Uint8Array(raw.length);
 for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);
 return out;
}
async function firebaseAccessToken(env){
 const raw=env.FIREBASE_SERVICE_ACCOUNT_JSON;
 if(!raw)return null;
 const sa=JSON.parse(raw);
 const now=Math.floor(Date.now()/1000);
 const header=b64url(new TextEncoder().encode(JSON.stringify({alg:'RS256',typ:'JWT'})));
 const claim=b64url(new TextEncoder().encode(JSON.stringify({iss:sa.client_email,scope:'https://www.googleapis.com/auth/firebase.messaging',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600})));
 const key=await crypto.subtle.importKey('pkcs8',pemToBytes(sa.private_key),{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign']);
 const sig=await crypto.subtle.sign({name:'RSASSA-PKCS1-v1_5'},key,new TextEncoder().encode(header+'.'+claim));
 const jwt=header+'.'+claim+'.'+b64url(sig);
 const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion='+encodeURIComponent(jwt)});
 if(!r.ok)return null;
 const data=await r.json();
 return data.access_token||null;
}
async function sendNewBookingPush(env,b){
 if(!env.FIREBASE_SERVICE_ACCOUNT_JSON || !env.DB)return {sent:0,reason:'firebase_push_not_configured'};
 const accessToken=await firebaseAccessToken(env);
 if(!accessToken)return {sent:0,reason:'firebase_auth_failed'};
 const sa=JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON);
 const rows=await env.DB.prepare("SELECT token FROM device_tokens WHERE active=1").all();
 const tokens=(rows.results||[]).map(x=>x.token).filter(Boolean);
 let sent=0;
 for(const token of tokens){
  const body={message:{token,notification:{title:'New Booking '+b.booking_ref,body:b.name+' • '+b.service+' • '+(b.date||'Date not set')},data:{booking_ref:String(b.booking_ref||''),guest:String(b.name||''),service:String(b.service||''),date:String(b.date||''),pax:String(b.pax||1),title:'New Booking '+b.booking_ref,body:b.name+' • '+b.service+' • '+(b.date||'Date not set')},android:{priority:'high',notification:{channel_id:'garhwal_bookings',click_action:'com.garhwaltournadventure.booking.OPEN_STAFF'}}}};
  const r=await fetch('https://fcm.googleapis.com/v1/projects/'+encodeURIComponent(sa.project_id)+'/messages:send',{method:'POST',headers:{Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(r.ok)sent++;
  else {
   let err='';try{err=await r.text()}catch(e){}
   if(err.includes('UNREGISTERED')||err.includes('registration-token-not-registered')){
    await env.DB.prepare('UPDATE device_tokens SET active=0,updated_at=? WHERE token=?').bind(new Date().toISOString(),token).run();
   }
  }
 }
 return {sent,total:tokens.length};
}
async function sendConfirmationEmail(env,b){
 const apiKey=env.RESEND_API_KEY;
 if(!apiKey || !b.email)return {sent:false,reason:'email_not_configured_or_missing_guest_email'};
 const from=env.NOTIFY_FROM;
 if(!from)return {sent:false,reason:'notify_from_not_configured'};
 const subject='Booking '+b.booking_ref+' — '+b.status;
 const text=[
  'Garhwal Tour N Adventure',
  'Travel Beyond Borders',
  '',
  'Booking Confirmation',
  'Booking: '+b.booking_ref,
  'Guest: '+b.name,
  'Phone: '+b.phone,
  'Service: '+b.service,
  'Date: '+(b.date||'—'),
  'Pax: '+(b.pax||1),
  'Vehicle: '+(b.vehicle||'To be confirmed'),
  'Driver: '+(b.driver||'To be confirmed'),
  'Driver Phone: '+(b.driver_phone||'To be confirmed'),
  'Details: '+(b.details||'—'),
  'Status: '+b.status,
  'Price (GST incl.): ₹'+Number(b.price||0).toLocaleString('en-IN'),
  'Advance: ₹'+Number(b.advance||0).toLocaleString('en-IN'),
  'Balance: ₹'+Math.max(0,Number(b.price||0)-Number(b.paid||0)).toLocaleString('en-IN'),
  '',
  'Thank you for choosing Garhwal Tour N Adventure.',
  '+91 80770 16559'
 ].join('\n');
 const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Authorization':'Bearer '+apiKey,'Content-Type':'application/json'},body:JSON.stringify({from,to:[b.email],subject,text})});
 return {sent:r.ok,status:r.status};
}
async function sendWhatsAppConfirmation(env,b){
 const token=env.WHATSAPP_ACCESS_TOKEN;
 const phoneNumberId=env.WHATSAPP_PHONE_NUMBER_ID;
 const template=env.WHATSAPP_CONFIRMATION_TEMPLATE;
 if(!token||!phoneNumberId||!template)return {sent:false,reason:'whatsapp_not_configured'};
 const to=String(b.phone||'').replace(/\\D/g,'');
 if(!to)return {sent:false,reason:'guest_phone_missing'};
 const version=env.WHATSAPP_GRAPH_VERSION||'v23.0';
 const url='https://graph.facebook.com/'+version+'/'+phoneNumberId+'/messages';
 const body={messaging_product:'whatsapp',to,type:'template',template:{name:template,language:{code:env.WHATSAPP_TEMPLATE_LANGUAGE||'en_US'},components:[{type:'body',parameters:[
  {type:'text',text:String(b.name||'Guest')},
  {type:'text',text:String(b.booking_ref||'')},
  {type:'text',text:String(b.service||'')},
  {type:'text',text:String(b.date||'')},
  {type:'text',text:String(b.vehicle||'To be confirmed')},
  {type:'text',text:String(b.driver||'To be confirmed')}
 ]}]}};
 const r=await fetch(url,{method:'POST',headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body)});
 let data=null;try{data=await r.json()}catch(e){}
 return {sent:r.ok,status:r.status,error:r.ok?null:(data&&data.error&&data.error.message)||'whatsapp_send_error'};
}
function id(){return crypto.randomUUID()}
function ref(){return 'GTA-'+new Date().getFullYear()+'-'+Date.now().toString().slice(-6)}
export async function onRequest(context){
 const {request,env}=context;
 if(!env.DB)return json({error:'Database is not configured.'},503);
 const url=new URL(request.url), method=request.method;
 if(method==='POST'){
  let b;try{b=await request.json()}catch{return json({error:'Invalid JSON'},400)}
  if(!b.name||!b.phone||!b.service)return json({error:'Name, phone and service are required.'},400);
  const rec={id:id(),booking_ref:ref(),created_at:new Date().toISOString(),company:b.company||'Garhwal Tour N Adventure',cphone:b.cphone||'',cemail:b.cemail||'',msme:b.msme||'',name:b.name,phone:b.phone,email:b.email||'',idtype:b.idtype||'',idno:b.idno||'',service:b.service,date:b.date||'',pax:Number(b.pax||1),details:b.details||'',payment_note:b.paymentNote||'',status:'New',vehicle:'',driver:'',driver_phone:'',price:0,advance:0,received:0,paid:0,mode:'',paidto:'',gst:0,admin_note:''};
  await env.DB.prepare(`INSERT INTO bookings (id,booking_ref,created_at,company,cphone,cemail,msme,name,phone,email,idtype,idno,service,date,pax,details,payment_note,status,vehicle,driver,driver_phone,price,advance,received,paid,mode,paidto,gst,admin_note) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(...Object.values(rec)).run();
  context.waitUntil(sendNewBookingPush(env,rec).catch(()=>null));
  return json({booking:rec},201);
 }
 if(!auth(request,env))return json({error:'Unauthorized'},401);
 if(method==='GET'){
  if(url.searchParams.get('workers')==='1'){
   const result=await env.DB.prepare("SELECT display_name FROM staff_users WHERE role='worker' AND active=1 ORDER BY display_name").all();
   return json({workers:result.results||[]});
  }
  const result=await env.DB.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all();
  return json({bookings:result.results||[]});
 }
 const bid=url.searchParams.get('id');if(!bid)return json({error:'Missing id'},400);
 const exists=await env.DB.prepare('SELECT * FROM bookings WHERE id=?').bind(bid).first();if(!exists)return json({error:'Booking not found'},404);
 if(method==='PATCH'){
  let b;try{b=await request.json()}catch{return json({error:'Invalid JSON'},400)}
  const price=Number(b.price||0),advance=Number(b.advance||0),received=Number(b.received||0),paid=Math.min(price,advance+received),gst=price-price/1.05;
  await env.DB.prepare('UPDATE bookings SET status=?,vehicle=?,driver=?,driver_phone=?,price=?,advance=?,received=?,paid=?,mode=?,paidto=?,gst=?,admin_note=? WHERE id=?').bind(b.status||'New',b.vehicle||'',b.driver||'',b.driver_phone||'',price,advance,received,paid,b.mode||'UPI',b.paidto||'Owner',gst,b.admin_note||'',bid).run();
  const saved=await env.DB.prepare('SELECT * FROM bookings WHERE id=?').bind(bid).first();
  let notification=null;
  const becameConfirmed=String(exists.status||'')!=='Confirmed' && String(saved.status||'')==='Confirmed';
  if(becameConfirmed || (b.notify_email||false)===true){
   const notifications={};
   if(saved.email){try{notifications.email=await sendConfirmationEmail(env,saved)}catch(e){notifications.email={sent:false,reason:'email_send_error'}}}
   else notifications.email={sent:false,reason:'guest_email_missing'};
   try{notifications.whatsapp=await sendWhatsAppConfirmation(env,saved)}catch(e){notifications.whatsapp={sent:false,reason:'whatsapp_send_error'}}
   notification=notifications;
  }
  return json({booking:saved,notification});
 }
 if(method==='DELETE'){await env.DB.prepare('DELETE FROM bookings WHERE id=?').bind(bid).run();return json({ok:true})}
 return json({error:'Method not allowed'},405);
}