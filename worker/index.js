const MAX_BYTES = 2 * 1024 * 1024;
const appointmentFields = new Set(["dtstart", "dtend", "due", "recurrence-id", "rdate", "exdate", "trigger"]);
const types = {
  dtstart: "date-time", dtend: "date-time", due: "date-time", dtstamp: "date-time",
  created: "date-time", "last-modified": "date-time", completed: "date-time",
  "recurrence-id": "date-time", rdate: "date-time", exdate: "date-time",
  rrule: "recur", exrule: "recur", trigger: "duration", duration: "duration",
  tzoffsetfrom: "utc-offset", tzoffsetto: "utc-offset", freebusy: "period",
  organizer: "cal-address", attendee: "cal-address", attach: "uri", url: "uri",
  tzurl: "uri", source: "uri", priority: "integer", sequence: "integer",
  repeat: "integer", "percent-complete": "integer", geo: "float"
};
const parameterTypes = { altrep: "uri", dir: "uri", "delegated-from": "cal-address",
  "delegated-to": "cal-address", member: "cal-address", "sent-by": "cal-address", rsvp: "boolean" };

class RequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function xml(value) {
  return String(value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g, "\ufffd")
    .replace(/[&<>]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[character]);
}

function element(name, body) {
  if (!/^[a-z][a-z0-9-]*$/.test(name)) throw new RequestError(422, "Ongeldige iCalendar-naam.");
  return `<${name}>${body}</${name}>`;
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
const splitText = value => value.match(/(?:\\.|[^,\\])*(?:,|$)/g)
  .filter((part, index, parts) => part || index < parts.length - 1)
  .map(part => part.replace(/,$/, ""));

function recurrence(value) {
  const order = ["freq", "until", "count", "interval", "bysecond", "byminute", "byhour", "byday",
    "bymonthday", "byyearday", "byweekno", "bymonth", "bysetpos", "wkst"];
  const fields = new Map(value.split(";").map(part => {
    const [name, content] = part.split("=", 2);
    if (!content || !order.includes(name.toLowerCase())) {
      throw new RequestError(422, "Onbekende iCalendar-herhaalregel.");
    }
    return [name.toLowerCase(), content];
  }));
  return order.filter(name => fields.has(name)).map(name => fields.get(name).split(",")
    .map(part => element(name, xml(name === "until" ? extended(part) : part))).join("")).join("");
}

function propertyXml(property, target) {
  const { name, value } = property;
  const parameters = new Map(property.parameters);
  const type = parameters.get("value")?.[0].toLowerCase() || Object.hasOwn(types, name) && types[name]
    || (name.startsWith("x-") ? "unknown" : "text");
  parameters.delete("value");
  let formatTime = extended;
  if (target && appointmentFields.has(name) && (type === "date-time" || type === "period")) {
    const utc = target === "UTC";
    formatTime = dateTime => extended(dateTime).replace(/Z$/, "") + (utc ? "Z" : "");
    if (utc) parameters.delete("tzid");
    else parameters.set("tzid", [target]);
  }
  const paramXml = [...parameters].map(([key, values]) => element(key,
    values.map(item => element(Object.hasOwn(parameterTypes, key) ? parameterTypes[key] :
      key.startsWith("x-") ? "unknown" : "text", xml(key === "rsvp" ? item.toLowerCase() : item))).join(""))).join("");
  let body;
  if (name === "geo") {
    const [latitude, longitude] = value.split(";");
    body = element("latitude", xml(latitude)) + element("longitude", xml(longitude));
  } else if (name === "request-status") {
    const [code, description, data] = value.split(/(?<!\\);/);
    body = element("code", xml(code)) + element("description", xml(unescapeText(description || "")));
    if (data !== undefined) body += element("data", xml(unescapeText(data)));
  } else {
    const values = ["rdate", "exdate", "freebusy"].includes(name) ? value.split(",")
      : ["categories", "resources"].includes(name) ? splitText(value) : [value];
    body = values.map(item => {
      if (type === "recur") return element(type, recurrence(item));
      if (type === "period") {
        const [start, finish] = item.split("/");
        if (!finish) throw new RequestError(422, "Ongeldige iCalendar-periode.");
        const end = finish.startsWith("P") ? element("duration", xml(finish)) : element("end", xml(formatTime(finish)));
        return element(type, element("start", xml(formatTime(start))) + end);
      }
      if (type === "date-time") item = formatTime(item);
      if (type === "date") item = extended(item);
      if (type === "text") item = unescapeText(item);
      if (type === "boolean") item = item.toLowerCase();
      if (type === "utc-offset") item = item.replace(/^([+-]\d{2})(\d{2})(\d{2})?$/, (_, h, m, s) =>
        `${h}:${m}${s ? ":" + s : ""}`);
      return element(type, xml(item));
    }).join("");
  }
  return element(name, (paramXml ? element("parameters", paramXml) : "") + body);
}

function componentXml(component, target) {
  // Time-zone definitions describe transitions and keep their original timestamps.
  if (component.name === "vtimezone") target = null;
  const properties = component.properties.map(property => propertyXml(property, target)).join("");
  const children = component.children.map(child => componentXml(child, target)).join("");
  return element(component.name, (properties ? element("properties", properties) : "") +
    (children ? element("components", children) : ""));
}

function toXcal(calendars, target) {
  const contents = calendars.map(calendar => componentXml(calendar, target)).join("");
  return '<?xml version="1.0" encoding="UTF-8"?>\n<icalendar xmlns="urn:ietf:params:xml:ns:icalendar-2.0">' +
    contents + "</icalendar>\n";
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
    const decoder = new TextDecoder();
    let size = 0;
    let contents = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) return contents + decoder.decode();
      size += value.byteLength;
      if (size > MAX_BYTES) {
        await reader.cancel();
        throw new RequestError(413, "De kalender is groter dan 2 MiB.");
      }
      contents += decoder.decode(value, { stream: true });
    }
  }
  throw new RequestError(502, "De bron gaf te veel of ongeldige omleidingen.");
}

const attribute = value => xml(value).replace(/"/g, "&quot;");

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
    const title = xml(unescapeText(field("summary") || "Naamloze afspraak"));
    const start = field("dtstart");
    const end = field("dtend");
    // An all-day DTEND is the first day after the event.
    const endLabel = end && end.includes("T") ? `<span>Einde ${previewTime(end)}</span>` : "";
    return `<li><strong>${title}</strong><div class="times">${start ? `<span>Begin ${previewTime(start)}</span>` : ""}
      ${endLabel}</div></li>`;
  }).join("");
  return `<section aria-labelledby="result">
<h2 id="result">Aangepaste kalender</h2>
<label>Kalender-URL (xCal/XML)<input readonly spellcheck="false" value="${attribute(calendarUrl)}"></label>
<p><a href="${attribute(calendarUrl)}">Open kalender-URL</a></p>
<h3>Eerste afspraken</h3>
<p>Tijdzone ${xml(target)}. Maximaal 10 afspraken in de volgorde van de bronfeed.</p>
${rows ? `<ul class="events">${rows}</ul>` : "<p>De bronfeed bevat geen afspraken.</p>"}
</section>`;
}

function page({ sourceUrl = "", target = "Europe/Amsterdam", result = "" } = {}) {
  return `<!doctype html>
<html lang="nl"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="no-referrer"><title>FixiCal</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#eef3f7;color:#173047;font:1rem/1.5 system-ui,sans-serif}
main{max-width:40rem;margin:clamp(2rem,9vw,7rem) auto;padding:0 1rem}h1{font-size:2.6rem;line-height:1.1;margin:0}
form{display:grid;gap:1rem;padding:1.5rem;background:white;border:1px solid #cbd7e0;border-radius:1rem}
label{display:grid;gap:.3rem;font-weight:600}input,button{font:inherit;border-radius:.45rem;padding:.65rem .8rem}
input{width:100%;border:1px solid #758a9a;color:inherit}button{border:0;background:#145361;color:white;font-weight:700;cursor:pointer}
a{color:#145361;text-decoration-thickness:.1em;text-underline-offset:.15em}
section{margin-top:1.5rem;padding:1.5rem;background:white;border:1px solid #cbd7e0;border-radius:1rem}
section h2{margin-top:0}.events{margin:0;padding:0;list-style:none}
.events li{padding:.8rem 0;border-top:1px solid #cbd7e0;overflow-wrap:anywhere}
.times{display:flex;flex-wrap:wrap;gap:.25rem 1rem}
p[role=alert]{padding:1rem;background:#fff4f1;color:#61231d;border-radius:.45rem}
</style><main><h1>FixiCal</h1><p>Vervang de tijdzone van afspraken en behoud de kloktijden. Het resultaat is xCal (XML).</p>
<form action="/preview" method="get">
<label>Bron-URL<input name="url" required value="${attribute(sourceUrl)}" placeholder="https://…/kalender.ics"></label>
<label>Doeltijdzone<input name="to" required value="${attribute(target)}"></label>
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
    const form = {
      sourceUrl: path.searchParams.get("url") || "",
      target: path.searchParams.get("to") || "Europe/Amsterdam"
    };
    const failure = (message, status) => preview
      ? reply(page({ ...form, result: `<p role="alert">${xml(message)}</p>` }), status, html)
      : reply(message, status, plain);
    if (request.method !== "GET") return reply("Gebruik GET.", 405, plain, { Allow: "GET" });
    if (path.pathname === "/" && !path.search) return reply(page(), 200, html);
    if (!["/", "/convert", "/preview"].includes(path.pathname)) return reply("Route niet gevonden.", 404, plain);
    try {
      const parameters = ["url", "to"].map(name => {
        const values = path.searchParams.getAll(name);
        if (values.length !== 1 || !values[0]) throw new RequestError(400, `Geef parameter "${name}" één keer op.`);
        return values[0];
      });
      const [sourceUrl, to] = parameters;
      const target = timeZone(to);
      const url = validateSource(sourceUrl, path.hostname);
      const calendars = parseCalendar(await download(url, path.hostname));
      if (preview) {
        const calendarUrl = new URL("/convert", path);
        calendarUrl.search = new URLSearchParams({ url: sourceUrl, to: target });
        return reply(page({ sourceUrl, target, result: previewResults(calendars, target, calendarUrl.href) }), 200, html);
      }
      return reply(toXcal(calendars, target), 200, "application/calendar+xml; charset=utf-8");
    } catch (error) {
      if (error instanceof RequestError) return failure(error.message, error.status);
      if (error.name === "TimeoutError" || error.name === "AbortError") {
        return failure("De kalenderbron reageerde niet op tijd.", 504);
      }
      return failure("De kalenderbron kon niet worden verwerkt.", 502);
    }
  }
};
