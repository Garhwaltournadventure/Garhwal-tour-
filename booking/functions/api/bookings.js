function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}})}
function auth(request,env){return !!env.ADMIN_PASSWORD && request.headers.get('x-admin-password')===env.ADMIN_PASSWORD}
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
  const result=await env.DB.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all();
  return json({bookings:result.results||[]});
 }
 const bid=url.searchParams.get('id');if(!bid)return json({error:'Missing id'},400);
 const exists=await env.DB.prepare('SELECT * FROM bookings WHERE id=?').bind(bid).first();if(!exists)return json({error:'Booking not found'},404);
 if(method==='PATCH'){
  let b;try{b=await request.json()}catch{return json({error:'Invalid JSON'},400)}
  const price=Number(b.price||0),advance=Number(b.advance||0),received=Number(b.received||0),paid=Math.min(price,advance+received),gst=price-price/1.05;
  await env.DB.prepare('UPDATE bookings SET status=?,vehicle=?,driver=?,driver_phone=?,price=?,advance=?,received=?,paid=?,mode=?,paidto=?,gst=?,admin_note=? WHERE id=?').bind(b.status||'New',b.vehicle||'',b.driver||'',b.driver_phone||'',price,advance,received,paid,b.mode||'UPI',b.paidto||'Owner',gst,b.admin_note||'',bid).run();
  return json({booking:await env.DB.prepare('SELECT * FROM bookings WHERE id=?').bind(bid).first()});
 }
 if(method==='DELETE'){await env.DB.prepare('DELETE FROM bookings WHERE id=?').bind(bid).run();return json({ok:true})}
 return json({error:'Method not allowed'},405);
}