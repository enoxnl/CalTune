# CalTune

Stateless Cloudflare Worker. De Worker leest de bron bij elke aanvraag en slaat kalendergegevens niet op.

Het formulier toont een .ics-abonnementslink voor agenda-apps en tien afspraken per pagina, gesorteerd op lokale begindatum en -tijd. De API is ook rechtstreeks beschikbaar:

```text
GET /calendar.ics?url=https%3A%2F%2Fexample.org%2Fcalendar.ics&forcetimezone=Europe%2FAmsterdam
```

Gebruik een publiek bereikbare HTTPS- of webcal-URL. Met de optionele parameter `forcetimezone` stel je een IANA-tijdzone in. CalTune gebruikt `PRODID:-//enox.nl//CalTune//EN` in de uitvoer en bewaart de bronwaarde, indien aanwezig, in `X-CALTUNE-ORIG-PRODID`. **View source ICS** geeft het bronbestand ongewijzigd weer. Encodeer de volledige bron-URL als één parameter, ook als die zelf een querystring heeft. De datum en kloktijd komen rechtstreeks uit het bronbestand. CalTune koppelt die kloktijd aan `forcetimezone`, ook als de bron een TZID of UTC-markering heeft. Het kalenderveld `X-WR-TIMEZONE` krijgt dezelfde doelzone. De uitvoer is iCalendar (.ics). Bestaande aanvragen aan `/convert` geven ook .ics terug.

Heledagafspraken houden hun kalenderdatum. Begin- en eindtijden en expliciete herhaaldatums krijgen de doelzone. Bestaande links met `to` werken als `forcetimezone` ontbreekt. Een bestaande `from`-parameter wordt genegeerd. Een eventuele UTC-eindgrens (`UNTIL`) in een herhaalregel blijft behouden.


Optionele titelbewerkingen gebruiken maximaal twaalf paren van `title-find` en `title-replace`. De regels worden in volgorde uitgevoerd en zoeken hoofdlettergevoelig naar letterlijke tekst. Een lege vervangtekst verwijdert de gevonden tekst. Daarna worden `title-prefix` en `title-suffix` toegevoegd. De oude parameter `title-remove` blijft werken als laatste vervangregel met een lege vervangtekst. Titelbewerkingen zijn te combineren met `forcetimezone`.

Gebruik een of meer `include-title`- of `exclude-title`-parameters om afspraken te filteren op letterlijke tekst in de oorspronkelijke titel, ongeacht hoofdletters. Minstens één inclusieregel moet matchen als inclusieregels zijn opgegeven. Elke matchende uitsluitregel verwijdert de afspraak. Herhaalreeksen worden gefilterd op de titel van de reeks. Gebruik `hide-description=1`, `hide-location=1` of `hide-attendees=1` om afspraakdetails weg te laten. `calendar-name` stelt de naam in die agenda-apps uit de feed kunnen overnemen.

Gebruik `force-status` met `TENTATIVE`, `CONFIRMED` of `CANCELLED` om alle afspraakstatussen in te stellen. `hide-status=1` verwijdert de status en heeft voorrang.

Gebruik `event-url` om bij elke afspraak dezelfde HTTP(S)-link in te stellen. `hide-event-url=1` verwijdert links uit afspraken en heeft voorrang.

Beschrijvingstekst bewerk je met `description-find` en `description-replace`, `description-prefix` en `description-suffix`. De regels werken hetzelfde als bij titels. `hide-description=1` heeft voorrang.

Gebruik `published-ttl` met een positieve iCalendar-duur, zoals `PT30M`, om `X-PUBLISHED-TTL` van de kalender te wijzigen. Agenda-apps bepalen zelf wanneer ze de feed opnieuw ophalen.
