# AgendaFix

Stateless Cloudflare Worker. De Worker leest de bron bij elke aanvraag en slaat kalendergegevens niet op.

Het formulier toont een .ics-abonnementslink voor agenda-apps en maximaal tien afspraken in de volgorde van de bronfeed. De API is ook rechtstreeks beschikbaar:

```text
GET /calendar.ics?url=https%3A%2F%2Fexample.org%2Fcalendar.ics&forcetimezone=Europe%2FAmsterdam
```

Gebruik een publiek bereikbare HTTPS- of webcal-URL. Met de optionele parameter `forcetimezone` stel je een IANA-tijdzone in. Zonder tijdzoneparameter geeft AgendaFix de bronbytes ongewijzigd door. Encodeer de volledige bron-URL als één parameter, ook als die zelf een querystring heeft. De datum en kloktijd komen rechtstreeks uit het bronbestand. AgendaFix koppelt die kloktijd aan `forcetimezone`, ook als de bron een TZID of UTC-markering heeft. De uitvoer is iCalendar (.ics). Bestaande aanvragen aan `/convert` geven ook .ics terug.

Heledagafspraken houden hun kalenderdatum. Begin- en eindtijden en expliciete herhaaldatums krijgen de doelzone. Bestaande links met `to` werken als `forcetimezone` ontbreekt. Een bestaande `from`-parameter wordt genegeerd. Een eventuele UTC-eindgrens (`UNTIL`) in een herhaalregel blijft behouden.

