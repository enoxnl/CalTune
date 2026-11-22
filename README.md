# CalTune

[CalTune](https://caltune.enox.nl) turns a public iCalendar feed into a customized `.ics` subscription link. It runs as a stateless Cloudflare Worker, fetches the source on every request, and stores no calendar data.

## Customize a calendar

1. Paste a public HTTPS or webcal link into **Source URL**, or load an existing CalTune link using **Import settings from existing URL**.
2. Select the changes you want to apply. Use **Settings** to expand or collapse each option's settings.
3. Click **Show calendar and events**. The preview compares the original and updated calendars and shows ten events per page, sorted by local start date and time. Open **Details** to compare individual fields.
4. Use **Copy link** to add the subscription link to your calendar app. Use **View source ICS** and **View output ICS** to inspect the raw files.

**Show only changed events** and **Show only included events** filter the preview. The selected calendar changes determine the subscription feed.

## API

All settings are passed as GET query parameters. URL-encode the entire source URL as a single value, including any query string it contains.

```text
GET /calendar.ics?url=https%3A%2F%2Fexample.org%2Fcalendar.ics&forcetimezone=Europe%2FAmsterdam
```

| Parameter | Behavior |
| --- | --- |
| `url` | Public source feed URL. Required. |
| `calendar-name` | Sets the calendar name. |
| `include-title`, `exclude-title` | Repeatable, case-insensitive literal text filters on the original event title. When inclusion rules are present, at least one must match. Any matching exclusion rule removes the event. Recurring series are evaluated using the series title. |
| `days-back`, `days-ahead` | Set a relative date range based on the local start date. Both bounds are inclusive. `0` means today. Omitting either bound leaves that side unrestricted. |
| `keep-series=1` | Exempts recurring series and their exceptions from title and date filters. Other calendar changes still apply to those events. |
| `title-find`, `title-replace`, `title-prefix`, `title-suffix` | Edit event titles. |
| `description-find`, `description-replace`, `description-prefix`, `description-suffix` | Edit event descriptions. |
| `hide-description=1`, `hide-location=1`, `hide-attendees=1`, `hide-status=1`, `hide-event-url=1` | Omit selected event details. Hiding attendees also omits organizers. Hiding takes precedence over editing or overriding a field. |
| `force-status` | Sets the status to `TENTATIVE`, `CONFIRMED`, or `CANCELLED`. |
| `availability` | Sets availability to `OPAQUE` (Busy) or `TRANSPARENT` (Free). |
| `event-url` | Sets the same HTTP or HTTPS link for every event. |
| `published-ttl` | Sets `X-PUBLISHED-TTL` to a positive iCalendar duration, such as `PT30M`. The calendar app decides when to fetch the feed again. |
| `forcetimezone` | Sets an IANA time zone while preserving local clock times. All-day events keep their dates. The output also sets `X-WR-TIMEZONE` to the target zone. |
| `view=source`, `view=raw` | Return the original source file and the updated ICS as plain text, respectively. By default, CalTune returns `text/calendar`. |

Use up to twelve find-and-replace pairs for titles or descriptions. CalTune pairs repeated parameters in order and applies the rules case-sensitively. An empty replacement removes the matching text. Prefixes and suffixes are added afterward.

Date ranges are applied to individual occurrences. With an upper bound, CalTune records the remaining occurrences as `RDATE` values. With an open-ended range, the recurrence rule stays active and earlier dates are excluded. Use **Keep recurring series unchanged** to preserve exceptions with `RANGE=THISANDFUTURE`.

The output identifies CalTune in `PRODID` and preserves the source value, if present, in `X-CALTUNE-ORIG-PRODID`. Recurrence rules are processed using the bundled [ical.js 2.2.1](https://github.com/kewisch/ical.js/tree/v2.2.1) under the Mozilla Public License 2.0.

The build includes the CalTune logo and favicon from `worker/assets/`.
