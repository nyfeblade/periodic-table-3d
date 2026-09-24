(function(){
"use strict";
try{

/* ============================================================
   0. DATA
   ============================================================ */
var RAW = window.__ELEMENTS__ || [];

var CAT_COLORS = {
  "alkali metal":        0x3987e5,
  "alkaline earth metal":0xd95926,
  "transition metal":    0x199e70,
  "post-transition metal":0xc98500,
  "metalloid":           0xd55181,
  "nonmetal":            0x3ecf3e,
  "noble gas":           0x9085e9,
  "lanthanide":          0xc2792c,
  "actinide":            0x29b6cf,
  "unknown":             0x5b5f6b
};
var CAT_LABELS = {
  "alkali metal":"Alkali metal",
  "alkaline earth metal":"Alkaline earth metal",
  "transition metal":"Transition metal",
  "post-transition metal":"Post-transition metal",
  "metalloid":"Metalloid",
  "nonmetal":"Nonmetal (reactive)",
  "noble gas":"Noble gas",
  "lanthanide":"Lanthanide",
  "actinide":"Actinide",
  "unknown":"Unknown"
};
var CAT_ORDER = ["alkali metal","alkaline earth metal","transition metal","post-transition metal",
  "metalloid","nonmetal","noble gas","lanthanide","actinide","unknown"];

var BLOCK_ORDER = { s:0, p:1, d:2, f:3 };
var BLOCK_LABELS = {
  s:"s-block — outermost electron in an s orbital (alkali/alkaline-earth metals, H, He)",
  p:"p-block — outermost electron in a p orbital (most nonmetals & metalloids, post-transition metals)",
  d:"d-block — filling d orbitals (transition metals)",
  f:"f-block — filling f orbitals (lanthanides & actinides)"
};

function normalize(el){
  var raw = el.cat || "unknown";
  var predicted = false;
  var key = raw;
  if(raw.indexOf("unknown") === 0){
    predicted = true;
    if(raw.indexOf("alkaline earth") !== -1) key = "alkaline earth metal";
    else if(raw.indexOf("alkali metal") !== -1) key = "alkali metal";
    else if(raw.indexOf("transition metal") !== -1) key = "transition metal";
    else if(raw.indexOf("post-transition") !== -1) key = "post-transition metal";
    else if(raw.indexOf("metalloid") !== -1) key = "metalloid";
    else if(raw.indexOf("noble gas") !== -1) key = "noble gas";
    else if(raw.indexOf("nonmetal") !== -1) key = "nonmetal";
    else key = "unknown";
  } else if(raw.indexOf("nonmetal") !== -1){
    key = "nonmetal";
  }
  if(!CAT_COLORS.hasOwnProperty(key)) key = "unknown";
  el._catKey = key;
  el._predicted = predicted || el.s === "Uue";
  el._color = CAT_COLORS[key];
  return el;
}
var ELEMENTS = RAW.map(normalize);
var BY_NUM = {};
ELEMENTS.forEach(function(e){ BY_NUM[e.n] = e; });

/* ============================================================
   1. LAYOUT
   ============================================================ */
var UNIT = 1.08;
var DEPTH_UNIT = 2.6;
var GAP_ROW = 0.75; // extra vertical gap before f-block rows

function rowY(ypos){
  var r = ypos <= 7 ? ypos : ypos + GAP_ROW;
  return -(r - 1) * UNIT;
}
function colX(xpos){ return (xpos - 9.5) * UNIT; }
function blockZ(block){ return -(BLOCK_ORDER.hasOwnProperty(block) ? BLOCK_ORDER[block] : 0) * DEPTH_UNIT; }

ELEMENTS.forEach(function(e){
  e._pos = { x: colX(e.x), y: rowY(e.y), z: blockZ(e.blk) };
});

// Link placeholders for the classic "57-71" / "89-103" table cut-outs
var LINKS = [
  { label:"57–71", sub:"Lanthanides", x: colX(3), y: rowY(6), z: blockZ("f")*0 - 0.01, targetY: 9 },
  { label:"89–103", sub:"Actinides",  x: colX(3), y: rowY(7), z: blockZ("f")*0 - 0.01, targetY: 10 }
];

/* ============================================================
   2. THREE.JS SCENE
   ============================================================ */
var container = document.getElementById("scene-container");
var scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05060a, 0.010);

var camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 3000);
camera.position.set(2, 10, 30);

var renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x05060a, 1);
container.appendChild(renderer.domElement);

var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 3;
controls.maxDistance = 140;
controls.target.set(0, -5.6, -3.5);
controls.autoRotate = false;
controls.autoRotateSpeed = 0.5;
controls.update();

// Lights
scene.add(new THREE.AmbientLight(0x8892b0, 0.55));
var key1 = new THREE.PointLight(0xffffff, 1.1, 0, 2); key1.position.set(20, 30, 40); scene.add(key1);
var key2 = new THREE.PointLight(0x5577ff, 0.6, 0, 2); key2.position.set(-30, -10, -20); scene.add(key2);
var key3 = new THREE.PointLight(0xff8855, 0.35, 0, 2); key3.position.set(0, -20, 10); scene.add(key3);

/* ---------- Starfield ---------- */
function buildStars(count, spread, size, color){
  var geo = new THREE.BufferGeometry();
  var pos = new Float32Array(count*3);
  for(var i=0;i<count;i++){
    var r = spread * (0.35 + 0.65*Math.random());
    var theta = Math.random()*Math.PI*2;
    var phi = Math.acos(2*Math.random()-1);
    pos[i*3]   = r*Math.sin(phi)*Math.cos(theta);
    pos[i*3+1] = r*Math.sin(phi)*Math.sin(theta);
    pos[i*3+2] = r*Math.cos(phi);
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  var mat = new THREE.PointsMaterial({ color:color, size:size, sizeAttenuation:true, transparent:true, opacity:0.9 });
  return new THREE.Points(geo, mat);
}
scene.add(buildStars(4500, 500, 1.1, 0xffffff));
scene.add(buildStars(2200, 260, 1.6, 0xbfd6ff));
scene.add(buildStars(900, 140, 2.2, 0xffe3c2));

/* ---------- Nebula glow sprites (procedural canvas, no external assets) ---------- */
function nebulaTexture(hue1, hue2){
  var c = document.createElement("canvas"); c.width = c.height = 256;
  var ctx = c.getContext("2d");
  var g = ctx.createRadialGradient(128,128,0,128,128,128);
  g.addColorStop(0, "hsla("+hue1+",80%,60%,0.55)");
  g.addColorStop(0.4, "hsla("+hue2+",70%,45%,0.28)");
  g.addColorStop(1, "hsla("+hue2+",70%,30%,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0,0,256,256);
  var tex = new THREE.CanvasTexture(c);
  return tex;
}
function addNebula(x,y,z,scale,hue1,hue2){
  var mat = new THREE.SpriteMaterial({ map:nebulaTexture(hue1,hue2), transparent:true, depthWrite:false, blending:THREE.AdditiveBlending });
  var spr = new THREE.Sprite(mat);
  spr.position.set(x,y,z);
  spr.scale.set(scale,scale,1);
  scene.add(spr);
}
addNebula(-60, 20, -220, 220, 230, 260);
addNebula(80, -40, -260, 260, 300, 330);
addNebula(-40, -60, -180, 160, 170, 200);
addNebula(50, 50, -300, 300, 20, 40);

/* ============================================================
   3. ELEMENT TILES
   ============================================================ */
var TILE_W = 0.92, TILE_H = 0.92, TILE_D = 0.20;

function labelTexture(e){
  var c = document.createElement("canvas");
  c.width = 256; c.height = 256;
  var ctx = c.getContext("2d");
  var hex = "#" + e._color.toString(16).padStart(6,"0");

  // background
  ctx.fillStyle = shadeColor(hex, -0.72);
  ctx.fillRect(0,0,256,256);
  ctx.strokeStyle = hex;
  ctx.lineWidth = 8;
  ctx.strokeRect(4,4,248,248);

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.font = "600 26px system-ui, sans-serif";
  ctx.fillText(e.n, 14, 36);

  ctx.textAlign = "center";
  ctx.font = "800 96px system-ui, sans-serif";
  ctx.fillText(e.s, 128, 158);

  ctx.font = "500 22px system-ui, sans-serif";
  ctx.fillStyle = "#dfe3f0";
  wrapText(ctx, e.nm, 128, 192, 232, 24);

  ctx.font = "400 18px system-ui, sans-serif";
  ctx.fillStyle = "#aab0c8";
  ctx.fillText((e.m!=null? e.m.toFixed(3): "—"), 128, 236);

  if(e._predicted){
    ctx.strokeStyle = "#e66767";
    ctx.setLineDash([10,8]);
    ctx.lineWidth = 6;
    ctx.strokeRect(10,10,236,236);
    ctx.setLineDash([]);
  }

  var tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}
function wrapText(ctx, text, x, y, maxWidth, lineHeight){
  var words = text.split(" ");
  var line = "";
  var lines = [];
  for(var n=0;n<words.length;n++){
    var test = line + words[n] + " ";
    if(ctx.measureText(test).width > maxWidth && n>0){
      lines.push(line); line = words[n] + " ";
    } else line = test;
  }
  lines.push(line);
  var startY = y - (lines.length-1)*lineHeight/2;
  lines.forEach(function(l,i){ ctx.fillText(l.trim(), x, startY + i*lineHeight); });
}
function shadeColor(hex, amt){
  var num = parseInt(hex.slice(1),16);
  var r = (num>>16)&255, g=(num>>8)&255, b=num&255;
  r = Math.max(0, Math.min(255, Math.round(r + (amt<0? r*amt : (255-r)*amt))));
  g = Math.max(0, Math.min(255, Math.round(g + (amt<0? g*amt : (255-g)*amt))));
  b = Math.max(0, Math.min(255, Math.round(b + (amt<0? b*amt : (255-b)*amt))));
  return "rgb("+r+","+g+","+b+")";
}

var elementMeshes = [];
var tileGeo = new THREE.BoxGeometry(TILE_W, TILE_H, TILE_D);

ELEMENTS.forEach(function(e){
  var tex = labelTexture(e);
  var faceMat = new THREE.MeshStandardMaterial({ map:tex, emissive:new THREE.Color(e._color), emissiveIntensity:0.28, emissiveMap:tex, roughness:0.55, metalness:0.15 });
  var sideMat = new THREE.MeshStandardMaterial({ color:new THREE.Color(e._color).multiplyScalar(0.35), roughness:0.7 });
  var mats = [sideMat,sideMat,sideMat,sideMat,faceMat,sideMat];
  var mesh = new THREE.Mesh(tileGeo, mats);
  mesh.position.set(e._pos.x, e._pos.y, e._pos.z);
  mesh.userData.element = e;
  mesh.userData.baseY = e._pos.y;
  mesh.userData.baseEmissive = 0.28;
  scene.add(mesh);
  elementMeshes.push(mesh);

  // phase indicator sprite (hidden until toggled)
  var pc = document.createElement("canvas"); pc.width=pc.height=64;
  var pctx = pc.getContext("2d");
  var pmat = new THREE.SpriteMaterial({ map:new THREE.CanvasTexture(pc), transparent:true, depthTest:false });
  var psprite = new THREE.Sprite(pmat);
  psprite.scale.set(0.3,0.3,1);
  psprite.position.set(e._pos.x + 0.34, e._pos.y + 0.34, e._pos.z + TILE_D/2 + 0.05);
  psprite.visible = false;
  scene.add(psprite);
  mesh.userData.phaseSprite = psprite;
  mesh.userData.phaseCanvas = pc;
});

// link placeholder tiles
var linkMeshes = [];
LINKS.forEach(function(L){
  var c = document.createElement("canvas"); c.width=c.height=256;
  var ctx = c.getContext("2d");
  ctx.fillStyle = "#11131c"; ctx.fillRect(0,0,256,256);
  ctx.strokeStyle = "#5b5f6b"; ctx.setLineDash([12,10]); ctx.lineWidth=6;
  ctx.strokeRect(6,6,244,244); ctx.setLineDash([]);
  ctx.fillStyle="#c3c2b7"; ctx.textAlign="center";
  ctx.font="700 34px system-ui, sans-serif"; ctx.fillText(L.label,128,130);
  ctx.font="400 20px system-ui, sans-serif"; ctx.fillText(L.sub,128,164);
  var tex = new THREE.CanvasTexture(c);
  var mat = new THREE.MeshStandardMaterial({ map:tex, roughness:0.8 });
  var side = new THREE.MeshStandardMaterial({ color:0x11131c, roughness:0.9 });
  var mesh = new THREE.Mesh(tileGeo, [side,side,side,side,mat,side]);
  mesh.position.set(L.x, L.y, L.z);
  mesh.userData.link = L;
  scene.add(mesh);
  linkMeshes.push(mesh);
});

/* ============================================================
   4. INTERACTION — hover & click
   ============================================================ */
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var hovered = null;
var tooltip = document.getElementById("tooltip");

function onPointerMove(ev){
  var r = renderer.domElement.getBoundingClientRect();
  mouse.x = ((ev.clientX - r.left)/r.width)*2 - 1;
  mouse.y = -((ev.clientY - r.top)/r.height)*2 + 1;

  raycaster.setFromCamera(mouse, camera);
  var all = elementMeshes.concat(linkMeshes);
  var hits = raycaster.intersectObjects(all);
  var hit = hits.length ? hits[0].object : null;

  if(hovered && hovered !== hit){
    resetHover(hovered);
    hovered = null;
  }
  if(hit && hit !== hovered){
    hovered = hit;
    applyHover(hit);
  }
  if(hit){
    tooltip.style.display = "block";
    tooltip.style.left = ev.clientX + "px";
    tooltip.style.top = ev.clientY + "px";
    if(hit.userData.element){
      var e = hit.userData.element;
      tooltip.innerHTML = "<b>"+e.s+"</b> — "+e.nm+"<div class='tt-cat'>#"+e.n+" · "+CAT_LABELS[e._catKey]+(e._predicted?" · predicted":"")+"</div>";
    } else {
      tooltip.innerHTML = "<b>"+hit.userData.link.label+"</b><div class='tt-cat'>"+hit.userData.link.sub+" — click to view</div>";
    }
  } else {
    tooltip.style.display = "none";
  }
}
function applyHover(mesh){
  mesh.scale.set(1.18,1.18,1.5);
  if(mesh.userData.element) mesh.material[4].emissiveIntensity = 0.75;
  document.body.style.cursor = "pointer";
}
function resetHover(mesh){
  mesh.scale.set(1,1,1);
  if(mesh.userData.element) mesh.material[4].emissiveIntensity = mesh.userData.baseEmissive;
  document.body.style.cursor = "default";
}

function onClick(){
  if(!hovered) return;
  if(hovered.userData.element){
    openElement(hovered.userData.element, true);
  } else if(hovered.userData.link){
    flyToRow(hovered.userData.link.targetY);
  }
}
renderer.domElement.addEventListener("pointermove", onPointerMove);
renderer.domElement.addEventListener("click", onClick);

function flyToRow(ypos){
  var y = rowY(ypos);
  flyCameraTo(new THREE.Vector3(0, y, 4), new THREE.Vector3(0, y, blockZ("f")));
}

/* ============================================================
   5. CAMERA FLIGHT
   ============================================================ */
var flightActive = false;
function flyCameraTo(camPos, targetPos, duration){
  duration = duration || 1100;
  flightActive = true;
  controls.autoRotate = false;
  var startCam = camera.position.clone();
  var startTarget = controls.target.clone();
  var t0 = performance.now();
  function step(now){
    var t = Math.min(1, (now - t0)/duration);
    var k = t<0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2; // easeInOutCubic
    camera.position.lerpVectors(startCam, camPos, k);
    controls.target.lerpVectors(startTarget, targetPos, k);
    controls.update();
    if(t<1) requestAnimationFrame(step); else flightActive = false;
  }
  requestAnimationFrame(step);
}
function defaultView(){
  flyCameraTo(new THREE.Vector3(2,10,30), new THREE.Vector3(0,-5.6,-3.5), 900);
}
document.getElementById("btn-reset").addEventListener("click", defaultView);
document.getElementById("btn-autorotate").addEventListener("click", function(){
  controls.autoRotate = !controls.autoRotate;
  this.classList.toggle("active", controls.autoRotate);
});

/* ============================================================
   6. RESIZE / RENDER LOOP
   ============================================================ */
window.addEventListener("resize", function(){
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

var clock = new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);
  var t = clock.getElapsedTime();
  elementMeshes.forEach(function(m,i){
    if(m !== hovered){
      m.position.y = m.userData.baseY + Math.sin(t*0.6 + i*0.35)*0.015;
    }
  });
  controls.update();
  updateAtomScene();
  renderer.render(scene, camera);
}
animate();

/* ============================================================
   7. LEGEND + FILTERS
   ============================================================ */
var activeCats = new Set(CAT_ORDER);
var legendList = document.getElementById("legend-list");
var counts = {};
ELEMENTS.forEach(function(e){ counts[e._catKey] = (counts[e._catKey]||0)+1; });

CAT_ORDER.filter(function(k){ return counts[k]; }).forEach(function(k){
  var row = document.createElement("div");
  row.className = "legend-row";
  row.innerHTML = "<span class='legend-swatch' style='background:#"+CAT_COLORS[k].toString(16).padStart(6,"0")+"'></span>"+
    "<span>"+CAT_LABELS[k]+"</span><span class='legend-count'>"+counts[k]+"</span>";
  row.addEventListener("click", function(){
    if(activeCats.has(k)) activeCats.delete(k); else activeCats.add(k);
    row.classList.toggle("off", !activeCats.has(k));
    applyFilters();
  });
  legendList.appendChild(row);
});

var depthList = document.getElementById("depthkey-list");
["s","p","d","f"].forEach(function(b){
  var row = document.createElement("div");
  row.style.cssText = "text-align:right;margin-bottom:5px;";
  row.innerHTML = "<b>"+b+"-block</b>";
  row.title = BLOCK_LABELS[b];
  depthList.appendChild(row);
});
depthList.parentElement.title = Object.values(BLOCK_LABELS).join("\n");

var searchInput = document.getElementById("search");
searchInput.addEventListener("input", applyFilters);

function applyFilters(){
  var q = searchInput.value.trim().toLowerCase();
  elementMeshes.forEach(function(m){
    var e = m.userData.element;
    var catOn = activeCats.has(e._catKey);
    var matchesSearch = !q || e.nm.toLowerCase().indexOf(q)!==-1 || e.s.toLowerCase()===q || String(e.n)===q || e.s.toLowerCase().indexOf(q)===0;
    var visible = catOn && matchesSearch;
    var targetOpacity = visible ? 1 : 0.06;
    m.material.forEach(function(mm){ mm.transparent = true; mm.opacity = targetOpacity; });
  });
}

/* ============================================================
   8. TEMPERATURE / PHASE SIMULATION
   ============================================================ */
var tempSlider = document.getElementById("temp-slider");
var tempLabel = document.getElementById("temp-label");
var tempToggleBtn = document.getElementById("temp-toggle");
var phaseOn = false;

function phaseAt(e, tempK){
  if(e.mp == null && e.bp == null) return "unknown";
  if(e.bp != null && tempK >= e.bp) return "gas";
  if(e.mp != null && tempK >= e.mp) return "liquid";
  return "solid";
}
var PHASE_COLORS = { solid:"#3987e5", liquid:"#3ecf3e", gas:"#ffffff", unknown:"#5b5f6b" };
function drawPhaseDot(canvas, phase){
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,64,64);
  ctx.beginPath();
  ctx.arc(32,32,20,0,Math.PI*2);
  ctx.fillStyle = PHASE_COLORS[phase];
  ctx.globalAlpha = phase==="gas" ? (0.5+0.5*Math.sin(performance.now()/200)) : 0.9;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.lineWidth=3; ctx.strokeStyle="rgba(0,0,0,0.4)"; ctx.stroke();
}
function updatePhases(){
  var t = parseFloat(tempSlider.value);
  var c = t - 273.15;
  tempLabel.textContent = t.toFixed(0) + " K · " + c.toFixed(0) + " °C";
  elementMeshes.forEach(function(m){
    var e = m.userData.element;
    var ph = phaseAt(e, t);
    m.userData.phase = ph;
    if(phaseOn){
      drawPhaseDot(m.userData.phaseCanvas, ph);
      m.userData.phaseSprite.material.map.needsUpdate = true;
      m.userData.phaseSprite.visible = true;
    }
  });
}
tempSlider.addEventListener("input", updatePhases);
tempToggleBtn.addEventListener("click", function(){
  phaseOn = !phaseOn;
  tempToggleBtn.classList.toggle("active", phaseOn);
  elementMeshes.forEach(function(m){ m.userData.phaseSprite.visible = phaseOn; });
  updatePhases();
});
updatePhases();

/* ============================================================
   9. DETAIL PANEL + BOHR ATOM MODEL
   ============================================================ */
var panel = document.getElementById("panel");
var panelClose = document.getElementById("panel-close");
var currentElement = null;

function fmt(v, suffix){ return (v===null || v===undefined) ? "—" : (v + (suffix||"")); }
function kToC(k){ return k==null ? null : (k - 273.15); }

function openElement(e, fly){
  currentElement = e;
  document.getElementById("panel-num").textContent = "Element " + e.n;
  document.getElementById("panel-symbol").textContent = e.s;
  document.getElementById("panel-symbol").style.color = "#"+e._color.toString(16).padStart(6,"0");
  document.getElementById("panel-name").textContent = e.nm;
  var catEl = document.getElementById("panel-cat");
  catEl.textContent = CAT_LABELS[e._catKey] + " · " + e.blk + "-block";
  catEl.style.background = "#"+e._color.toString(16).padStart(6,"0")+"33";
  catEl.style.color = "#"+e._color.toString(16).padStart(6,"0");
  var predEl = document.getElementById("panel-predicted");
  if(e._predicted){
    predEl.style.display = "block";
    predEl.textContent = "⚠ Not yet confirmed / synthesized — properties are theoretical predictions (raw category: \""+e.cat+"\").";
  } else predEl.style.display = "none";

  var grid = document.getElementById("panel-grid");
  var mp = e.mp, bp = e.bp;
  var items = [
    ["Atomic mass", fmt(e.m, " u")],
    ["Phase (STP)", fmt(e.ph)],
    ["Period / Group", e.per + " / " + fmt(e.grp)],
    ["Electron config.", fmt(e.ec)],
    ["Electron shells", e.sh ? e.sh.join(", ") : "—"],
    ["Electronegativity", fmt(e.en, " (Pauling)")],
    ["Density", fmt(e.d, " g/cm³")],
    ["Melting point", mp!=null ? mp.toFixed(2)+" K ("+kToC(mp).toFixed(0)+" °C)" : "—"],
    ["Boiling point", bp!=null ? bp.toFixed(2)+" K ("+kToC(bp).toFixed(0)+" °C)" : "—"],
    ["1st ionization energy", fmt(e.ie1, " kJ/mol")],
    ["Electron affinity", fmt(e.ea, " kJ/mol")],
    ["Molar heat capacity", fmt(e.mh, " J/(mol·K)")],
    ["Appearance", fmt(e.ap)],
    ["Discovered by", fmt(e.db)],
    ["Named by", fmt(e.nb)]
  ];
  grid.innerHTML = items.map(function(it){
    return "<div class='data-item'><dt>"+it[0]+"</dt><dd>"+it[1]+"</dd></div>";
  }).join("");

  document.getElementById("panel-summary").textContent = e.sum || "";

  var notesArea = document.getElementById("panel-notes");
  notesArea.value = getElementNote(e.n);

  document.getElementById("atom-shells-label").textContent =
    "Simplified Bohr model — shells: [" + (e.sh? e.sh.join(", ") : "?") + "]  ·  " +
    e.n + "p / " + Math.max(0, Math.round((e.m||e.n) - e.n)) + "n (approx.)";

  panel.classList.add("open");
  initAtomScene(e);

  if(fly){
    var targetPos = new THREE.Vector3(e._pos.x, e._pos.y, e._pos.z);
    var camPos = new THREE.Vector3(e._pos.x*0.4, e._pos.y + 1.2, e._pos.z + 5.5);
    flyCameraTo(camPos, targetPos, 1000);
  }
}
panelClose.addEventListener("click", function(){ panel.classList.remove("open"); currentElement=null; });

var notesSavedEl = document.getElementById("notes-saved");
var notesTimer = null;
document.getElementById("panel-notes").addEventListener("input", function(){
  if(!currentElement) return;
  setElementNote(currentElement.n, this.value);
  notesSavedEl.textContent = "Saved…";
  clearTimeout(notesTimer);
  notesTimer = setTimeout(function(){ notesSavedEl.textContent = ""; }, 1200);
});

/* ---- mini Bohr scene ---- */
var atomScene, atomCamera, atomRenderer, atomGroup;
function initAtomScene(e){
  var canvas = document.getElementById("atom-canvas");
  if(!atomRenderer){
    atomRenderer = new THREE.WebGLRenderer({ canvas:canvas, antialias:true, alpha:true });
    atomScene = new THREE.Scene();
    atomCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    atomScene.add(new THREE.AmbientLight(0xffffff, 0.7));
    var pl = new THREE.PointLight(0xffffff, 1.2); pl.position.set(5,5,8); atomScene.add(pl);
  }
  if(atomGroup) atomScene.remove(atomGroup);
  atomGroup = new THREE.Group();
  atomScene.add(atomGroup);

  var protons = e.n;
  var neutrons = Math.max(0, Math.round((e.m || e.n) - e.n));
  var A = protons + neutrons;
  var nucleusR = 0.16 * Math.cbrt(Math.max(1,A));
  var nucGeo = new THREE.SphereGeometry(nucleusR, 24, 24);
  var nucMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setRGB(0.85, 0.35 + 0.3*(protons/(A||1)), 0.35),
    emissive: 0x552211, emissiveIntensity:0.4, roughness:0.4
  });
  atomGroup.add(new THREE.Mesh(nucGeo, nucMat));

  var shells = e.sh || [];
  var shellGroup = new THREE.Group();
  shells.forEach(function(count, idx){
    var radius = nucleusR + 0.55 + idx*0.5;
    var ringGeo = new THREE.RingGeometry(radius-0.006, radius+0.006, 128);
    var ringMat = new THREE.MeshBasicMaterial({ color:0x5577ff, side:THREE.DoubleSide, transparent:true, opacity:0.35 });
    var ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI/2 + idx*0.18;
    shellGroup.add(ring);

    var eGeo = new THREE.SphereGeometry(0.045, 10, 10);
    var eMat = new THREE.MeshStandardMaterial({ color:0x8fd3ff, emissive:0x2266ff, emissiveIntensity:0.8 });
    var orbitGroup = new THREE.Group();
    orbitGroup.rotation.x = ring.rotation.x;
    orbitGroup.userData.speed = 0.5 / (idx+1) + 0.15;
    for(var i=0;i<count;i++){
      var ang = (i/count)*Math.PI*2;
      var em = new THREE.Mesh(eGeo, eMat);
      em.position.set(Math.cos(ang)*radius, Math.sin(ang)*radius, 0);
      orbitGroup.add(em);
    }
    shellGroup.add(orbitGroup);
    orbitGroup.userData.isOrbit = true;
  });
  atomGroup.add(shellGroup);
  atomGroup.userData.shellGroup = shellGroup;

  var maxR = nucleusR + 0.55 + Math.max(0,shells.length-1)*0.5 + 0.3;
  atomCamera.position.set(0,0, maxR*2.6 + 1);
  atomCamera.lookAt(0,0,0);

  resizeAtomCanvas();
}
function resizeAtomCanvas(){
  if(!atomRenderer) return;
  var wrap = document.getElementById("atom-canvas-wrap");
  var w = wrap.clientWidth, h = wrap.clientHeight;
  atomRenderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  atomRenderer.setSize(w,h,false);
  atomCamera.aspect = w/h;
  atomCamera.updateProjectionMatrix();
}
window.addEventListener("resize", resizeAtomCanvas);
function updateAtomScene(){
  if(!atomRenderer || !panel.classList.contains("open") || !atomGroup) return;
  atomGroup.rotation.y += 0.0035;
  var sg = atomGroup.userData.shellGroup;
  if(sg) sg.children.forEach(function(child){
    if(child.userData.isOrbit) child.rotation.z += child.userData.speed*0.02;
  });
  atomRenderer.render(atomScene, atomCamera);
}

/* ============================================================
   10. NOTES + VERSIONING (localStorage)
   ============================================================ */
var LS_KEY = "periodicTable3D.state.v1";
var LS_VERSIONS = "periodicTable3D.versions.v1";

function loadState(){
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || { elementNotes:{}, generalNotes:"" }; }
  catch(e){ return { elementNotes:{}, generalNotes:"" }; }
}
function saveState(s){ localStorage.setItem(LS_KEY, JSON.stringify(s)); }
var state = loadState();

function getElementNote(n){ return state.elementNotes[n] || ""; }
function setElementNote(n, text){
  state.elementNotes[n] = text;
  saveState(state);
}

var generalNotesArea = document.getElementById("general-notes");
generalNotesArea.value = state.generalNotes || "";
generalNotesArea.addEventListener("input", function(){
  state.generalNotes = this.value;
  saveState(state);
});

function loadVersions(){
  try { return JSON.parse(localStorage.getItem(LS_VERSIONS)) || []; }
  catch(e){ return []; }
}
function saveVersions(v){ localStorage.setItem(LS_VERSIONS, JSON.stringify(v)); }

function renderVersionList(){
  var list = document.getElementById("version-list");
  var versions = loadVersions();
  if(!versions.length){
    list.innerHTML = "<p style='color:var(--text-muted);font-size:12px;'>No saved versions yet.</p>";
    return;
  }
  list.innerHTML = "";
  versions.slice().reverse().forEach(function(v){
    var row = document.createElement("div");
    row.className = "version-row";
    var noteCount = Object.keys(v.elementNotes||{}).filter(function(k){ return (v.elementNotes[k]||"").trim(); }).length;
    row.innerHTML =
      "<div class='vname'>"+escapeHtml(v.name)+"</div>"+
      "<div class='vmeta'>"+new Date(v.savedAt).toLocaleString()+" · "+noteCount+" element note(s)</div>"+
      "<div class='version-actions'>"+
        "<button class='btn small' data-act='load'>Load</button>"+
        "<button class='btn small' data-act='export'>Export</button>"+
        "<button class='btn small' data-act='rename'>Rename</button>"+
        "<button class='btn small danger' data-act='delete'>Delete</button>"+
      "</div>";
    row.querySelector("[data-act=load]").addEventListener("click", function(){
      if(confirm("Load version \""+v.name+"\"? This replaces your current notes (unsaved changes will be lost unless you save a version first).")){
        state = { elementNotes: v.elementNotes||{}, generalNotes: v.generalNotes||"" };
        saveState(state);
        generalNotesArea.value = state.generalNotes;
        if(currentElement) document.getElementById("panel-notes").value = getElementNote(currentElement.n);
        alert("Loaded \""+v.name+"\".");
      }
    });
    row.querySelector("[data-act=export]").addEventListener("click", function(){
      downloadJSON(v, "periodic-table-3d_" + slug(v.name) + ".json");
    });
    row.querySelector("[data-act=rename]").addEventListener("click", function(){
      var name = prompt("New name for this version:", v.name);
      if(name){
        var all = loadVersions();
        var idx = all.findIndex(function(x){ return x.id===v.id; });
        if(idx!==-1){ all[idx].name = name; saveVersions(all); renderVersionList(); }
      }
    });
    row.querySelector("[data-act=delete]").addEventListener("click", function(){
      if(confirm("Delete version \""+v.name+"\"? This cannot be undone.")){
        var all = loadVersions().filter(function(x){ return x.id!==v.id; });
        saveVersions(all); renderVersionList();
      }
    });
    list.appendChild(row);
  });
}
function escapeHtml(s){ var d=document.createElement("div"); d.textContent=s; return d.innerHTML; }
function slug(s){ return s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"") || "version"; }
function downloadJSON(obj, filename){
  var blob = new Blob([JSON.stringify(obj,null,2)], { type:"application/json" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

document.getElementById("btn-save-version").addEventListener("click", function(){
  var name = prompt("Name this version:", "Version " + new Date().toLocaleDateString());
  if(!name) return;
  var versions = loadVersions();
  versions.push({
    id: Date.now()+"-"+Math.random().toString(36).slice(2,8),
    name: name,
    savedAt: new Date().toISOString(),
    elementNotes: JSON.parse(JSON.stringify(state.elementNotes)),
    generalNotes: state.generalNotes
  });
  saveVersions(versions);
  renderVersionList();
});

document.getElementById("import-file").addEventListener("change", function(ev){
  var file = ev.target.files[0];
  if(!file) return;
  var reader = new FileReader();
  reader.onload = function(){
    try{
      var v = JSON.parse(reader.result);
      if(!v.elementNotes && !v.generalNotes) throw new Error("not a version file");
      v.id = Date.now()+"-"+Math.random().toString(36).slice(2,8);
      v.name = v.name || file.name.replace(/\.json$/,"");
      v.savedAt = v.savedAt || new Date().toISOString();
      var versions = loadVersions();
      versions.push(v);
      saveVersions(versions);
      renderVersionList();
      alert("Imported \""+v.name+"\" as a new version.");
    } catch(e){ alert("Couldn't read that file as a Periodic Table 3D version."); }
  };
  reader.readAsText(file);
  ev.target.value = "";
});

/* ============================================================
   11. DRAWERS / INTRO / HELP
   ============================================================ */
function openDrawer(id){ document.getElementById(id).classList.add("open"); if(id==="drawer-versions") renderVersionList(); }
function closeDrawer(id){ document.getElementById(id).classList.remove("open"); }
document.getElementById("btn-notes").addEventListener("click", function(){ openDrawer("drawer-notes"); });
document.getElementById("btn-versions").addEventListener("click", function(){ openDrawer("drawer-versions"); });
document.querySelectorAll(".drawer-close").forEach(function(btn){
  btn.addEventListener("click", function(){ closeDrawer(btn.getAttribute("data-close")); });
});

document.getElementById("intro-start").addEventListener("click", function(){
  document.getElementById("intro").style.display = "none";
});
document.getElementById("help-btn").addEventListener("click", function(){
  document.getElementById("intro").style.display = "flex";
});

if(location.search.indexOf("autostart") !== -1){
  document.getElementById("intro").style.display = "none";
}

document.addEventListener("keydown", function(ev){
  if(ev.key === "Escape"){
    panel.classList.remove("open");
    closeDrawer("drawer-notes");
    closeDrawer("drawer-versions");
  }
});

} catch(err){
  var d = document.createElement("div");
  d.style.cssText = "position:fixed;inset:0;z-index:9999;background:#05060a;color:#fff;display:flex;align-items:center;justify-content:center;text-align:center;flex-direction:column;padding:30px;font-family:system-ui,sans-serif;";
  d.innerHTML = "<h2 style='margin-bottom:8px;'>Couldn't start the 3D scene</h2>"+
    "<p style='color:#c3c2b7;max-width:420px;font-size:14px;line-height:1.5;'>This page needs a browser with WebGL support (recent Chrome, Safari, Firefox or Edge). "+
    "Try updating your browser or enabling hardware acceleration.</p>"+
    "<p style='color:#666;font-size:11px;margin-top:14px;'>"+String(err && err.message || err)+"</p>";
  document.body.appendChild(d);
  console.error(err);
}
})();
