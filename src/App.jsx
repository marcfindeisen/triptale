import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

/* ========== Leaflet CSS dynamisch ========== */
function useLeafletCss() {
  useEffect(() => {
    const id = "leaflet-css";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id; link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
  }, []);
}

/* ========== Icons (Vehicle Choice) ========== */
const carSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="34" height="20" viewBox="0 0 64 38">
  <g fill="#3b82f6">
    <path d="M6 23h4l6-9c1-2 3-3 5-3h18c2 0 4 1 5 3l6 9h4c3 0 6 3 6 6v3c0 1-1 2-2 2h-3a8 8 0 0 1-16 0H27a8 8 0 0 1-16 0H8c-1 0-2-1-2-2v-3c0-3 3-6 6-6Z"/>
    <circle cx="22" cy="32" r="6" fill="#0f172a"/><circle cx="22" cy="32" r="3" fill="#94a3b8"/>
    <circle cx="46" cy="32" r="6" fill="#0f172a"/><circle cx="46" cy="32" r="3" fill="#94a3b8"/>
  </g>
</svg>`);
const planeSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="34" height="20" viewBox="0 0 64 40">
  <path d="M3 23l46-10 3 5-22 8 14 9-3 3-16-7-9 6-4-2 7-8-13-2z" fill="#22d3ee"/>
</svg>`);
function vehicleIcon(kind) {
  const html = kind === "plane"
    ? `<img alt="" src="data:image/svg+xml,${planeSvg}" style="width:34px;height:auto;filter:drop-shadow(0 2px 6px rgba(0,0,0,.45))" />`
    : `<img alt="" src="data:image/svg+xml,${carSvg}" style="width:34px;height:auto;filter:drop-shadow(0 2px 6px rgba(0,0,0,.45))" />`;
  return L.divIcon({ html, className: "car-icon", iconSize: [34, 20], iconAnchor: [17, 10] });
}
const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize:[25,41], iconAnchor:[12,41], popupAnchor:[1,-34], shadowSize:[41,41],
});

/* ========== Utils ========== */
const fmt = (ts)=> new Date(ts).toLocaleString();
function haversine(a,b){const R=6371000,rad=d=>d*Math.PI/180;
  const dLat=rad(b.lat-a.lat), dLng=rad(b.lng-a.lng);
  const x=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLng/2)**2;
  return 2*R*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
}
const distKm = (track)=> (track.length<2?0:track.slice(1).reduce((d,p,i)=>d+haversine(track[i],p),0)/1000);
const KEY="travel-tracker-mvp-v5";
const save=(s)=>localStorage.setItem(KEY,JSON.stringify(s));
const load=()=>{try{const x=localStorage.getItem(KEY);return x?JSON.parse(x):null}catch{return null}};
const fileToDataUrl=(f)=> new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f)});

async function compressImage(file, maxSide=1800){
  const du = await fileToDataUrl(file);
  const img = await new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=du});
  const scale = Math.min(1, maxSide/Math.max(img.width,img.height));
  if(scale===1) return du;
  const c=document.createElement("canvas"); c.width=Math.round(img.width*scale); c.height=Math.round(img.height*scale);
  const ctx=c.getContext("2d"); ctx.drawImage(img,0,0,c.width,c.height);
  return c.toDataURL("image/jpeg", .85);
}

/* ========== Map Size Fix ========== */
function MapAutoFix({ deps=[] }) {
  const map = useMap();
  useEffect(() => {
    const kick = () => map.invalidateSize();
    const t1 = setTimeout(kick, 60);
    const t2 = setTimeout(kick, 300);
    window.addEventListener("resize", kick);
    return () => { clearTimeout(t1); clearTimeout(t2); window.removeEventListener("resize", kick); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return null;
}

/* ========== SafeImg ========== */
function SafeImg({ src, alt, style, onClick }) {
  const [s, setS] = useState(src);
  return (
    <img
      src={s} alt={alt||""} loading="lazy" referrerPolicy="no-referrer"
      onError={()=> setS("https://picsum.photos/seed/fallback"+Math.random()+"/640/420")}
      style={style} onClick={onClick}
    />
  );
}

/* ========== DEMOS (picsum) ========== */
const Demos = {
  "USA – Midwest & Badlands": {
    cover: "https://picsum.photos/seed/chicago-skyline/1600/900",
    waypoints: [
      {name:"Chicago, IL",     lat:41.8781, lng:-87.6298, img:"https://picsum.photos/seed/chicago-river/640/420", note:"Start an der Riverwalk & Deep-Dish Pizza"},
      {name:"Milwaukee, WI",   lat:43.0389, lng:-87.9065, img:"https://picsum.photos/seed/milwaukee-museum/640/420", note:"Calatrava-Wings am Art Museum"},
      {name:"Madison, WI",     lat:43.0731, lng:-89.4012, img:"https://picsum.photos/seed/madison-capitol/640/420", note:"Capitol & Farmers’ Market"},
      {name:"Minneapolis, MN", lat:44.9778, lng:-93.2650, img:"https://picsum.photos/seed/minneapolis-bridge/640/420", note:"Stone Arch Bridge"},
      {name:"Badlands, SD",    lat:43.8554, lng:-102.3397,img:"https://picsum.photos/seed/badlands/640/420", note:"Mondlandschaft bei Sunset"},
      {name:"Mount Rushmore",  lat:43.8791, lng:-103.4591,img:"https://picsum.photos/seed/rushmore/640/420", note:"Ikonische Präsidenten"},
      {name:"Sioux Falls, SD", lat:43.5499, lng:-96.7003, img:"https://picsum.photos/seed/sioux-falls/640/420", note:"Falls Park"},
      {name:"Chicago, IL",     lat:41.8781, lng:-87.6298, img:"https://picsum.photos/seed/chicago-night/640/420", note:"Zurück am Lake Michigan"}
    ]
  },
  "Pacific Coast Highway": {
    cover: "https://picsum.photos/seed/bigsur-cover/1600/900",
    waypoints: [
      {name:"San Francisco", lat:37.7749, lng:-122.4194, img:"https://picsum.photos/seed/sf-ggb/640/420", note:"Golden Gate"},
      {name:"Santa Cruz",    lat:36.9741, lng:-122.0308, img:"https://picsum.photos/seed/santa-cruz/640/420", note:"Boardwalk"},
      {name:"Monterey",      lat:36.6002, lng:-121.8947, img:"https://picsum.photos/seed/monterey/640/420", note:"17-Mile Drive"},
      {name:"Big Sur",       lat:36.2704, lng:-121.8081, img:"https://picsum.photos/seed/bigsur/640/420", note:"Bixby Bridge"},
      {name:"San Simeon",    lat:35.6437, lng:-121.1870, img:"https://picsum.photos/seed/simeon/640/420", note:"Seeelefanten"},
      {name:"Santa Barbara", lat:34.4208, lng:-119.6982, img:"https://picsum.photos/seed/sb/640/420", note:"Spanish vibes"},
      {name:"Los Angeles",   lat:34.0522, lng:-118.2437, img:"https://picsum.photos/seed/la/640/420", note:"Ziel in LA"}
    ]
  }
};

/* ========== Demo-Track / Cues ========== */
function interpolate(a,b,steps=22){
  const out=[]; for(let i=0;i<=steps;i++){ const t=i/steps;
    out.push({ lat:a.lat+(b.lat-a.lat)*t, lng:a.lng+(b.lng-a.lng)*t, ts: Date.now()+i*250 });
  } return out;
}
function buildDemoTrack(waypoints){
  let points=[]; for(let i=1;i<waypoints.length;i++){
    points = points.concat(interpolate(waypoints[i-1], waypoints[i], 28));
  } return points;
}
function buildCues(track, highlights){
  // mappe je Highlight den nächsten Track-Index
  return highlights.map(h=>{
    let bestIdx=0, best=Infinity;
    for(let i=0;i<track.length;i++){
      const d = Math.hypot(track[i].lat-h.lat, track[i].lng-h.lng);
      if(d<best){best=d; bestIdx=i;}
    }
    return { idx: bestIdx, h };
  }).sort((a,b)=>a.idx-b.idx);
}

/* ========== Hintergrund FX (falls schon vorhanden – gern lassen) ========== */
function BackgroundFX(){
  return (
    <div className="bg-layer">
      <div className="bg-layer bg-vignette"></div>
      <div className="bg-layer bg-grid"></div>
      <div className="bg-layer bg-noise"></div>
      <div className="bg-layer bg-blobs">
        <span></span><span></span><span></span>
      </div>
    </div>
  );
}

/* ===================== App ===================== */
export default function App(){
  useLeafletCss();

  const [tab,setTab] = useState("demos");
  const [vehicle,setVehicle] = useState("car");           // "car" | "plane"
  const [title,setTitle] = useState("Meine Reise");
  const [cover,setCover] = useState("");
  const [track,setTrack] = useState([]);
  const [hl,setHl] = useState([]);                       // [{lat,lng,ts,note,photo}]
  const [trackingId,setTrackingId] = useState(null);
  const [note,setNote] = useState("");
  const [photoFile,setPhotoFile] = useState(null);

  // Player
  const [playing,setPlaying] = useState(false);
  const [idx,setIdx] = useState(0);
  const [cues,setCues] = useState([]);                   // [{idx,h}]
  const [hold,setHold] = useState(false);               // 2s Wartezeit an Cue
  const timerRef = useRef(null);

  // Popup direkt über Punkt + Lightbox
  const [popup,setPopup] = useState(null);              // {lat,lng,img,title,text}
  const [lightbox,setLightbox] = useState(null);        // DataURL/URL
 // Install (PWA) & Share
  const [installEvt, setInstallEvt] = useState(null); // merkt sich beforeinstallprompt-Event
  const [shareSupported, setShareSupported] = useState(false);
  const [toastMsg, setToastMsg] = useState(""); // kurzer Hinweis-Toast


  // Load/Save
  useEffect(()=>{ const s=load(); if(s){ setTitle(s.title||"Meine Reise"); setCover(s.cover||""); setTrack(s.track||[]); setHl(s.hl||[]);} },[]);
  useEffect(()=>{ save({title,cover,track,hl}); },[title,cover,track,hl]);
// === INSTALL- & SHARE-HOOKS ===
useEffect(() => {
  // Install-Event abfangen (Chrome/Edge/Android)
  const onBIP = (e) => {
    e.preventDefault();
    setInstallEvt(e); // Button „Installieren“ aktivieren
  };
  window.addEventListener("beforeinstallprompt", onBIP);

  // Bereits installiert? -> ggf. Button ausblenden
  const onInstalled = () => {
    setInstallEvt(null);
    setToastMsg("App wurde installiert 🎉");
    setTimeout(() => setToastMsg(""), 2500);
  };
  window.addEventListener("appinstalled", onInstalled);

  // Share prüfen
  setShareSupported(!!navigator.share);

  return () => {
    window.removeEventListener("beforeinstallprompt", onBIP);
    window.removeEventListener("appinstalled", onInstalled);
  };
}, []);


  // Cues neu berechnen, wenn Track/HL ändern
  useEffect(()=>{
    if(track.length && hl.length){
      setCues(buildCues(track, hl));
      setIdx(0); setPlaying(false); setHold(false); setPopup(null);
    } else { setCues([]); setIdx(0); setPlaying(false); setHold(false); setPopup(null); }
  }, [track, hl]);

  // Auto-Fortschritt
  useEffect(()=>{
    if(!playing || track.length<2){ if(timerRef.current){ clearInterval(timerRef.current); timerRef.current=null; } return; }
    if(timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(()=>{
      setIdx(prev=>{
        if(hold) return prev;                              // hier warten wir 2s am Cue
        const next = prev + 1;
        if(next >= track.length-1){ setPlaying(false); return prev; }
        return next;
      });
    }, 120);
    return ()=>{ if(timerRef.current){ clearInterval(timerRef.current); timerRef.current=null; } };
  }, [playing, track.length, hold]);

  // Bei Index-Wechsel: checke, ob wir auf einem Cue sind → Popup & 2s Pause
  useEffect(()=>{
    if(!cues.length) return;
    const cue = cues.find(c=>c.idx===idx);
    if(!cue) return;
    const { h } = cue;
    setPopup({ lat:h.lat, lng:h.lng, img:h.photo, title:(h.note?.split(" — ")[0]||"Stop"), text:h.note||"" });
    setHold(true);
    const t = setTimeout(()=>{ setHold(false); setPopup(null); }, 2000);
    return ()=> clearTimeout(t);
  }, [idx, cues]);

  const center = useMemo(()=> track.length? [track[0].lat, track[0].lng] : [52.52, 13.405], [track]);
  const km = distKm(track).toFixed(2);
  const carPos = track.length ? [track[Math.min(idx, track.length-1)].lat, track[Math.min(idx, track.length-1)].lng] : null;
  const currentIcon = useMemo(()=> vehicleIcon(vehicle), [vehicle]);

  // Tracking
  const start=()=>{
    if(!navigator.geolocation){ alert("Geolocation wird nicht unterstützt."); return; }
    const id=navigator.geolocation.watchPosition(
      pos=>{ const {latitude:lat,longitude:lng}=pos.coords; setTrack(t=>[...t,{lat,lng,ts:Date.now()}]); },
      err=>alert("Position nicht verfügbar: "+err.message),
      {enableHighAccuracy:true, maximumAge:10000, timeout:20000}
    ); setTrackingId(id);
  };
  const stop=()=>{ if(trackingId!==null) navigator.geolocation.clearWatch(trackingId); setTrackingId(null); };

  async function addHighlight(){
    if(track.length===0){ alert("Kein Trackpunkt – starte Tracking oder lade eine Demo."); return; }
    let photo; if(photoFile){ photo = await compressImage(photoFile, 1600); }
    const last=track[track.length-1];
    setHl(list=>[...list,{lat:last.lat,lng:last.lng,ts:Date.now(),note:note.trim(),photo}]);
    setNote(""); setPhotoFile(null);
  }

  // Export
  function download(name,text,type="application/octet-stream"){
    const blob=new Blob([text],{type}); const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download=name; a.click(); URL.revokeObjectURL(url);
  }
  function toGPX(){
    const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;");
    const trk=track.map(p=>`<trkpt lat="${p.lat}" lon="${p.lng}"><time>${new Date(p.ts).toISOString()}</time></trkpt>`).join("\n");
    const wpt=hl.map(h=>`<wpt lat="${h.lat}" lon="${h.lng}"><name>${esc(h.note||"Highlight")}</name><time>${new Date(h.ts).toISOString()}</time></wpt>`).join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="TravelTracker" xmlns="http://www.topografix.com/GPX/1/1">\n${wpt}\n<trk><name>${esc(title)}</name><trkseg>\n${trk}\n</trkseg></trk>\n</gpx>`;
  }

// === INSTALL & SHARE HANDLER ===
async function handleInstall() {
  if (!installEvt) return;
  try {
    await installEvt.prompt();
    const choice = await installEvt.userChoice;
    if (choice.outcome === "accepted") {
      setToastMsg("Danke! App wird installiert …");
    } else {
      setToastMsg("Installation abgebrochen");
    }
  } catch (e) {
    setToastMsg("Installation nicht möglich");
  } finally {
    setTimeout(() => setToastMsg(""), 2000);
    setInstallEvt(null); // Event kann nur einmal verwendet werden
  }
}

async function handleShare() {
  try {
    const shareData = {
      title: title || "Travel Tracker",
      text: "Meine Reiseroute & Highlights",
      url: window.location.href
    };
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(shareData.url);
      setToastMsg("Link kopiert 📋");
      setTimeout(() => setToastMsg(""), 2000);
    }
  } catch {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToastMsg("Link kopiert 📋");
      setTimeout(() => setToastMsg(""), 2000);
    } catch {
      setToastMsg("Teilen nicht möglich");
      setTimeout(() => setToastMsg(""), 2000);
    }
  }
}


  // Demos laden
  function loadDemo(key){
    const d = Demos[key]; if(!d) return;
    const points = buildDemoTrack(d.waypoints);
    const demoHl = d.waypoints.map(w=>({lat:w.lat,lng:w.lng,ts:Date.now(),note:w.name+" — "+(w.note||""),photo:w.img}));
    setTitle(key); setCover(d.cover); setTrack(points); setHl(demoHl); setTab("my");
  }

  // Player
  const canPlay = track.length > 1;
  const play = ()=> { if(!canPlay) return; setPlaying(true); };
  const pause = ()=> setPlaying(false);
  const reset = ()=> { setPlaying(false); setIdx(0); setPopup(null); setHold(false); };

  // Background FX component (optional)
  function Background() { return <BackgroundFX />; }

  return (
    <div>
      <Background />
      <div className="container">
        {/* Tabs */}
        <div className="tabs">
          <div className={`tab ${tab==="my"?"active":""}`} onClick={()=>setTab("my")}>Meine Reise</div>
          <div className={`tab ${tab==="demos"?"active":""}`} onClick={()=>setTab("demos")}>Beispiele</div>
        </div>

        {/* HERO */}
        <div className="hero card" style={{marginTop:12}}>
          {cover ? <SafeImg src={cover} alt="Cover" style={{width:"100%",height:260,objectFit:"cover"}}/> : <div className="cover" style={{background:"#0e1830"}}/>}
          <div className="overlay"/>
          <div className="title">{title}</div>
        </div>

        {/* Toolbar */}
        <div className="row" style={{justifyContent:"space-between", marginTop:12, boxShadow:"0 10px 30px rgba(18,30,60,.35)"}}>
          <div className="row">
            <span className="badge">PWA • Offline • Story-Export</span>
            <span className="badge">Looks: Glass • Gradient</span>
<button
  className="btn btn-acc"
  onClick={handleInstall}
  disabled={!installEvt}
  title={installEvt ? "Auf diesem Gerät installieren" : "Installieren derzeit nicht verfügbar"}
>
  ⬇️ Installieren
</button>

<button
  className="btn"
  onClick={handleShare}
  title="Link teilen oder kopieren"
>
  🔗 Teilen
</button>

          </div>
          <div className="row">
            {/* Vehicle select */}
            <select className="input" value={vehicle} onChange={e=>setVehicle(e.target.value)} style={{width:140}}>
              <option value="car">🚗 Auto</option>
              <option value="plane">✈️ Flugzeug</option>
            </select>
            <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Reisetitel"/>
            <label className="btn" style={{cursor:"pointer"}}>
              Cover wählen
              <input type="file" accept="image/*" onChange={async e=>{const f=e.target.files?.[0]; if(!f) return; setCover(await compressImage(f, 2000));}} hidden/>
            </label>
            {trackingId===null
              ? <button className="btn btn-acc" onClick={start}>Tracking starten</button>
              : <button className="btn" style={{background:"#7a1f23",borderColor:"#5a171a"}} onClick={stop}>Tracking stoppen</button>}
          </div>
        </div>

        {/* Demos */}
        {tab==="demos" && (
          <section className="card" style={{padding:16, marginTop:12}}>
            <h3 className="section-title">Beispielrouten</h3>
            <div className="grid" style={{gridTemplateColumns:"repeat(3, minmax(0,1fr))"}}>
              {Object.keys(Demos).map(k=>(
                <div key={k} className="card" style={{overflow:"hidden"}}>
                  <SafeImg src={Demos[k].cover} alt={k} style={{width:"100%",height:120,objectFit:"cover"}}/>
                  <div style={{padding:12}}>
                    <div style={{fontWeight:700, marginBottom:8}}>{k}</div>
                    <button className="btn btn-acc" onClick={()=>loadDemo(k)}>Demo laden</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Karte + Player */}
        <section className="card" style={{marginTop:12, overflow:"hidden"}}>
          <div className="mapwrap">
            <MapContainer key={tab==="my" ? "my" : "demos"} center={center} zoom={5} scrollWheelZoom style={{height:"100%",width:"100%"}}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors"/>
              {track.length>0 && <Polyline positions={track.map(p=>[p.lat,p.lng])}/>}
              {hl.map((h,i)=>(
                <Marker key={i} position={[h.lat,h.lng]} icon={defaultIcon}>
                  <Popup>
                    <div style={{maxWidth:240}}>
                      <div style={{fontWeight:700}}>{h.note?.split(" — ")[0] || `Stop ${i+1}`}</div>
                      <div style={{fontSize:12,color:"#9aa4b2"}}>{fmt(h.ts)}</div>
                      {h.photo && <SafeImg src={h.photo} alt="" style={{width:"100%",height:"auto",borderRadius:8,marginTop:6}} onClick={()=>setLightbox(h.photo)}/>}
                      {h.note && <p style={{margin:"6px 0 0 0"}}>{h.note}</p>}
                    </div>
                  </Popup>
                </Marker>
              ))}
              {/* Fahrzeugsymbol */}
              {carPos && <Marker position={carPos} icon={currentIcon} />}
              {/* Gesteuertes Popup direkt über dem Punkt (2s) */}
              {popup && (
                <Popup position={[popup.lat, popup.lng]} autoPan={false} closeButton={false}>
                  <div style={{maxWidth:240}}>
                    <div style={{fontWeight:800, marginBottom:6}}>{popup.title}</div>
                    <SafeImg src={popup.img} alt={popup.title} style={{width:"100%",height:"auto",borderRadius:8}} onClick={()=>setLightbox(popup.img)}/>
                    {popup.text && <div style={{fontSize:12, color:"#9aa4b2", marginTop:6}}>{popup.text}</div>}
                    <div style={{fontSize:11, color:"#9aa4b2", marginTop:6}}>Tippen zum Zoomen</div>
                  </div>
                </Popup>
              )}
              <MapAutoFix deps={[tab, track.length, hl.length, idx]} />
            </MapContainer>
          </div>

          {/* Controls */}
          <div className="statbar">
            <div className="row">
              <div className="kpi">Trackpunkte: <b style={{color:"#cfd6e7",marginLeft:6}}>{track.length}</b></div>
              <div className="kpi">Highlights: <b style={{color:"#cfd6e7",marginLeft:6}}>{hl.length}</b></div>
              <div className="kpi">Distanz: <b style={{color:"#cfd6e7",marginLeft:6}}>{km} km</b></div>
              <div className="kpi">Position: <b style={{color:"#cfd6e7",marginLeft:6}}>{idx}/{Math.max(0, track.length-1)}</b></div>
            </div>
            <div className="row">
              {!playing ? (
                <button className="btn btn-acc" disabled={!track.length} onClick={play}>▶ Tour abspielen</button>
              ) : (
                <button className="btn" onClick={pause}>⏸ Pause</button>
              )}
              <button className="btn" onClick={reset}>↺ Reset</button>
              <div style={{width:10}} />
              <button className="btn" onClick={()=>download(`${title.replace(/\s+/g,"_")}.gpx`, toGPX(), "application/gpx+xml")}>GPX</button>
              <button className="btn" onClick={()=>download(`${title.replace(/\s+/g,"_")}.json`, JSON.stringify({title,cover,track,hl},null,2), "application/json")}>JSON</button>
            </div>
          </div>
        </section>

        {/* Highlight-Editor */}
        <section className="card" style={{marginTop:12,padding:16}}>
          <h3 className="section-title">Highlight hinzufügen</h3>
          <div className="grid" style={{gridTemplateColumns:"2fr 1fr"}}>
            <div>
              <label style={{fontSize:13,color:"var(--muted)"}}>Notiz</label>
              <textarea className="textarea" value={note} onChange={e=>setNote(e.target.value)} placeholder="Was macht diesen Ort besonders?" />
            </div>
            <div>
              <label style={{fontSize:13,color:"var(--muted)"}}>Foto (optional)</label>
              <input type="file" accept="image/*" onChange={e=>setPhotoFile(e.target.files?.[0]||null)} />
              <button className="btn btn-acc" style={{marginTop:10,width:"100%"}} onClick={addHighlight}>Highlight am letzten Standort setzen</button>
              <p style={{fontSize:12,color:"var(--muted)"}}>Fotos bleiben lokal; im Story-Export eingebettet.</p>
            </div>
          </div>
        </section>

        <footer>© {new Date().getFullYear()} Travel Tracker • PWA • Offline • Story-Export</footer>
      </div>

      {/* Lightbox (Zoom) */}
      {lightbox && (
        <div className="lightbox" onClick={()=>setLightbox(null)}>
          <img src={lightbox} alt="" />
        </div>
      )}
{toastMsg && (
  <div className="minitoast card">{toastMsg}</div>
)}

    </div>
  );
}
