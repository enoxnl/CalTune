const MAX_BYTES = 2 * 1024 * 1024;
const appointmentFields = new Set(["dtstart", "dtend", "due", "recurrence-id", "rdate", "exdate", "trigger"]);
const appointmentTypes = { trigger: "duration" };

// IANA tzdata 2026e, including aliases and fixed-offset Etc zones.
const IANA_TIME_ZONES = `Africa/Abidjan Africa/Accra Africa/Addis_Ababa Africa/Algiers
Africa/Asmara Africa/Asmera Africa/Bamako Africa/Bangui
Africa/Banjul Africa/Bissau Africa/Blantyre Africa/Brazzaville
Africa/Bujumbura Africa/Cairo Africa/Casablanca Africa/Ceuta
Africa/Conakry Africa/Dakar Africa/Dar_es_Salaam Africa/Djibouti
Africa/Douala Africa/El_Aaiun Africa/Freetown Africa/Gaborone
Africa/Harare Africa/Johannesburg Africa/Juba Africa/Kampala
Africa/Khartoum Africa/Kigali Africa/Kinshasa Africa/Lagos
Africa/Libreville Africa/Lome Africa/Luanda Africa/Lubumbashi
Africa/Lusaka Africa/Malabo Africa/Maputo Africa/Maseru
Africa/Mbabane Africa/Mogadishu Africa/Monrovia Africa/Nairobi
Africa/Ndjamena Africa/Niamey Africa/Nouakchott Africa/Ouagadougou
Africa/Porto-Novo Africa/Sao_Tome Africa/Timbuktu Africa/Tripoli
Africa/Tunis Africa/Windhoek America/Adak America/Anchorage
America/Anguilla America/Antigua America/Araguaina America/Argentina/Buenos_Aires
America/Argentina/Catamarca America/Argentina/ComodRivadavia America/Argentina/Cordoba America/Argentina/Jujuy
America/Argentina/La_Rioja America/Argentina/Mendoza America/Argentina/Rio_Gallegos America/Argentina/Salta
America/Argentina/San_Juan America/Argentina/San_Luis America/Argentina/Tucuman America/Argentina/Ushuaia
America/Aruba America/Asuncion America/Atikokan America/Atka
America/Bahia America/Bahia_Banderas America/Barbados America/Belem
America/Belize America/Blanc-Sablon America/Boa_Vista America/Bogota
America/Boise America/Buenos_Aires America/Cambridge_Bay America/Campo_Grande
America/Cancun America/Caracas America/Catamarca America/Cayenne
America/Cayman America/Chicago America/Chihuahua America/Ciudad_Juarez
America/Coral_Harbour America/Cordoba America/Costa_Rica America/Coyhaique
America/Creston America/Cuiaba America/Curacao America/Danmarkshavn
America/Dawson America/Dawson_Creek America/Denver America/Detroit
America/Dominica America/Edmonton America/Eirunepe America/El_Salvador
America/Ensenada America/Fort_Nelson America/Fort_Wayne America/Fortaleza
America/Glace_Bay America/Godthab America/Goose_Bay America/Grand_Turk
America/Grenada America/Guadeloupe America/Guatemala America/Guayaquil
America/Guyana America/Halifax America/Havana America/Hermosillo
America/Indiana/Indianapolis America/Indiana/Knox America/Indiana/Marengo America/Indiana/Petersburg
America/Indiana/Tell_City America/Indiana/Vevay America/Indiana/Vincennes America/Indiana/Winamac
America/Indianapolis America/Inuvik America/Iqaluit America/Jamaica
America/Jujuy America/Juneau America/Kentucky/Louisville America/Kentucky/Monticello
America/Knox_IN America/La_Paz America/Lima
America/Los_Angeles America/Louisville America/Lower_Princes America/Maceio
America/Managua America/Manaus America/Marigot America/Martinique
America/Matamoros America/Mazatlan America/Mendoza America/Menominee
America/Merida America/Metlakatla America/Mexico_City America/Miquelon
America/Moncton America/Monterrey America/Montevideo America/Montreal
America/Montserrat America/Nassau America/New_York America/Nipigon
America/Nome America/Noronha America/North_Dakota/Beulah America/North_Dakota/Center
America/North_Dakota/New_Salem America/Nuuk America/Ojinaga America/Panama
America/Pangnirtung America/Paramaribo America/Phoenix America/Port-au-Prince
America/Port_of_Spain America/Porto_Acre America/Porto_Velho America/Puerto_Rico
America/Punta_Arenas America/Rainy_River America/Rankin_Inlet America/Recife
America/Regina America/Resolute America/Rio_Branco America/Rosario
America/Santa_Isabel America/Santarem America/Santiago America/Santo_Domingo
America/Sao_Paulo America/Scoresbysund America/Shiprock America/Sitka
America/St_Barthelemy America/St_Johns America/St_Kitts America/St_Lucia
America/St_Thomas America/St_Vincent America/Swift_Current America/Tegucigalpa
America/Thule America/Thunder_Bay America/Tijuana America/Toronto
America/Tortola America/Vancouver America/Virgin America/Whitehorse
America/Winnipeg America/Yakutat America/Yellowknife Antarctica/Casey
Antarctica/Davis Antarctica/DumontDUrville Antarctica/Macquarie Antarctica/Mawson
Antarctica/McMurdo Antarctica/Palmer Antarctica/Rothera Antarctica/South_Pole
Antarctica/Syowa Antarctica/Troll Antarctica/Vostok Arctic/Longyearbyen
Asia/Aden Asia/Almaty Asia/Amman Asia/Anadyr
Asia/Aqtau Asia/Aqtobe Asia/Ashgabat Asia/Ashkhabad
Asia/Atyrau Asia/Baghdad Asia/Bahrain Asia/Baku
Asia/Bangkok Asia/Barnaul Asia/Beirut Asia/Bishkek
Asia/Brunei Asia/Calcutta Asia/Chita Asia/Choibalsan
Asia/Chongqing Asia/Chungking Asia/Colombo Asia/Dacca
Asia/Damascus Asia/Dhaka Asia/Dili Asia/Dubai
Asia/Dushanbe Asia/Famagusta Asia/Gaza Asia/Harbin
Asia/Hebron Asia/Ho_Chi_Minh Asia/Hong_Kong Asia/Hovd
Asia/Irkutsk Asia/Istanbul Asia/Jakarta Asia/Jayapura
Asia/Jerusalem Asia/Kabul Asia/Kamchatka Asia/Karachi
Asia/Kashgar Asia/Kathmandu Asia/Katmandu Asia/Khandyga
Asia/Kolkata Asia/Krasnoyarsk Asia/Kuala_Lumpur Asia/Kuching
Asia/Kuwait Asia/Macao Asia/Macau Asia/Magadan
Asia/Makassar Asia/Manila Asia/Muscat Asia/Nicosia
Asia/Novokuznetsk Asia/Novosibirsk Asia/Omsk Asia/Oral
Asia/Phnom_Penh Asia/Pontianak Asia/Pyongyang Asia/Qatar
Asia/Qostanay Asia/Qyzylorda Asia/Rangoon Asia/Riyadh
Asia/Saigon Asia/Sakhalin Asia/Samarkand Asia/Seoul
Asia/Shanghai Asia/Singapore Asia/Srednekolymsk Asia/Taipei
Asia/Tashkent Asia/Tbilisi Asia/Tehran Asia/Tel_Aviv
Asia/Thimbu Asia/Thimphu Asia/Tokyo Asia/Tomsk
Asia/Ujung_Pandang Asia/Ulaanbaatar Asia/Ulan_Bator Asia/Urumqi
Asia/Ust-Nera Asia/Vientiane Asia/Vladivostok Asia/Yakutsk
Asia/Yangon Asia/Yekaterinburg Asia/Yerevan Atlantic/Azores
Atlantic/Bermuda Atlantic/Canary Atlantic/Cape_Verde Atlantic/Faeroe
Atlantic/Faroe Atlantic/Jan_Mayen Atlantic/Madeira Atlantic/Reykjavik
Atlantic/South_Georgia Atlantic/St_Helena Atlantic/Stanley Australia/ACT
Australia/Adelaide Australia/Brisbane Australia/Broken_Hill Australia/Canberra
Australia/Currie Australia/Darwin Australia/Eucla Australia/Hobart
Australia/LHI Australia/Lindeman Australia/Lord_Howe Australia/Melbourne
Australia/NSW Australia/North Australia/Perth Australia/Queensland
Australia/South Australia/Sydney Australia/Tasmania Australia/Victoria
Australia/West Australia/Yancowinna Brazil/Acre Brazil/DeNoronha
Brazil/East Brazil/West CET CST6CDT
Canada/Atlantic Canada/Central Canada/Eastern Canada/Mountain
Canada/Newfoundland Canada/Pacific Canada/Saskatchewan Canada/Yukon
Chile/Continental Chile/EasterIsland Cuba EET
EST EST5EDT Egypt Eire
Etc/GMT Etc/GMT+0 Etc/GMT+1 Etc/GMT+10
Etc/GMT+11 Etc/GMT+12 Etc/GMT+2 Etc/GMT+3
Etc/GMT+4 Etc/GMT+5 Etc/GMT+6 Etc/GMT+7
Etc/GMT+8 Etc/GMT+9 Etc/GMT-0 Etc/GMT-1
Etc/GMT-10 Etc/GMT-11 Etc/GMT-12 Etc/GMT-13
Etc/GMT-14 Etc/GMT-2 Etc/GMT-3 Etc/GMT-4
Etc/GMT-5 Etc/GMT-6 Etc/GMT-7 Etc/GMT-8
Etc/GMT-9 Etc/GMT0 Etc/Greenwich Etc/UCT
Etc/UTC Etc/Universal Etc/Zulu Europe/Amsterdam
Europe/Andorra Europe/Astrakhan Europe/Athens Europe/Belfast
Europe/Belgrade Europe/Berlin Europe/Bratislava Europe/Brussels
Europe/Bucharest Europe/Budapest Europe/Busingen Europe/Chisinau
Europe/Copenhagen Europe/Dublin Europe/Gibraltar Europe/Guernsey
Europe/Helsinki Europe/Isle_of_Man Europe/Istanbul Europe/Jersey
Europe/Kaliningrad Europe/Kiev Europe/Kirov Europe/Kyiv
Europe/Lisbon Europe/Ljubljana Europe/London Europe/Luxembourg
Europe/Madrid Europe/Malta Europe/Mariehamn Europe/Minsk
Europe/Monaco Europe/Moscow Europe/Nicosia Europe/Oslo
Europe/Paris Europe/Podgorica Europe/Prague Europe/Riga
Europe/Rome Europe/Samara Europe/San_Marino Europe/Sarajevo
Europe/Saratov Europe/Simferopol Europe/Skopje Europe/Sofia
Europe/Stockholm Europe/Tallinn Europe/Tirane Europe/Tiraspol
Europe/Ulyanovsk Europe/Uzhgorod Europe/Vaduz Europe/Vatican
Europe/Vienna Europe/Vilnius Europe/Volgograd Europe/Warsaw
Europe/Zagreb Europe/Zaporozhye Europe/Zurich
GB GB-Eire GMT GMT+0
GMT-0 GMT0 Greenwich HST
Hongkong Iceland Indian/Antananarivo Indian/Chagos
Indian/Christmas Indian/Cocos Indian/Comoro Indian/Kerguelen
Indian/Mahe Indian/Maldives Indian/Mauritius Indian/Mayotte
Indian/Reunion Iran Israel Jamaica
Japan Kwajalein Libya MET
MST MST7MDT Mexico/BajaNorte Mexico/BajaSur
Mexico/General NZ NZ-CHAT Navajo
PRC PST8PDT Pacific/Apia Pacific/Auckland
Pacific/Bougainville Pacific/Chatham Pacific/Chuuk Pacific/Easter
Pacific/Efate Pacific/Enderbury Pacific/Fakaofo Pacific/Fiji
Pacific/Funafuti Pacific/Galapagos Pacific/Gambier Pacific/Guadalcanal
Pacific/Guam Pacific/Honolulu Pacific/Johnston Pacific/Kanton
Pacific/Kiritimati Pacific/Kosrae Pacific/Kwajalein Pacific/Majuro
Pacific/Marquesas Pacific/Midway Pacific/Nauru Pacific/Niue
Pacific/Norfolk Pacific/Noumea Pacific/Pago_Pago Pacific/Palau
Pacific/Pitcairn Pacific/Pohnpei Pacific/Ponape Pacific/Port_Moresby
Pacific/Rarotonga Pacific/Saipan Pacific/Samoa Pacific/Tahiti
Pacific/Tarawa Pacific/Tongatapu Pacific/Truk Pacific/Wake
Pacific/Wallis Pacific/Yap Poland Portugal
ROC ROK Singapore Turkey
UCT US/Alaska US/Aleutian US/Arizona
US/Central US/East-Indiana US/Eastern US/Hawaii
US/Indiana-Starke US/Michigan US/Mountain US/Pacific
US/Samoa UTC Universal W-SU
WET Zulu`.split(/\s+/);
const TIME_ZONES = [...new Set([...IANA_TIME_ZONES, ...Intl.supportedValuesOf("timeZone")])].sort();

class RequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function escapeHtml(value) {
  return String(value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g, "\ufffd")
    .replace(/[&<>]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[character]);
}

function contentLine(line) {
  const parts = [];
  let quoted = false;
  let start = 0;
  for (let index = 0; index < line.length; index++) {
    const character = line[index];
    if (character === '"') quoted = !quoted;
    if (!quoted && (character === ";" || character === ":")) {
      parts.push(line.slice(start, index));
      start = index + 1;
      if (character === ":") {
        const name = parts.shift().toLowerCase();
        const parameters = new Map(parts.map(part => {
          const equals = part.indexOf("=");
          if (equals < 1) throw new RequestError(422, "Ongeldige iCalendar-parameter.");
          const values = part.slice(equals + 1).split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
            .map(value => value.replace(/^"|"$/g, "").replace(/\^(\^|n|')/gi,
              (_, code) => code === "^" ? "^" : code === "'" ? '"' : "\n"));
          return [part.slice(0, equals).toLowerCase(), values];
        }));
        return { name, parameters, value: line.slice(start) };
      }
    }
  }
  throw new RequestError(422, "Ongeldige iCalendar-regel.");
}

function parseCalendar(input) {
  const root = { children: [] };
  const stack = [root];
  for (const line of input.replace(/\r?\n[ \t]/g, "").split(/\r?\n/)) {
    if (!line.trim()) continue;
    const property = contentLine(line);
    const parent = stack.at(-1);
    if (property.name === "begin") {
      if (stack.length >= 16) throw new RequestError(422, "Kalender bevat te veel geneste onderdelen.");
      const child = { name: property.value.toLowerCase(), properties: [], children: [] };
      parent.children.push(child);
      stack.push(child);
    } else if (property.name === "end" && stack.length > 1 && parent.name === property.value.toLowerCase()) {
      stack.pop();
    } else if (stack.length > 1 && property.name !== "end") {
      parent.properties.push(property);
    } else {
      throw new RequestError(422, "Ongeldige iCalendar-structuur.");
    }
  }
  if (stack.length !== 1 || !root.children.length || root.children.some(child => child.name !== "vcalendar")) {
    throw new RequestError(422, "De bron bevat geen volledige iCalendar-kalender.");
  }
  return root.children;
}

function timeZone(name) {
  try {
    if (!/^[a-z][a-z0-9_+/-]*$/i.test(name)) throw new RangeError();
    return new Intl.DateTimeFormat("en", { timeZone: name }).resolvedOptions().timeZone;
  } catch {
    throw new RequestError(400, "Gebruik een geldige IANA-tijdzone, bijvoorbeeld Europe/Amsterdam.");
  }
}

function extended(value) {
  const match = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/.exec(value);
  if (!match) throw new RequestError(422, "Ongeldige datum of tijd in de kalender.");
  const [, year, month, day, hour, minute, second, utc] = match;
  const date = `${year}-${month}-${day}`;
  return hour === undefined ? date : `${date}T${hour}:${minute}:${second}${utc || ""}`;
}

const unescapeText = value => value.replace(/\\([nN,;\\])/g, (_, code) =>
  code.toLowerCase() === "n" ? "\n" : code);
function iCalendarTimeZone(target) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: target, calendar: "iso8601", numberingSystem: "latn", hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  });
}

function utcAppointment(value, zone) {
  if (value.startsWith("P")) return value;
  const clock = extended(value).replace(/Z$/, "");
  const nominal = Date.parse(clock + "Z");
  if (!Number.isFinite(nominal) || new Date(nominal).toISOString().slice(0, 19) !== clock) {
    throw new RequestError(422, "Ongeldige datum of tijd in de kalender.");
  }
  const wallTime = instant => {
    const p = Object.fromEntries(zone.formatToParts(instant).map(({ type, value }) => [type, value]));
    return `${p.year.padStart(4, "0")}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}`;
  };
  const offset = instant => Date.parse(wallTime(instant) + "Z") - instant;
  const day = 86_400_000;
  const earlierOffset = offset(nominal - day);
  const candidates = [...new Set([earlierOffset, offset(nominal), offset(nominal + day)])]
    .map(delta => nominal - delta).filter(instant => wallTime(instant) === clock);
  // iCalendar chooses the earlier occurrence in an overlap and the pre-gap offset.
  const instant = candidates.length ? Math.min(...candidates) : nominal - earlierOffset;
  return new Date(instant).toISOString().slice(0, 19).replace(/[-:]/g, "") + "Z";
}

function foldCalendarLine(line) {
  let result = "";
  let bytes = 0;
  for (const character of line) {
    const point = character.codePointAt(0);
    const size = point <= 0x7f ? 1 : point <= 0x7ff ? 2 : point <= 0xffff ? 3 : 4;
    if (bytes + size > 75) {
      result += "\r\n ";
      bytes = 1;
    }
    result += character;
    bytes += size;
  }
  return result;
}

function toIcs(calendars, target) {
  const zone = iCalendarTimeZone(target);
  const parameterValue = value => {
    const encoded = value.replaceAll("^", "^^").replaceAll('"', "^'").replaceAll("\n", "^n");
    return /[;:,]/.test(encoded) ? `"${encoded}"` : encoded;
  };
  const lines = [];
  for (const calendar of calendars) {
    const uid = component => component.properties.find(property => property.name === "uid")?.value;
    const hasRule = component => component.properties.some(property => property.name === "rrule");
    const series = new Set(calendar.children.filter(hasRule).map(uid).filter(Boolean));
    function writeComponent(component, rewrite = true, recurring = false) {
      rewrite = rewrite && component.name !== "vtimezone";
      recurring = recurring || hasRule(component) || series.has(uid(component));
      const name = component.name.toUpperCase();
      lines.push(`BEGIN:${name}`);
      for (const property of component.properties) {
        const parameters = new Map(property.parameters);
        const type = parameters.get("value")?.[0].toLowerCase() || appointmentTypes[property.name] || "date-time";
        let value = property.value;
        if (rewrite && appointmentFields.has(property.name) && (type === "date-time" || type === "period")) {
          parameters.delete("tzid");
          // A series uses its local clock across DST. Standalone instants are unambiguous in UTC.
          const local = recurring && target !== "UTC" && property.name !== "trigger";
          if (local) parameters.set("tzid", [target]);
          value = value.split(",").map(item => item.split("/").map(part =>
            local ? part.replace(/Z$/, "") : utcAppointment(part, zone)).join("/")).join(",");
        }
        const suffix = [...parameters].map(([key, values]) =>
          `;${key.toUpperCase()}=${values.map(parameterValue).join(",")}`).join("");
        lines.push(`${property.name.toUpperCase()}${suffix}:${value}`);
      }
      for (const child of component.children) writeComponent(child, rewrite, component.name !== "vcalendar" && recurring);
      lines.push(`END:${name}`);
    }
    writeComponent(calendar);
  }
  return lines.map(foldCalendarLine).join("\r\n") + "\r\n";
}

function validateSource(value, originHost) {
  let url;
  try {
    url = new URL(value.replace(/^webcal:/i, "https:"));
  } catch {
    throw new RequestError(400, "Geef een geldige HTTPS- of webcal-bron-URL op.");
  }
  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  if (url.protocol !== "https:" || url.username || url.password || url.port || url.hash ||
      !/^(?:[a-z0-9-]+\.)+[a-z][a-z0-9-]*$/.test(hostname) ||
      /.(?:localhost|local|internal|onion|test|invalid|example|home|lan)$/.test(hostname) ||
      hostname === originHost.toLowerCase().replace(/\.$/, "")) {
    throw new RequestError(400, "Gebruik een publieke HTTPS-bron-URL zonder poort, fragment of inloggegevens.");
  }
  return url;
}

async function download(url, originHost) {
  const signal = AbortSignal.timeout(10_000);
  for (let redirects = 0; redirects <= 4; redirects++) {
    const response = await fetch(url, {
      redirect: "manual", signal,
      headers: { Accept: "text/calendar, application/octet-stream;q=0.9, */*;q=0.1" },
      cache: "no-store"
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      await response.body?.cancel();
      const location = response.headers.get("location");
      if (!location) break;
      url = validateSource(new URL(location, url).href, originHost);
      continue;
    }
    if (!response.ok || !response.body) {
      await response.body?.cancel();
      throw new RequestError(502, `De kalenderbron is niet beschikbaar (HTTP ${response.status}).`);
    }
    if (Number(response.headers.get("content-length")) > MAX_BYTES) {
      await response.body.cancel();
      throw new RequestError(413, "De kalender is groter dan 2 MiB.");
    }
    const reader = response.body.getReader();
    const chunks = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) {
        await reader.cancel();
        throw new RequestError(413, "De kalender is groter dan 2 MiB.");
      }
      chunks.push(value);
    }
    const contents = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      contents.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return contents;
  }
  throw new RequestError(502, "De bron gaf te veel of ongeldige omleidingen.");
}

const attribute = value => escapeHtml(value).replace(/"/g, "&quot;");

function previewTime(value) {
  const [date, clock] = extended(value).split("T");
  const [year, month, day] = date.split("-");
  return `${day}-${month}-${year}${clock ? " " + clock.slice(0, 5) : " · hele dag"}`;
}

function previewResults(calendars, target, calendarUrl) {
  const events = calendars.flatMap(calendar => calendar.children.filter(component => component.name === "vevent"))
    .slice(0, 10);
  const rows = events.map(event => {
    const field = name => event.properties.find(property => property.name === name)?.value;
    const title = escapeHtml(unescapeText(field("summary") || "Naamloze afspraak"));
    const start = field("dtstart");
    const end = field("dtend");
    // An all-day DTEND is the first day after the event.
    const endLabel = end && end.includes("T") ? `<span>Einde ${previewTime(end)}</span>` : "";
    return `<li><strong>${title}</strong><div class="times">${start ? `<span>Begin ${previewTime(start)}</span>` : ""}
      ${endLabel}</div></li>`;
  }).join("");
  return `<section aria-labelledby="result">
<h2 id="result">Kalender</h2>
<label>Abonnements-URL voor Google Agenda (.ics)<input readonly spellcheck="false" value="${attribute(calendarUrl)}"></label>
<p><a href="${attribute(calendarUrl)}">Open .ics</a></p>
<h3>Eerste afspraken</h3>
<p>${target ? `Tijdzone ${escapeHtml(target)}.` : "Tijden en tijdzones uit de bronfeed."} Maximaal 10 afspraken in de volgorde van de bronfeed.</p>
${rows ? `<ul class="events">${rows}</ul>` : "<p>De bronfeed bevat geen afspraken.</p>"}
</section>`;
}

function timeZoneOptions(selected) {
  const active = TIME_ZONES.includes(selected) ? selected : "";
  const placeholder = `<option value="" disabled${active ? "" : " selected"}>Kies een tijdzone</option>`;
  return placeholder + TIME_ZONES.map(zone =>
    `<option value="${attribute(zone)}"${zone === active ? " selected" : ""}>${escapeHtml(zone)}</option>`).join("");
}

function page({ sourceUrl = "", target = "", force = false, result = "" } = {}) {
  return `<!doctype html>
<html lang="nl"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="no-referrer"><title>FixiCal</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#eef3f7;color:#173047;font:1rem/1.5 system-ui,sans-serif}
main{max-width:40rem;margin:clamp(2rem,9vw,7rem) auto;padding:0 1rem}h1{font-size:2.6rem;line-height:1.1;margin:0}
form{display:grid;gap:1rem;padding:1.5rem;background:white;border:1px solid #cbd7e0;border-radius:1rem}
label{display:grid;gap:.3rem;font-weight:600}input,select,button{font:inherit;border-radius:.45rem;padding:.65rem .8rem}
input,select{width:100%;border:1px solid #758a9a;color:inherit}
.force-option{display:flex;align-items:center;gap:.5rem}
.force-option input{width:1.1rem;height:1.1rem;margin:0;accent-color:#145361}
.force-zone{display:grid;gap:.75rem}.force-zone .zone-select{display:none}
.force-zone:has(input:checked) .zone-select{display:grid}
select{appearance:none;padding-right:2.5rem;background:linear-gradient(45deg,transparent 50%,#173047 50%) right 1.2rem center/6px 6px no-repeat,linear-gradient(135deg,#173047 50%,transparent 50%) right .85rem center/6px 6px no-repeat,#fff}
button{border:0;background:#145361;color:white;font-weight:700;cursor:pointer}
a{color:#145361;text-decoration-thickness:.1em;text-underline-offset:.15em}
section{margin-top:1.5rem;padding:1.5rem;background:white;border:1px solid #cbd7e0;border-radius:1rem}
section h2{margin-top:0}.events{margin:0;padding:0;list-style:none}
.events li{padding:.8rem 0;border-top:1px solid #cbd7e0;overflow-wrap:anywhere}
.times{display:flex;flex-wrap:wrap;gap:.25rem 1rem}
p[role=alert]{padding:1rem;background:#fff4f1;color:#61231d;border-radius:.45rem}
</style><main><h1>FixiCal</h1><p>Maak een .ics-abonnementslink. Je kunt de tijdzone overschrijven met behoud van de kloktijden.</p>
<form action="/preview" method="get">
<label>Bron-URL<input name="url" required value="${attribute(sourceUrl)}" placeholder="https://…/kalender.ics"></label>
<div class="force-zone">
<label class="force-option"><input type="checkbox" name="force" value="1"${force ? " checked" : ""}>Force timezone</label>
<label class="zone-select">Doeltijdzone<select name="timezone">${timeZoneOptions(target)}</select></label>
</div>
<button>Toon kalender en afspraken</button></form>
${result}</main></html>`;
}

function reply(body, status, type, extra = {}) {
  return new Response(body, { status, headers: {
    "Content-Type": type, "Cache-Control": "no-store", "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'",
    ...extra
  } });
}

export default {
  async fetch(request) {
    const path = new URL(request.url);
    const plain = "text/plain; charset=utf-8";
    const html = "text/html; charset=utf-8";
    const preview = path.pathname === "/preview";
    const query = path.searchParams;
    const zoneParameter = query.has("forcetimezone") ? "forcetimezone" : "to";
    const useForm = preview && !query.has(zoneParameter);
    const force = useForm ? query.has("force") : query.has(zoneParameter);
    const form = {
      sourceUrl: query.get("url") || "",
      target: force ? query.get(useForm ? "timezone" : zoneParameter) || "" : "",
      force
    };
    const failure = (message, status) => preview
      ? reply(page({ ...form, result: `<p role="alert">${escapeHtml(message)}</p>` }), status, html)
      : reply(message, status, plain);
    if (request.method !== "GET") return reply("Gebruik GET.", 405, plain, { Allow: "GET" });
    if (path.pathname === "/" && !path.search) return reply(page(), 200, html);
    if (!["/", "/convert", "/preview", "/calendar.ics"].includes(path.pathname)) return reply("Route niet gevonden.", 404, plain);
    try {
      const values = query.getAll("url");
      if (values.length !== 1 || !values[0]) throw new RequestError(400, 'Geef parameter "url" één keer op.');
      const [sourceUrl] = values;
      const zones = force ? query.getAll(useForm ? "timezone" : zoneParameter) : [];
      if (force && (zones.length !== 1 || !zones[0])) throw new RequestError(400, "Kies één doeltijdzone.");
      const target = force ? timeZone(zones[0]) : "";
      const url = validateSource(sourceUrl, path.hostname);
      const input = await download(url, path.hostname);
      const calendarType = "text/calendar; charset=utf-8";
      if (!preview && !target) return reply(input, 200, calendarType);
      const calendars = parseCalendar(new TextDecoder().decode(input));
      if (preview) {
        const calendarUrl = new URL("/calendar.ics", path);
        calendarUrl.searchParams.set("url", sourceUrl);
        if (target) calendarUrl.searchParams.set("forcetimezone", target);
        return reply(page({ sourceUrl, target, force, result: previewResults(calendars, target, calendarUrl.href) }), 200, html);
      }
      return reply(toIcs(calendars, target), 200, calendarType);
    } catch (error) {
      if (error instanceof RequestError) return failure(error.message, error.status);
      if (error.name === "TimeoutError" || error.name === "AbortError") {
        return failure("De kalenderbron reageerde niet op tijd.", 504);
      }
      return failure("De kalenderbron kon niet worden verwerkt.", 502);
    }
  }
};
