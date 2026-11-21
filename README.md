# CalTune

[CalTune](https://caltune.enox.nl) maakt van een openbare iCalendar-feed een aangepaste `.ics`-abonnementslink. De app draait als stateless Cloudflare Worker, haalt de bron bij elke aanvraag op en bewaart geen kalendergegevens.

## Een kalender aanpassen

1. Plak een openbare HTTPS- of webcal-link in **Source URL**, of laad een eerder gemaakte CalTune-link via **Import settings from existing URL**.
2. Vink aan welke wijzigingen je wilt toepassen. Via **Settings** kun je de opties per onderdeel in- en uitklappen.
3. Klik **Show calendar and events**. De preview vergelijkt de oorspronkelijke en aangepaste kalender en toont tien afspraken per pagina, gesorteerd op lokale begindatum en -tijd. Open **Details** om de velden te vergelijken.
4. Gebruik **Copy link** om de abonnementslink aan je agenda-app toe te voegen. Met **View source ICS** en **View output ICS** kun je de ruwe bestanden bekijken.

**Show only changed events** en **Show only included events** filteren de preview. De abonnementsfeed wordt bepaald door de gekozen kalenderbewerkingen.

## API

Alle instellingen zitten in de GET-parameters. URL-encodeer de volledige bron-URL als één waarde, ook als die zelf een querystring bevat.

```text
GET /calendar.ics?url=https%3A%2F%2Fexample.org%2Fcalendar.ics&forcetimezone=Europe%2FAmsterdam
```

| Parameter | Werking |
| --- | --- |
| `url` | Openbare bronfeed. Verplicht. |
| `calendar-name` | Stelt de kalendernaam in. |
| `include-title`, `exclude-title` | Herhaalbare filters op letterlijke tekst in de oorspronkelijke titel, hoofdletterongevoelig. Als er inclusieregels zijn, moet er minstens één matchen. Elke matchende uitsluitregel verwijdert de afspraak. Herhaalreeksen worden beoordeeld op de titel van de reeks. |
| `days-back`, `days-ahead` | Relatief datumbereik op basis van de lokale begindatum. Grenzen zijn inclusief. `0` betekent vandaag en een weggelaten zijde is onbegrensd. |
| `keep-series=1` | Houdt herhaalreeksen en hun uitzonderingen buiten de titel- en datumfilters. Andere kalenderbewerkingen blijven op die afspraken van toepassing. |
| `title-find`, `title-replace`, `title-prefix`, `title-suffix` | Bewerkt afspraaktitels. |
| `description-find`, `description-replace`, `description-prefix`, `description-suffix` | Bewerkt afspraakbeschrijvingen. |
| `hide-description=1`, `hide-location=1`, `hide-attendees=1`, `hide-status=1`, `hide-event-url=1` | Laat de geselecteerde afspraakdetails weg. Bij deelnemers worden ook organisatoren weggelaten. Verbergen krijgt voorrang op bewerken of overschrijven. |
| `force-status` | Stelt de status in op `TENTATIVE`, `CONFIRMED` of `CANCELLED`. |
| `availability` | Stelt de beschikbaarheid in op `OPAQUE` (Busy) of `TRANSPARENT` (Free). |
| `event-url` | Stelt dezelfde HTTP- of HTTPS-link in voor elke afspraak. |
| `published-ttl` | Stelt `X-PUBLISHED-TTL` in met een positieve iCalendar-duur, zoals `PT30M`. De agenda-app bepaalt wanneer ze de feed opnieuw ophaalt. |
| `forcetimezone` | Stelt een IANA-tijdzone in met behoud van de lokale kloktijd. Heledagafspraken houden hun datum. De uitvoer krijgt dezelfde doelzone in `X-WR-TIMEZONE`. |
| `view=source`, `view=raw` | Geeft respectievelijk het ongewijzigde bronbestand en de aangepaste ICS als platte tekst terug. Zonder `view` geeft CalTune `text/calendar` terug. |

Gebruik voor titels of beschrijvingen maximaal twaalf paren van zoek- en vervangtekst. CalTune koppelt herhaalde parameters op volgorde en voert de regels hoofdlettergevoelig uit. Een lege vervangtekst verwijdert de gevonden tekst. Voor- en achtervoegsels worden daarna toegevoegd.

Bij een datumbereik worden afzonderlijke herhalingen beoordeeld. Met een eindgrens legt CalTune de overgebleven herhalingen vast als `RDATE`. Zonder eindgrens blijft de herhaalregel actief en worden eerdere datums uitgesloten. Uitzonderingen met `RANGE=THISANDFUTURE` kunnen via **Keep recurring series unchanged** worden behouden.

De uitvoer vermeldt CalTune als producent in `PRODID` en bewaart een aanwezige bronwaarde in `X-CALTUNE-ORIG-PRODID`. Herhaalregels worden verwerkt met de meegeleverde [ical.js 2.2.1](https://github.com/kewisch/ical.js/tree/v2.2.1) onder de Mozilla Public License 2.0.

Het CalTune-logo en favicon worden bij de build opgenomen vanuit `worker/assets/`.
