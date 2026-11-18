import { useEffect, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import { links } from "./content";

export default function ContactSection() {
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [message,setMessage]=useState("");
  const [notice,setNotice]=useState("");
  const [copied,setCopied]=useState(false);
  const [directEnabled,setDirectEnabled]=useState(false);
  const [sending,setSending]=useState(false);
  const [website,setWebsite]=useState("");
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

  useEffect(()=>{
    if (!siteKey) return;
    const controller=new AbortController();
    const check=async()=>{
      try {
        const result=await fetch("/api/contact",{signal:controller.signal,headers:{"Accept":"application/json"}});
        if (!result.ok || !result.headers.get("content-type")?.includes("application/json")) return;
        const data=await result.json() as {enabled?:boolean};
        if(!controller.signal.aborted)setDirectEnabled(data.enabled===true);
      } catch { /* Vite dev builds without a serverless function retain mailto. */ }
    };
    void check();
    return ()=>controller.abort();
  },[siteKey]);

  useEffect(()=>{
    if (!directEnabled || !siteKey) return;
    const script=document.createElement("script");
    script.src="https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async=true;
    script.defer=true;
    script.dataset.contactTurnstile="true";
    document.head.appendChild(script);
    return ()=>{
      script.remove();
    };
  },[directEnabled,siteKey]);

  const composeMail=()=>{
    const subject=encodeURIComponent("Portfolio enquiry from "+name.trim());
    const body=encodeURIComponent(message.trim()+"\n\nFrom: "+name.trim()+"\nReply to: "+email.trim());
    setNotice("Your email app should open. Send the message there to complete contact.");
    window.location.assign("mailto:"+links.email+"?subject="+subject+"&body="+body);
  };

  const onSubmit=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    if(!directEnabled){composeMail();return;}
    const token=document.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]')?.value??"";
    if(!token){setNotice("Complete the security check to send directly.");return;}
    setSending(true);
    setNotice("");
    try{
      const response=await fetch("/api/contact",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          name:name.trim(),email:email.trim(),message:message.trim(),website,
          token,requestId:crypto.randomUUID(),
        }),
        signal:AbortSignal.timeout(12000),
      });
      const result=await response.json() as {sent?:boolean;error?:string};
      if(response.ok&&result.sent){
        setNotice("Message submitted successfully. Thanks for getting in touch.");
        setName("");setEmail("");setMessage("");setWebsite("");
        const turnstile=(window as Window&{turnstile?:{reset:()=>void}}).turnstile;
        turnstile?.reset();
      }else{
        setNotice(result.error??"Unable to send directly. Use the email link or compose-email fallback.");
      }
    }catch{
      setNotice("Unable to send directly. Use the email link or compose-email fallback.");
    }finally{setSending(false);}
  };

  const copyEmail=async()=>{
    try {await navigator.clipboard.writeText(links.email);setCopied(true);setNotice("Email address copied.");}
    catch {setNotice("Select and copy the email address shown here.");}
  };
  return <section id="contact" className="contact-section" aria-labelledby="contact-title">
    <div className="section-heading contact-heading"><div><span className="eyebrow">04 / CONTACT</span><h2 id="contact-title">Get in touch<span className="period-accent">.</span></h2></div><span className="heading-aside">DIRECT LINE / OPEN</span></div>
    <div className="contact-layout">
      <div className="contact-left">
        <p>For engineering work, projects and collaborations.</p>
        <div className="contact-address"><span>EMAIL</span><div><a href={"mailto:"+links.email}>{links.email}</a><button type="button" onClick={copyEmail} aria-label="Copy email">{copied?<Check size={18}/>:<Copy size={18}/>}</button></div></div>
        <div className="social-links"><a href={links.github} target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight size={17}/></a><a href={links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight size={17}/></a><a href={links.resume} download>Résumé <ArrowUpRight size={17}/></a></div>
      </div>
      <form className="contact-form" onSubmit={onSubmit}>
        <div className="form-top"><span>{directEnabled?"SEND MESSAGE":"COMPOSE MESSAGE"}</span><Mail size={18}/></div>
        <div className="form-row"><label htmlFor="contact-name">Name</label><input id="contact-name" type="text" autoComplete="name" required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></div>
        <div className="form-row"><label htmlFor="contact-email">Email</label><input id="contact-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com"/></div>
        <div className="form-row"><label htmlFor="contact-message">Message</label><textarea id="contact-message" rows={4} minLength={10} maxLength={3000} required value={message} onChange={e=>setMessage(e.target.value)} placeholder="What are you building?"/></div>
        <div className="contact-honeypot" aria-hidden="true"><label htmlFor="contact-website">Website</label><input id="contact-website" type="text" autoComplete="off" tabIndex={-1} value={website} onChange={e=>setWebsite(e.target.value)}/></div>
        {directEnabled&&siteKey&&<div className="contact-verification"><div className="cf-turnstile" data-sitekey={siteKey}/></div>}
        <button type="submit" disabled={sending} className="submit-mail">{sending?"Sending…":directEnabled?"Send message":"Compose email"} <ArrowUpRight size={18}/></button>
        {directEnabled&&<button type="button" className="compose-fallback" onClick={composeMail}>Or open a draft in your email app <ArrowUpRight size={15}/></button>}
        <p className="form-disclaimer">{directEnabled?"Messages are sent securely after verification.":"Opens your email application; nothing is uploaded from this form."}</p>
        {notice&&<p role="status" className="contact-status">{notice}</p>}
      </form>
    </div>
  </section>;
}

