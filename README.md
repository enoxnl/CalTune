# FixiCal

Stateless Cloudflare Worker. De Worker leest de bron bij elke aanvraag en slaat kalendergegevens niet op.

Open de homepage voor het formulier of roep de API aan:

```text
GET /convert?url=https%3A%2F%2Fexample.org%2Fcalendar.ics&from=Etc%2FUTC&to=Europe%2FAmsterdam
```

Gebruik een publiek bereikbare HTTPS- of webcal-URL en IANA-tijdzones. Encodeer de volledige bron-URL als één parameter, ook als die zelf een querystring heeft. De API valideert `from` als brontijdzone. De datum en kloktijd komen rechtstreeks uit het bronbestand. FixiCal koppelt die kloktijd aan `to`, ook als de bron een TZID of UTC-markering heeft. De uitvoer is xCal (XML, RFC 6321).

Heledagafspraken houden hun kalenderdatum. Begin- en eindtijden en expliciete herhaaldatums krijgen de doelzone. Een eventuele UTC-eindgrens (`UNTIL`) in een herhaalregel blijft behouden.

