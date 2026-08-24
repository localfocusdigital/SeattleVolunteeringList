"use strict";
const fs=require("fs");
const path=require("path");
const BASE="https://localfocusdigital.github.io/SeattleVolunteeringList/";
let html=fs.readFileSync("index.html","utf8");
const firstScriptStart=html.indexOf("<script>")+8;
const firstScriptEnd=html.indexOf("</script>");
const dataJs=html.slice(firstScriptStart,firstScriptEnd);
const {CAUSES,LOCS,ORGS,ATTRS}=new Function(dataJs+";return {CAUSES,LOCS,ORGS,ATTRS};")();
const css=html.slice(html.indexOf("<style>")+7,html.indexOf("</style>"));
const ORG_SET=new Set(ORGS.map(o=>o.n));
function esc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function attrsOf(n){return ATTRS[n]||null;}
function factPills(o){
  const a=attrsOf(o.n);if(!a)return"";
  const out=[];
  if(a[0]===0)out.push("All ages");else if(a[0])out.push(a[0]+"+");
  if(a[1])out.push("Background check");
  if(a[2])out.push("Groups welcome");
  if(a[3]==="once")out.push("One-time friendly");
  else if(a[3]==="ongoing")out.push("Regular commitment");
  else if(a[3]==="both")out.push("Flexible schedule");
  return out.length?'<div class="facts">'+out.map(f=>'<span class="fact">'+f+"</span>").join("")+"</div>":"";
}
function cardHTML(o){
  const badges=o.c.map(k=>pill(CAUSES[k][0],CAUSES[k][1])).join("")+'<span class="pill loc">'+LOCS[o.l][0]+"</span>";
  return '<article class="card"><h2>'+o.n+'</h2><p>'+o.d+'</p><div class="badges">'+badges+'</div>'+factPills(o)+'<a class="go" href="'+o.u+'" target="_blank" rel="noopener noreferrer">Volunteer \u2192</a></article>';
}
function pill(text,color){return '<span class="pill" style="background:'+color+'1c;color:'+color+'">'+text+"</span>";}
const EASTSIDE=["bellevue","kirkland","redmond","woodinville","bothell","mercerisland","sammamish","issaquah"];
const SOUTHKC=["renton","tukwila","kent","auburn","burien","seatac","desmoines","federalway"];
const NAMES=(list)=>{const bad=list.filter(n=>!ORG_SET.has(n));if(bad.length)throw new Error("Unknown org names: "+bad.join(" | "));return list;};
const PAGES=[
{slug:"volunteer-thanksgiving-seattle",title:"Volunteer for Thanksgiving & Food Drives in Seattle (2026 Guide)",h1:"Thanksgiving Volunteering in Seattle",desc:"Where to volunteer for Thanksgiving and fall food drives across Seattle, the Eastside and South King County — 30+ food banks and meal programs that need hands.",filter:o=>o.c.includes("food"),
intro:["Every November, Puget Sound food banks serve two to three times their normal volume — and they plan for it months ahead. The catch: Thanksgiving-week slots fill by mid-October, so the families who get the most out of the season are the ones who sign up early or volunteer at less-famous spots.","Below are every food bank and meal program in our directory. Big warehouse sorting shifts are great for groups; neighborhood food banks need regular hands all season, not just the week of the holiday."],
tips:["Sign up for the week BEFORE Thanksgiving — that is when sorting and distribution peak","Turkey-drive logistics (gleaning, pickup routes) need drivers more than servers","If Thanksgiving week is full, ask about December holiday boxes — demand stays high"]},
{slug:"holiday-volunteering-seattle",title:"Holiday Season Volunteering in Seattle — Toys, Meals & Giving Trees",h1:"Holiday Volunteering in Seattle",desc:"Christmas and holiday volunteering in Seattle: toy shops, giving trees, holiday meals and winter shelters across King County — plus how to sign up before slots vanish.",filter:o=>o.c.includes("food")||o.c.includes("housing")||["Treehouse","WestSide Baby","Bellevue LifeSpring","Mary's Place","Kin On Health Center","Union Gospel Mission","Salvation Army Seattle Social Services","Jewish Family Service (Polack Food Bank)","Wellspring Family Services"].includes(o.n),
intro:["Between holiday meals, toy shops and giving trees, December is the busiest volunteering month of the year in the Puget Sound region — and also when well-meaning volunteers show up unannounced. Nearly every program below requires advance signup, and gift-related roles often close by early December.","The organizations below run holiday-specific programs (free toy stores, adopt-a-family, winter meal service) alongside their year-round work."],
tips:["Toy-shop style programs (Treehouse, Bellevue LifeSpring, WestSide Baby) need SORTERS in November more than gift-wrappers in December","Winter weather shelters recruit heavily after the first cold snap — flexibility beats timing","Group holiday parties? Book a sorting shift instead — museums and zoos book out a year ahead"]},
{slug:"mlk-day-of-service-seattle",title:"MLK Day of Service 2027 in Seattle — Volunteer Projects & Sign-ups",h1:"MLK Day of Service in Seattle",desc:"Find MLK Day of Service volunteer projects in Seattle and King County — park restorations, food bank shifts and day-of events honoring Dr. King.",filter:o=>(ATTRS[o.n]&&ATTRS[o.n][3]==="once")||o.c.includes("environment"),
intro:["Martin Luther King Jr. Day (third Monday in January) is one of the biggest single days of volunteering in the Puget Sound region. United Way of King County anchors the official calendar, but dozens of parks groups, food banks and habitat teams run work parties the same morning.","The projects below are one-day-friendly: show up, work a shift, no long-term commitment."],
tips:["United Way opens its official MLK Day project registry in December — browse it alongside the list below","January work parties happen rain or shine; boots and layers matter more than gloves","Schools often release students to participate — teens count these hours for service requirements"]},
{slug:"earth-day-volunteer-seattle",title:"Earth Day Volunteer Events in Seattle — Parks, Trails & Restoration",h1:"Earth Day Volunteering in Seattle",desc:"Earth Day and spring volunteering across Puget Sound: forest restoration, beach cleanups, trail work parties and native plantings near you.",filter:o=>o.c.includes("environment"),
intro:["April is peak season for getting outside for a cause. The Green Seattle, Green Tukwila, Green Kirkland and Green Redmond partnerships all run Earth Week work parties, and salmon-restoration crews time spring plantings to the rains.","Everything below welcomes first-timers — tools and training are provided on site, and most events run two to three hours."],
tips:["Earth WEEK now stretches into 30+ events across the region — you can volunteer several days running","Duwamish Alive (April & October) coordinates 10+ simultaneous river sites if you want a flagship event","Restoration work is genuinely kid-friendly — it is the easiest category for families"]},
{slug:"volunteer-food-bank-seattle",title:"Food Bank Volunteering in Seattle & King County — 35+ Places to Help",h1:"Volunteer at a Food Bank in Seattle",desc:"Every food bank and hunger-relief program in Seattle, Bellevue, Renton, Kent and beyond that takes volunteers — with ages, group policies and sign-up links.",filter:o=>o.c.includes("food"),
intro:["Hunger relief is the largest volunteering category in our directory for a reason: food banks run on volunteers seven days a week, all year. Roles range from warehouse sorting and grocery-rescue driving to client check-in and home delivery.","Most shifts are 2–3 hours, training happens on the job, and nearly every food bank below welcomes first-timers and groups."],
tips:["Warehouse and repack shifts (Food Lifeline, Northwest Harvest) scale best for corporate groups","Grocery-rescue drivers are chronically scarce — if you have a vehicle and a license, ask","Consistency beats volume: one monthly shift beats one heroic holiday appearance"]},
{slug:"animal-shelter-volunteering-seattle",title:"Animal Shelter & Wildlife Volunteering in Seattle — Dogs, Cats & Wildlife",h1:"Animal Volunteering in Seattle",desc:"Dog walking, cat socializing, wildlife care and fostering at Seattle-area shelters — Seattle Humane, PAWS, RASKC, MEOW and more, with requirements explained.",filter:o=>o.c.includes("animals"),
intro:["Shelter work is steady, physical and deeply rewarding — and more structured than people expect. Dog-walking and wildlife-feeding roles usually require an orientation, a minimum age (often 16–18, sometimes with an adult) and a weekly commitment while you train.","Fostering is the other big lever: shelters consistently say foster homes free up more capacity than any volunteer shift."],
tips:["Under 18? Ask about teen councils and assisted-handling programs — several shelters run them","Cat socializing and laundry/kennel shifts usually have lower age floors than dog handling","Wildlife rehab (PAWS) is seasonal-heavy in spring baby-animal season — apply in winter"]},
{slug:"trail-park-cleanup-volunteering-seattle",title:"Trail Work & Park Cleanup Volunteering near Seattle",h1:"Trails, Parks & Cleanup Volunteering",desc:"Trail maintenance work parties, forest restoration and park cleanups across Puget Sound — WTA, Green Seattle, Greenway and local groups. Tools provided.",filter:o=>o.c.includes("environment"),
intro:["From downtown pocket parks to Tiger Mountain, the regions trails and forested parks are maintained substantially by volunteers. Work parties supply tools, gloves and instruction — you bring closed-toe shoes and rain-or-shine attitude.","No experience is needed anywhere on this list, and most events welcome supervised kids, making this the best category for families and first-time volunteers."],
tips:["Washington Trails Association publishes its work-party calendar seasonally — backcountry trips fill fast","Green City partnerships (Seattle, Kirkland, Redmond, Tukwila, Everett, Issaquah) run weekly neighborhood events — no signup needed at many","Want ownership? Train as a Forest Steward and adopt your own park site"]},
{slug:"hospital-volunteer-seattle",title:"Hospital Volunteer Programs in Seattle — Requirements & How to Apply",h1:"Hospital Volunteering in Seattle",desc:"Hospital and community-health volunteer programs across Seattle and the Eastside — UW Medicine, Swedish, Overlake, EvergreenHealth, Fred Hutch and more.",filter:o=>["UW Medicine Volunteer Program","Swedish Medical Center (First Hill)","Overlake Medical Center & Clinics","EvergreenHealth Hospital Volunteers","Fred Hutchinson Cancer Center","Bloodworks Northwest","HealthPoint","Sea Mar Community Health Centers"].includes(o.n),
intro:["Hospital volunteering is one of the most competitive volunteer categories in the region — healthcare-adjacent roles attract pre-med students and career changers, and programs cap their rosters. Applications typically take 4–8 weeks to process including background checks and health screening.","Most hospital programs ask for roughly one four-hour shift per week over six months to a year. In exchange you get real clinical-adjacent exposure, from patient escorting to unit support."],
tips:["Apply to TWO or three hospitals at once — waitlists are real","Teens: Overlake, EvergreenHealth and UW run limited summer teen programs with spring deadlines","Community health centers (HealthPoint, Sea Mar) are less crowded paths with equally meaningful roles"]},
{slug:"tutor-mentor-volunteer-seattle",title:"Tutoring & Youth Mentoring Volunteers in Seattle — Weekly, One Kid at a Time",h1:"Tutoring & Mentoring Opportunities",desc:"Be a tutor or mentor for Seattle-area kids — Big Brothers Big Sisters, Reading Partners, Communities In Schools and school-based programs needing weekly volunteers.",filter:o=>o.c.includes("youth")&&ATTRS[o.n]&&(ATTRS[o.n][3]==="ongoing"),
intro:["Nothing in our directory moves the needle like an hour a week with the same kid. Literacy programs, school-based mentoring and after-school homework help all share one shape: a modest commitment, a background check, and outsized impact.","Programs cluster around the school year, with application surges in August–September and January. If you start mid-year, most programs will still place you."],
tips:["Budget 4–6 weeks for background-check clearance before your first session","Site-based programs (at school, fixed hour) are easier to sustain than community-based ones","Bilingual volunteers: tell every program — demand for Spanish, Vietnamese, Somali and Amharic speakers far exceeds supply"]},
{slug:"volunteer-with-refugees-seattle",title:"Volunteer With Refugees & Immigrants in Seattle",h1:"Refugee & Immigrant Support",desc:"Help newly arrived families build lives here — refugee resettlement, ESL tutoring, citizenship classes and youth programs in Seattle, Kent, Tukwila and Lynnwood.",filter:o=>o.c.includes("refugees"),
intro:["King County resettles thousands of refugees a year, with communities from Ukraine, Afghanistan, Somalia, Ethiopia, Vietnam, Cambodia and beyond concentrated in Seattle's south end, Tukwila and Kent. Organizations below provide resettlement case support, ESL, citizenship prep, youth programs and cultural connection.","You do not need to speak another language — though if you do, say so loudly on every application."],
tips:["ESL and citizenship tutors are needed daytime AND evening — flexibility is broader than most assume","Co-sponsorship teams (furniture, airport pickups, first-month hosting) are the fastest-growing need","Tukwila and Kent host the largest newcomer school populations — school districts there recruit directly"]},
{slug:"corporate-team-volunteering-seattle",title:"Corporate Team Volunteering in Seattle — Group Events Companies Actually Want",h1:"Corporate & Team Volunteering",desc:"Group-friendly volunteer events for company outings in Seattle — warehouse packing, restoration work parties and museum events that scale to 10–100 people.",filter:o=>{const a=ATTRS[o.n];return a&&a[2]===1&&a[3]!=="ongoing"&&(a[0]===null||a[0]>=12)&&o.l!=="regional";},
intro:["Planning a team offsite or giving campaign? The organizations below explicitly welcome groups, run predictable repeatable shifts, and can absorb anywhere from 8 to 100 coworkers. Warehouse repacking, forest restoration and event support are the classic formats for good reason: minimal training, visible output, great photos.","Two logistics notes: companies should contact coordinators directly rather than booking individual slots, and September–December books out fastest."],
tips:["Ask about employer matching — most large Seattle employers match volunteer HOURS with cash grants","Private group shifts usually have minimums (often 10–15 people) and book 4–8 weeks out","Restoration events are the best budget option: free, outdoor, scalable, zero catering required"]},
{slug:"kid-friendly-volunteering-seattle",title:"Kid-Friendly Volunteering in Seattle — Family Volunteer Opportunities",h1:"Family & Kid-Friendly Volunteering",desc:"Volunteer WITH your kids around Seattle — all-ages park restorations, family sorting shifts and events where children are welcome, not tolerated.",filter:o=>{const a=ATTRS[o.n];return a&&(a[0]===0||(a[0]!==null&&a[0]<=12));},
intro:["Families who volunteer together say the same thing: it works best when the organization actually plans for children, not merely permits them. The list below favors all-ages restoration work parties, family sorting nights and festival roles where kids contribute genuinely.","A good rule of thumb: outdoor stewardship welcomes young children almost everywhere; direct-service settings (shelters, kitchens) generally start at 12+ for safety and privacy reasons."],
tips:["Match the shift length to the kid: 90 minutes is the honest maximum for elementary ages","Restoration events supply child-sized tools at some sites — email ahead to ask","Let kids pick the cause — ownership doubles the odds they will want to go back"]},
{slug:"teen-volunteer-hours-seattle",title:"Teen Volunteer Opportunities in Seattle — Service Hours That Count",h1:"Teen Volunteering & Service Hours",desc:"Seattle-area volunteer programs open to teens — zoos, museums, hospitals, shelters and libraries — with real minimum ages for school service-hour requirements.",filter:o=>{const a=ATTRS[o.n];return a&&a[0]!==null&&a[0]>0&&a[0]<=16;},
intro:["Need service hours? The programs below publish minimum ages of 16 or younger, meaning teens can join directly rather than tagging along with adults. Zoo and aquarium teen programs, museum ambassador roles and shelter assistant shifts are the marquee options — and the competitive ones, with spring application windows.","For hour-tracking, confirm your program qualifies with your school FIRST, and keep every confirmation email."],
tips:["Zoo, aquarium and hospital teen programs run on APPLICATION cycles — deadlines land January–April for summer","Ongoing weekly roles beat one-off events for college applications and actual references","Presidential Volunteer Service Award tracking starts at 100 hours/year — ask programs to log your hours"]},
{slug:"virtual-volunteer-opportunities-seattle",title:"Virtual & At-Home Volunteer Opportunities in Seattle",h1:"Volunteer From Home",desc:"Remote volunteering for Seattle causes — crisis text lines, virtual tutoring, translation, research and writing roles you can do from your couch.",filter:o=>["Crisis Connections","Horn of Africa Services","Asian Counseling and Referral Service (ACRS)","Zero Waste Washington","Reading Partners Seattle","International Rescue Committee (IRC) Seattle & SeaTac","NAMI Seattle"].includes(o.n),
intro:["Fully remote volunteering is smaller than the internet promises — most direct service is stubbornly in-person. But a real handful of Puget Sound organizations run genuine at-home roles: crisis text and chat lines, online tutoring, remote research, translation and writing.","Set expectations honestly: crisis-line work requires serious training (weeks, not hours), while research and writing roles are closer to skilled micro-volunteering."],
tips:["Crisis Connections' Teen Link and 988 chat roles train cohorts quarterly — apply ahead","Translation and bilingual mentoring requests appear constantly — flag any second language","Remote roles still want LOCAL volunteers — regional knowledge makes your help better"]},
{slug:"one-time-volunteer-opportunities-seattle",title:"One-Time Volunteer Opportunities in Seattle — No Commitment Needed",h1:"One-Time Volunteering, Zero Commitment",desc:"Drop-in volunteer events around Seattle — cleanups, work parties and festivals where anyone can show up once without an application or ongoing schedule.",filter:o=>{const a=ATTRS[o.n];return a&&a[3]==="once";},
intro:["Want to help without joining anything? One-day events are how most people start volunteering, and the Puget Sound region runs on them: Saturday work parties, river cleanups, festival crews and gleaning days that need zero paperwork.","The trade-off is seasonal rhythm — restoration events concentrate March–June and September–November, while festivals cluster in summer."],
tips:["Many park work parties are drop-in: just check the event listing for meeting point and dress code","Festival crews (Folklife, film fests, neighborhood street fairs) offer single 3-hour shifts","Liked it? Every one-time event is a recruiting pipeline into deeper roles — coordinators remember helpful strangers"]},
{slug:"volunteer-bellevue-eastside",title:"Volunteer Opportunities in Bellevue & the Eastside",h1:"Volunteer on the Eastside",desc:"Volunteer opportunities in Bellevue, Kirkland, Redmond, Woodinville, Bothell, Sammamish, Mercer Island and Issaquah — food banks, hospitals, shelters and parks.",filter:o=>EASTSIDE.includes(o.l),
intro:["The Eastside runs a full volunteer economy of its own: Hopelink's service centers, two major hospitals, Seattle Humane, a dense network of city park partnerships and some of the region's best-funded food programs serving neighbors across Bellevue, Kirkland, Redmond, Woodinville, Bothell, Sammamish, Mercer Island and Issaquah.","Eastside shifts skew slightly corporate-friendly (Microsoft and Boeing pipelines) but need individual regulars just as badly."],
tips:["Hopelink alone operates centers in Bellevue, Kirkland/Northshore, Redmond and Carnation — pick your closest","City volunteer pages (Bellevue, Kirkland, Redmond) bundle parks, events and boards in one place","Crossroads and Bellevue area programs serve high-need neighborhoods that surprise newcomers"]},
{slug:"volunteer-south-king-county",title:"Volunteer in Renton, Kent, Tukwila & South King County",h1:"South King County Volunteering",desc:"Volunteer opportunities in Renton, Tukwila, Kent, Auburn, Burien, SeaTac, Des Moines and Federal Way — food banks, refugee services, shelters and river restorations.",filter:o=>SOUTHKC.includes(o.l),
intro:["South King County is where the region's need and its newest neighbors meet: the country's most diverse school districts, major refugee resettlement corridors in Tukwila and Kent, and a ring of hard-working food banks from Renton to Federal Way. Volunteer capacity here stretches further per hour than anywhere else in metro Seattle.","The Duwamish River corridor adds a whole environmental layer — habitat restoration from Auburn to the harbor."],
tips:["Newcomer-serving programs (IRC SeaTac, World Relief Kent, Tukwila Pantry) need weekday daytime help most","RASKC's Kent adoption center trains dog walkers continuously — high turnover means always-open slots","City-run programs (Renton, SeaTac) are underrated: structured, staff-supported and rarely full"]},
{slug:"volunteer-seattle-neighborhoods",title:"Volunteer Opportunities Across Seattle — By Neighborhood",h1:"Volunteer in Seattle, By Neighborhood",desc:"Find volunteering near you in Seattle — Ballard to Rainier Valley, Capitol Hill to West Seattle — food banks, shelters, parks, museums and schools in your neighborhood.",
filter:o=>o.l==="seattle",
neighborhoods:{
"Ballard & North Seattle":["Ballard Food Bank","North Helpline","FamilyWorks","Seattle ReCreative"],
"University District & Northeast":["University District Food Bank","ROOTS Young Adult Shelter","Teen Feed","Elizabeth Gregory Home"],
"Capitol Hill & Central District":["Byrd Barr Place","Community Lunch on Capitol Hill","Operation Nightwatch","Atlantic Street Center","Lambert House LGBTQ Youth Center","Japanese Cultural & Community Center of Washington","Seattle Art Museum","Henry Art Gallery","Woodland Park Zoo"],
"Downtown, Pioneer Square & CID":["Union Gospel Mission","Plymouth Housing","Compass Housing Alliance","Chief Seattle Club","Mary's Place","DESC","Pike Market Senior Center & Food Bank","Queen Anne Food Bank","Wellspring Family Services","Chinese Information and Service Center (CISC)","InterIm CDA / Danny Woo Community Garden","Wing Luke Museum","Asian Counseling and Referral Service (ACRS)","Filipino Community of Seattle","Helping Link/Một Dấu Nối","Kin On Health Center","Museum of Flight","Museum of Pop Culture (MoPOP)","Pacific Science Center","Seattle Aquarium","Northwest Folklife"],
"West Seattle & White Center":["West Seattle Food Bank","White Center Food Bank","WestSide Baby","American Cancer Society Discovery Shop (West Seattle)"],
"Beacon Hill & South Seattle":["El Centro de la Raza","Rainier Valley Food Bank","Horn of Africa Services","Urban League of Metropolitan Seattle","Food Lifeline","Recovery Caf\u00e9"],
"Discovery Park & Magnolia":["United Indians of All Tribes Foundation"]
},
intro:["Seattle's volunteer infrastructure is intensely neighborhood-based — most people can find something meaningful within a 15-minute walk. Below, the city's organizations grouped by area, from Ballard's food bank to Beacon Hill's cultural anchors to the Duwamish corridor's restoration crews.","Neighborhood guesses live in each listing's description; when in doubt, the pin on our map view tells you exactly where."],
tips:["Your own neighborhood first: hyper-local volunteering survives busy seasons better than cross-town commitments","Rainier Valley and the CID host cultural institutions found nowhere else in the state","Check the Map tab on our homepage to see everything pinned by area"]}
];
function renderCardSection(orgs){
  const sorted=orgs.slice().sort((a,b)=>a.n.localeCompare(b.n));
  return '<div class="grid">'+sorted.map(cardHTML).join("")+'</div>';
}
function renderTips(tips){
  return '<div class="tipsbox"><h2>Making it work</h2><ul>'+tips.map(t=>"<li>"+t+"</li>").join("")+"</ul></div>";
}
const NEIGHBORHOOD_ORDER=Object.keys(PAGES.find(p=>p.slug==="volunteer-seattle-neighborhoods").neighborhoods||{});
function renderBody(p){
  const orgs=ORGS.filter(p.filter);
  let body='<p class="count">'+orgs.length+" organizations match this guide — updated August 2026.</p>";
  if(p.neighborhoods){
    NEIGHBORHOOD_ORDER.forEach(hood=>{
      const names=p.neighborhoods[hood].filter(n=>ORG_SET.has(n));
      if(!names.length)return;
      body+='<h2 class="sect">'+hood+"</h2>"+renderCardSection(names.map(n=>ORGS.find(o=>o.n===n)));
    });
  }else{
    body+=renderCardSection(orgs);
  }
  body+=renderTips(p.tips);
  body+='<div class="cta"><p>These '+orgs.length+" listings are part of a larger directory of "+ORGS.length+" organizations across the Puget Sound region.</p><a href=\""+BASE+"\">Browse the full directory \u2192</a></div>";
  return body;
}
const guideLinks=PAGES.map(p=>'<a href="'+BASE+p.slug+'/">'+p.h1+"</a>").join("");
const guidesSection='\n<section class="wrap guides"><h2>Popular guides</h2><p>Deep-dives for common ways to help:</p><nav class="guidecloud">'+guideLinks+"</nav></section>\n";
html=html.replace('<svg class="divider"',guidesSection+'<svg class="divider"');
if(!html.includes("og:type"))html=html.replace("</title>","</title>\n"+'<meta property="og:type" content="website">\n<meta property="og:url" content="'+BASE+'">\n<meta property="og:title" content="Volunteer Puget Sound">\n<meta property="og:description" content="187 nonprofits across Seattle, the Eastside, South King County and Snohomish County that need volunteers — searchable by cause and city.">\n<meta name="twitter:card" content="summary">');
fs.writeFileSync("index.html",html);
function pageHTML(p){
  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>'+p.title+"</title>\n"+
'<meta name="description" content="'+p.desc+'">\n<link rel="canonical" href="'+BASE+p.slug+'/">\n'+
'<meta property="og:type" content="article">\n<meta property="og:url" content="'+BASE+p.slug+'/">\n<meta property="og:title" content="'+p.title+'">\n<meta property="og:description" content="'+p.desc+'">\n<meta name="twitter:card" content="summary">\n'+
'<link rel="icon" href="data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><text y=\'.9em\' font-size=\'90\'>🌲</text></svg>">\n'+
'<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'+
'<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Nunito+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">\n'+
"<style>"+css+"\nh1{font-family:Fraunces,Georgia,serif;font-size:clamp(1.9rem,4.5vw,2.8rem);font-weight:700;color:var(--ink);margin-bottom:10px}\n.pagehead{background:linear-gradient(180deg,var(--sky1),var(--sky2));padding:44px 0 34px;border-bottom:1px solid var(--line)}\n.count{color:var(--muted);font-weight:700;margin-bottom:22px}\n.sect{font-family:Fraunces,Georgia,serif;font-size:1.5rem;margin:38px 0 14px;color:var(--green-dark)}\n.intro p{max-width:760px;color:#38566e;font-weight:600;margin-bottom:12px}\n.tipsbox{margin-top:46px;background:#fff;border:1.5px solid var(--line);border-radius:20px;padding:26px}\n.tipsbox h2{font-family:Fraunces,Georgia,serif;color:var(--green-dark);margin-bottom:12px}\n.tipsbox li{margin-bottom:8px;color:#38566e}\n.tipsbox ul{padding-left:22px}\n.cta{margin-top:40px;text-align:center;background:var(--green-dark);color:#cfe2d7;border-radius:20px;padding:30px}\n.cta a{color:#fff;font-weight:800;font-size:1.05rem}\n.topbar{background:var(--cream);border-bottom:1px solid var(--line);padding:14px 0}\n.topbar a.brand{font-family:Fraunces,Georgia,serif;font-weight:700;font-size:1.15rem;color:var(--ink);text-decoration:none}\n.topbar a.cta-link{float:right;font-size:.88rem;font-weight:800;color:var(--green)}\n.guides{padding:10px 0 44px}\n.guidecloud a{display:inline-block;background:#fff;border:1.5px solid var(--line);border-radius:999px;padding:8px 17px;margin:4px;font-size:.86rem;font-weight:800;color:var(--green);text-decoration:none}\n.guidecloud a:hover{border-color:var(--green)}\n@media(max-width:640px){.topbar a.cta-link{float:none;display:block;margin-top:6px}}\n</style>\n</head>\n<body>\n"+
'<div class="topbar"><div class="wrap"><a class="brand" href="'+BASE+'">🌲 The Seattle Volunteer List</a><a class="cta-link" href="'+BASE+'">Full directory →</a></div></div>\n'+
'<header class="pagehead"><div class="wrap"><h1>'+p.h1+"</h1></div></header>\n"+
'<main class="wrap" style="padding-top:28px"><div class="intro">'+p.intro.map(x=>"<p>"+x+"</p>").join("")+"</div>"+
renderBody(p)+
"</main>\n"+
'<footer style="background:var(--green-dark);color:#cfe2d7;padding:30px 0;margin-top:60px"><div class="wrap" style="font-size:.85rem">Part of <a href="'+BASE+'" style="color:#fff;font-weight:800">The Seattle Volunteer List</a> — '+ORGS.length+" organizations across the region. Listings verified August 2026; always confirm current openings on each organization's page.</div></footer>\n"+
"</body>\n</html>";
}
PAGES.forEach(p=>{
  const dir=path.join(p.slug);
  fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,"index.html"),pageHTML(p));
  console.log(p.slug,"->",ORGS.filter(p.filter).length,"orgs");
});
const urls=[BASE,...PAGES.map(p=>BASE+p.slug+"/")];
const today=new Date().toISOString().slice(0,10);
const sm='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(u=>" <url><loc>"+u+"</loc><lastmod>"+today+"</lastmod></url>").join("\n")+"\n</urlset>\n";
fs.writeFileSync("sitemap.xml",sm);
console.log("sitemap.xml ->",urls.length,"urls");
