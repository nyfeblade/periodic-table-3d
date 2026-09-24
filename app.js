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

function labelTexture(e, neutral){
  var c = document.createElement("canvas");
  c.width = 256; c.height = 256;
  var ctx = c.getContext("2d");
  var hex = neutral ? "#ffffff" : "#" + e._color.toString(16).padStart(6,"0");

  // background
  ctx.fillStyle = neutral ? "#4a4e5a" : shadeColor(hex, -0.72);
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
      if(trendIndex >= 0){
        var tv = hit.userData.trendValue;
        tooltip.innerHTML += "<div class='tt-cat'>" + TRENDS[trendIndex].name + ": " + (tv == null ? "no value (grey)" : fmtSci(tv, 4) + TRENDS[trendIndex].unit) + "</div>";
      }
    } else {
      tooltip.innerHTML = "<b>"+hit.userData.link.label+"</b><div class='tt-cat'>"+hit.userData.link.sub+" — click to view</div>";
    }
  } else {
    tooltip.style.display = "none";
  }
}
function applyHover(mesh){
  mesh.scale.set(1.18,1.18, mesh.userData.trendScaleZ || 1.5);
  if(mesh.userData.element) mesh.material[4].emissiveIntensity = 0.75;
  document.body.style.cursor = "pointer";
}
function resetHover(mesh){
  mesh.scale.set(1,1, mesh.userData.trendScaleZ || 1);
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
    ["Density", e.d==null ? "—" : (e.ph==="Gas" ? e.d+" g/L (gas, 0 °C & 1 atm)" : e.d+" g/cm³")],
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
  orbitalSel.sub = null;
  setOrbitalMode(orbitalMode);
  renderIsotopes(e);
  populateBondSelect(e);

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
  var nucleus = new THREE.Mesh(nucGeo, nucMat);
  atomGroup.add(nucleus);
  atomGroup.userData.nucleus = nucleus;

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
  atomGroup.userData.nucleusR = nucleusR;
  atomGroup.userData.orbitalGroup = null;

  var maxR = nucleusR + 0.55 + Math.max(0,shells.length-1)*0.5 + 0.3;
  atomGroup.userData.maxR = maxR;
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
  if(sg && sg.visible) sg.children.forEach(function(child){
    if(child.userData.isOrbit) child.rotation.z += child.userData.speed*0.02;
  });
  atomRenderer.render(atomScene, atomCamera);
}

/* ---- real hydrogen-like orbital shapes (Z_eff=1, exact node structure) ---- */
var orbitalMode = false;
var orbitalSel = { sub:null, orb:"all" };

// Generalized Laguerre polynomial L_k^alpha(x) via the standard three-term recurrence
function laguerre(k, alpha, x){
  if(k===0) return 1;
  var Lm2 = 1, Lm1 = 1 + alpha - x, Lk = Lm1;
  for(var i=2;i<=k;i++){
    Lk = ((2*i-1+alpha-x)*Lm1 - (i-1+alpha)*Lm2) / i;
    Lm2 = Lm1; Lm1 = Lk;
  }
  return Lk;
}
// Hydrogen radial function R_{n,l}(r), Z=1, r in Bohr radii (unnormalized — only shape matters)
function radialR(n, l, r){
  var rho = 2*r/n;
  return Math.exp(-r/n) * Math.pow(rho, l) * laguerre(n-l-1, 2*l+1, rho);
}
// Real spherical harmonics (unnormalized) on the unit sphere
var ORBITAL_SHAPES = {
  s: [{ name:"s",  f:function(){ return 1; } }],
  p: [{ name:"pz", f:function(x,y,z){ return z; } },
      { name:"px", f:function(x,y,z){ return x; } },
      { name:"py", f:function(x,y,z){ return y; } }],
  d: [{ name:"dz²",    f:function(x,y,z){ return 3*z*z-1; } },
      { name:"dxz",    f:function(x,y,z){ return x*z; } },
      { name:"dyz",    f:function(x,y,z){ return y*z; } },
      { name:"dxy",    f:function(x,y,z){ return x*y; } },
      { name:"dx²−y²", f:function(x,y,z){ return x*x-y*y; } }],
  f: [{ name:"fz³",       f:function(x,y,z){ return z*(5*z*z-3); } },
      { name:"fxz²",      f:function(x,y,z){ return x*(5*z*z-1); } },
      { name:"fyz²",      f:function(x,y,z){ return y*(5*z*z-1); } },
      { name:"fxyz",      f:function(x,y,z){ return x*y*z; } },
      { name:"fz(x²−y²)", f:function(x,y,z){ return z*(x*x-y*y); } },
      { name:"fx(x²−3y²)",f:function(x,y,z){ return x*(x*x-3*y*y); } },
      { name:"fy(3x²−y²)",f:function(x,y,z){ return y*(3*x*x-y*y); } }]
};
var L_LETTER = "spdf";

function expandConfig(ec){
  var subs = [];
  if(!ec) return subs;
  var re = /(\d+)([spdf])(\d+)/g, m;
  while((m = re.exec(ec))) subs.push({ n:parseInt(m[1],10), l:"spdf".indexOf(m[2]), count:parseInt(m[3],10) });
  return subs;
}
// Hund's rule: singly occupy each orbital first, then pair up.
function orbitalOccupancy(l, count){
  var k = 2*l+1, occ = [];
  for(var i=0;i<k;i++) occ.push(Math.min(2, (count > i ? 1 : 0) + (count - k > i ? 1 : 0)));
  return occ;
}
function radialCutoff(n, l){
  var rMax = n*n*8, steps = 3000, cum = [], total = 0;
  for(var i=0;i<=steps;i++){
    var r = rMax*i/steps, R = radialR(n,l,r);
    total += r*r*R*R; cum.push(total);
  }
  for(var j=0;j<=steps;j++) if(cum[j] >= 0.995*total) return rMax*j/steps;
  return rMax;
}
function sampleOrbital(n, l, shapeFn, count){
  var rCut = radialCutoff(n, l);
  var radMax = 0, angMax = 0, i;
  for(i=0;i<=400;i++){ var rr = rCut*i/400, RR = radialR(n,l,rr); radMax = Math.max(radMax, rr*rr*RR*RR); }
  for(i=0;i<6000;i++){
    var u0 = Math.random()*2-1, s0 = Math.sqrt(1-u0*u0), p0 = Math.random()*Math.PI*2;
    var a0 = shapeFn(s0*Math.cos(p0), s0*Math.sin(p0), u0); angMax = Math.max(angMax, a0*a0);
  }
  radMax *= 1.1; angMax *= 1.1;
  var pts = [], signs = [], tries = 0;
  while(pts.length < count && tries < count*2000){
    tries++;
    var r = Math.random()*rCut, R = radialR(n,l,r);
    if(Math.random()*radMax > r*r*R*R) continue;
    var u = Math.random()*2-1, s = Math.sqrt(1-u*u), ph = Math.random()*Math.PI*2;
    var x = s*Math.cos(ph), y = s*Math.sin(ph), z = u;
    var A = shapeFn(x,y,z);
    if(Math.random()*angMax > A*A) continue;
    pts.push(x*r/rCut, z*r/rCut, -y*r/rCut); // rotate so the z-axis points up
    signs.push(R*A >= 0 ? 1 : -1);
  }
  return { pts:pts, signs:signs };
}

function buildOrbitalCloud(e){
  if(!atomGroup) return;
  if(atomGroup.userData.orbitalGroup) atomGroup.remove(atomGroup.userData.orbitalGroup);
  var group = new THREE.Group();
  atomGroup.userData.orbitalGroup = group;
  atomGroup.add(group);
  var subs = expandConfig(e.ec);
  var controls = document.getElementById("orbital-controls");
  if(!subs.length){ controls.innerHTML = ""; return; }
  if(orbitalSel.sub == null || orbitalSel.sub >= subs.length){
    var best = 0;
    subs.forEach(function(s, i){ if(s.l >= subs[best].l) best = i; });
    orbitalSel.sub = best; orbitalSel.orb = 0;
  }
  var sub = subs[orbitalSel.sub];
  var shapes = ORBITAL_SHAPES[L_LETTER[sub.l]];
  var occ = orbitalOccupancy(sub.l, sub.count);
  var drawIdx = orbitalSel.orb === "all"
    ? occ.map(function(o,i){ return o > 0 ? i : -1; }).filter(function(i){ return i >= 0; })
    : [orbitalSel.orb];

  var TOTAL_POINTS = 8000, DISPLAY_R = 1.8;
  var pos = [], col = [];
  var cPlus = new THREE.Color(0x3987e5), cMinus = new THREE.Color(0xf0a030);
  drawIdx.forEach(function(oi){
    var smp = sampleOrbital(sub.n, sub.l, shapes[oi].f, Math.round(TOTAL_POINTS / drawIdx.length));
    for(var i=0;i<smp.signs.length;i++){
      pos.push(smp.pts[i*3]*DISPLAY_R, smp.pts[i*3+1]*DISPLAY_R, smp.pts[i*3+2]*DISPLAY_R);
      var c = smp.signs[i] > 0 ? cPlus : cMinus;
      col.push(c.r, c.g, c.b);
    }
  });
  var geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  group.add(new THREE.Points(geo, new THREE.PointsMaterial({
    size:0.035, vertexColors:true, transparent:true, opacity:0.75, depthWrite:false, blending:THREE.AdditiveBlending
  })));
  var dot = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), new THREE.MeshBasicMaterial({ color:0xffffff }));
  group.add(dot);

  group.position.y = -0.1;
  atomCamera.position.set(0, 1.2, 5.6);
  atomCamera.lookAt(0,0,0);

  var subLabel = function(s){ return s.n + L_LETTER[s.l] + sup(s.count); };
  controls.innerHTML =
    subs.map(function(s, i){ return "<button class='orb-chip" + (i===orbitalSel.sub ? " active" : "") + "' data-sub='" + i + "'>" + subLabel(s) + "</button>"; }).join("") +
    "<br>" +
    (shapes.length > 1 ? "<button class='orb-chip" + (orbitalSel.orb==="all" ? " active" : "") + "' data-orb='all'>occupied</button>" : "") +
    shapes.map(function(sh, i){
      return shapes.length > 1 ? "<button class='orb-chip" + (orbitalSel.orb===i ? " active" : "") + "' data-orb='" + i + "' title='" + occ[i] + " electron(s) in this orbital'>" + sh.name + (occ[i] ? "" : " ∅") + "</button>" : "";
    }).join("");
  controls.querySelectorAll("[data-sub]").forEach(function(b){
    b.addEventListener("click", function(){ orbitalSel.sub = parseInt(b.getAttribute("data-sub"),10); orbitalSel.orb = 0; buildOrbitalCloud(e); });
  });
  controls.querySelectorAll("[data-orb]").forEach(function(b){
    b.addEventListener("click", function(){ var v = b.getAttribute("data-orb"); orbitalSel.orb = v === "all" ? "all" : parseInt(v,10); buildOrbitalCloud(e); });
  });
  document.getElementById("atom-shells-label").textContent =
    sub.n + L_LETTER[sub.l] + " subshell (" + sub.count + " e⁻) — hydrogen-like ψ: exact shape & nodes, size normalized. Blue/orange = +/− sign of ψ.";
}

function setOrbitalMode(on){
  orbitalMode = on;
  document.getElementById("btn-orbital-toggle").textContent = on ? "Show Bohr model" : "Show orbitals";
  document.getElementById("orbital-controls").style.display = on ? "block" : "none";
  if(!atomGroup || !currentElement) return;
  atomGroup.userData.shellGroup.visible = !on;
  atomGroup.userData.nucleus.visible = !on;
  if(on){
    buildOrbitalCloud(currentElement);
  } else {
    if(atomGroup.userData.orbitalGroup) atomGroup.userData.orbitalGroup.visible = false;
    atomCamera.position.set(0,0, atomGroup.userData.maxR*2.6 + 1);
    atomCamera.lookAt(0,0,0);
    var e = currentElement;
    document.getElementById("atom-shells-label").textContent =
      "Simplified Bohr model — shells: [" + (e.sh? e.sh.join(", ") : "?") + "]  ·  " +
      e.n + "p / " + Math.max(0, Math.round((e.m||e.n) - e.n)) + "n (approx.)";
  }
}
document.getElementById("btn-orbital-toggle").addEventListener("click", function(){ setOrbitalMode(!orbitalMode); });


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
   12. NUCLIDE HELPERS (IAEA Live Chart of Nuclides data)
   ============================================================ */
var ISOTOPES = window.__ISOTOPES__ || {};
var DECAY_CHAINS = window.__DECAY_CHAINS__ || {};
var CHEM_REACTIONS = window.__CHEM_REACTIONS__ || [];
var NUCLEAR_PRESETS = window.__NUCLEAR_PRESETS__ || [];
var BY_SYM = {};
ELEMENTS.forEach(function(e){ BY_SYM[e.s] = e; });

var NEUTRON_ME_KEV = 8071.3171;
var KEV_PER_U = 931494.10242;
var U_KG = 1.66053906660e-27;
var MEV_J = 1.602176634e-13;
var AVOGADRO = 6.02214076e23;

var SUP_DIGITS = { "0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹","-":"⁻" };
function sup(n){ return String(n).split("").map(function(c){ return SUP_DIGITS[c] || c; }).join(""); }
function symOf(z){ return z===0 ? "n" : (BY_NUM[z] ? BY_NUM[z].s : "Z"+z); }
function nuclideLabel(z, a){ return z===0 && a===1 ? "n" : sup(a) + symOf(z); }
function findIso(z, a){
  var list = ISOTOPES[String(z)] || [];
  for(var i=0;i<list.length;i++) if(list[i].a === a) return list[i];
  return null;
}
function massExcessKeV(z, a){
  if(z===0 && a===1) return NEUTRON_ME_KEV;
  var iso = findIso(z, a);
  return iso ? iso.me : undefined;
}
function atomicMassU(z, a){
  var me = massExcessKeV(z, a);
  return me == null ? null : a + me / KEV_PER_U;
}

function fmtSci(x, digits){
  digits = digits || 3;
  if(x === 0) return "0";
  var ax = Math.abs(x);
  if(ax >= 1e-2 && ax < 1e5) return Number(x.toPrecision(digits)).toLocaleString("en-US", { maximumFractionDigits: 6 });
  var exp = Math.floor(Math.log10(ax));
  var mant = x / Math.pow(10, exp);
  if(Math.abs(mant) >= 9.995){ mant /= 10; exp += 1; }
  return mant.toFixed(digits-1) + " × 10" + sup(exp);
}
var TIME_UNITS = [["y",31557600],["d",86400],["h",3600],["min",60],["s",1],["ms",1e-3],["µs",1e-6],["ns",1e-9],["ps",1e-12],["fs",1e-15],["as",1e-18],["zs",1e-21],["ys",1e-24]];
function fmtDuration(s){
  if(s == null || !isFinite(s)) return "—";
  if(s === 0) return "0 s";
  for(var i=0;i<TIME_UNITS.length;i++){
    if(s >= TIME_UNITS[i][1] || i === TIME_UNITS.length-1){
      return fmtSci(s / TIME_UNITS[i][1], 3) + " " + TIME_UNITS[i][0];
    }
  }
}

var MODE_SHORT = {
  "A":"α","B-":"β⁻","B+":"β⁺","EC":"EC","EC+B+":"EC/β⁺","IT":"IT","SF":"SF","P":"p","2P":"2p","N":"n","2N":"2n",
  "2B-":"2β⁻","2EC":"2EC","2B+":"2β⁺","B-N":"β⁻n","B-2N":"β⁻2n","B-3N":"β⁻3n","B-4N":"β⁻4n","B-5N":"β⁻5n","B-6N":"β⁻6n","B-7N":"β⁻7n",
  "B-A":"β⁻α","B-P":"β⁻p","B-SF":"β⁻SF","ECP":"ECp","B+P":"β⁺p","EC2P":"EC2p","B+2P":"β⁺2p","ECA":"ECα","B+A":"β⁺α","ECSF":"EC-SF",
  "14C":"¹⁴C","24NE":"²⁴Ne","34SI":"³⁴Si","Mg":"Mg"
};
var MODE_LONG = {
  "14C":"carbon-14 cluster emission","24NE":"neon-24 cluster emission","34SI":"silicon-34 cluster emission","Mg":"magnesium cluster emission",
  "B-4N":"beta- delayed 4-neutron","B-5N":"beta- delayed 5-neutron","B-6N":"beta- delayed 6-neutron","B-7N":"beta- delayed 7-neutron",
  "ECSF":"EC delayed fission","B-SF":"beta- delayed fission","EC+B+":"electron capture / beta-plus","SF+EC+B+":"fission or EC/beta-plus"
};
// [ΔZ, ΔA] from parent to the residual (daughter) nucleus
var MODE_DAUGHTER = {
  "A":[-2,-4],"B-":[1,0],"B+":[-1,0],"EC":[-1,0],"EC+B+":[-1,0],"IT":[0,0],"P":[-1,-1],"2P":[-2,-2],"N":[0,-1],"2N":[0,-2],
  "2B-":[2,0],"2EC":[-2,0],"2B+":[-2,0],"B-N":[1,-1],"B-2N":[1,-2],"B-3N":[1,-3],"B-4N":[1,-4],"B-5N":[1,-5],"B-6N":[1,-6],"B-7N":[1,-7],
  "B-A":[-1,-4],"B-P":[0,-1],"ECP":[-2,-1],"B+P":[-2,-1],"EC2P":[-3,-2],"B+2P":[-3,-2],"ECA":[-3,-4],"B+A":[-3,-4],
  "14C":[-6,-14],"24NE":[-10,-24],"34SI":[-14,-34]
};
function modeShort(m){ return MODE_SHORT[m] || m; }
function modeLong(d){ return MODE_LONG[d.mode] || d.label || d.mode; }
function daughterLabel(z, a, mode){
  if(/SF/.test(mode)) return "fission fragments";
  var d = MODE_DAUGHTER[mode];
  if(!d) return null;
  return nuclideLabel(z + d[0], a + d[1]);
}
// A listed branch with 0 or no percentage means "observed/expected but not quantified".
function pctText(p){ return !p ? "?%" : (p >= 0.01 ? Number(p.toPrecision(4)) + "%" : fmtSci(p, 2) + "%"); }

// Branch weights. IAEA/NUBASE convention: delayed-particle branches (e.g. β⁻n) are
// already included in their parent branch (β⁻), so subtract them to get exclusive weights.
function delayedParent(mode, present){
  if(mode !== "B-" && /^B-./.test(mode)) return present["B-"] ? "B-" : null;
  if(/^(EC|B\+)./.test(mode) && mode !== "EC+B+"){
    if(present["EC+B+"]) return "EC+B+";
    if(present["EC"] && mode.indexOf("EC")===0) return "EC";
    if(present["B+"] && mode.indexOf("B+")===0) return "B+";
  }
  return null;
}
function branchWeights(decays){
  var present = {};
  decays.forEach(function(d){ present[d.mode] = true; });
  var w = decays.map(function(d){ return typeof d.pct === "number" ? d.pct : 0; });
  decays.forEach(function(d, i){
    var p = delayedParent(d.mode, present);
    if(p && typeof d.pct === "number"){
      var pi = decays.findIndex(function(x){ return x.mode === p; });
      w[pi] = Math.max(0, w[pi] - d.pct);
    }
  });
  var total = w.reduce(function(s,x){ return s+x; }, 0);
  return { weights: w, total: total };
}

/* ============================================================
   13. ISOTOPE EXPLORER (in the element panel)
   ============================================================ */
function renderIsotopes(e){
  var list = (ISOTOPES[String(e.n)] || []).slice().sort(function(x,y){ return x.a - y.a; });
  var box = document.getElementById("isotope-list");
  var stableCount = list.filter(function(i){ return i.stable; }).length;
  document.getElementById("isotope-count").textContent = list.length
    ? "(" + list.length + " known · " + stableCount + " stable)" : "";
  if(!list.length){
    box.innerHTML = "<div class='iso-row' style='color:var(--text-muted)'>No isotope data — this element hasn't been synthesized.</div>";
    return;
  }
  box.innerHTML = "";
  list.forEach(function(iso){
    var row = document.createElement("div");
    row.className = "iso-row";
    var hl = iso.stable ? "<span class='iso-stable'>stable</span>" : escapeHtml(iso.hl_s ? fmtDuration(iso.hl_s) : (iso.hl_txt || "unknown"));
    var decay = iso.decay.map(function(d){
      var dl = daughterLabel(e.n, iso.a, d.mode);
      return modeShort(d.mode) + " " + pctText(d.pct) + (dl && d.mode.indexOf("SF")===-1 ? " → " + dl : "");
    }).join(", ");
    var decayTitle = iso.decay.map(function(d){ return modeLong(d) + " " + pctText(d.pct); }).join("; ");
    row.innerHTML =
      "<span class='iso-mass'>" + escapeHtml(e.s + "-" + iso.a) + "</span>" +
      "<span class='iso-hl'>" + hl + "</span>" +
      "<span class='iso-decay' title='" + escapeHtml(decayTitle) + "'>" + escapeHtml(decay) + "</span>" +
      "<span class='iso-abund'>" + (iso.abund != null ? Number(iso.abund.toPrecision(4)) + "%" : "") + "</span>";
    if(!iso.stable && iso.hl_s && iso.decay.length){
      var btn = document.createElement("button");
      btn.className = "iso-sim-btn";
      btn.textContent = "Simulate";
      btn.title = "Monte Carlo simulation of this isotope's radioactive decay";
      btn.addEventListener("click", function(){ openDecaySim(e, iso); });
      row.appendChild(btn);
    }
    if(iso.abund != null || iso.stable) row.classList.add("iso-natural");
    row.setAttribute("data-a", iso.a);
    box.appendChild(row);
  });
  var focusRow = box.querySelector("[data-a='" + defaultMassNumber(e.n) + "']");
  box.scrollTop = focusRow ? Math.max(0, focusRow.offsetTop - box.offsetTop - 30) : 0;
}

/* ============================================================
   14. RADIOACTIVE DECAY MONTE CARLO SIMULATOR
   ============================================================ */
var decayModal = document.getElementById("decay-modal");
var decayCanvas = document.getElementById("decay-canvas");
var decayCtx = decayCanvas.getContext("2d");
var decayRunId = 0;
var decaySimTarget = null;
var BRANCH_COLORS = ["#e66767","#3ecf3e","#c98500","#9085e9","#d55181","#29b6cf","#ffffff"];

function openDecaySim(e, iso){
  decaySimTarget = { e:e, iso:iso };
  decayRunId++;
  var lambda = Math.LN2 / iso.hl_s;
  document.getElementById("decay-modal-title").textContent =
    "Decay of " + nuclideLabel(e.n, iso.a) + " (" + e.nm + "-" + iso.a + ") — half-life " + fmtDuration(iso.hl_s);
  var bw = branchWeights(iso.decay);
  var unknownBranching = bw.total <= 0;
  document.getElementById("decay-modal-note").innerHTML =
    "Every nucleus has the same fixed chance per unit time of decaying: λ = ln 2 / t½ = " + fmtSci(lambda, 3) + " s⁻¹. " +
    "Which nucleus decays, and when, is truly random — this is a real Monte Carlo simulation of that process. " +
    "Time is compressed so 5 half-lives play out in a few seconds; the dashed line is the exact expectation N₀·2<sup>−t/t½</sup>. " +
    (unknownBranching
      ? "Branching ratios for this nuclide haven't been measured, so every decay is shown as its first listed mode (" + escapeHtml(modeLong(iso.decay[0])) + ")."
      : "Decay branches are chosen with the IAEA's measured branching ratios.");
  decayModal.classList.add("open");
  drawDecayFrame(null);
  document.getElementById("decay-modal-stats").innerHTML = "";
}
function closeDecayModal(){ decayRunId++; decayModal.classList.remove("open"); }
document.getElementById("decay-modal-close").addEventListener("click", closeDecayModal);
decayModal.addEventListener("click", function(ev){ if(ev.target === decayModal) closeDecayModal(); });
document.getElementById("decay-start").addEventListener("click", function(){ if(decaySimTarget) runDecaySim(); });

function runDecaySim(){
  var runId = ++decayRunId;
  var e = decaySimTarget.e, iso = decaySimTarget.iso;
  var N0 = Math.max(10, Math.min(5000, parseInt(document.getElementById("decay-n").value, 10) || 500));
  document.getElementById("decay-n").value = N0;
  var T = iso.hl_s;
  var bw = branchWeights(iso.decay);
  var weights = bw.total > 0 ? bw.weights : iso.decay.map(function(_, i){ return i===0 ? 1 : 0; });
  var total = weights.reduce(function(s,x){ return s+x; }, 0);
  var FRAMES = 300, HALF_LIVES = 5;
  var pDecay = 1 - Math.pow(2, -HALF_LIVES / FRAMES);
  var state = new Int16Array(N0).fill(-1);
  var remaining = N0;
  var branchCounts = weights.map(function(){ return 0; });
  var history = [[0, N0]];
  var frame = 0;

  function pickBranch(){
    var r = Math.random() * total;
    for(var i=0;i<weights.length;i++){ r -= weights[i]; if(r < 0) return i; }
    return weights.length - 1;
  }
  function step(){
    if(runId !== decayRunId) return;
    frame++;
    for(var i=0;i<N0;i++){
      if(state[i] === -1 && Math.random() < pDecay){
        var b = pickBranch();
        state[i] = b; branchCounts[b]++; remaining--;
      }
    }
    var tHalfLives = frame * HALF_LIVES / FRAMES;
    history.push([tHalfLives, remaining]);
    drawDecayFrame({ N0:N0, state:state, history:history });
    var expected = N0 * Math.pow(2, -tHalfLives);
    var legend = iso.decay.map(function(d, i){
      if(!branchCounts[i] && !weights[i]) return "";
      var dl = daughterLabel(e.n, iso.a, d.mode);
      return "<span style='color:" + BRANCH_COLORS[i % BRANCH_COLORS.length] + "'>■</span> " +
        escapeHtml(modeShort(d.mode) + (dl ? " → " + dl : "")) + ": " + branchCounts[i];
    }).filter(Boolean).join(" &nbsp; ");
    document.getElementById("decay-modal-stats").innerHTML =
      "<div>Elapsed: " + fmtDuration(tHalfLives * T) + " (" + tHalfLives.toFixed(2) + " t½)<br>" + legend + "</div>" +
      "<div style='text-align:right'>Undecayed: <b>" + remaining + "</b> / " + N0 + "<br>Expected: " + expected.toFixed(1) + "</div>";
    if(frame < FRAMES && remaining > 0) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function drawDecayFrame(sim){
  var W = decayCanvas.width, H = decayCanvas.height, ctx = decayCtx;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = "#05060a"; ctx.fillRect(0,0,W,H);
  // left: nuclei grid
  var gx = 10, gy = 10, gw = 220, gh = 280;
  if(sim){
    var cols = Math.ceil(Math.sqrt(sim.N0 * gw / gh));
    var rows = Math.ceil(sim.N0 / cols);
    var cell = Math.min(gw / cols, gh / rows);
    var sz = Math.max(1, cell * 0.78);
    for(var i=0;i<sim.N0;i++){
      var s = sim.state[i];
      ctx.fillStyle = s === -1 ? "#8fd3ff" : BRANCH_COLORS[s % BRANCH_COLORS.length];
      ctx.globalAlpha = s === -1 ? 1 : 0.55;
      ctx.fillRect(gx + (i % cols) * cell, gy + Math.floor(i / cols) * cell, sz, sz);
    }
    ctx.globalAlpha = 1;
  } else {
    ctx.fillStyle = "#898781"; ctx.font = "12px system-ui, sans-serif"; ctx.textAlign = "center";
    ctx.fillText("Press ▶ Run simulation", gx + gw/2, gy + gh/2);
  }
  // right: N(t) plot
  var px = 262, py = 16, pw = 204, ph = 244;
  ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py+ph); ctx.lineTo(px+pw, py+ph); ctx.stroke();
  ctx.fillStyle = "#898781"; ctx.font = "10px system-ui, sans-serif"; ctx.textAlign = "center";
  for(var k=0;k<=5;k++){
    var tx = px + pw * k / 5;
    ctx.fillText(k + "t½", tx, py + ph + 13);
    ctx.beginPath(); ctx.moveTo(tx, py+ph); ctx.lineTo(tx, py+ph+3); ctx.stroke();
  }
  ctx.textAlign = "right";
  ctx.fillText("N₀", px - 4, py + 8);
  ctx.fillText("0", px - 4, py + ph);
  ctx.textAlign = "center";
  ctx.fillText("Undecayed nuclei vs time", px + pw/2, py + ph + 28);
  // expected curve
  ctx.setLineDash([4,4]); ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.beginPath();
  for(var j=0;j<=100;j++){
    var t = 5 * j / 100, yv = Math.pow(2, -t);
    var X = px + pw * t / 5, Y = py + ph * (1 - yv);
    if(j===0) ctx.moveTo(X,Y); else ctx.lineTo(X,Y);
  }
  ctx.stroke(); ctx.setLineDash([]);
  if(sim){
    ctx.strokeStyle = "#3987e5"; ctx.lineWidth = 2;
    ctx.beginPath();
    sim.history.forEach(function(h, idx){
      var X = px + pw * h[0] / 5, Y = py + ph * (1 - h[1] / sim.N0);
      if(idx===0) ctx.moveTo(X,Y); else ctx.lineTo(X,Y);
    });
    ctx.stroke();
  }
}

/* ============================================================
   15. BONDING PREDICTOR
   ============================================================ */
var METAL_CATS = { "alkali metal":1, "alkaline earth metal":1, "transition metal":1, "post-transition metal":1, "lanthanide":1, "actinide":1 };
var bondSelect = document.getElementById("bond-partner");
bondSelect.innerHTML = "<option value=''>Pick an element to bond with…</option>" +
  ELEMENTS.filter(function(x){ return x.n <= 118; }).map(function(x){
    return "<option value='" + x.n + "'>" + x.s + " — " + x.nm + " (EN " + (x.en != null ? x.en : "n/a") + ")</option>";
  }).join("");
function populateBondSelect(e){
  bondSelect.value = "";
  document.getElementById("bond-result").style.display = "none";
  renderElementReactions(e);
}
bondSelect.addEventListener("change", function(){
  if(!currentElement || !this.value) { document.getElementById("bond-result").style.display = "none"; return; }
  showBond(currentElement, BY_NUM[parseInt(this.value, 10)]);
});
function predictBond(a, b){
  var aMetal = !!METAL_CATS[a._catKey], bMetal = !!METAL_CATS[b._catKey];
  var inert = { "He":1, "Ne":1, "Ar":1 };
  if(inert[a.s] || inert[b.s]){
    var g = inert[a.s] ? a : b;
    return { type:"No stable bond", color:"#898781",
      text: g.nm + " has a completely filled outer shell and no measured electronegativity; it forms no stable neutral compounds under ordinary conditions." };
  }
  if(a.en == null || b.en == null){
    var m = a.en == null ? a : b;
    return { type:"Can't predict", color:"#898781",
      text: "No Pauling electronegativity has been measured for " + m.nm + ", so the electronegativity-difference rule can't be applied." };
  }
  var dEN = Math.abs(a.en - b.en);
  var ionicPct = 100 * (1 - Math.exp(-dEN*dEN/4));
  var res = { dEN:dEN, ionicPct:ionicPct };
  if(aMetal && bMetal){
    res.type = "Metallic"; res.color = "#c98500";
    res.text = "Both are metals: their valence electrons delocalize into a shared \"sea\" around positive ions, forming an alloy or intermetallic compound rather than discrete bonds. This is why metals conduct electricity and heat.";
  } else if(dEN < 0.5){
    res.type = a === b ? "Nonpolar covalent (pure)" : "Nonpolar covalent"; res.color = "#3ecf3e";
    res.text = "Electrons are shared almost equally — neither atom pulls noticeably harder on the bonding pair.";
  } else if(dEN < 1.7){
    res.type = "Polar covalent"; res.color = "#3987e5";
    res.text = "Electrons are shared unequally: the bonding pair sits closer to " + (a.en > b.en ? a.nm : b.nm) +
      ", giving it a partial negative charge (δ−) and " + (a.en > b.en ? b.nm : a.nm) + " a partial positive charge (δ+).";
  } else if(!aMetal && !bMetal){
    res.type = "Polar covalent (highly polar)"; res.color = "#3987e5";
    res.text = "The difference is large, but neither element is a metal, so neither gives up its electrons completely: the bond stays a shared pair pulled strongly toward " +
      (a.en > b.en ? a.nm : b.nm) + ". H–F is the classic example — HF is a molecular gas, not an ionic crystal.";
  } else {
    res.type = "Ionic"; res.color = "#e66767";
    res.text = (a.en > b.en ? b.nm : a.nm) + " effectively transfers electron(s) to " + (a.en > b.en ? a.nm : b.nm) +
      ", making a positive and a negative ion held together by electrostatic attraction (a crystal lattice, like table salt).";
  }
  var hb = { "N":1, "O":1, "F":1 };
  if((a.s === "H" && hb[b.s]) || (b.s === "H" && hb[a.s])){
    res.text += " Molecules containing H–N, H–O or H–F bonds can also form hydrogen bonds with each other — the reason water boils at 100 °C instead of about −80 °C.";
  }
  return res;
}
function showBond(a, b){
  var r = predictBond(a, b);
  var box = document.getElementById("bond-result");
  var html = "<span class='bond-type' style='color:" + r.color + "'>" + escapeHtml(a.s + "–" + b.s + ": " + r.type) + "</span>";
  if(r.dEN != null){
    html += "<div style='font-size:11.5px;color:var(--text-muted);margin-bottom:4px;'>ΔEN = |" + a.en + " − " + b.en + "| = " + r.dEN.toFixed(2) +
      " · ionic character ≈ " + r.ionicPct.toFixed(0) + "% (Pauling: 1 − e<sup>−ΔEN²/4</sup>)</div>" +
      "<div style='height:6px;border-radius:3px;background:var(--surface-2);margin-bottom:6px;'><div style='height:6px;border-radius:3px;width:" +
      r.ionicPct.toFixed(1) + "%;background:" + r.color + "'></div></div>";
  }
  html += escapeHtml(r.text);
  html += "<div style='font-size:10.5px;color:var(--text-muted);margin-top:6px;'>Rule of thumb: ΔEN &lt; 0.5 nonpolar, 0.5–1.7 polar, ≥ 1.7 ionic (ionic only when a metal is involved). Real bonds are a continuum with exceptions — e.g. NaH is ionic although ΔEN is only 1.27.</div>";
  box.innerHTML = html;
  box.style.display = "block";
}

function renderElementReactions(e){
  var box = document.getElementById("element-reactions");
  var hits = CHEM_REACTIONS.filter(function(r){ return r.el.indexOf(e.s) !== -1; });
  if(!hits.length){
    box.innerHTML = "<p style='font-size:12px;color:var(--text-muted);margin:0 0 10px;'>Not featured in the 50-reaction library.</p>";
    return;
  }
  box.innerHTML = "<p style='font-size:12px;color:var(--text-secondary);margin:0 0 6px;'>Featured in " + hits.length + " reaction" + (hits.length>1?"s":"") + ":</p>" +
    hits.map(function(r){ return "<div style='font-size:12px;margin-bottom:4px;'><b>" + escapeHtml(r.name) + "</b><br><span style='color:var(--text-secondary)'>" + escapeHtml(r.eq) + "</span></div>"; }).join("") +
    "<button class='btn small' id='btn-open-reactions' style='margin:4px 0 10px;'>Open in Chemistry →</button>";
  document.getElementById("btn-open-reactions").addEventListener("click", function(){
    openDrawer("drawer-chemistry"); initChemistry();
    chemSearch.value = e.s; chemType = "All"; renderChemistry();
  });
}

/* ============================================================
   16. DECAY CHAIN VIEWER
   ============================================================ */
var chainsInited = false;
function initDecayChains(){
  if(chainsInited) return;
  chainsInited = true;
  var tabs = document.getElementById("chain-tabs");
  Object.keys(DECAY_CHAINS).forEach(function(name, i){
    var b = document.createElement("button");
    b.textContent = name.replace(/ \(.*/, "");
    b.title = name;
    b.addEventListener("click", function(){
      tabs.querySelectorAll("button").forEach(function(x){ x.classList.remove("active"); });
      b.classList.add("active");
      renderChain(name);
    });
    tabs.appendChild(b);
    if(i === 0){ b.classList.add("active"); renderChain(name); }
  });
}
function renderChain(name){
  var nodes = DECAY_CHAINS[name];
  var view = document.getElementById("chain-view");
  var first = nodes[0], last = nodes[nodes.length-1];
  var nAlpha = 0, nBeta = 0;
  for(var i=1;i<nodes.length;i++){
    if(nodes[i].a !== nodes[i-1].a) nAlpha++; else nBeta++;
  }
  var qKeV = massExcessKeV(first.z, first.a) - massExcessKeV(last.z, last.a) - nAlpha * massExcessKeV(2, 4);
  var html = "<div style='font-size:12.5px;color:var(--text-secondary);margin-bottom:10px;line-height:1.5;'><b style='color:#fff'>" + escapeHtml(name) + "</b><br>" +
    nuclideLabel(first.z, first.a) + " → " + nuclideLabel(last.z, last.a) + " via " + nAlpha + " α and " + nBeta + " β⁻ decays (main path). " +
    "Total energy released per starting nucleus: <b style='color:#fff'>" + (qKeV/1000).toFixed(1) + " MeV</b> (from mass data; part is carried off by antineutrinos).</div>";
  nodes.forEach(function(nd, idx){
    var minor = nd.decays.slice(1).map(function(d){ return modeShort(d.mode) + " " + pctText(d.pct); }).join(", ");
    html += "<div class='chain-node" + (nd.stable ? " stable" : "") + "' data-z='" + nd.z + "'>" +
      "<span class='chain-sym'>" + sup(nd.a) + (nd.isomer ? "ᵐ" : "") + symOf(nd.z) + "</span>" +
      "<span class='chain-info'><b>" + escapeHtml((BY_NUM[nd.z] ? BY_NUM[nd.z].nm : nd.symbol) + "-" + nd.a + (nd.isomer ? "m" : "")) + "</b> · " +
      (nd.stable ? "<span class='iso-stable'>stable — end of chain</span>" : "half-life " + escapeHtml(fmtDuration(nd.hl_s))) +
      (minor ? "<br><span style='font-size:10.5px;color:var(--text-muted)'>minor branches: " + escapeHtml(minor) + "</span>" : "") +
      (nd.note ? "<br><span style='font-size:10.5px;color:var(--text-muted)'>" + escapeHtml(nd.note) + "</span>" : "") +
      "</span></div>";
    if(idx < nodes.length - 1){
      var nx = nodes[idx+1];
      var mode = nx.a !== nd.a ? "A" : "B-";
      var d = nd.decays.filter(function(x){ return x.mode === mode; })[0];
      var qd = massExcessKeV(nd.z, nd.a) + (nd.ex_kev || 0) - massExcessKeV(nx.z, nx.a) - (nx.ex_kev || 0) - (mode === "A" ? massExcessKeV(2, 4) : 0);
      html += "<div class='chain-arrow'>↓ " + modeShort(mode) + " decay" + (d ? " (" + pctText(d.pct) + ")" : "") +
        " · Q = " + (qd/1000).toFixed(3) + " MeV</div>";
    }
  });
  view.innerHTML = html;
  view.querySelectorAll(".chain-node").forEach(function(n){
    n.addEventListener("click", function(){
      var el = BY_NUM[parseInt(n.getAttribute("data-z"), 10)];
      if(el) openElement(el, true);
    });
  });
}

/* ============================================================
   17. NUCLEAR REACTION LAB (live Q-value from mass excesses)
   ============================================================ */
var nucInited = false;
var nucState = { reactants:[{z:1,a:2},{z:1,a:3}], products:[{z:2,a:4},{z:0,a:1}], note:"" };
var NUC_OPTIONS = "<option value='0'>n — neutron</option>" + ELEMENTS.filter(function(x){ return x.n <= 118; }).map(function(x){
  return "<option value='" + x.n + "'>" + x.s + " — " + x.nm + "</option>";
}).join("");

function defaultMassNumber(z){
  var list = ISOTOPES[String(z)] || [];
  if(!list.length) return 1;
  var best = list.slice().sort(function(x,y){
    return (y.abund || 0) - (x.abund || 0) || (y.stable - x.stable) || ((y.hl_s || 0) - (x.hl_s || 0));
  })[0];
  return best.a;
}
function sideText(list){
  var groups = [];
  list.forEach(function(p){
    var g = groups.filter(function(x){ return x.z === p.z && x.a === p.a; })[0];
    if(g) g.count++; else groups.push({ z:p.z, a:p.a, count:1 });
  });
  return groups.map(function(g){ return (g.count > 1 ? g.count + " " : "") + nuclideLabel(g.z, g.a); }).join(" + ");
}

function leptonText(R, P){
  var dZ = R.reduce(function(s,p){ return s+p.z; },0) - P.reduce(function(s,p){ return s+p.z; },0);
  if(dZ > 0) return " + " + (dZ > 1 ? dZ + " " : "") + "e⁺ + " + (dZ > 1 ? dZ + " " : "") + "ν";
  if(dZ < 0) return " + " + (dZ < -1 ? -dZ + " " : "") + "e⁻ + " + (dZ < -1 ? -dZ + " " : "") + "ν̄";
  return "";
}
function initNuclearLab(){
  if(nucInited) return;
  nucInited = true;
  var box = document.getElementById("nuclear-presets");
  NUCLEAR_PRESETS.forEach(function(p){
    var d = document.createElement("div");
    d.className = "nuc-preset";
    d.innerHTML = "<div class='np-cat'>" + escapeHtml(p.cat) + "</div><div class='np-name'>" + escapeHtml(p.name) + "</div>" +
      "<div style='color:var(--text-secondary);'>" + sideText(p.reactants) + " → " + sideText(p.products) + leptonText(p.reactants, p.products) + "</div>";
    d.addEventListener("click", function(){
      nucState = { reactants: p.reactants.map(function(x){ return {z:x.z,a:x.a}; }),
                   products: p.products.map(function(x){ return {z:x.z,a:x.a}; }), note: p.note };
      renderNucBuilder(); computeNuclear();
      document.getElementById("nuclear-builder").scrollIntoView({ behavior:"smooth", block:"start" });
    });
    box.appendChild(d);
  });
  renderNucBuilder(); computeNuclear();
}

function renderNucBuilder(){
  var b = document.getElementById("nuclear-builder");
  b.innerHTML = "";
  [["reactants","Reactants"],["products","Products"]].forEach(function(side){
    var label = document.createElement("div");
    label.style.cssText = "font-size:11px;color:var(--text-muted);";
    label.textContent = side[1];
    b.appendChild(label);
    nucState[side[0]].forEach(function(p, i){
      var row = document.createElement("div");
      row.className = "nb-row";
      row.innerHTML = "<select>" + NUC_OPTIONS + "</select>" +
        "<input type='number' min='1' max='300' step='1' title='Mass number A (protons + neutrons)'/>" +
        "<button class='btn small danger' title='Remove'>✕</button>";
      var sel = row.querySelector("select"), inp = row.querySelector("input"), rm = row.querySelector("button");
      sel.value = String(p.z); inp.value = p.a; inp.disabled = p.z === 0;
      sel.addEventListener("change", function(){
        p.z = parseInt(sel.value, 10);
        p.a = p.z === 0 ? 1 : defaultMassNumber(p.z);
        inp.value = p.a; inp.disabled = p.z === 0;
        nucState.note = ""; computeNuclear();
      });
      inp.addEventListener("input", function(){
        p.a = parseInt(inp.value, 10);
        nucState.note = ""; computeNuclear();
      });
      rm.addEventListener("click", function(){
        nucState[side[0]].splice(i, 1);
        nucState.note = ""; renderNucBuilder(); computeNuclear();
      });
      b.appendChild(row);
    });
    var add = document.createElement("button");
    add.className = "btn small";
    add.textContent = "+ Add " + (side[0] === "reactants" ? "reactant" : "product");
    add.addEventListener("click", function(){
      nucState[side[0]].push({ z:0, a:1 });
      nucState.note = ""; renderNucBuilder(); computeNuclear();
    });
    b.appendChild(add);
  });
}

function computeNuclear(){
  var out = document.getElementById("nuclear-result");
  var R = nucState.reactants, P = nucState.products;
  if(!R.length || !P.length){ out.innerHTML = "Add at least one reactant and one product."; return; }
  var problems = [];
  function sumME(list){
    var s = 0;
    list.forEach(function(p){
      if(!(p.a >= 1)){ problems.push("Enter a mass number for every nucleus."); return; }
      if(p.a < p.z){ problems.push(nuclideLabel(p.z, p.a) + " is impossible: a nucleus can't have fewer nucleons (A) than protons (Z)."); return; }
      var me = massExcessKeV(p.z, p.a);
      if(me === undefined) problems.push(nuclideLabel(p.z, p.a) + " isn't a known nuclide — it's not in the IAEA chart of 3,383 observed nuclides.");
      else if(me === null) problems.push(nuclideLabel(p.z, p.a) + " has been observed but its mass hasn't been measured.");
      else s += me;
    });
    return s;
  }
  var meR = sumME(R), meP = sumME(P);
  var aR = R.reduce(function(s,p){ return s+p.a; },0), aP = P.reduce(function(s,p){ return s+p.a; },0);
  var zR = R.reduce(function(s,p){ return s+p.z; },0), zP = P.reduce(function(s,p){ return s+p.z; },0);
  var html = "<div style='font-size:15px;margin-bottom:6px;'>" + sideText(R) + " → " + sideText(P) + (problems.length || aR !== aP ? "" : leptonText(R, P)) + "</div>";
  if(problems.length){
    out.innerHTML = html + "<div class='q-bad'>" + problems.filter(function(v,i,a){ return a.indexOf(v)===i; }).map(escapeHtml).join("<br>") + "</div>";
    return;
  }
  if(aR !== aP){
    out.innerHTML = html + "<div class='q-bad'>Not balanced: the number of nucleons must be conserved (reactants A = " + aR + ", products A = " + aP + ").</div>";
    return;
  }
  var dZ = zR - zP;
  html += "<div style='font-size:11.5px;color:var(--text-muted);'>A: " + aR + " = " + aP + " ✓ · Z: " + zR + (dZ === 0 ? " = " + zP + " ✓" : " → " + zP) + "</div>";
  if(dZ > 0) html += "<div style='font-size:12px;color:var(--text-secondary);'>Charge is balanced by emitting " + dZ + " positron" + (dZ>1?"s":"") + " (e⁺) + " + dZ + " neutrino" + (dZ>1?"s":"") + " — weak-force (β⁺) process. Q below includes the 1.022 MeV released per positron when it annihilates with a leftover electron.</div>";
  if(dZ < 0) html += "<div style='font-size:12px;color:var(--text-secondary);'>Charge is balanced by emitting " + (-dZ) + " electron" + (dZ<-1?"s":"") + " (e⁻) + antineutrino" + (dZ<-1?"s":"") + " — weak-force (β⁻) process.</div>";

  var Q = (meR - meP) / 1000; // MeV (atomic mass excesses: electrons are accounted for)
  var massR = R.reduce(function(s,p){ return s + atomicMassU(p.z, p.a); }, 0);
  var dm = Q * 1000 / KEV_PER_U;
  html += "<div class='q-value " + (Q >= 0 ? "q-good" : "q-bad") + "'>Q = " + (Q >= 0 ? "+" : "") + Q.toFixed(3) + " MeV</div>";
  if(Q >= 0){
    var perKg = Q * MEV_J / (massR * U_KG);
    html += "<div><b>Exothermic</b> — " + fmtSci(dm, 4) + " u of mass (" + fmtSci(100 * dm / massR, 3) + "% of the reactants) is converted into kinetic energy and radiation (E = mc²).</div>" +
      "<div style='font-size:12px;color:var(--text-secondary);margin-top:6px;line-height:1.7;'>" +
      "Per reaction: " + fmtSci(Q * MEV_J, 3) + " J<br>" +
      "Per mole of reactions: " + fmtSci(Q * MEV_J * AVOGADRO, 3) + " J<br>" +
      "Per kg of reactants: " + fmtSci(perKg, 3) + " J/kg ≈ " + fmtSci(perKg / 4.184e9, 3) + " tonnes of TNT<br>" +
      "≈ " + fmtSci(perKg / 46.4e6, 3) + "× the energy of burning the same mass of gasoline (46.4 MJ/kg)</div>";
  } else {
    html += "<div><b>Endothermic</b> — the products are heavier than the reactants, so " + (-Q).toFixed(3) + " MeV must be supplied as kinetic energy.</div>";
    if(R.length === 2){
      var m1 = atomicMassU(R[0].z, R[0].a), m2 = atomicMassU(R[1].z, R[1].a);
      var proj = Math.min(m1, m2), targ = Math.max(m1, m2);
      html += "<div style='font-size:12px;color:var(--text-secondary);'>Threshold if the lighter particle hits the heavier one at rest: E<sub>th</sub> = −Q(1 + m<sub>proj</sub>/m<sub>target</sub>) = " + (-Q * (1 + proj/targ)).toFixed(3) + " MeV (momentum must also be conserved).</div>";
    }
  }
  if(R.length === 2 && R[0].z > 0 && R[1].z > 0){
    var rr = 1.2 * (Math.cbrt(R[0].a) + Math.cbrt(R[1].a));
    var vc = 1.439964 * R[0].z * R[1].z / rr;
    html += "<div style='font-size:12px;color:var(--text-secondary);margin-top:6px;'>Coulomb barrier ≈ " + vc.toFixed(2) + " MeV (touching-spheres estimate, R = 1.2·A<sup>⅓</sup> fm): the electric repulsion the two nuclei must overcome. " +
      "Stars and fusion reactors run far below this — quantum tunnelling lets a small fraction of collisions get through anyway.</div>";
  }
  if(nucState.note) html += "<div style='font-size:12px;color:var(--text-muted);margin-top:8px;'>" + escapeHtml(nucState.note) + "</div>";
  out.innerHTML = html;
}

/* ============================================================
   18. CHEMISTRY BROWSER
   ============================================================ */
var chemInited = false;
var chemType = "All";
var chemSearch = document.getElementById("chem-search");
function initChemistry(){
  if(chemInited) return;
  chemInited = true;
  var types = ["All"];
  CHEM_REACTIONS.forEach(function(r){ if(types.indexOf(r.type) === -1) types.push(r.type); });
  var bar = document.createElement("div");
  bar.id = "chem-types";
  bar.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;";
  types.forEach(function(t){
    var b = document.createElement("button");
    b.className = "btn small" + (t === chemType ? " active" : "");
    b.textContent = t;
    b.addEventListener("click", function(){ chemType = t; renderChemistry(); });
    bar.appendChild(b);
  });
  chemSearch.parentNode.insertBefore(bar, chemSearch.nextSibling);
  chemSearch.addEventListener("input", renderChemistry);
  renderChemistry();
}
function renderChemistry(){
  document.querySelectorAll("#chem-types button").forEach(function(b){ b.classList.toggle("active", b.textContent === chemType); });
  var q = chemSearch.value.trim().toLowerCase();
  var list = CHEM_REACTIONS.filter(function(r){
    if(chemType !== "All" && r.type !== chemType) return false;
    if(!q) return true;
    if(r.el.some(function(s){ return s.toLowerCase() === q; })) return true;
    if(q.length < 3) return false;
    return (r.name + " " + r.type + " " + r.note).toLowerCase().indexOf(q) !== -1 ||
      r.el.some(function(s){ return BY_SYM[s] && BY_SYM[s].nm.toLowerCase().indexOf(q) !== -1; });
  });
  var box = document.getElementById("chem-list");
  if(!list.length){ box.innerHTML = "<p style='color:var(--text-muted);font-size:12px;'>No reactions match.</p>"; return; }
  box.innerHTML = list.map(function(r){
    return "<div class='chem-card'><div class='cc-type'>" + escapeHtml(r.type) + "</div>" +
      "<div class='cc-name'>" + escapeHtml(r.name) + "</div>" +
      "<div class='cc-eq'>" + escapeHtml(r.eq) + "</div>" +
      "<div class='cc-note'>" + escapeHtml(r.note) + "</div>" +
      "<div style='display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;align-items:center;'>" +
      r.el.map(function(s){ return "<button class='iso-sim-btn' data-sym='" + escapeHtml(s) + "'>" + escapeHtml(s) + "</button>"; }).join("") +
      (r.exo === true ? "<span class='cc-exo'>Exothermic</span>" : r.exo === false ? "<span class='cc-exo' style='background:rgba(57,135,229,0.15);color:#3987e5'>Endothermic</span>" : "") +
      "</div></div>";
  }).join("");
  box.querySelectorAll("[data-sym]").forEach(function(b){
    b.addEventListener("click", function(){ var el = BY_SYM[b.getAttribute("data-sym")]; if(el) openElement(el, true); });
  });
}

/* ============================================================
   19. PERIODIC TRENDS 3D OVERLAY
   ============================================================ */
var TRENDS = [
  { key:"en",  name:"Electronegativity (Pauling)", unit:"" },
  { key:"ie1", name:"First ionization energy",     unit:" kJ/mol" },
  { key:"ar",  name:"Atomic radius (bonded)",      unit:" pm" },
  { key:"ea",  name:"Electron affinity",           unit:" kJ/mol" },
  { key:"d",   name:"Density",                     unit:" g/cm³" },
  { key:"mp",  name:"Melting point",               unit:" K" },
  { key:"bp",  name:"Boiling point",               unit:" K" }
];
var trendIndex = -1;
var trendsFlown = false;
var TREND_MAX_Z = 100;
function trendValue(e, key){
  if(e.n > TREND_MAX_Z) return null;
  var v = e[key];
  if(v == null) return null;
  if(key === "d" && e.ph === "Gas") return v / 1000; // dataset stores gas densities in g/L
  return v;
}
function trendColor(t){ return new THREE.Color().setHSL(0.55 - 0.45 * t, 0.85, 0.30 + 0.30 * t); }

function applyTrend(){
  var legend = document.getElementById("trends-legend");
  var btn = document.getElementById("btn-trends");
  if(trendIndex < 0){
    elementMeshes.forEach(function(m){
      var ud = m.userData;
      ud.trendScaleZ = null; ud.trendValue = null;
      m.scale.z = 1;
      m.position.z = ud.element._pos.z;
      if(ud.origEmissive){
        var face = m.material[4];
        face.emissive.copy(ud.origEmissive); face.color.set(0xffffff);
        face.map = face.emissiveMap = ud.origMap; face.needsUpdate = true;
        m.material[0].color.copy(ud.origSide);
      }
      ud.phaseSprite.position.z = ud.element._pos.z + TILE_D/2 + 0.05;
    });
    legend.style.display = "none";
    document.getElementById("legend").style.display = "";
    btn.textContent = "📈 Trends: off";
    btn.classList.remove("active");
    return;
  }
  var tr = TRENDS[trendIndex];
  var vals = elementMeshes.map(function(m){ return trendValue(m.userData.element, tr.key); });
  var present = vals.filter(function(v){ return v != null; });
  var min = Math.min.apply(null, present), max = Math.max.apply(null, present);
  var minEl = elementMeshes[vals.indexOf(min)].userData.element, maxEl = elementMeshes[vals.indexOf(max)].userData.element;
  elementMeshes.forEach(function(m, i){
    var ud = m.userData;
    var face = m.material[4];
    if(!ud.origEmissive){
      ud.origEmissive = face.emissive.clone(); ud.origSide = m.material[0].color.clone();
      ud.origMap = face.map; ud.neutralMap = labelTexture(ud.element, true);
    }
    face.map = face.emissiveMap = ud.neutralMap; face.needsUpdate = true;
    var v = vals[i];
    var scaleZ = 1;
    if(v == null){
      face.color.set(0x44464e); face.emissive.set(0x000000);
      m.material[0].color.set(0x22242e);
    } else {
      var t = max > min ? (v - min) / (max - min) : 0;
      scaleZ = 1 + t * 16;
      var c = trendColor(t);
      face.color.copy(c); face.emissive.copy(c);
      m.material[0].color.copy(c).multiplyScalar(0.8);
    }
    ud.trendScaleZ = scaleZ;
    ud.trendValue = v;
    m.scale.z = scaleZ;
    m.position.z = ud.element._pos.z + TILE_D * (scaleZ - 1) / 2;
    ud.phaseSprite.position.z = m.position.z + TILE_D * scaleZ / 2 + 0.05;
  });
  var missing = vals.length - present.length;
  document.getElementById("trends-title").textContent = tr.name + " — column height & colour";
  document.getElementById("trends-gradient").style.background =
    "linear-gradient(to right, " + [0,0.25,0.5,0.75,1].map(function(t){ return "#" + trendColor(t).getHexString(); }).join(",") + ")";
  document.getElementById("trends-min").textContent = fmtSci(min, 3) + tr.unit + " (" + minEl.s + ")";
  document.getElementById("trends-max").textContent = fmtSci(max, 3) + tr.unit + " (" + maxEl.s + ")";
  document.getElementById("trends-note").textContent = missing + " elements shown flat & grey: no value in the dataset, or Z > " + TREND_MAX_Z +
    " (those exist only a few atoms at a time, so their values are theoretical and excluded)." +
    (tr.key === "ar" ? " Radii are bonded (mostly covalent) radii." : "") +
    (tr.key === "d" ? " Gas densities converted from g/L." : "");
 legend.style.display = "block";
  document.getElementById("legend").style.display = "none";
  btn.textContent = "📈 Trends: " + tr.name.replace(/ \(.*/, "");
  btn.classList.add("active");
  if(!trendsFlown){
    trendsFlown = true;
    flyCameraTo(new THREE.Vector3(-4, -24, 20), new THREE.Vector3(0, -5.6, -1), 1200);
  }
}
document.getElementById("btn-trends").addEventListener("click", function(){
  trendIndex = trendIndex + 1 >= TRENDS.length ? -1 : trendIndex + 1;
  applyTrend();
});

/* ============================================================
   20. DRAWERS / INTRO / HELP
   ============================================================ */
function openDrawer(id){
  document.querySelectorAll(".drawer.open").forEach(function(d){ if(d.id !== id) d.classList.remove("open"); });
  document.getElementById(id).classList.add("open");
  if(id==="drawer-versions") renderVersionList();
}
function closeDrawer(id){ document.getElementById(id).classList.remove("open"); }
document.getElementById("btn-notes").addEventListener("click", function(){ openDrawer("drawer-notes"); });
document.getElementById("btn-versions").addEventListener("click", function(){ openDrawer("drawer-versions"); });
document.getElementById("btn-decaychains").addEventListener("click", function(){ openDrawer("drawer-decaychains"); initDecayChains(); });
document.getElementById("btn-nuclearlab").addEventListener("click", function(){ openDrawer("drawer-nuclearlab"); initNuclearLab(); });
document.getElementById("btn-chemistry").addEventListener("click", function(){ openDrawer("drawer-chemistry"); initChemistry(); });
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

// Shareable deep links: ?element=Au  ?orbitals=1  ?bond=Cl  ?open=decaychains|nuclearlab|chemistry  ?preset=9 (with nuclearlab)  ?trend=en  ?decay=U-238
(function(){
  var params = new URLSearchParams(location.search);
  var sym = params.get("element");
  var decay = params.get("decay");
  var decayMatch = decay && /^([A-Za-z]{1,3})-(\d{1,3})$/.exec(decay);
  if(decayMatch) sym = decayMatch[1];
  var el = sym && (BY_SYM[sym] || BY_SYM[sym.charAt(0).toUpperCase() + sym.slice(1).toLowerCase()]);
  if(el){
    document.getElementById("intro").style.display = "none";
    openElement(el, true);
    if(params.get("orbitals") === "1") document.getElementById("btn-orbital-toggle").click();
    var partner = params.get("bond") && BY_SYM[params.get("bond")];
    if(partner){ bondSelect.value = String(partner.n); showBond(el, partner); }
    if(decayMatch){
      var iso = findIso(el.n, parseInt(decayMatch[2], 10));
      if(iso && !iso.stable && iso.hl_s && iso.decay.length){ openDecaySim(el, iso); runDecaySim(); }
    }
  }
  var open = params.get("open");
  if(open && ["decaychains","nuclearlab","chemistry"].indexOf(open) !== -1){
    document.getElementById("intro").style.display = "none";
    document.getElementById("btn-" + open).click();
    var preset = open === "nuclearlab" && NUCLEAR_PRESETS.filter(function(p){ return String(p.id) === params.get("preset"); })[0];
    if(preset) document.querySelectorAll(".nuc-preset")[NUCLEAR_PRESETS.indexOf(preset)].click();
  }
  var trend = params.get("trend");
  var ti = TRENDS.findIndex(function(t){ return t.key === trend; });
  if(ti !== -1){
    document.getElementById("intro").style.display = "none";
    trendIndex = ti; applyTrend();
  }
})();

document.addEventListener("keydown", function(ev){
  if(ev.key === "Escape"){
    panel.classList.remove("open");
    closeDrawer("drawer-notes");
    closeDrawer("drawer-versions");
    closeDrawer("drawer-decaychains");
    closeDrawer("drawer-nuclearlab");
    closeDrawer("drawer-chemistry");
    closeDecayModal();
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
