const BUILD_COMMIT = "";
const CALTUNE_PRODUCT_ID = "-//enox.nl//CalTune//EN";
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
          if (equals < 1) throw new RequestError(422, "Invalid iCalendar parameter.");
          const values = part.slice(equals + 1).split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
            .map(value => value.replace(/^"|"$/g, "").replace(/\^(\^|n|')/gi,
              (_, code) => code === "^" ? "^" : code === "'" ? '"' : "\n"));
          return [part.slice(0, equals).toLowerCase(), values];
        }));
        return { name, parameters, value: line.slice(start) };
      }
    }
  }
  throw new RequestError(422, "Invalid iCalendar line.");
}

function parseCalendar(input) {
  const root = { children: [] };
  const stack = [root];
  for (const line of input.replace(/\r?\n[ \t]/g, "").split(/\r?\n/)) {
    if (!line.trim()) continue;
    const property = contentLine(line);
    const parent = stack.at(-1);
    if (property.name === "begin") {
      if (stack.length >= 16) throw new RequestError(422, "The calendar contains too many nested components.");
      const child = { name: property.value.toLowerCase(), properties: [], children: [] };
      parent.children.push(child);
      stack.push(child);
    } else if (property.name === "end" && stack.length > 1 && parent.name === property.value.toLowerCase()) {
      stack.pop();
    } else if (stack.length > 1 && property.name !== "end") {
      parent.properties.push(property);
    } else {
      throw new RequestError(422, "Invalid iCalendar structure.");
    }
  }
  if (stack.length !== 1 || !root.children.length || root.children.some(child => child.name !== "vcalendar")) {
    throw new RequestError(422, "The source does not contain a complete iCalendar feed.");
  }
  return root.children;
}

function timeZone(name) {
  try {
    if (!/^[a-z][a-z0-9_+/-]*$/i.test(name)) throw new RangeError();
    return new Intl.DateTimeFormat("en", { timeZone: name }).resolvedOptions().timeZone;
  } catch {
    throw new RequestError(400, "Enter a valid IANA time zone, such as Europe/Amsterdam.");
  }
}

function extended(value) {
  const match = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/.exec(value);
  if (!match) throw new RequestError(422, "Invalid date or time in the calendar.");
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
    throw new RequestError(422, "Invalid date or time in the calendar.");
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
  const zone = target ? iCalendarTimeZone(target) : null;
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
        if (zone && rewrite && appointmentFields.has(property.name) && (type === "date-time" || type === "period")) {
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
    throw new RequestError(400, "Enter a valid HTTPS or webcal source URL.");
  }
  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  if (url.protocol !== "https:" || url.username || url.password || url.port || url.hash ||
      !/^(?:[a-z0-9-]+\.)+[a-z][a-z0-9-]*$/.test(hostname) ||
      /.(?:localhost|local|internal|onion|test|invalid|example|home|lan)$/.test(hostname) ||
      hostname === originHost.toLowerCase().replace(/\.$/, "")) {
    throw new RequestError(400, "Use a public HTTPS source URL without a port, fragment, or credentials.");
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
      throw new RequestError(502, `The source calendar is unavailable (HTTP ${response.status}).`);
    }
    if (Number(response.headers.get("content-length")) > MAX_BYTES) {
      await response.body.cancel();
      throw new RequestError(413, "The calendar exceeds 2 MiB.");
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
        throw new RequestError(413, "The calendar exceeds 2 MiB.");
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
  throw new RequestError(502, "The source returned too many redirects or an invalid redirect.");
}

const attribute = value => escapeHtml(value).replace(/"/g, "&quot;");

const MAX_RULES = 12;

function readTextEdits(query, key) {
  const edits = new URLSearchParams();
  const findKey = `${key}-find`;
  const replaceKey = `${key}-replace`;
  const singleFields = [`${key}-prefix`, `${key}-suffix`];
  if (key === "title") singleFields.push("title-remove");
  for (const name of [...singleFields, findKey, replaceKey]) {
    const values = query.getAll(name);
    const limit = [findKey, replaceKey].includes(name) ? MAX_RULES : 1;
    if (values.length > limit || values.some(value => value.length > 160 || /[\r\n]/.test(value))) {
      throw new RequestError(400, "Use up to 12 replacement rules and one line of up to 160 characters per field.");
    }
  }
  for (const name of [`${key}-prefix`, `${key}-suffix`]) {
    const value = query.get(name)?.trim();
    if (value) edits.set(name, value);
  }
  const finds = query.getAll(findKey);
  const replacements = query.getAll(replaceKey);
  for (let index = 0; index < Math.max(finds.length, replacements.length); index++) {
    const find = finds[index];
    const replacement = replacements[index] || "";
    if (find?.trim()) {
      edits.append(findKey, find);
      edits.append(replaceKey, replacement);
    } else if (replacement.trim()) {
      throw new RequestError(400, "Enter Find text for each replacement rule.");
    }
  }
  const legacyRemove = key === "title" ? query.get("title-remove") : "";
  if (legacyRemove?.trim()) {
    if (edits.getAll(findKey).length >= MAX_RULES) {
      throw new RequestError(400, "Use up to 12 replacement rules.");
    }
    edits.append(findKey, legacyRemove);
    edits.append(replaceKey, "");
  }
  return edits;
}

function escapeCalendarText(value) {
  return value.replaceAll("\\", "\\\\").replaceAll("\n", "\\n")
    .replaceAll(",", "\\,").replaceAll(";", "\\;");
}

function editEventText(calendars, edits, key, propertyName) {
  const replacements = edits.getAll(`${key}-replace`);
  const rules = edits.getAll(`${key}-find`).map((find, index) => [find, replacements[index]]);
  const prefix = edits.get(`${key}-prefix`)?.trim();
  const suffix = edits.get(`${key}-suffix`)?.trim();
  let growth = 0;

  for (const calendar of calendars) {
    for (const event of calendar.children) {
      if (event.name !== "vevent") continue;
      const field = event.properties.find(property => property.name === propertyName);
      const original = unescapeText(field?.value || "");
      let text = original;
      for (const [find, replacement] of rules) {
        if (text.length > 8192 && replacement.length > find.length && text.includes(find)) {
          throw new RequestError(422, `This replacement would make an event ${key} too large.`);
        }
        text = text.replaceAll(find, () => replacement);
      }
      if (text !== original) text = text.trim();
      if (prefix || suffix) text = [prefix, text, suffix].filter(Boolean).join(" ");
      if (text === original) continue;
      growth += Math.max(0, text.length - original.length);
      if (growth > MAX_BYTES) throw new RequestError(422, "These edits would make the calendar too large.");
      const value = escapeCalendarText(text);
      if (field) field.value = value;
      else event.properties.push({ name: propertyName, parameters: new Map(), value });
      if (propertyName === "description") {
        // Alternate descriptions still describe the original text.
        if (field?.parameters.has("altrep")) {
          field.parameters = new Map(field.parameters);
          field.parameters.delete("altrep");
        }
        event.properties = event.properties.filter(property =>
          !["x-alt-desc", "styled-description"].includes(property.name));
      }
    }
  }
}

function optionTextInput(name, label, value = "", type = "text", maxLength = 160) {
  return `<label>${label}<input type="${type}" name="${name}" maxlength="${maxLength}" value="${attribute(value)}"></label>`;
}

function textRuleRow(key, find = "", replacement = "") {
  return `<div class="edit-row rule-row replacement-rule">
${optionTextInput(`${key}-find`, "Find text", find)}
${optionTextInput(`${key}-replace`, "Replace with", replacement)}
<button class="secondary" type="button" data-remove-rule aria-label="Remove replacement rule">Remove</button>
</div>`;
}

function textFieldsHtml(key, values, enabled) {
  const finds = values.getAll(`${key}-find`);
  const replacements = values.getAll(`${key}-replace`);
  const legacyRemove = key === "title" ? values.get("title-remove") : "";
  if (legacyRemove && finds.length < MAX_RULES) {
    replacements[finds.length] = "";
    finds.push(legacyRemove);
  }
  const rows = Array.from({ length: Math.min(MAX_RULES, Math.max(1, finds.length, replacements.length)) },
    (_, index) => textRuleRow(key, finds[index], replacements[index]));
  return `<div class="option-panel text-edits">
<input type="hidden" name="${key}-form" value="1">
<label class="force-option"><input class="text-edit-toggle" type="checkbox" name="edit-${key}s" value="1"${enabled ? " checked" : ""}>Edit event ${key}s</label>
<div class="text-options" data-rule-editor>
<div class="edit-row">
${optionTextInput(`${key}-prefix`, `Add before the ${key}`, values.get(`${key}-prefix`) || "")}
${optionTextInput(`${key}-suffix`, `Add after the ${key}`, values.get(`${key}-suffix`) || "")}
</div>
<p>Replacement rules run from top to bottom and match exact text. Leave “Replace with” blank to delete the matching text.</p>
<div data-rule-list>${rows.join("")}</div>
<template data-rule-template>${textRuleRow(key)}</template>
<button class="secondary" data-add-rule type="button">Add replacement rule</button>
</div></div>`;
}

const eventStatuses = ["TENTATIVE", "CONFIRMED", "CANCELLED"];

const extraOptions = [
  { toggle: "filter-events", label: "Filter events",
    fields: [["include-title", "Title contains"], ["exclude-title", "Title excludes"]], multiple: true },
  { toggle: "hide-details", label: "Hide event details",
    fields: [["hide-description", "Descriptions"], ["hide-location", "Locations"],
      ["hide-attendees", "Attendees and organizers"], ["hide-status", "Status"], ["hide-event-url", "Event URL"]], checkboxes: true },
  { toggle: "force-event-status", label: "Force event status",
    fields: [["force-status", "Target status"]], choices: eventStatuses },
  { toggle: "force-event-url", label: "Force event URL",
    fields: [["event-url", "Replacement event URL"]], url: true },
  { toggle: "set-published-ttl", label: "Set suggested refresh interval",
    fields: [["published-ttl", "Suggested refresh interval"]] },
  { toggle: "rename-calendar", label: "Rename calendar",
    fields: [["calendar-name", "Calendar name"]] }
];

function extraEnabled(query, useForm, option) {
  return useForm ? query.has(option.toggle) : option.fields.some(([name]) => query.has(name));
}

const durationUnits = [
  ["week", "P", "W"], ["day", "P", "D"], ["hour", "PT", "H"],
  ["minute", "PT", "M"], ["second", "PT", "S"]
];

function durationParts(value) {
  const match = /^\+?P(?:(\d+)W|(?=\d+D|T)(?:(\d+)D)?(?:T(?=\d)(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?)$/i.exec(value);
  if (!match) return null;
  return durationUnits.flatMap(([unit], index) => {
    const amount = match[index + 1]?.replace(/^0+(?=\d)/, "");
    return amount === undefined ? [] : [[unit, amount]];
  });
}

function humanDuration(value) {
  const parts = durationParts(value);
  if (!parts) return value;
  const positive = parts.filter(([, amount]) => amount !== "0");
  return positive.map(([unit, amount]) => `${amount} ${unit}${amount === "1" ? "" : "s"}`).join(", ") || "0 seconds";
}

function publishedTtlFromForm(query, existing) {
  const amounts = query.getAll("published-ttl-amount");
  const units = query.getAll("published-ttl-unit");
  if (!amounts.length && !units.length) return existing;
  if (amounts.length === 1 && units.length === 1) {
    const amount = amounts[0];
    const unit = durationUnits.find(([name]) => name === units[0]);
    if (!amount && existing && unit) return existing;
    if (/^\d{1,155}$/.test(amount) && /[1-9]/.test(amount) && unit) {
      return `${unit[1]}${amount.replace(/^0+/, "")}${unit[2]}`;
    }
  }
  throw new RequestError(400, "Enter a positive whole number and select a time unit.");
}

function durationFields(query, enabled) {
  const existing = enabled ? query.get("published-ttl") || "" : "";
  const parts = (durationParts(existing) || []).filter(([, amount]) => amount !== "0");
  const [existingUnit, existingAmount] = parts.length === 1 ? parts[0] : [];
  const amount = enabled ? query.get("published-ttl-amount") || existingAmount || "" : "";
  const unit = enabled ? query.get("published-ttl-unit") || existingUnit || "minute" : "minute";
  const choices = durationUnits.map(([name]) =>
    `<option value="${name}"${name === unit ? " selected" : ""}>${name[0].toUpperCase() + name.slice(1)}s</option>`).join("");
  const compound = parts.length > 1 ?
    `<input type="hidden" name="published-ttl" value="${attribute(existing)}">
<p>Current interval: ${escapeHtml(humanDuration(existing))}. Enter a new amount to replace it.</p>` : "";
  return `${compound}<div class="edit-row" data-duration-fields>
<label>Amount<input type="number" name="published-ttl-amount" min="1" step="1" value="${attribute(amount)}"></label>
<label>Unit<select name="published-ttl-unit">${choices}</select></label>
</div>`;
}

function readExtras(query, useForm) {
  const result = new URLSearchParams();
  for (const option of extraOptions) {
    if (!extraEnabled(query, useForm, option)) continue;
    for (const [name, label] of option.fields) {
      const values = query.getAll(name);
      if (!values.length) continue;
      const limit = option.multiple ? MAX_RULES : 1;
      if (values.length > limit) throw new RequestError(400, `Too many values for ${label}.`);
      for (const value of values) {
        const invalid = option.checkboxes ? value !== "1" : value.length > (option.url ? 2048 : 160) || /[\r\n]/.test(value);
        if (invalid || (value && option.choices && !option.choices.includes(value))) {
          throw new RequestError(400, `Invalid value for ${label}.`);
        }
        if (value.trim()) result.append(name, value.trim());
      }
    }
    if (option.toggle === "set-published-ttl") {
      const original = result.get("published-ttl") || "";
      const ttl = (useForm ? publishedTtlFromForm(query, original) : original).toUpperCase();
      if (!durationParts(ttl)?.some(([, amount]) => amount !== "0")) {
        throw new RequestError(400, "Enter a positive refresh interval.");
      }
      result.set("published-ttl", ttl);
    }
    if (option.url) {
      const name = option.fields[0][0];
      const url = URL.parse(result.get(name) || "");
      if (!url || !["http:", "https:"].includes(url.protocol) || url.username || url.password) {
        throw new RequestError(400, "Enter an HTTP or HTTPS event URL without credentials.");
      }
      result.set(name, url.href);
    }
    if (option.choices && !result.has(option.fields[0][0])) {
      throw new RequestError(400, "Select a target status.");
    }
    if (option.toggle === "rename-calendar" && !result.has("calendar-name")) {
      throw new RequestError(400, "Enter a calendar name.");
    }
  }
  return result;
}

function filterRuleFields(name, label, values) {
  const row = (value = "") => `<div class="edit-row rule-row filter-rule">
${optionTextInput(name, label, value)}
<button class="secondary" type="button" data-remove-rule aria-label="Remove filter rule">Remove</button>
</div>`;
  const exclude = name === "exclude-title";
  return `<fieldset class="filter-rules" data-rule-editor>
<legend>${exclude ? "Exclude if any rule matches" : "Include if any rule matches"}</legend>
<div data-rule-list>${(values.length ? values.slice(0, MAX_RULES) : [""]).map(row).join("")}</div>
<template data-rule-template>${row()}</template>
<button class="secondary" data-add-rule type="button">${exclude ? "Add exclusion rule" : "Add inclusion rule"}</button>
</fieldset>`;
}

function extraFieldsHtml(query, useForm) {
  return Object.fromEntries(extraOptions.map(option => {
    const enabled = extraEnabled(query, useForm, option);
    const fields = option.fields.map(([name, label]) => {
      if (option.toggle === "set-published-ttl") return durationFields(query, enabled);
      if (option.multiple) return filterRuleFields(name, label, enabled ? query.getAll(name) : []);
      const value = enabled ? query.get(name) : "";
      if (option.choices) {
        const choices = option.choices.map(status => `<option value="${status}"${value === status ? " selected" : ""}>${status[0] + status.slice(1).toLowerCase()}</option>`).join("");
        return `<label>${label}<select name="${name}"><option value="">Select a status</option>${choices}</select></label>`;
      }
      if (option.url) return optionTextInput(name, label, value || "", "url", 2048);
      if (!option.checkboxes) return optionTextInput(name, label, value || "");
      return `<label class="force-option"><input type="checkbox" name="${name}" value="1"${value === "1" ? " checked" : ""}>${label}</label>`;
    }).join("");
    const hint = option.toggle === "filter-events" ? "Matches the original event title, regardless of capitalization." : "";
    return [option.toggle, `<div class="option-panel extra-option">
<label class="force-option"><input class="extra-toggle" type="checkbox" name="${option.toggle}" value="1"${enabled ? " checked" : ""}>${option.label}</label>
<div class="extra-fields">${hint ? `<p>${hint}</p>` : ""}${fields}</div>
</div>`];
  }));
}

function applyExtras(calendars, extras, target, keepProductId) {
  const include = extras.getAll("include-title").map(value => value.toLowerCase());
  const exclude = extras.getAll("exclude-title").map(value => value.toLowerCase());
  const calendarName = extras.get("calendar-name");
  const publishedTtl = extras.get("published-ttl");
  const hidden = new Set();
  if (extras.has("hide-status")) hidden.add("status");
  if (extras.has("hide-event-url")) hidden.add("url");
  const replacements = [["status", extras.get("force-status")], ["url", extras.get("event-url")]]
    .filter(([name, value]) => value && !hidden.has(name));
  if (extras.has("hide-description")) {
    hidden.add("description");
    hidden.add("x-alt-desc");
    hidden.add("styled-description");
  }
  if (extras.has("hide-location")) {
    hidden.add("location");
    hidden.add("geo");
    hidden.add("x-apple-structured-location");
  }
  if (extras.has("hide-attendees")) {
    hidden.add("attendee");
    hidden.add("organizer");
  }
  for (const calendar of calendars) {
    if (include.length || exclude.length) {
      const value = (event, name) => event.properties.find(field => field.name === name)?.value;
      const series = new Map(calendar.children
        .filter(event => event.name === "vevent" && value(event, "uid") && !value(event, "recurrence-id"))
        .map(event => [value(event, "uid"), value(event, "summary")]));
      calendar.children = calendar.children.filter(event => {
        if (event.name !== "vevent") return true;
        const uid = value(event, "uid");
        const summary = series.has(uid) ? series.get(uid) : value(event, "summary");
        const title = unescapeText(summary || "").toLowerCase();
        return (!include.length || include.some(text => title.includes(text))) && !exclude.some(text => title.includes(text));
      });
    }
    if (hidden.size || replacements.length) {
      for (const event of calendar.children) {
        if (event.name !== "vevent") continue;
        event.properties = event.properties.filter(field => !hidden.has(field.name) &&
          !replacements.some(([name]) => name === field.name));
        for (const [name, value] of replacements) {
          event.properties.push({ name, parameters: new Map(), value });
        }
        // Keep alarms valid when a field required by their action is hidden.
        event.children = event.children.filter(child =>
          child.name !== "valarm" || !child.properties.some(field => hidden.has(field.name)));
      }
    }
    if (!keepProductId) {
      calendar.properties = calendar.properties.filter(field => field.name !== "prodid");
      calendar.properties.push({ name: "prodid", parameters: new Map(), value: CALTUNE_PRODUCT_ID });
    }
    if (target) {
      calendar.properties = calendar.properties.filter(field => field.name !== "x-wr-timezone");
      calendar.properties.push({ name: "x-wr-timezone", parameters: new Map(), value: target });
    }
    if (publishedTtl) {
      calendar.properties = calendar.properties.filter(field => field.name !== "x-published-ttl");
      calendar.properties.push({ name: "x-published-ttl", parameters: new Map(), value: publishedTtl });
    }
    if (calendarName) {
      calendar.properties = calendar.properties.filter(field => !["name", "x-wr-calname"].includes(field.name));
      const name = escapeCalendarText(calendarName);
      for (const property of ["name", "x-wr-calname"]) {
        calendar.properties.push({ name: property, parameters: new Map(), value: name });
      }
    }
  }
}

function previewTime(value) {
  const [date, clock] = extended(value).split("T");
  const [year, month, day] = date.split("-");
  return `${day}-${month}-${year}${clock ? " " + clock.slice(0, 5) : " · all day"}`;
}

function calendarEvents(calendars) {
  return calendars.flatMap(calendar => calendar.children.filter(component => component.name === "vevent"));
}

function eventCard(properties, label, target) {
  const field = name => properties.find(property => property.name === name);
  const title = escapeHtml(unescapeText(field("summary")?.value || "Untitled event"));
  const start = field("dtstart");
  const end = field("dtend")?.value;
  // An all-day DTEND is the first day after the event.
  const endLabel = end && end.includes("T") ? `<span>End ${previewTime(end)}</span>` : "";
  const zone = start?.value.includes("T") ?
    target || (start.value.endsWith("Z") ? "UTC" : start.parameters.get("tzid")?.[0] || "Floating local time") : "";
  const details = [["Time zone", zone]];
  for (const [name, detailLabel] of [["description", "Description"], ["location", "Location"],
    ["organizer", "Organizer"], ["attendee", "Attendees"], ["status", "Status"],
    ["duration", "Duration"], ["url", "Event URL"]]) {
    const values = properties.filter(property => property.name === name && property.value).map(property => {
      if (!["organizer", "attendee"].includes(name)) return unescapeText(property.value);
      const address = property.value.replace(/^mailto:/i, "");
      const commonName = property.parameters.get("cn")?.[0];
      return commonName ? `${commonName} (${address})` : address;
    });
    if (values.length) details.push([detailLabel, values.join("\n")]);
  }
  const terms = details.filter(([, value]) => value).map(([term, value]) =>
    `<dt>${term}</dt><dd>${escapeHtml(value)}</dd>`).join("");
  return `<div class="event-card">
<h4>${label}</h4>
<strong>${title}</strong>
<div class="times">${start ? `<span>Start ${previewTime(start.value)}</span>` : ""}${endLabel}</div>
<details><summary>Details</summary><div class="event-detail-panel">${terms ? `<dl>${terms}</dl>` : "<p>No additional details.</p>"}</div></details>
</div>`;
}

function calendarOverview(calendars) {
  return calendars.map(calendar => {
    const value = (...names) => {
      for (const name of names) {
        const property = calendar.properties.find(field => field.name === name && field.value.trim());
        if (property) return unescapeText(property.value);
      }
      return "";
    };
    return {
      name: value("name", "x-wr-calname") || "No calendar name",
      details: [
        ["Events", calendar.children.filter(component => component.name === "vevent").length],
        ["Suggested refresh interval", humanDuration(value("x-published-ttl")) || "Not set"],
        ["Refresh interval", humanDuration(value("refresh-interval"))],
        ["Description", value("description", "x-wr-caldesc")],
        ["Time zone", value("x-wr-timezone")],
        ["iCalendar version", value("version")],
        ["Calendar scale", value("calscale")],
        ["Method", value("method")],
        ["Product ID", value("prodid")],
        ["Calendar URL", value("url")],
        ["Source", value("source")]
      ].filter(([, detail]) => detail !== "")
    };
  });
}

function calendarCard(label, { name, details }) {
  const terms = details.map(([term, value]) => `<dt>${term}</dt><dd>${escapeHtml(value)}</dd>`).join("");
  return `<div class="event-card"><dt>${label}</dt><dd>${escapeHtml(name)}
<details><summary>Details</summary><div class="event-detail-panel"><dl>${terms}</dl></div></details>
</dd></div>`;
}

function previewResults(originals, updated, target, calendarUrl, query, originalCalendars, updatedCalendars) {
  const events = [...originals.keys()];
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(events.length / pageSize));
  const requestedPage = Number(query.get("page"));
  const currentPage = Number.isSafeInteger(requestedPage)
    ? Math.max(1, Math.min(requestedPage, pageCount))
    : 1;
  const startIndex = (currentPage - 1) * pageSize;
  const pageEvents = events.slice(startIndex, startIndex + pageSize);
  const excluded = events.length - updated.size;
  const summary = pageEvents.length
    ? `Showing ${startIndex + 1}–${startIndex + pageEvents.length} of ${events.length} source events.`
    : "";
  const eventCount = summary + (excluded ? ` ${excluded} excluded by the filter.` : "");
  const pagination = pageCount > 1 ? previewPagination(query, currentPage, pageCount, eventCount)
    : eventCount ? `<p>${eventCount}</p>` : "";
  const rows = pageEvents.map(event => `<li class="event-comparison">
${eventCard(originals.get(event), "Original", "")}
${updated.has(event) ? eventCard(event.properties, "Updated", target)
    : '<div class="event-card filtered"><h4>Updated</h4><p>Excluded by the event filter.</p></div>'}
</li>`).join("");
  const sourceView = new URL(calendarUrl);
  sourceView.search = new URLSearchParams({ url: sourceView.searchParams.get("url"), "keep-prodid": "1", view: "raw" });
  const outputView = new URL(calendarUrl);
  outputView.searchParams.set("view", "raw");
  const names = originalCalendars.map((calendar, index) => `<dl class="calendar-comparison">
${calendarCard("Original calendar name", calendar)}
${calendarCard("Updated calendar name", updatedCalendars[index])}
</dl>`).join("");
  return `<section aria-labelledby="result">
<h2 id="result">Calendar</h2>
<label for="calendar-url">Calendar subscription URL (.ics)</label>
<div class="calendar-link">
<input id="calendar-url" readonly spellcheck="false" value="${attribute(calendarUrl)}">
<button id="copy-calendar-url" type="button">Copy link</button>
</div>
<p id="copy-status" role="status"></p>
<div class="raw-links">
<a href="${attribute(sourceView.href)}" target="_blank" rel="noopener noreferrer">View source ICS</a>
<a href="${attribute(outputView.href)}" target="_blank" rel="noopener noreferrer">View output ICS</a>
</div>

<h3 id="events">Compare Calendar</h3>
${names}
${pagination}
${rows ? `<ul class="events">${rows}</ul>` : "<p>The source feed contains no events.</p>"}
</section>`;
}

function previewPagination(query, currentPage, pageCount, eventCount) {
  const previewFields = ["url", "force", "timezone", "forcetimezone", "to", "title-form", "edit-titles",
    "title-prefix", "title-suffix", "title-find", "title-replace", "title-remove", "extras-form",
    "description-form", "edit-descriptions", "description-prefix", "description-suffix", "description-find", "description-replace",
    "published-ttl-amount", "published-ttl-unit", "keep-prodid",
    ...extraOptions.flatMap(option => [option.toggle, ...option.fields.map(([name]) => name)])];
  const fields = [...query].filter(([name]) => previewFields.includes(name)).map(([name, value]) =>
    `<input type="hidden" name="${attribute(name)}" value="${attribute(value)}">`).join("");
  const options = Array.from({ length: pageCount }, (_, index) => {
    const number = index + 1;
    return `<option value="${number}"${number === currentPage ? " selected" : ""}>Page ${number} of ${pageCount}</option>`;
  }).join("");
  return `<form class="pagination" action="/preview#events" method="get">
${fields}
<label for="preview-page">Page</label>
<select id="preview-page" name="page">${options}</select>
<noscript><button type="submit">Show page</button></noscript>
<span class="event-count">${eventCount}</span>
</form>`;
}

function timeZoneOptions(selected) {
  const active = TIME_ZONES.includes(selected) ? selected : "";
  const placeholder = `<option value="" disabled${active ? "" : " selected"}>Select a time zone</option>`;
  return placeholder + TIME_ZONES.map(zone =>
    `<option value="${attribute(zone)}"${zone === active ? " selected" : ""}>${escapeHtml(zone)}</option>`).join("");
}

function page({ sourceUrl = "", target = "", force = false, edits = new URLSearchParams(), editTitles = false, descriptionEdits = new URLSearchParams(), editDescriptions = false, keepProductId = false, extraQuery = new URLSearchParams(), extraForm = false, result = "" } = {}) {
  const extraPanels = extraFieldsHtml(extraQuery, extraForm);
  return `<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="no-referrer"><title>CalTune</title>
<script src="/app.js" defer></script>
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
.option-panel{border:1px solid #cbd7e0;border-radius:.5rem;padding:.75rem}
.extra-fields{display:none;margin-top:.75rem}
.extra-option:has(.extra-toggle:checked) .extra-fields{display:grid;gap:.65rem}
.extra-fields p{margin:0}
.text-options{display:none;margin-top:.75rem}
.text-edits:has(.text-edit-toggle:checked) .text-options{display:block}
.text-edits p{margin:.65rem 0}
.edit-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,12rem),1fr));gap:.75rem}
.filter-rules{min-width:0;margin:0;padding:.65rem;border:1px solid #cbd7e0;border-radius:.4rem}
.filter-rules legend{font-weight:600;padding:0 .25rem}
.filter-rule{grid-template-columns:minmax(0,1fr) auto;align-items:end;margin-bottom:.75rem}
.replacement-rule{grid-template-columns:repeat(2,minmax(0,1fr)) auto;align-items:end;margin-bottom:.75rem}
.secondary{background:white;color:#145361;border:1px solid #758a9a}
.secondary:disabled{opacity:.5;cursor:default}
@media(max-width:36rem){.filter-rules{min-width:0;margin:0;padding:.65rem;border:1px solid #cbd7e0;border-radius:.4rem}
.filter-rules legend{font-weight:600;padding:0 .25rem}
.filter-rule{grid-template-columns:minmax(0,1fr) auto;align-items:end;margin-bottom:.75rem}
.replacement-rule{grid-template-columns:1fr}.replacement-rule button{justify-self:start}}
button{border:0;background:#145361;color:white;font-weight:700;cursor:pointer}
section{margin-top:1.5rem;padding:1.5rem;background:white;border:1px solid #cbd7e0;border-radius:1rem}
section h2{margin-top:0}
.calendar-link{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.3rem}
.calendar-link input{flex:1 1 12rem;min-width:0;width:auto}
.raw-links{display:flex;flex-wrap:wrap;gap:.4rem 1rem;margin-top:.7rem}
.raw-links a{color:#145361;text-underline-offset:.15em}
#copy-status{margin:.4rem 0 0}#copy-status:empty{margin:0}
.pagination{display:flex;flex-wrap:wrap;align-items:center;gap:.65rem;padding:0;margin:0 0 .75rem;border:0}
.pagination select{width:auto;max-width:100%}
.event-count{flex:1 1 12rem}
.events{margin:0;padding:0;list-style:none}
.calendar-comparison,.event-comparison{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.65rem}
.calendar-comparison dt{font-weight:600;font-size:.875rem}.calendar-comparison dd{margin:0}
.event-comparison{padding:.65rem 0;border-top:1px solid #cbd7e0}
.event-card{min-width:0;border:1px solid #cbd7e0;border-radius:.5rem;padding:.75rem;overflow-wrap:anywhere}
.event-card h4{margin:0 0 .3rem;font-size:.875rem}.event-card details{margin-top:.45rem}
.event-card summary{cursor:pointer;color:#145361}
.event-detail-panel{margin-top:.45rem;padding:.55rem .65rem;border:1px solid #cbd7e0;border-radius:.4rem;background:#f5f8fa;font-size:.875rem}
.event-detail-panel dl,.event-detail-panel p{margin:0}
.event-detail-panel dt:first-child{margin-top:0}
.event-card dt{font-weight:600;margin-top:.4rem}.event-card dd{margin:0;white-space:pre-wrap}
.event-card p{margin:.4rem 0 0}.event-card.filtered{background:#eef3f7}
@media(max-width:36rem){.calendar-comparison,.event-comparison{grid-template-columns:1fr}}
.times{display:flex;flex-wrap:wrap;gap:.25rem 1rem}
footer{display:flex;flex-wrap:wrap;gap:.4rem 1rem;margin-top:1.5rem;padding:.8rem 0;border-top:1px solid #cbd7e0;font-size:.875rem}
footer a{color:#145361}
p[role=alert]{padding:1rem;background:#fff4f1;color:#61231d;border-radius:.45rem}
</style><main><h1>CalTune</h1><p>Customize an existing calendar feed and get a new .ics subscription link.</p>
<form action="/preview" method="get">
<label>Source URL<input name="url" required value="${attribute(sourceUrl)}" placeholder="https://…/calendar.ics"></label>
<input type="hidden" name="extras-form" value="1">
${extraPanels["rename-calendar"]}
${extraPanels["filter-events"]}
${textFieldsHtml("title", edits, editTitles)}
${textFieldsHtml("description", descriptionEdits, editDescriptions)}
${extraPanels["hide-details"]}
${extraPanels["force-event-status"]}
${extraPanels["force-event-url"]}
${extraPanels["set-published-ttl"]}
<div class="option-panel force-zone">
<label class="force-option"><input type="checkbox" name="force" value="1"${force ? " checked" : ""}>Force timezone</label>
<label class="zone-select">Target time zone<select name="timezone">${timeZoneOptions(target)}</select></label>
</div>
<div class="option-panel">
<label class="force-option"><input type="checkbox" name="keep-prodid" value="1"${keepProductId ? " checked" : ""}>Keep original product ID</label>
</div>
<button>Show calendar and events</button></form>
${result}
<footer><span>© 2026 <a href="https://enox.nl">enox.nl</a></span>
${BUILD_COMMIT ? `<span>Git commit <code title="${BUILD_COMMIT}">${BUILD_COMMIT.slice(0, 7)}</code></span>` : ""}
</footer></main></html>`;
}

const appScript = `
for (const row of document.querySelectorAll(".event-comparison, .calendar-comparison")) {
  const [original, updated] = row.querySelectorAll("details");
  if (!original || !updated) continue;
  original.addEventListener("toggle", () => { updated.open = original.open; });
  updated.addEventListener("toggle", () => { original.open = updated.open; });
}

const duration = document.querySelector("[data-duration-fields]");
if (duration) {
  const toggle = document.querySelector('input[name="set-published-ttl"]');
  const syncDurationFields = () => {
    for (const field of duration.querySelectorAll("input, select")) field.disabled = !toggle.checked;
  };
  toggle.addEventListener("change", syncDurationFields);
  syncDurationFields();
}

const pageSelect = document.getElementById("preview-page");
pageSelect?.addEventListener("change", () => pageSelect.form.requestSubmit());

for (const editor of document.querySelectorAll("[data-rule-editor]")) {
  const rules = editor.querySelector("[data-rule-list]");
  const template = editor.querySelector("[data-rule-template]");
  const addRule = editor.querySelector("[data-add-rule]");
  function updateRuleButtons() {
    const count = rules.children.length;
    addRule.disabled = count >= ${MAX_RULES};
    for (const button of rules.querySelectorAll("[data-remove-rule]")) button.disabled = count === 1;
  }
  addRule.addEventListener("click", () => {
    if (rules.children.length >= ${MAX_RULES}) return;
    rules.append(template.content.cloneNode(true));
    updateRuleButtons();
    rules.lastElementChild.querySelector("input").focus();
  });
  rules.addEventListener("click", event => {
    const button = event.target.closest("[data-remove-rule]");
    if (!button || rules.children.length === 1) return;
    const row = button.closest(".rule-row");
    const next = row.nextElementSibling || row.previousElementSibling;
    row.remove();
    updateRuleButtons();
    next.querySelector("input").focus();
  });
  updateRuleButtons();
}

const field = document.getElementById("calendar-url");
const button = document.getElementById("copy-calendar-url");
const status = document.getElementById("copy-status");

button?.addEventListener("click", async () => {
  status.textContent = "";
  try {
    await navigator.clipboard.writeText(field.value);
    status.textContent = "Link copied.";
  } catch {
    field.focus();
    field.select();
    status.textContent = "The link is selected. Press Ctrl+C or ⌘C to copy it.";
  }
});
`;

function reply(body, status, type, extra = {}) {
  return new Response(body, { status, headers: {
    "Content-Type": type, "Cache-Control": "no-store", "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; script-src 'self'; form-action 'self'",
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
    const editTitles = query.has("title-form") && preview
      ? query.has("edit-titles")
      : [...query].some(([key, value]) => key.startsWith("title-") && value.trim());
    const editDescriptions = preview && query.has("description-form")
      ? query.has("edit-descriptions")
      : [...query].some(([key, value]) => key.startsWith("description-") && value.trim());
    const extraForm = preview && query.has("extras-form");
    const keepProductId = query.get("keep-prodid") === "1";
    const form = {
      sourceUrl: query.get("url") || "",
      target: force ? query.get(useForm ? "timezone" : zoneParameter) || "" : "",
      force,
      edits: editTitles ? query : new URLSearchParams(),
      editTitles,
      descriptionEdits: editDescriptions ? query : new URLSearchParams(),
      editDescriptions,
      keepProductId,
      extraQuery: query,
      extraForm
    };
    const failure = (message, status) => preview
      ? reply(page({ ...form, result: `<p role="alert">${escapeHtml(message)}</p>` }), status, html)
      : reply(message, status, plain);
    if (request.method !== "GET") return reply("Use GET.", 405, plain, { Allow: "GET" });
    if (path.pathname === "/app.js") return reply(appScript, 200, "text/javascript; charset=utf-8");
    if (path.pathname === "/" && !path.search) return reply(page(), 200, html);
    if (!["/", "/convert", "/preview", "/calendar.ics"].includes(path.pathname)) return reply("Route not found.", 404, plain);
    try {
      const values = query.getAll("url");
      if (values.length !== 1 || !values[0]) throw new RequestError(400, 'Provide the "url" parameter exactly once.');
      const [sourceUrl] = values;
      const productIdOptions = query.getAll("keep-prodid");
      if (productIdOptions.length && (productIdOptions.length !== 1 || !keepProductId)) {
        throw new RequestError(400, 'Use "keep-prodid=1" to keep the original product ID.');
      }
      const zones = force ? query.getAll(useForm ? "timezone" : zoneParameter) : [];
      if (force && (zones.length !== 1 || !zones[0])) throw new RequestError(400, "Select a target time zone.");
      const target = force ? timeZone(zones[0]) : "";
      const extras = readExtras(query, extraForm);
      const edits = editTitles ? readTextEdits(query, "title") : new URLSearchParams();
      const descriptionEdits = editDescriptions ? readTextEdits(query, "description") : new URLSearchParams();
      const url = validateSource(sourceUrl, path.hostname);
      const input = await download(url, path.hostname);
      const calendarType = path.pathname === "/calendar.ics" && query.get("view") === "raw"
        ? plain : "text/calendar; charset=utf-8";
      if (!preview && keepProductId && !target && !edits.size && !descriptionEdits.size && !extras.size) return reply(input, 200, calendarType);
      const calendars = parseCalendar(new TextDecoder().decode(input));
      const originalCalendars = preview ? calendarOverview(calendars) : null;
      const originals = preview ? new Map(calendarEvents(calendars).map(event =>
        [event, event.properties.map(property => ({ ...property }))])) : null;
      if (extras.size || target || !keepProductId) applyExtras(calendars, extras, target, keepProductId);
      if (edits.size) editEventText(calendars, edits, "title", "summary");
      if (descriptionEdits.size && !extras.has("hide-description")) {
        editEventText(calendars, descriptionEdits, "description", "description");
      }
      if (preview) {
        const calendarUrl = new URL("/calendar.ics", path);
        calendarUrl.searchParams.set("url", sourceUrl);
        if (target) calendarUrl.searchParams.set("forcetimezone", target);
        if (keepProductId) calendarUrl.searchParams.set("keep-prodid", "1");
        for (const [name, value] of edits) calendarUrl.searchParams.append(name, value);
        for (const [name, value] of descriptionEdits) calendarUrl.searchParams.append(name, value);
        for (const [name, value] of extras) calendarUrl.searchParams.append(name, value);
        const updated = new Set(calendarEvents(calendars));
        const result = previewResults(originals, updated, target, calendarUrl.href, query, originalCalendars, calendarOverview(calendars));
        return reply(page({ ...form, sourceUrl, target, edits, descriptionEdits, result }), 200, html);
      }
      return reply(toIcs(calendars, target), 200, calendarType);
    } catch (error) {
      if (error instanceof RequestError) return failure(error.message, error.status);
      if (error.name === "TimeoutError" || error.name === "AbortError") {
        return failure("The source calendar timed out.", 504);
      }
      return failure("Could not process the source calendar.", 502);
    }
  }
};
