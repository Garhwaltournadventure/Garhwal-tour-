function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}})}
function auth(request,env){
 const configuredPassword=env.ADMIN_PASSWORD||env["ADMIN-PASSWORD"];
 return !!configuredPassword && request.headers.get('x-admin-password')===configuredPassword;
}
function corsJson(data,status=200){
 return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
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
  if((b.notify_email||false)===true && saved.email){try{notification=await sendConfirmationEmail(env,saved)}catch(e){notification={sent:false,reason:'email_send_error'}}}
  return json({booking:saved,notification});
 }
 if(method==='DELETE'){await env.DB.prepare('DELETE FROM bookings WHERE id=?').bind(bid).run();return json({ok:true})}
 return json({error:'Method not allowed'},405);
}