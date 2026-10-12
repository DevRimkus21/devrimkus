require("dotenv").config();
const express = require("express");
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost")
    ? { rejectUnauthorized: false } : false
});

app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(express.json({ limit: "2mb" }));
app.use(session({
  store: new PgSession({ pool, tableName: "user_sessions", createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET || (process.env.NODE_ENV === "production" ? (() => { throw new Error("SESSION_SECRET doit être configuré dans Render > Environment") })() : "dev-only-change-me"),
  resave: false, saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

const SHOP = {
  name: "CHRIST ID SHOP",
  whatsapp: (process.env.SHOP_WHATSAPP || "2250768802524").replace(/\D/g, ""),
  location: process.env.SHOP_LOCATION || "Abattoir 1, juste devant l’École des Mines"
};

function esc(v = "") {
  return String(v).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}
function money(n) { return Number(n || 0).toLocaleString("fr-FR") + " FCFA"; }
function layout(title, content, user, active = "") {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#111111"><meta name="description" content="CHRIST ID SHOP — vêtements pour homme. Découvrez les t-shirts et commandez facilement sur WhatsApp.">
  <title>${esc(title)} | ${SHOP.name}</title><style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
  :root{--bg:#f5f3ee;--ink:#171916;--muted:#74776f;--accent:#c8f169;--line:#dedfd7;--white:#fff;--dark:#171916;--radius:4px}
  *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--ink);font-family:'DM Sans',Arial,sans-serif;-webkit-font-smoothing:antialiased}a{color:inherit;text-decoration:none}button,input,textarea,select{font:inherit}button,a{-webkit-tap-highlight-color:transparent}
  .top{background:var(--accent);color:#171916;padding:9px 5%;font-size:10px;letter-spacing:1.1px;text-transform:uppercase;font-weight:800;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
  header{background:rgba(245,243,238,.96);border-bottom:1px solid var(--line);position:sticky;top:0;z-index:5;backdrop-filter:blur(14px)}.nav{max-width:1320px;margin:auto;padding:18px 28px;display:flex;align-items:center;gap:30px}.brand{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:19px;letter-spacing:-1.1px;white-space:nowrap}.brand b{background:var(--accent);padding:2px 5px;margin:0 2px}.search{flex:1;max-width:440px;margin-left:auto}.search input{width:100%;padding:12px 15px;border:1px solid var(--line);border-radius:2px;background:transparent;outline:none;font-size:13px}.search input:focus{border-color:#777}.navlinks{display:flex;gap:20px;align-items:center;font-size:11px;letter-spacing:.8px;text-transform:uppercase;font-weight:800}.navlinks a:hover{opacity:.58}
  main{max-width:1320px;margin:0 auto;padding:28px 28px 78px}.hero{min-height:430px;background:#20231e;color:#fff;padding:clamp(28px,5vw,68px);display:grid;grid-template-columns:1.1fr .9fr;gap:30px;align-items:center;overflow:hidden;position:relative}.hero:after{content:'ID';position:absolute;right:-8px;bottom:-105px;font-family:'Space Grotesk',sans-serif;font-size:clamp(220px,36vw,480px);font-weight:700;letter-spacing:-.12em;color:#ffffff08;line-height:1;pointer-events:none}.eyebrow{color:var(--accent);font-size:10px;letter-spacing:2.5px;text-transform:uppercase;font-weight:800}.hero h1{font-family:'Space Grotesk',sans-serif;font-size:clamp(42px,6vw,82px);letter-spacing:-.075em;line-height:.94;margin:22px 0 20px;max-width:650px}.hero h1 em{font-style:normal;color:var(--accent)}.hero p{color:#c4c8bf;max-width:420px;line-height:1.8;font-size:14px}.hero-art{min-height:260px;display:flex;align-items:center;justify-content:center;position:relative;z-index:1}.hero-art:before{content:'';width:min(29vw,310px);height:min(29vw,310px);min-width:210px;min-height:210px;border-radius:50%;background:var(--accent);position:absolute}.hero-art span{position:relative;z-index:1;font-size:clamp(100px,16vw,205px);filter:grayscale(1);transform:rotate(-9deg);text-shadow:0 20px 25px #0003}.btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;background:var(--accent);color:#171916;border:1px solid var(--accent);border-radius:2px;padding:14px 19px;font-size:11px;letter-spacing:.8px;text-transform:uppercase;font-weight:900;cursor:pointer;transition:transform .18s,background .18s}.btn:hover{transform:translateY(-2px);background:#d7ff87}.btn.dark{background:#171916;color:#fff;border-color:#171916}.btn.light{background:transparent;color:#171916;border:1px solid var(--line)}.btn.small{padding:9px 12px;font-size:10px}.sectionhead{display:flex;align-items:end;justify-content:space-between;gap:12px;margin:48px 0 20px}.sectionhead h2{font-family:'Space Grotesk',sans-serif;letter-spacing:-1.8px;font-size:clamp(26px,4vw,38px);margin:0}.muted{color:var(--muted)}.chips{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0 34px}.chip{border:1px solid var(--line);background:transparent;border-radius:2px;padding:9px 12px;font-size:10px;letter-spacing:.4px;text-transform:uppercase;font-weight:800}
  .products{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}.product{background:#fff;border:1px solid #e9e8e2;border-radius:2px;overflow:hidden;display:flex;flex-direction:column;min-width:0;transition:transform .2s,border-color .2s}.product:hover{transform:translateY(-4px);border-color:#b8b9af}.photo{background:#e8e7e1;aspect-ratio:4/4.7;position:relative;overflow:hidden;display:block}.photo img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s}.product:hover .photo img{transform:scale(1.045)}.photo .placeholder{height:100%;display:flex;align-items:center;justify-content:center;font-size:90px;color:#8d9086;background:linear-gradient(145deg,#e7e7df,#d2d3c9)}.tag{position:absolute;left:10px;top:10px;background:var(--accent);color:#171916;padding:7px 9px;font-size:9px;letter-spacing:.7px;text-transform:uppercase;font-weight:900}.productbody{padding:15px;display:flex;flex-direction:column;gap:10px;flex:1}.productbody h3{font-family:'Space Grotesk',sans-serif;letter-spacing:-.4px;font-size:15px;margin:0}.price{font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;letter-spacing:-.7px}.productfoot{display:flex;gap:7px;margin-top:auto;padding-top:5px}.productfoot .btn{flex:1}.formbox{max-width:540px;margin:28px auto;background:#fff;border:1px solid var(--line);padding:clamp(22px,5vw,38px);border-radius:2px}.formbox h1{font-family:'Space Grotesk',sans-serif;letter-spacing:-1.7px;margin-top:0}.field{display:grid;gap:7px;margin:16px 0}.field label{font-weight:800;font-size:11px;letter-spacing:.6px;text-transform:uppercase}.field input,.field textarea,.field select{padding:13px;border:1px solid var(--line);border-radius:2px;width:100%;background:#fff;outline:none}.field input:focus,.field textarea:focus,.field select:focus{border-color:#7b7f72}.note{background:#f1f6e5;padding:14px 16px;font-size:13px;line-height:1.6}.tablewrap{overflow:auto;background:#fff;border:1px solid var(--line)}table{width:100%;border-collapse:collapse;min-width:700px}th,td{text-align:left;padding:14px;border-bottom:1px solid var(--line);font-size:13px}th{background:#f7f7f2;font-size:10px;letter-spacing:.8px;text-transform:uppercase}.inline{display:inline}.danger{background:#a81426;color:#fff;border-color:#a81426}.two{display:grid;grid-template-columns:1fr 1fr;gap:14px}.detail{display:grid;grid-template-columns:1fr 1fr;gap:clamp(20px,4vw,55px);background:#fff;border:1px solid var(--line);padding:clamp(18px,4vw,42px)}.detail img{width:100%;border-radius:2px;max-height:500px;object-fit:contain;background:#f1f0ea}.footer{background:#20231e;color:#c6c9c0;padding:38px 20px;text-align:center;font-size:12px;line-height:1.9}.footer b{color:#fff;font-family:'Space Grotesk',sans-serif;letter-spacing:1px}.empty{background:#fff;border:1px dashed #c7c9be;padding:42px;text-align:center;grid-column:1/-1}.alert{padding:13px;border-radius:2px;background:#e7f7ed;color:#14532d;margin:12px 0}.error{background:#ffe9eb;color:#8b1020}
  @media(max-width:900px){.products{grid-template-columns:repeat(3,minmax(0,1fr))}.nav{gap:16px;padding:15px 20px}.navlinks{gap:12px}.hero{min-height:360px;padding:34px}.hero-art{min-height:210px}}
  @media(max-width:640px){.top{padding:9px 13px;font-size:9px}.top span:last-child{display:none}.nav{padding:14px 13px;gap:12px;flex-wrap:wrap}.brand{font-size:18px}.search{order:3;flex-basis:100%;max-width:none}.navlinks{margin-left:auto;gap:10px;font-size:9px}.navlinks a:nth-child(3){display:none}main{padding:14px 12px 48px}.hero{grid-template-columns:1fr;min-height:0;padding:30px 23px;gap:0}.hero h1{font-size:clamp(43px,13vw,65px);margin:17px 0}.hero p{font-size:13px}.hero-art{min-height:155px;margin-top:8px}.hero-art:before{width:170px;height:170px;min-width:0;min-height:0}.hero-art span{font-size:120px}.chips{gap:6px;margin:14px 0 25px}.chip{font-size:9px;padding:8px}.sectionhead{margin:34px 0 16px}.products{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.productbody{padding:11px;gap:8px}.productbody h3{font-size:13px}.price{font-size:17px}.productfoot{flex-direction:column}.productfoot .btn{width:100%;padding:11px 7px;font-size:9px}.tag{left:7px;top:7px;padding:6px;font-size:8px}.photo .placeholder{font-size:68px}.detail,.two{grid-template-columns:1fr}.detail{padding:14px;gap:20px}.formbox{padding:21px 17px}.footer{padding:30px 16px}}
  </style></head><body><div class="top"><span>🚚 Commande simple sur WhatsApp</span><span>📍 ${esc(SHOP.location)}</span></div>
  <header><div class="nav"><a class="brand" href="/">CHRIST <b>ID</b> SHOP</a><form class="search" action="/" method="get"><input name="q" value="${esc(new URLSearchParams((typeof window!=="undefined"?window.location.search:"")).get("q") || "")}" placeholder="Rechercher un t-shirt..." aria-label="Rechercher"></form>
  <nav class="navlinks"><a href="/">Boutique</a>${user ? `<a href="/account">Mon compte</a>` : `<a href="/login">Connexion</a>`}${user && user.is_admin ? `<a href="/admin">Admin</a>` : ""}${user ? `<form class="inline" method="post" action="/logout"><button class="btn light small">Sortir</button></form>` : `<a href="/register">Créer un compte</a>`}</nav></div></header>
  <main>${content}</main><footer class="footer"><b>CHRIST ID SHOP</b><p>Style, simplicité et commande rapide.</p><p>📍 ${esc(SHOP.location)} · WhatsApp : +${esc(SHOP.whatsapp)}</p>© ${new Date().getFullYear()} CHRIST ID SHOP</footer></body></html>`;
}
function page(res, title, content, req) { res.send(layout(title, content, req.session.user)); }
function requireLogin(req,res,next){ if(!req.session.user) return res.redirect("/login"); next(); }
function requireAdmin(req,res,next){ if(!req.session.user || !req.session.user.is_admin) return res.status(403).send(layout("Accès refusé",'<div class="formbox"><h1>Accès réservé</h1><p>Cette page est uniquement disponible pour l’administrateur.</p><a class="btn" href="/">Retour à la boutique</a></div>',req.session.user)); next(); }

async function initDb(){
 await pool.query(`CREATE TABLE IF NOT EXISTS users(
  id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL, is_admin BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
 CREATE TABLE IF NOT EXISTS products(
  id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, description TEXT DEFAULT '', price INTEGER NOT NULL CHECK(price > 0),
  front_image TEXT DEFAULT '', back_image TEXT DEFAULT '', category TEXT DEFAULT 'T-shirts',
  stock INTEGER NOT NULL DEFAULT 1 CHECK(stock >= 0), active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
 CREATE TABLE IF NOT EXISTS orders(
  id BIGSERIAL PRIMARY KEY, user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL, customer_phone TEXT NOT NULL, address TEXT NOT NULL DEFAULT '',
  items JSONB NOT NULL, total INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`);
 if(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD){
   const email = (process.env.ADMIN_EMAIL || "admin@christidshop.local").toLowerCase();
   const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
   await pool.query(`INSERT INTO users(name,email,password_hash,is_admin) VALUES($1,$2,$3,TRUE)
    ON CONFLICT(email) DO UPDATE SET name=EXCLUDED.name,password_hash=EXCLUDED.password_hash,is_admin=TRUE`,
    [process.env.ADMIN_USERNAME,email,hash]);
 }
 const count = await pool.query("SELECT COUNT(*)::int AS n FROM products");
 if(count.rows[0].n === 0){
   for(let i=1;i<=25;i++){
    await pool.query("INSERT INTO products(name,description,price,stock) VALUES($1,$2,$3,1)",
      [`T-shirt homme ${String(i).padStart(2,"0")}`,"T-shirt homme. Ajoutez les photos recto et verso depuis l’espace administrateur.",i<=15?3500:4000]);
   }
 }
}
app.get("/", async(req,res,next)=>{try{
 const q=String(req.query.q||"").trim();
 const r=await pool.query("SELECT * FROM products WHERE active=TRUE AND stock>0 AND ($1='' OR name ILIKE $2 OR description ILIKE $2) ORDER BY id", [q,`%${q}%`]);
 const cards=r.rows.map(p=>`<article class="product"><a href="/product/${p.id}" class="photo">${p.front_image?`<img src="${esc(p.front_image)}" alt="${esc(p.name)}" loading="lazy">`:`<div class="placeholder">👕</div>`}<span class="tag">T-SHIRT HOMME</span></a><div class="productbody"><h3><a href="/product/${p.id}">${esc(p.name)}</a></h3><div class="price">${money(p.price)}</div><div class="muted" style="font-size:12px">Recto & verso sur la fiche produit</div><div class="productfoot"><a class="btn" href="/product/${p.id}">Voir l’article</a></div></div></article>`).join("");
 const content=`<section class="hero"><div><div class="eyebrow">CHRIST ID SHOP · EST. 2026</div><h1>WEAR YOUR<br><em>IDENTITY.</em></h1><p>Des pièces sélectionnées pour affirmer ton style. Découvre la collection CHRIST ID SHOP et commande simplement sur WhatsApp.</p><a class="btn" href="#catalogue">Explorer la collection <span aria-hidden="true">↗</span></a></div><div class="hero-art" aria-label="T-shirt de la collection"><span>✳</span></div></section>
 <div class="chips"><span class="chip">01 / T-shirts & essentials</span><span class="chip">Prix dès 3 500 FCFA</span><span class="chip">Commande directe WhatsApp ↗</span></div>
 <div class="sectionhead" id="catalogue"><div><div class="eyebrow" style="color:#555;margin-bottom:9px">CHOISIS TON LOOK</div><h2>La sélection.</h2><div class="muted" style="margin-top:7px;font-size:13px">${r.rows.length} article(s) disponible(s)</div></div><span class="muted" style="font-size:10px;letter-spacing:1px">CHRIST ID / SHOP</span></div>
 <section class="products">${cards||'<div class="empty"><h3>Aucun article trouvé</h3><p>Essaie une autre recherche.</p><a class="btn" href="/">Voir toute la boutique</a></div>'}</section>`;
 page(res,"Boutique",content,req);
 }catch(e){next(e)}});
app.get("/product/:id",async(req,res,next)=>{try{
 const r=await pool.query("SELECT * FROM products WHERE id=$1 AND active=TRUE",[req.params.id]); if(!r.rowCount)return res.status(404).send(layout("Introuvable","<h1>Article introuvable</h1>",req.session.user));
 const p=r.rows[0], pics=[p.front_image,p.back_image].filter(Boolean);
 const images=pics.length?pics.map((src,i)=>`<div><div class="muted" style="margin:8px 0">${i===0?"RECTO":"VERSO"}</div><img src="${esc(src)}" alt="${esc(p.name)} ${i===0?"recto":"verso"}"></div>`).join(""):`<div class="photo"><div class="placeholder">👕</div><p class="muted">Photos à ajouter prochainement</p></div>`;
 const content=`<p><a href="/">← Retour à la boutique</a></p><section class="detail"><div class="two">${images}</div><div><span class="eyebrow">CHRIST ID SHOP</span><h1>${esc(p.name)}</h1><div class="price">${money(p.price)}</div><p>${esc(p.description||"T-shirt homme.")}</p><p class="muted">Disponibilité : ${p.stock>0?"En stock":"Rupture"}</p>
 <form method="post" action="/order"><input type="hidden" name="product_id" value="${p.id}"><div class="field"><label>Quantité</label><input type="number" name="quantity" value="1" min="1" max="${p.stock}" required></div><div class="field"><label>Votre nom</label><input name="customer_name" value="${esc(req.session.user?.name||"")}" required maxlength="100"></div><div class="field"><label>Votre numéro WhatsApp</label><input name="customer_phone" required placeholder="Ex. 07 XX XX XX XX" maxlength="30"></div><div class="field"><label>Lieu de livraison / retrait</label><input name="address" placeholder="Abattoir 1 ou autre lieu" maxlength="250"></div><button class="btn" type="submit">Commander sur WhatsApp</button></form><p class="muted" style="font-size:12px">La commande sera préparée dans WhatsApp pour confirmer la disponibilité et la livraison.</p></div></section>`;
 page(res,p.name,content,req);
 }catch(e){next(e)}});
app.post("/order",async(req,res,next)=>{try{
 const id=Number(req.body.product_id), qty=Math.max(1,Math.min(99,Number(req.body.quantity)||1));
 const r=await pool.query("SELECT * FROM products WHERE id=$1 AND active=TRUE AND stock >= $2",[id,qty]);
 if(!r.rowCount)return res.status(400).send(layout("Commande",'<div class="formbox"><h1>Stock insuffisant</h1><a class="btn" href="/">Retour</a></div>',req.session.user));
 const p=r.rows[0], name=String(req.body.customer_name||"").trim().slice(0,100), phone=String(req.body.customer_phone||"").trim().slice(0,30), address=String(req.body.address||"").trim().slice(0,250);
 if(!name||!phone)return res.status(400).send("Nom et numéro requis.");
 const total=p.price*qty;
 const saved=await pool.query("INSERT INTO orders(user_id,customer_name,customer_phone,address,items,total) VALUES($1,$2,$3,$4,$5,$6) RETURNING id",
 [req.session.user?.id||null,name,phone,address,JSON.stringify([{id:p.id,name:p.name,price:p.price,quantity:qty}]),total]);
 const message=`Bonjour CHRIST ID SHOP ! Je souhaite commander :\n- ${p.name}\n- Quantité : ${qty}\n- Prix unitaire : ${money(p.price)}\n- Total : ${money(total)}\n- Nom : ${name}\n- Mon numéro : ${phone}\n- Livraison/retrait : ${address||"À préciser"}\n- Référence commande : #${saved.rows[0].id}`;
 const wa=`https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(message)}`;
 res.send(layout("Finaliser la commande",`<div class="formbox"><h1>Commande préparée ✅</h1><p>Ton article : <b>${esc(p.name)}</b></p><p>Total : <b>${money(total)}</b></p><p>Appuie sur le bouton pour envoyer la commande à la boutique et confirmer les détails.</p><a class="btn" href="${wa}" target="_blank" rel="noopener">Continuer sur WhatsApp ↗</a><p class="muted" style="font-size:12px">Référence : #${saved.rows[0].id}</p><a href="/" class="btn light">Retour à la boutique</a></div>`,req.session.user));
 }catch(e){next(e)}});
app.get("/register",(req,res)=>page(res,"Créer un compte",`<div class="formbox"><h1>Créer un compte</h1><p class="muted">Retrouve une expérience simple chez CHRIST ID SHOP.</p>${req.query.error?'<div class="alert error">Vérifie les informations ou utilise une autre adresse e-mail.</div>':""}<form method="post" action="/register"><div class="field"><label>Nom complet</label><input name="name" required maxlength="100"></div><div class="field"><label>Adresse e-mail</label><input name="email" type="email" required maxlength="200"></div><div class="field"><label>Mot de passe (8 caractères minimum)</label><input name="password" type="password" required minlength="8"></div><button class="btn">Créer mon compte</button></form><p>Déjà inscrit ? <a href="/login"><b>Se connecter</b></a></p></div>`,req));
app.post("/register",async(req,res,next)=>{try{
 const name=String(req.body.name||"").trim().slice(0,100),email=String(req.body.email||"").trim().toLowerCase(),password=String(req.body.password||"");
 if(!name||!email||password.length<8)return res.redirect("/register?error=1");
 const hash=await bcrypt.hash(password,12);
 const r=await pool.query("INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email,is_admin",[name,email,hash]);
 req.session.user={id:r.rows[0].id,name:r.rows[0].name,email:r.rows[0].email,is_admin:false};res.redirect("/account");
 }catch(e){if(e.code==="23505")return res.redirect("/register?error=1");next(e)}});
app.get("/login",(req,res)=>page(res,"Connexion",`<div class="formbox"><h1>Content de te revoir</h1>${req.query.error?'<div class="alert error">Identifiants incorrects.</div>':""}<form method="post" action="/login"><div class="field"><label>E-mail</label><input type="email" name="email" required></div><div class="field"><label>Mot de passe</label><input type="password" name="password" required></div><button class="btn">Se connecter</button></form><p>Pas encore de compte ? <a href="/register"><b>Créer un compte</b></a></p></div>`,req));
app.post("/login",async(req,res,next)=>{try{
 const email=String(req.body.email||"").trim().toLowerCase(), password=String(req.body.password||"");
 const r=await pool.query("SELECT * FROM users WHERE email=$1",[email]);
 if(!r.rowCount||!await bcrypt.compare(password,r.rows[0].password_hash))return res.redirect("/login?error=1");
 const u=r.rows[0];req.session.regenerate(err=>{if(err)return next(err);req.session.user={id:u.id,name:u.name,email:u.email,is_admin:u.is_admin};res.redirect(u.is_admin?"/admin":"/account")});
 }catch(e){next(e)}});
app.post("/logout",(req,res)=>req.session.destroy(()=>res.redirect("/")));
app.get("/account",requireLogin,async(req,res,next)=>{try{
 const r=await pool.query("SELECT id,total,status,created_at FROM orders WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20",[req.session.user.id]);
 const orders=r.rows.map(o=>`<tr><td>#${o.id}</td><td>${money(o.total)}</td><td>${esc(o.status)}</td><td>${new Date(o.created_at).toLocaleDateString("fr-FR")}</td></tr>`).join("");
 page(res,"Mon compte",`<h1>Bonjour ${esc(req.session.user.name)} 👋</h1><p>Bienvenue dans ton espace client CHRIST ID SHOP.</p><div class="sectionhead"><h2>Mes commandes</h2></div><div class="tablewrap"><table><thead><tr><th>Référence</th><th>Total</th><th>Statut</th><th>Date</th></tr></thead><tbody>${orders||'<tr><td colspan="4">Aucune commande enregistrée avec ce compte pour le moment.</td></tr>'}</tbody></table></div><p><a class="btn" href="/">Continuer mes achats</a></p>`,req);
 }catch(e){next(e)}});
app.get("/admin",requireAdmin,async(req,res,next)=>{try{
 const r=await pool.query("SELECT * FROM products ORDER BY id");
 const rows=r.rows.map(p=>`<tr><td>${p.id}</td><td>${esc(p.name)}</td><td>${money(p.price)}</td><td>${p.stock}</td><td><a href="/admin/edit/${p.id}">Modifier</a></td><td><form method="post" action="/admin/delete/${p.id}" onsubmit="return confirm('Supprimer cet article ?')"><button class="btn small danger">Supprimer</button></form></td></tr>`).join("");
 page(res,"Administration",`<div class="sectionhead"><div><h1>Administration</h1><p class="muted">Seul le compte administrateur peut gérer le catalogue.</p></div><a class="btn" href="/admin/new">+ Ajouter un article</a></div><div class="tablewrap"><table><thead><tr><th>ID</th><th>Article</th><th>Prix</th><th>Stock</th><th>Modifier</th><th>Supprimer</th></tr></thead><tbody>${rows}</tbody></table></div><div class="note" style="margin-top:16px">Les images doivent être des URL directes accessibles publiquement (recto et verso). Pour un déploiement réel, évite les liens temporaires.</div>`,req);
 }catch(e){next(e)}});
function productForm(p={},edit=false){return `<div class="formbox" style="max-width:760px"><h1>${edit?"Modifier":"Ajouter"} un article</h1><form method="post" action="${edit?`/admin/edit/${p.id}`:"/admin/new"}"><div class="two"><div class="field"><label>Nom de l’article</label><input name="name" required maxlength="160" value="${esc(p.name||"")}"></div><div class="field"><label>Prix (FCFA)</label><select name="price"><option value="3500" ${Number(p.price)===3500?"selected":""}>3 500 FCFA</option><option value="4000" ${Number(p.price)===4000?"selected":""}>4 000 FCFA</option></select></div></div><div class="field"><label>Description</label><textarea name="description" rows="3">${esc(p.description||"T-shirt homme")}</textarea></div><div class="two"><div class="field"><label>Photo recto — URL directe</label><input type="url" name="front_image" value="${esc(p.front_image||"")}" placeholder="https://..."></div><div class="field"><label>Photo verso — URL directe</label><input type="url" name="back_image" value="${esc(p.back_image||"")}" placeholder="https://..."></div></div><div class="two"><div class="field"><label>Stock</label><input type="number" min="0" name="stock" value="${p.stock??1}" required></div><div class="field"><label>Catégorie</label><input name="category" value="${esc(p.category||"T-shirts")}" maxlength="80"></div></div><button class="btn">Enregistrer</button> <a class="btn light" href="/admin">Annuler</a></form></div>`}
app.get("/admin/new",requireAdmin,(req,res)=>page(res,"Ajouter un article",productForm(),req));
app.post("/admin/new",requireAdmin,async(req,res,next)=>{try{
 const b=req.body;await pool.query("INSERT INTO products(name,description,price,front_image,back_image,category,stock) VALUES($1,$2,$3,$4,$5,$6,$7)",
 [String(b.name||"").trim().slice(0,160),String(b.description||"").slice(0,2000),[3500,4000].includes(Number(b.price))?Number(b.price):3500,String(b.front_image||"").trim(),String(b.back_image||"").trim(),String(b.category||"T-shirts").slice(0,80),Math.max(0,Number(b.stock)||0)]);
 res.redirect("/admin");
 }catch(e){next(e)}});
app.get("/admin/edit/:id",requireAdmin,async(req,res,next)=>{try{const r=await pool.query("SELECT * FROM products WHERE id=$1",[req.params.id]);if(!r.rowCount)return res.redirect("/admin");page(res,"Modifier un article",productForm(r.rows[0],true),req)}catch(e){next(e)}});
app.post("/admin/edit/:id",requireAdmin,async(req,res,next)=>{try{
 const b=req.body;await pool.query("UPDATE products SET name=$1,description=$2,price=$3,front_image=$4,back_image=$5,category=$6,stock=$7 WHERE id=$8",
 [String(b.name||"").trim().slice(0,160),String(b.description||"").slice(0,2000),[3500,4000].includes(Number(b.price))?Number(b.price):3500,String(b.front_image||"").trim(),String(b.back_image||"").trim(),String(b.category||"T-shirts").slice(0,80),Math.max(0,Number(b.stock)||0),req.params.id]);
 res.redirect("/admin");
 }catch(e){next(e)}});
app.post("/admin/delete/:id",requireAdmin,async(req,res,next)=>{try{await pool.query("DELETE FROM products WHERE id=$1",[req.params.id]);res.redirect("/admin")}catch(e){next(e)}});
app.get("/health",async(req,res)=>{try{await pool.query("SELECT 1");res.json({status:"ok",database:"connected"})}catch(e){res.status(503).json({status:"error",database:"disconnected"})}});
app.use((err,req,res,next)=>{console.error(err);res.status(500).send(layout("Erreur",`<div class="formbox"><h1>Une erreur est survenue</h1><p>Réessaie dans quelques instants.</p><a class="btn" href="/">Retour à l’accueil</a></div>`,req.session.user))});
initDb().then(()=>app.listen(PORT,()=>console.log(`${SHOP.name} listening on ${PORT}`))).catch(err=>{console.error("Database initialization failed:",err);process.exit(1)});
