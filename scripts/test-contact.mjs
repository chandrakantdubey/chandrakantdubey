import assert from "node:assert/strict";
import { GET, POST, contactConfigured, validateContactPayload } from "../api/contact.ts";

const id = "123e4567-e89b-42d3-a456-426614174000";
const payload = {
  name:"A Developer",
  email:"developer@example.com",
  message:"Hello, I would like to discuss the implementation.",
  token:"valid-turnstile-response-token",
  requestId:id,
  website:"",
};

const saved = {
  RESEND_API_KEY:process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL:process.env.RESEND_FROM_EMAIL,
  CONTACT_TURNSTILE_SECRET:process.env.CONTACT_TURNSTILE_SECRET,
  VITE_TURNSTILE_SITE_KEY:process.env.VITE_TURNSTILE_SITE_KEY,
};
const originalFetch = globalThis.fetch;
const url = "https://chandrakantdubey.vercel.app/api/contact";

function makeRequest(data, {origin="https://chandrakantdubey.vercel.app",contentType="application/json"} = {}) {
  return new Request(url,{method:"POST",headers:{"origin":origin,"content-type":contentType},body:JSON.stringify(data)});
}
try {
  delete process.env.RESEND_API_KEY;
  delete process.env.RESEND_FROM_EMAIL;
  delete process.env.CONTACT_TURNSTILE_SECRET;
  delete process.env.VITE_TURNSTILE_SITE_KEY;
  assert.equal(contactConfigured(),false);
  let result=await GET();
  assert.equal(result.status,200);
  assert.deepEqual(await result.json(),{enabled:false});
  result=await POST(makeRequest(payload));
  assert.equal(result.status,503);

  process.env.RESEND_API_KEY="re_test";
  process.env.RESEND_FROM_EMAIL="Portfolio <contact@example.com>";
  process.env.CONTACT_TURNSTILE_SECRET="turnstile-secret-test";
  process.env.VITE_TURNSTILE_SITE_KEY="turnstile-public-site-key";
  for (const key of ["RESEND_API_KEY","RESEND_FROM_EMAIL","CONTACT_TURNSTILE_SECRET","VITE_TURNSTILE_SITE_KEY"]) {
    const value=process.env[key];
    process.env[key]="  ";
    assert.equal(contactConfigured(),false,key+" must not be blank");
    process.env[key]=value;
  }
  assert.equal(contactConfigured(),true);
  assert.equal((await GET()).status,200);
  assert.equal(validateContactPayload(payload).ok,true);
  for(const invalid of [
    {...payload,name:"A"},
    {...payload,name:"Bad\nHeader"},
    {...payload,email:"not-an-email"},
    {...payload,message:"short"},
    {...payload,message:"x".repeat(3200)},
    {...payload,token:""},
    {...payload,requestId:"invalid"},
    {...payload,name:7},
    {},
  ]){
    assert.equal(validateContactPayload(invalid).ok,false);
  }

  result=await POST(makeRequest(payload,{origin:"https://evil.example"}));
  assert.equal(result.status,403);
  result=await POST(makeRequest(payload,{contentType:"text/plain"}));
  assert.equal(result.status,415);

  let verificationCount=0,deliveryCount=0,lastDelivery;
  globalThis.fetch=async (input,options)=>{
    if(String(input).includes("/siteverify")){
      verificationCount++;
      assert.equal(options.method,"POST");
      return Response.json({success:true,hostname:"chandrakantdubey.vercel.app"});
    }
    if(String(input).includes("api.resend.com/emails")){
      deliveryCount++;
      assert.equal(options.headers["Idempotency-Key"],id);
      assert.equal(options.headers.Authorization,"Bearer re_test");
      lastDelivery=JSON.parse(options.body);
      return Response.json({id:"sent-test"});
    }
    throw Error("unexpected network call: "+String(input));
  };
  result=await POST(makeRequest({...payload,website:"spam.example"}));
  assert.equal(result.status,200);
  assert.equal(verificationCount,0,"honeypot must not call upstream services");
  result=await POST(makeRequest(payload));
  assert.equal(result.status,200);
  assert.deepEqual(await result.json(),{sent:true});
  assert.equal(verificationCount,1);
  assert.equal(deliveryCount,1);
  assert.equal(lastDelivery.to[0],"919chandrakant@gmail.com");
  assert.equal(lastDelivery.reply_to,payload.email);
  assert.equal(lastDelivery.from,process.env.RESEND_FROM_EMAIL);

  globalThis.fetch=async input=>{
    if(String(input).includes("/siteverify"))return Response.json({success:false});
    throw Error("mail must not send without challenge");
  };
  result=await POST(makeRequest(payload));
  assert.equal(result.status,403);

  globalThis.fetch=async input=>{
    if(String(input).includes("/siteverify"))
      return Response.json({success:true,hostname:"wrong.example"});
    throw Error("mail must not send from another host");
  };
  result=await POST(makeRequest(payload));
  assert.equal(result.status,403);
  globalThis.fetch=async input=>{
    if(String(input).includes("/siteverify"))return Response.json({success:true});
    throw Error("Resend must not send for a missing verification hostname");
  };
  result=await POST(makeRequest(payload));
  assert.equal(result.status,403,"Turnstile siteverify must report the exact hostname");

  globalThis.fetch=async input=>{
    if(String(input).includes("/siteverify"))return Response.json({success:true,hostname:"chandrakantdubey.vercel.app"});
    if(String(input).includes("api.resend.com/emails"))return Response.json({error:"upstream failure"},{status:403});
    throw Error("unexpected network");
  };
  result=await POST(makeRequest(payload));
  assert.equal(result.status,502,"Resend rejection must not be reported as success");

  globalThis.fetch=async input=>{
    if(String(input).includes("/siteverify"))return Response.json({success:true,hostname:"chandrakantdubey.vercel.app"});
    if(String(input).includes("api.resend.com/emails"))return Response.json({});
    throw Error("unexpected network");
  };
  result=await POST(makeRequest(payload));
  assert.equal(result.status,502,"Resend must return a valid accepted-message id");

  console.log("Contact API unit tests: validation, all env gates, origin, strict Turnstile and Resend receipts — PASS");
}finally{
  globalThis.fetch=originalFetch;
  for(const [key,value] of Object.entries(saved)){
    if(value===undefined)delete process.env[key];
    else process.env[key]=value;
  }
}
