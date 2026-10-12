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
  secret: process.env.SESSION_SECRET || "change-this-secret-before-deploying",
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
  :root{--bg:#f5f5f5;--ink:#171717;--muted:#707070;--accent:#d51f35;--line:#e6e6e6;--white:#fff}
  *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:Inter,Arial,sans-serif}a{color:inherit;text-decoration:none}button,input,textarea,select{font:inherit}
  .top{background:#111;color:#fff;padding:10px 5%;font-size:13px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
  header{background:#fff;border-bottom:1px solid var(--line);position:sticky;top:0;z-index:5}.nav{max-width:1200px;margin:auto;padding:16px 20px;display:flex;align-items:center;gap:22px}.brand{font-weight:950;font-size:20px;letter-spacing:-.8px;white-space:nowrap}.brand b{color:var(--accent)}.search{flex:1}.search input{width:100%;padding:12px 14px;border:1px solid #ddd;border-radius:10px;background:#f7f7f7}.navlinks{display:flex;gap:14px;align-items:center;font-size:14px;font-weight:700}.navlinks a:hover{color:var(--accent)}
  main{max-width:1200px;margin:0 auto;padding:25px 20px 50px}.hero{background:linear-gradient(120deg,#171717,#333);border-radius:20px;color:#fff;padding:38px;display:grid;grid-template-columns:1.3fr .7fr;gap:20px;align-items:center;overflow:hidden}.eyebrow{color:#ffb5bf;font-size:12px;letter-spacing:2px;font-weight:900}.hero h1{font-size:clamp(32px,5vw,54px);line-height:1.02;margin:13px 0}.hero p{color:#ddd;max-width:510px;line-height:1.6}.hero-art{font-size:100px;text-align:center;filter:drop-shadow(0 15px 20px #0007)}.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--accent);color:#fff;border:0;border-radius:10px;padding:12px 17px;font-weight:800;cursor:pointer}.btn:hover{filter:brightness(.94)}.btn.dark{background:#171717}.btn.light{background:#fff;color:#111;border:1px solid #ddd}.btn.small{padding:8px 11px;font-size:13px}.sectionhead{display:flex;align-items:end;justify-content:space-between;gap:12px;margin:28px 0 15px}.sectionhead h2{margin:0;font-size:25px}.muted{color:var(--muted)}.chips{display:flex;gap:8px;flex-wrap:wrap;margin:20px 0}.chip{border:1px solid #ddd;background:#fff;border-radius:30px;padding:8px 13px;font-size:13px;font-weight:700}
  .products{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.product{background:#fff;border:1px solid var(--line);border-radius:15px;overflow:hidden;display:flex;flex-direction:column;min-width:0}.photo{background:#eee;aspect-ratio:4/4.3;position:relative;overflow:hidden}.photo img{width:100%;height:100%;object-fit:cover;display:block}.photo .placeholder{height:100%;display:flex;align-items:center;justify-content:center;font-size:70px;color:#999;background:linear-gradient(135deg,#eee,#ddd)}.tag{position:absolute;left:10px;top:10px;background:#fff;border-radius:7px;padding:5px 8px;font-size:11px;font-weight:900}.productbody{padding:13px;display:flex;flex-direction:column;gap:8px;flex:1}.productbody h3{font-size:15px;margin:0}.price{font-size:18px;font-weight:950}.productfoot{display:flex;gap:7px;margin-top:auto}.productfoot .btn{flex:1}.formbox{max-width:520px;margin:20px auto;background:#fff;border:1px solid var(--line);padding:25px;border-radius:16px}.formbox h1{margin-top:0}.field{display:grid;gap:6px;margin:14px 0}.field label{font-weight:800;font-size:13px}.field input,.field textarea,.field select{padding:12px;border:1px solid #d8d8d8;border-radius:9px;width:100%;background:#fff}.note{background:#fff6df;padding:12px 14px;border-radius:9px;font-size:13px;line-height:1.5}.tablewrap{overflow:auto;background:#fff;border-radius:12px;border:1px solid var(--line)}table{width:100%;border-collapse:collapse;min-width:700px}th,td{text-align:left;padding:12px;border-bottom:1px solid var(--line);font-size:13px}th{background:#fafafa}.inline{display:inline}.danger{background:#a81426}.two{display:grid;grid-template-columns:1fr 1fr;gap:12px}.detail{display:grid;grid-template-columns:1fr 1fr;gap:25px;background:#fff;border-radius:16px;padding:20px}.detail img{width:100%;border-radius:12px;max-height:500px;object-fit:contain;background:#eee}.footer{background:#111;color:#ddd;padding:26px 20px;text-align:center;font-size:13px}.empty{background:#fff;border:1px dashed #ccc;border-radius:14px;padding:35px;text-align:center;grid-column:1/-1}.alert{padding:12px;border-radius:9px;background:#e7f7ed;color:#14532d;margin:12px 0}.error{background:#ffe9eb;color:#8b1020}
  @media(max-width:850px){.products{grid-template-columns:repeat(3,minmax(0,1fr))}.nav{flex-wrap:wrap;gap:12px}.search{order:3;flex-basis:100%}.hero{grid-template-columns:1fr;padding:27px}.hero-art{display:none}}
  @media(max-width:560px){main{padding:16px 12px 35px}.top{padding:9px 12px}.nav{padding:13px 12px}.brand{font-size:18px}.navlinks{margin-left:auto;gap:10px;font-size:12px}.products{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.productbody{padding:10px}.productbody h3{font-size:13px}.price{font-size:16px}.productfoot{flex-direction:column}.hero{border-radius:14px}.hero h1{font-size:34px}.detail,.two{grid-template-columns:1fr}.formbox{padding:18px}}
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
 const content=`<section class="hero"><div><div class="eyebrow">LE STYLE AU QUOTIDIEN</div><h1>Ton style.<br>Ton identité.</h1><p>Découvre nos t-shirts pour homme, choisis ton modèle et finalise ta commande directement sur WhatsApp.</p><a class="btn" href="#catalogue">Découvrir la collection ↓</a></div><div class="hero-art">👕</div></section>
 <div class="chips"><span class="chip">👕 T-shirts homme</span><span class="chip">💸 3 500 – 4 000 FCFA</span><span class="chip">💬 Commande WhatsApp</span></div>
 <div class="sectionhead" id="catalogue"><div><h2>Notre collection</h2><div class="muted">${r.rows.length} article(s) disponible(s)</div></div></div>
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
