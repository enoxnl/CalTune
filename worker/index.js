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

function timeZone(name, status = 400) {
  try {
    if (!/^[a-z][a-z0-9_+/-]*$/i.test(name)) throw new RangeError();
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: name, calendar: "iso8601", numberingSystem: "latn", hourCycle: "h23",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
  } catch {
    throw new RequestError(status, "Gebruik een geldige IANA-tijdzone, bijvoorbeeld Europe/Amsterdam.");
  }
}

function extended(value) {
  const match = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/.exec(value);
  if (!match) throw new RequestError(422, "Ongeldige datum of tijd in de kalender.");
  const [, year, month, day, hour, minute, second, utc] = match;
  const date = `${year}-${month}-${day}`;
  return hour === undefined ? date : `${date}T${hour}:${minute}:${second}${utc || ""}`;
}

function wallTime(zone, instant) {
  const parts = Object.fromEntries(zone.formatToParts(instant).map(({ type, value }) => [type, value]));
  return `${parts.year.padStart(4, "0")}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
}

function offsetAt(zone, instant) {
  return Date.parse(wallTime(zone, instant) + "Z") - instant;
}

function convertTime(value, source, target) {
  const input = extended(value);
  const utc = input.endsWith("Z");
  const wall = utc ? input.slice(0, -1) : input;
  const nominal = Date.parse(wall + "Z");
  if (!Number.isFinite(nominal) || new Date(nominal).toISOString().slice(0, 19) !== wall) {
    throw new RequestError(422, "Ongeldige datum of tijd in de kalender.");
  }
  let instant = nominal;
  if (!utc) {
    // RFC 5545 uses the first instant in an overlap and the pre-transition offset in a gap.
    const day = 86_400_000;
    const earlierOffset = offsetAt(source, nominal - day);
    const offsets = new Set([earlierOffset, offsetAt(source, nominal), offsetAt(source, nominal + day)]);
    const matches = [...offsets].map(offset => nominal - offset)
      .filter(candidate => wallTime(source, candidate) === wall);
    instant = matches.length ? Math.min(...matches) : nominal - earlierOffset;
  }
  return wallTime(target, instant) + (target.resolvedOptions().timeZone === "UTC" ? "Z" : "");
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

function propertyXml(property, source, target, preserveSchedule) {
  const { name, value } = property;
  const parameters = new Map(property.parameters);
  const originalZone = parameters.get("tzid")?.[0];
  const type = parameters.get("value")?.[0].toLowerCase() || Object.hasOwn(types, name) && types[name]
    || (name.startsWith("x-") ? "unknown" : "text");
  parameters.delete("value");
  let formatTime = extended;
  const scheduled = source && appointmentFields.has(name) && (type === "date-time" || type === "period");
  if (scheduled && preserveSchedule && !originalZone && !/Z(?:$|[,/])/.test(value)) {
    parameters.set("tzid", [source.resolvedOptions().timeZone]);
  } else if (scheduled && !preserveSchedule) {
    // Resolve a TZID only for local values, since a UTC value already identifies its instant.
    let explicitZone;
    formatTime = dateTime => convertTime(dateTime,
      originalZone && !dateTime.endsWith("Z") ? explicitZone ??= timeZone(originalZone, 422) : source, target);
    if (target.resolvedOptions().timeZone === "UTC") parameters.delete("tzid");
    else parameters.set("tzid", [target.resolvedOptions().timeZone]);
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

function componentXml(component, source, target, recurringIds, preserveSchedule = false) {
  if (component.name === "vtimezone") source = null;
  const uid = component.properties.find(property => property.name === "uid")?.value;
  preserveSchedule ||= ["vevent", "vtodo", "vjournal"].includes(component.name) &&
    (recurringIds.has(uid) || component.properties.some(property => ["rrule", "exrule"].includes(property.name)));
  const properties = component.properties.map(property => propertyXml(property, source, target, preserveSchedule)).join("");
  const children = component.children.map(child => componentXml(child, source, target, recurringIds, preserveSchedule)).join("");
  return element(component.name, (properties ? element("properties", properties) : "") +
    (children ? element("components", children) : ""));
}

function toXcal(input, source, target) {
  const calendars = parseCalendar(input);
  const contents = calendars.map(calendar => {
    const recurringIds = new Set(calendar.children
      .filter(component => component.properties.some(property => ["rrule", "exrule"].includes(property.name)))
      .map(component => component.properties.find(property => property.name === "uid")?.value)
      .filter(Boolean));
    return componentXml(calendar, source, target, recurringIds);
  }).join("");
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

const help = `<!doctype html>
<html lang="nl"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="no-referrer"><title>FixiCal</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#eef3f7;color:#173047;font:1rem/1.5 system-ui,sans-serif}
main{max-width:40rem;margin:clamp(2rem,9vw,7rem) auto;padding:0 1rem}h1{font-size:2.6rem;line-height:1.1;margin:0}
form{display:grid;gap:1rem;padding:1.5rem;background:white;border:1px solid #cbd7e0;border-radius:1rem}
label{display:grid;gap:.3rem;font-weight:600}input,button{font:inherit;border-radius:.45rem;padding:.65rem .8rem}
input{width:100%;border:1px solid #758a9a;color:inherit}button{border:0;background:#145361;color:white;font-weight:700;cursor:pointer}
code{overflow-wrap:anywhere}
</style><main><h1>FixiCal</h1><p>Zet de tijden van een iCalendar-feed om en open het resultaat als xCal (XML).</p>
<form action="/convert" method="get">
<label>Bron-URL<input name="url" required placeholder="https://…/kalender.ics"></label>
<label>Brontijdzone<input name="from" required placeholder="Europe/Amsterdam"></label>
<label>Doeltijdzone<input name="to" required placeholder="Europe/Amsterdam"></label>
<button>Open xCal</button></form>
<p>API: <code>GET /convert?url=…&amp;from=…&amp;to=…</code></p>
<p>Afspraken die de hele dag duren behouden hun datum. Reeksen met herhaalregels behouden hun oorspronkelijke tijdzone.</p>
</main></html>`;

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
    if (request.method !== "GET") return reply("Gebruik GET.", 405, plain, { Allow: "GET" });
    if (path.pathname === "/" && !path.search) return reply(help, 200, "text/html; charset=utf-8");
    if (!["/", "/convert"].includes(path.pathname)) return reply("Route niet gevonden.", 404, plain);
    try {
      const parameters = ["url", "from", "to"].map(name => {
        const values = path.searchParams.getAll(name);
        if (values.length !== 1 || !values[0]) throw new RequestError(400, `Geef parameter "${name}" één keer op.`);
        return values[0];
      });
      const [sourceUrl, from, to] = parameters;
      const source = timeZone(from);
      const target = timeZone(to);
      const url = validateSource(sourceUrl, path.hostname);
      const input = await download(url, path.hostname);
      return reply(toXcal(input, source, target), 200, "application/calendar+xml; charset=utf-8");
    } catch (error) {
      if (error instanceof RequestError) return reply(error.message, error.status, plain);
      if (error.name === "TimeoutError" || error.name === "AbortError") {
        return reply("De kalenderbron reageerde niet op tijd.", 504, plain);
      }
      return reply("De kalenderbron kon niet worden verwerkt.", 502, plain);
    }
  }
};
