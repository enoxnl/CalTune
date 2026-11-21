# FixiCal

Stateless Cloudflare Worker. De Worker leest de bron bij elke aanvraag en slaat kalendergegevens niet op.

Open de homepage voor het formulier of roep de API aan:

```text
GET /convert?url=https%3A%2F%2Fexample.org%2Fcalendar.ics&from=Etc%2FUTC&to=Europe%2FAmsterdam
```

Gebruik een publiek bereikbare HTTPS- of webcal-URL en IANA-tijdzones. Encodeer de volledige bron-URL als één parameter, ook als die zelf een querystring heeft. Een aanwezige TZID of UTC-markering gaat vóór `from`. De uitvoer is xCal (XML, RFC 6321).

Heledagafspraken houden hun kalenderdatum. Herhaalregels en gekoppelde uitzonderingen behouden hun geplande tijden in de bronzone om verschuivingen door verschillende zomer- en wintertijdregels te voorkomen. Omzetting van losse afspraken met een expliciete TZID vereist dat de Worker die zone als IANA-zone herkent.

