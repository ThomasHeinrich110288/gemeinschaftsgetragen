# Gemeinschaftsgetragen

Gemeinschaftsgetragen ist ein kleines MVP für das Projekt "Nachbarschaftszentrum Hainfeld". Die App zeigt eine einzelne, datengetriebene Detailseite mit transparenten Kosten, Aufgaben und einer interaktiven Sidebar.

## Schnellstart lokal
1. Abhängigkeiten installieren: `npm install`
2. Entwicklungsserver starten: `npm run dev`
3. Browser öffnen: [http://localhost:3000](http://localhost:3000) – der Einstiegspunkt `/` leitet direkt auf `/org/gg-hainfeld/projects/nachbarschaftszentrum-hainfeld`.

Optional kann die Umgebungsvariable `NEXT_PUBLIC_START_PROJECT` gesetzt werden, um auf ein anderes Projekt zu verweisen (Standardwert: `/org/gg-hainfeld/projects/nachbarschaftszentrum-hainfeld`).

## Deployment auf Render (Beispiel)
1. Repository zu Render importieren und eine neue **Web Service**-Instanz erstellen.
2. Build-Befehl (empfohlen): `./render-build.sh`
   - Das Skript legt bei Bedarf automatisch eine `package-lock.json` an und führt anschließend `npm ci && npm run build` aus.
   - Alternativ funktioniert auch `npm install && npm run build`, falls du den Lockfile lieber manuell erzeugst.
3. Start-Befehl: `npm run start`
4. Optionales Environment-Variable-Setup wie lokal (`NEXT_PUBLIC_START_PROJECT`).
5. DNS: Wunsch-Subdomain per CNAME auf die Render-URL zeigen und in Render HTTPS aktivieren.

## Datenquellen
Alle Demo-Daten werden lokal aus JSON-Dateien im Ordner `/seed` gelesen. Es gibt keine Speicherung von Nutzereingaben.

## Lizenz
Dieses Projekt steht unter der [GNU Affero General Public License v3.0](./LICENSE).
