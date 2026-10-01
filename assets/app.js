(function(){
"use strict";
var grid=document.getElementById("grid"),empty=document.getElementById("empty"),
count=document.getElementById("count"),chips=document.getElementById("chips"),
sel=document.getElementById("loc"),q=document.getElementById("q"),
clearBtn=document.getElementById("clear"),surpriseBtn=document.getElementById("surprise"),
stats=document.getElementById("stats"),lastFiltered=[];
function esc(v){return String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");}
function safeUrl(u){try{var x=new URL(u);return (x.protocol==="https:"||x.protocol==="http:")?esc(x.href):"#";}catch(e){return "#";}}
function safeColor(c){return /^#[0-9a-fA-F]{6}$/.test(c)?c:"#5a7086";}
function pill(text,color){color=safeColor(color);return '<span class="pill" style="background:'+color+'1c;color:'+color+'">'+esc(text)+"</span>";}
(function treeline(){for(var d="",x=-10;x<1460;x+=40){var h=64+((x*7919)%43);d+="M"+x+",262 L"+(x+26)+","+(262-h)+" L"+(x+52)+",262 Z ";}document.getElementById("trees").setAttribute("d",d);})();
function locOptions(){
  var groups={},order=["Everywhere","Seattle","Eastside","Snoqualmie Valley","South King County","Snohomish County","Other"],html='<option value="">All locations</option>';
  Object.keys(LOCS).forEach(function(k){var g=LOCS[k][1];(groups[g]=groups[g]||[]).push([k,LOCS[k][0]]);});
  order.forEach(function(g){
    if(!groups[g])return;
    html+='<optgroup label="'+esc(g)+'">';
    groups[g].sort(function(a,b){return a[1].localeCompare(b[1]);}).forEach(function(p){html+='<option value="'+esc(p[0])+'">'+esc(p[1])+"</option>";});
    html+="</optgroup>";
  });
  sel.innerHTML=html;
}
function chipRow(){
  var html='<button class="chip active" data-c="">All causes</button>';
  Object.keys(CAUSES).forEach(function(k){html+='<button class="chip" data-c="'+esc(k)+'"><span class="dot" style="background:'+safeColor(CAUSES[k][1])+'"></span>'+esc(CAUSES[k][0])+"</button>";});
  chips.innerHTML=html;
}
function factPills(o){
  var a=ATTRS[o.n];if(!a)return"";
  var out=[];
  if(a[0]===0)out.push("All ages");else if(a[0])out.push(a[0]+"+");
  if(a[1])out.push("Background check");
  if(a[2])out.push("Groups welcome");
  if(a[3]==="once")out.push("One-time friendly");
  else if(a[3]==="ongoing")out.push("Regular commitment");
  else if(a[3]==="both")out.push("Flexible schedule");
  return out.length?'<div class="facts">'+out.map(function(f){return '<span class="fact">'+f+"</span>";}).join("")+"</div>":"";
}
function cardHTML(o){
  var badges=o.c.map(function(k){return pill(CAUSES[k][0],CAUSES[k][1]);}).join("")+'<span class="pill loc">'+esc(LOCS[o.l][0])+"</span>";
  return '<article class="card"><h2>'+esc(o.n)+'</h2><p>'+esc(o.d)+'</p><div class="badges">'+badges+'</div>'+factPills(o)+'<a class="go" href="'+safeUrl(o.u)+'" target="_blank" rel="noopener noreferrer">Volunteer \u2192</a></article>';
}
function apply(){
  var term=q.value.trim().toLowerCase(),html="",sorted=ORGS.slice().sort(function(a,b){return a.n.localeCompare(b.n);});
  lastFiltered=[];
  sorted.forEach(function(o){
    if(activeCause&&o.c.indexOf(activeCause)===-1)return;
    if(activeLoc&&o.l!==activeLoc)return;
    if(term&&(o.n+" "+o.d+" "+LOCS[o.l][0]+" "+CAUSES[o.c[0]][0]).toLowerCase().indexOf(term)===-1)return;
    lastFiltered.push(o);html+=cardHTML(o);
  });
  grid.innerHTML=html;
  empty.style.display=lastFiltered.length?"none":"block";
  count.textContent=lastFiltered.length+" of "+ORGS.length+" organizations";
  drawMarkers();
}
chips.addEventListener("click",function(e){
  var b=e.target.closest(".chip");if(!b)return;
  activeCause=b.getAttribute("data-c");
  chips.querySelectorAll(".chip").forEach(function(c){c.classList.toggle("active",c===b);});
  apply();
});
sel.addEventListener("change",function(){activeLoc=sel.value;apply();});
q.addEventListener("input",apply);
clearBtn.addEventListener("click",function(){
  q.value="";activeCause="";activeLoc="";sel.value="";
  chips.querySelectorAll(".chip").forEach(function(c){c.classList.toggle("active",!c.getAttribute("data-c"));});
  apply();
});
surpriseBtn.addEventListener("click",function(){
  if(!lastFiltered.length)return;
  if(activeView!=="list")setView("list");
  var pick=lastFiltered[Math.floor(Math.random()*lastFiltered.length)];
  var idx=lastFiltered.indexOf(pick),card=grid.children[idx];
  if(card){card.scrollIntoView({behavior:"smooth",block:"center"});card.classList.remove("flash");void card.offsetWidth;card.classList.add("flash");}
});
var activeView="list",map=null,markerLayer=null;
function hashName(s){var h=0;for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0;}return h;}
function orgXY(o){
  var c=CITYXY[o.l];if(!c)return null;
  var h=hashName(o.n);
  return [c[0]+(((h%17)-8)*0.0022),c[1]+((((h>>5)%17)-8)*0.003)];
}
function drawMarkers(){
  if(!map||activeView!=="map")return;
  markerLayer.clearLayers();
  var shown=0;
  lastFiltered.forEach(function(o){
    var xy=orgXY(o);if(!xy)return;shown++;
    markerLayer.addLayer(L.circleMarker(xy,{radius:7,color:"#20694f",weight:2,fillColor:"#ff6f54",fillOpacity:.9})
      .bindPopup('<b>'+esc(o.n)+'</b><br><small>'+esc(LOCS[o.l][0])+'</small><br>'+esc(o.d)+'<br><a href="'+safeUrl(o.u)+'" target="_blank" rel="noopener noreferrer">Volunteer page \u2192</a>'));
  });
  document.getElementById("mapnote").textContent="Showing "+shown+" place-based organizations — region-wide programs aren't pinned. Pins show the general area; check each organization's page for the exact address.";
}
function initViewMap(){
  map=L.map("map",{scrollWheelZoom:true}).setView([47.55,-122.28],9);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
  markerLayer=L.layerGroup().addTo(map);
  drawMarkers();
}
function setView(v){
  activeView=v;
  document.getElementById("listview").style.display=(v==="list")?"":"none";
  document.getElementById("mapbox").style.display=(v==="map")?"":"none";
  document.getElementById("vlist").classList.toggle("active",v==="list");
  document.getElementById("vmap").classList.toggle("active",v==="map");
  if(v==="map"){
    if(!map)initViewMap();else{setTimeout(function(){map.invalidateSize();drawMarkers();},60);}
  }
  window.scrollTo({top:0});
}
document.getElementById("vlist").addEventListener("click",function(){setView("list");});
document.getElementById("vmap").addEventListener("click",function(){setView("map");});
var activeCause="",activeLoc="";
(function init(){
  locOptions();chipRow();
  var cities=new Set();ORGS.forEach(function(o){cities.add(LOCS[o.l][0]);});
  stats.innerHTML="<b>"+ORGS.length+" organizations</b><b>"+Object.keys(CAUSES).length+" causes</b><b>"+cities.size+" communities</b>";
  apply();
})();
})();
