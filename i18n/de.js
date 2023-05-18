/*!
* TOTUM LOCALIZATION
* */
App.langs = App.langs || {};
App.langs.de =
    {
	"locale":"de-DE",
"localeDatetimepicker":"de",
"dateFormat":"DD.MM.YY",
"dateTimeFormat":"DD.MM.YY HH:mm",
"timeDateFormatNoYear":"HH:mm DD.MM",
"filtersExtenders":App.commonFiltersExtenders,
"search_prepare_function":function (string1, string2) { let letter_replaces= {"ß": "ss"}; Object.keys(letter_replaces).forEach((_) => {string1 = string1.toLowerCase().replace(_, letter_replaces[_]);if (string2) {string2 = string2.toLowerCase().replace(_, letter_replaces[_]);}}); return [string1, string2];},
"css":{
"table":".pcTable-container .loading-row td {background: url(\"\/imgs\/loading_en.png\") repeat #fff;}"
}
,
"modelMethods":{
"edit":"Ändern",
"checkInsertRow":"Vorläufige Hinzufügung",
"duplicate":"Duplizieren",
"refresh_rows":"Neuberechnung von Zeilen",
"loadPage":"Seite wird geladen",
"getTableData":"Laden der Tabelleninformationen",
"refresh":"Aktualisierung der Tabellendaten",
"checkEditRow":"Vorläufige Berechnung des Panels",
"saveEditRow":"Speichern des Panels",
"save":"Ändern des Feld",
"click":"Betätigen der Taste",
"selectSourceTableAction":"Aufruf des Panels",
"add":"Hinzufügen einer Zeile",
"getEditSelect":"Laden der Selektion",
"delete":"Löschen"
}
,
"translates":{
"Creator-tableEditButtons-default_action":"Aktion",
"Creator-tableEditButtons-on_duplicate":"Duplier.",
"Creator-tableEditButtons-row_format":"Zeile",
"Creator-tableEditButtons-table_format":"Tabelle",
"Load context data":"Weitere Informationen herunterladen",
"Close context data":"<b>Schließen<\/b> weitere Informationen",
"Open context data":"<b>Öffnen<\/b> weitere Informationen",
"Element preview is empty":"Vorschauelement leer",
"PATH-TO-DOCUMENTATION":"https:\/\/docs.totum.online\/",
"Email for cron notifications":"E-Mail für Cron-Benachrichtigungen",
"Password":"Kennwort",
"Login":"Login",
"Create a user with full access":"Erstellen eines Benutzers mit Vollzugriff",
"PostgreSql console utilities":"PostgreSql-Konsolen-Dienstprogramme",
"With console utilities":"Mit Konsolen-Dienstprogrammen",
"Without console utilities":"Ohne Konsolendienstprogramme",
"Database name":"Datenbank-Name",
"Database host":"Datenbank-Host",
"Setup string":"Setup-String",
"Row <b>id %s %s<\/b> is blocked":"Zeile <b>id %s %s<\/b> blockiert",
"Database PostgreSQL":"Datenbank PostgreSQL",
"Deploy only in the new":"Einsatz nur im neuen Bereich",
"Use the existing":"Verwenden Sie eine bestehende",
"Schema":"Schema",
"Schema (not public)":"Schema (nicht öffentlich)",
"Single installation":"Einzelne Installation",
"Multiple installation":"Mehrfache Installation",
"The value is not found":"Wert nicht gefunden",
"Edit totumCode in %s":"Bearbeiten von Totum-Code in %s",
"Edit totumCode in value of %s":"Bearbeiten Totum-Code in Zelle %s",
"Recalculate all table rows after changing the field type":"Neuberechnung aller Tabellenzeilen nach Änderung des Feldtyps",
"Default printing":"Standarddruck",
"Forms":"Formulare",
"Add form":"Formular hinzufügen",
"On type change all field setting will be reset to default. If you want to save this changes — save field and change it's type after that":"Wenn Sie den Typ ändern, werden alle Feldeinstellungen auf ihre Standardwerte zurückgesetzt. Wenn Sie diese Änderungen beibehalten wollen, speichern Sie das Feld und ändern Sie anschließend seinen Typ.",
"On type change all field setting will be reset to saved. If you want to save this changes — save field and change it's type after that":"Wenn Sie den Typ ändern, werden alle Feldeinstellungen auf die gespeicherten Einstellungen zurückgesetzt. Wenn Sie diese Änderungen beibehalten wollen, speichern Sie das Feld und ändern Sie anschließend seinen Typ.",
"RowList of page\/table rows":"RowList der Seiten-\/Tabellenzeilen",
"Attention":"Achtung",
"Show columns extra info":"Weitere Spalteninformationen anzeigen",
"Hide columns extra info":"Zusätzliche Spalteninformationen ausblenden",
"Edited":"Bearbeitet",
"There is no any active trigger.":"Keine Auslöser aktiviert.",
"Your last comment editing":"Bearbeitung des letzten Kommentars",
"Cancel":"Abbrechen",
"Add":"Hinzufügen",
"Add a branch":"Verzweigung hinzufügen",
"Add a row":"Eine Zeile hinzufügen",
"Save":"Speichern",
"Load":"Laden",
"Open":"Öffnen",
"Open all":"Alle öffnen",
"Close":"Schließen",
"Close all":"Alle schließen",
"Close the panel":"Schließen Sie das Panel",
"Apply":"Anwenden",
"By default":"Standardmäßig",
"Show all":"Alle anzeigen",
"Disable code":"Code deaktivieren",
"Code disabling":"Deaktivierung des Codes",
"Disable":"Deaktivieren",
"Refresh":"Aktualisieren",
"Tab":"Tab",
"Create a set":"Ein Set erstellen",
"Hide admin. fields":"Adm. Felder ausblenden",
"Save the fields set":"Eine Gruppe von Feldern speichern",
"Set title":"Name des Sets",
"Upload limit exceeded":"Upload-Limit überschritten",
"In a new tab":"In einem neuen Tab",
"Expand All":"Alle erweitern",
"Scheme of calculation":"Berechnungsschema",
"Select user":"Benutzer auswählen",
"Select values":"Werte auswählen",
"Select":"Markieren",
"Loading":"Laden",
"%s elements":"%s Elemente",
"%s el.":"%s El.",
"Change warning":"Warnung bei einer Änderung",
"Default sets":"Standard-Sets",
"Sets":"Sets",
"Save as default set":"Als Standardset speichern",
"Click hear to unlock":"Zum Entsperren anklicken",
"Apply to selected":"Anwenden auf ausgewählte",
"Fix the selected":"Fixieren der ausgewählten",
"Reset manuals":"Reset manuals",
"Reset manual":"Reset manual",
"Change in source table":"Änderung in der Quelltabelle",
"Add to source table":"Zur Quelltabelle hinzufügen",
"Viewing table settings":"Anzeigen der Tabelleneinstellungen",
"Editing table settings":"Bearbeiten von Tabelleneinstellungen",
"Viewing table field":"Anzeigen eines Tabellenfeldes",
"Editing table field":"Bearbeiten eines Tabellenfeldes",
"Viewing <b>%s<\/b> from table <b>%s<\/b>":"Ansicht <b>%s<\/b> Tabelle <b>%s<\/b>",
"Editing <b>%s<\/b> from table <b>%s<\/b>":"Bearbeitung <b>%s<\/b> Tabelle <b>%s<\/b>",
"Adding table":"Tabelle hinzufügen",
"Adding field":"Ein Feld hinzufügen",
"Adding row to table":"Hinzufügen einer Zeile zur Tabelle",
"Error in %s field":"Fehler im Feld %s",
"You can't put the Settings field type in linkToEdit":"Sie können den Feldtyp Einstellungen nicht in linkToEdit eingeben",
"Done":"Erledigt",
"Comments of field":"Kommentare zum Feld",
"Editing in the form":"Bearbeitung im Formular",
"Add comment":"Einen Kommentar hinzufügen",
"Manually":"Manually",
"Action not executed":"Nicht erhobene Maßnahmen",
"Manually changing the json field":"Manuelles Ändern des json-Feldes",
"Manually changing the json":"Manuelles Ändern der json",
"JSON format error":"Fehler im JSON-Format",
"Fill in by the default settings":"Füllen Sie die Standardeinstellungen aus",
"Edit list\/json":"Liste\/json bearbeiten",
"Order":"Reihenfolge",
"Format":"Format",
"FormatShort":"Format",
"Copy":"Kopieren",
"Field <b>%s<\/b> text":"Feldtext <b>%s<\/b>",
"Field settings":"Feldeinstellungen",
"Edit text":"Text bearbeiten",
"Edit":"Bearbeiten",
"View":"Ansehen",
"Adding to the table is forbidden":"Das Hinzufügen zur Tabelle ist verboten",
"The field must be entered":"Das Feld muss ausgefüllt werden",
"The field %s must be entered":"Das Feld %s muss ausgefüllt werden",
"Value fails regexp validation: \"%s\"":"Wert besteht die Validierung nicht regex: \"%s\"",
"Change the password":"Kennwort ändern",
"New password":"Neues Kennwort",
"Selected":"Ausgewählt",
"The data is incomplete. Use the search!":"Die Daten sind nicht vollständig. Benutzen Sie die Suche!",
"Filled \"%s\" field  error: %s":"Fehler bei der Feldvervollständigung \"%s\": %s",
"Failed to load data":"Daten können nicht hochgeladen werden",
"Required to save the item for file binding":"Erfordert das Speichern eines Elements, um eine Datei zu binden",
"Adding file":"Datei hinzufügen",
"Adding files":"Dateien hinzufügen",
"Drag and drop the file here":"Ziehen Sie die Datei per Drag & Drop hierher",
"There must be a number":"Hier sollte eine Zahl stehen",
"ApplyShort":"Apply",
"InvertShort":"Invert.",
"CancelShort":"Abbrechen",
"Field structure error":"Fehler in der Feldstruktur",
"Field %s structure error":"Fehler in der Feldstruktur %s",
"Field <b>%s<\/b> parameters":"Parameter des Feldes <b>%s<\/b>",
"Editor":"Editor",
"ERR!":"ERR!",
"Error":"Fehler",
"The field accepts only one file":"In das Feld kann nur eine Datei eingegeben werden",
"Checking the file with the server":"Überprüfung der Datei mit dem Server",
"The file is too large":"Die Datei ist zu groß",
"Empty":"Leere",
"Files form <b>%s<\/b>":"Datei Formular <b>%s<\/b>",
"Edit field":"Feld bearbeiten",
"The JSON field content":"Inhalt des JSON-Felde",
"Choose the field":"Ein Feld auswählen",
"Remove from the filter":"Aus dem Filter entfernen",
"Add to the filter":"Zum Filter hinzufügen",
"Simple":"Einfach",
"Calculated in the cycle":"Im Zyklus berechnet",
"Calculated":"Kalkulation",
"Temporary":"Temporär",
"Cycles":"Zyklen",
"Code":"Code",
"Action code":"Aktionscode",
"ActionShort":"Aktion",
"SelectShort":"Select",
"Formating":"Formatierung",
"Selects":"Selects",
"Fields calculation time":"Feldberechnungszeit",
"Send password to email":"Kennwort per E-Mail senden",
"Register and send password to email":"Registrieren Sie sich und senden Sie Ihr Kennwort per E-Mail",
"Registration":"Registrierung",
"Service is optimized for browsers Chrome, Safari, Yandex, FireFox latest versions":"Der Dienst ist für die neuesten Versionen von Chrome, Safari, Yandex und FireFox optimiert.",
"I still want to see it":"Ich möchte noch sehen",
"Apply and close":"Anwenden und schließen",
"Shelve all":"Alle verschieben",
"Shelve":"Ablegen",
"__clock_shelve_panel":"<span class=\"clocks-na\">Unter<\/span> <input type=\"number\" step=\"1\" value=\"10\" class=\"form-control\"\/> <select class=\"form-control\"><option  selected value=\"1\">Minuten<\/option><option value=\"2\">Stunden<\/option><option value=\"3\">Tagen<\/option><\/select>",
"Calculated value":"Berechnetes Ergebnis",
"Same as calculated":"Gleich wie berechnet",
"Show logs":"Logs anzeigen",
"Debugging":"Fehlersuche",
"Without highlightning":"Nicht beleuchtet",
"With code":"Mit Code",
"With code only on adding":"Mit Code beim Hinzufügen",
"With action code":"Mit einem Aktionscode",
"With action code on add":"Mit Aktionscode beim Hinzufügen von",
"With action code on change":"Mit einem Änderungsaktionscode",
"With action code on delete":"Mit dem Code für die Löschaktion",
"With action code on click":"Mit einem Klick-Aktionscode",
"With format code":"Mit Formatierungscode",
"Log":"Log",
"Calculate log":"Berechnen log",
"Log of field manual changes":"Protokoll der manuellen Änderungen nach Feld",
"Log is empty":"Das Protokoll ist leer. Aktivieren Sie die Protokollierung und laden Sie die Seite neu",
"Operation execution error":"Fehler bei der Bedienung",
"No server connection":"Keine Verbindung zum Server",
"export":"export",
"import":"import",
"Full":"Vollständig",
"Only rows":"Nur Zeilen",
"Copied":"Kopiert",
"Edit table settings":"Tabelleneinstellungen bearbeiten",
"Open Tables":"Liste der Tabellen öffnen",
"Open Tables Fields":"Offenen Tabellenaufbau",
"Creating tables versions":"Tabellenversionen erstellen",
"Changing versions of cycle tables":"Ändern der Versionen der Schleifentabellen",
"Restore":"Wiederherstellen",
"Restoring":"Wiederherstellung",
"Editing":"Bearbeitung",
"Normal mode":"Normaler Modus",
" \/ Version %s \/ Cycle %s":" \/ Version %s \/ Zyklus %s",
"Add field":"Feld hinzufügen",
"%s from %s":"%s von %s",
"Reset":"Zurücksetzen",
"Comment of the table rows part":"Kommentar zu den Tabellenzeilen",
"Read only":"Nur Lesen",
"Filters":"Filter",
"Parameters":"Einstellungen",
"Rows part":"Zeilen Teil",
"with id":"mit id",
"Column footers":"Fußzeilen der Spalten",
"Out of column footers":"Fußzeilen außerhalb der Spalten",
"Logout":"Logout",
"Print":"Drucken",
" from ":" von ",
"Header":"Kopfzeile",
"Columns":"Spalten",
"Footer":"Fußzeile",
"Prefilter":"Vorfilter",
"Hidden by default":"Standardmäßig ausgeblendet",
"Fields visibility":"Sichtbarkeit des Feldes",
"On adding":"Beim Hinzufügen",
"On changing":"Beim Ändern",
"On deleting":"Beim Entfernen",
"On click":"Beim Klicken",
"Adding and editing is disallowed":"Hinzufügen und Bearbeiten ist verboten",
"Adding is disallowed":"Hinzufügen ist verboten",
"Editing is disallowed":"Bearbeitung ist verboten",
"Field %s":"Feld %s",
"Change":"Ändernь",
"Duplicate":"Duplizieren",
"Insert after":"Einfügen nach",
"Section":"Abschnitt",
"Change NAME":"Ändern NAME",
"Delete":"Löschen",
"Deleting":"Entfernen",
"Hide":"Ausblenden",
"Hiding":"Ausblenden",
"Open the panel":"Das Panel öffnen",
"Recalculate":"Neuberechnen",
"Recalculate cycle":"Neuberechnung des Zyklus",
"Show":"Anzeigen",
"Field width":"Feldbreite",
"Pin":"Fixiren",
"Unpin":"Entriegeln",
"Sort A-Z":"Sortieren A-Z",
"Sort Z-A":"Sortieren Z-A",
"Table is empty":"Die Tabelle ist leer",
"Page is empty":"Die Seite ist leer",
"Text field editing":"Bearbeiten des Textfelds",
"Documentaion":"Dokumentation",
"Delete field %s from table %s?":"Feld %s aus Tabelle %s löschen?",
"Deleting field %s from table %s?":"Entfernung des Feldes %s aus der Tabelle %s?",
"Fill in the values for unique fields":"Füllen Sie die Werte für die individuellen Felder aus",
"Operation":"Vorgang",
"Value":"Wert",
"Math operations":"Mathematische Operationen",
"Summ":"Summe",
"Number of numbers":"Anzahl der Zahlen",
"Average":"Durchschnittliche",
"Max":"Maximales",
"Min":"Minimale",
"Non-numeric elements":"Nicht-numerische Elemente",
"Calculated only by visible rows":"Berechnet nur nach sichtbaren Zeilen",
"By current page":"Nach aktueller Seite",
"Wait, the table is loading":"Warten Sie, die Tabelle wird gerade geladen",
"Add row":"Eine Zeile hinzufügen",
"Field % not found":"Feld %s nicht gefunden",
"Section deleting":"Entfernen eines Abschnitts",
"Section editing":"Einen Abschnitt bearbeiten",
"empty list":"Leeres Blatt",
"date":"Datum",
"date-time":"Datum-Zeit",
"date-time with secongs":"Datum-Zeit mit Sekunden",
"user id":"Benutzer-ID",
"user roles ids":"Benutzerrollen-IDs",
"table id":"Tabellen-ID",
"table NAME":"Tabelle NAME",
"temporary table HASH":"temporäre Tabelle HASH",
"adding row HASH":"HASH der Additionszeichenkette",
"calcuated table cycle id":"Zyklus-ID der Abrechnungstabelle",
"field NAME":"NAME-Feld",
"new line":"neue Reihe",
"tab":"tab",
"action code action type":"Aktions-Code Aktionsart",
"the ids of the checked fields":"die ID der angekreuzten Felder",
"current field value (for selections\/actions\/formats)":"aktueller Feldwert (für Selektionen\/Aktionen\/Formate)",
"past value of the current field":"den früheren Wert des aktuellen Feldes",
"current host-name":"aktueller Host-Name",
"duplicated row id":"duplizierte Zeilen-ID",
"Csv-loading question":"Frage zum Hochladen von csv-Dateien",
"Check matching the structure of the loaded file to the sequence of fields":"Prüfen Sie, ob die Struktur der hochgeladenen Datei mit der Reihenfolge der Felder übereinstimmt",
"Running":"Durchgeführt",
"Deleted":"Gelöscht",
"Blocked":"Blockiert",
"Surely to change?":"Sind Sie sicher, dass Sie es ändern wollen?",
"Surely to recalculate %s rows?":"Sind Sie sicher, dass Sie es Neuberechnung der %s -Zeilen?",
"Surely to duplicate %s rows?":"Sicherlich, um %s Zeilen zu duplizieren?",
"Surely to recalculate %s cycles?":"Sicherlich zur Neuberechnung von %s Zyklen",
"Surely to hide %s rows?":"Sicherlich, um %s-Zeilen auszublenden?",
"Surely to delete %s rows?":"Sicherlich %s Zeilen löschen?",
"Surely to hide the row?":"Sicherlich um den Streit zu verbergen?",
"Surely to delete the row?":"Sicherlich, um die Zeile zu löschen?",
"Surely to restore the row %s?":"Sicherlich, um die Zeile %s wiederherzustellen?",
"Surely to restore %s rows?":"Sicherlich um %s Zeilen wiederherzustellen?",
"Hiding %s rows":"Ausblenden von %s -Zeilen",
"Deleting %s rows":"%s Zeilen löschen",
"Hiding the row %s":"Zeile %s ausblenden",
"Deleting the row %s":"Entfernen der Zeichenfolge %s",
"Recalculating":"Neuberechnen",
"Duplicating":"Duplizierung",
"Confirmation":"Konfirmation",
"Reload":"Aktualisieren",
"All":"Alle",
"Without hand":"Ohne Hand",
"With hand all":"Mit der Hand alles",
"With hand equals calc":"Mit einer Hand wie eine Berechnung",
"With hand different":"Mit Hand unterschiedlich",
"Filtering by current page":"Filtern nach aktueller Seite",
"No rows are selected by the filtering conditions":"Keine Zeile ist durch die Filterbedingungen ausgewählt",
"To operate the order field, reload the table":"Um das Auftragsfeld zu bedienen, laden Sie die Tabelle neu",
"Rows restore mode. Sorting disabled":"Zeilenwiederherstellungsmodus. Sortierung deaktiviert",
"It is possible to sort only within a category":"Es ist nur möglich, innerhalb einer Kategorie zu sortieren",
"You cannot move the row %s":"Sie können die Zeile %s nicht verschieben",
"The unchecked row should be selected as the anchor for the move":"Wählen Sie eine nicht markierte Zeile als beweglichen Anker",
"No data":"Keine Daten",
"Only nested rows can be moved":"Nur verschachtelte Zeilen können verschoben werden",
"You can only move within one branch":"Sie können sich nur innerhalb einer Branche bewegen",
"Attention, please - this is a temporary table":"Vorsicht - dies ist eine temporäre Tabelle",
"The table was changed by the user <b>%s<\/b> at <b>%s<\/b>":"Die Tabelle wurde vom Benutzer <b>%s<\/b> geändert in <b>%s<\/b>",
"treeAddTable":"Tabelle",
"treeAddFolder":"Ordner\/Verknüpfung",
"Tree search":"Suche im Baum",
"isCreatorSelector-NotCreatorView":"Admin-Ebene deaktivieren",
"isCreatorSelector-CommonView":"Deaktivieren Sie die Spezialansicht",
"isCreatorSelector-MobileView":"Zum Desktop wechseln",
"Dbstring is incorrect":"Fehlerhafte Zeile",
"Create config and upload scheme":"Erstellen Sie eine Konfiguration und füllen Sie den Schaltplan aus",
"Recalculate +":"Neuberechnen +",
"Recalculate cycle +":"Neuberechnung des Zyklus +",
"Available in PRO":"Verfügbar in PRO",
"In the fields marked with a checkmark, their Code on Addition will be executed when recalculating":"In diesem Feld können nur die folgenden Typen eingegeben werden: %s",
"The field accept only following types: %s":"In dieses Feld können nur die folgenden Typen eingegeben werden: %s",
"mobileToDesctopWarning":"Diese Art der Anzeige ist nur für PCs mit einem kleinen Bildschirm gedacht. Schalten Sie sie nicht ein, wenn Sie ein mobiles Gerät wie ein Telefon oder *PAD besitzen.",
"mobileToDesctopUserWarning":"Wir haben den Seitentyp automatisch erkannt.  Wenn uns ein Fehler unterlaufen ist, können Sie die Mobil-\/Desktop-Ansicht manuell umschalten.  Sie müssen sich sicher sein, welche Aktion Sie durchführen!  Wenn Sie auf einem mobilen Gerät zur Desktop-Ansicht wechseln, ist die Seite fehlerhaft!",
"Dark mode":"Dunkler Modus",
"This option works only in PRO.":"Diese Option funktioniert nur in PRO.",
"If you enable it and you have files in this field, they stay on the server, but you cannot access them from totum.":"Wenn Sie diese Option aktivieren und sich Dateien in diesem Feld befinden, verbleiben diese auf dem Server, aber Sie können sie nicht über totum abrufen.",
"This option can be enabled only. You will not be able to turn it off.":"Diese Option kann nur aktiviert werden. Sie haben nicht die Möglichkeit, sie zu deaktivieren.",
"Page":"Seite",
"Orientation":"Orientierung",
"Portrate":"Hochformat",
"Landscape":"Querformat",
"Excel export":"Excel-Export",
"Copy selected":"Markierte Kopie",
"Copy with names":"Kopie mit Titeln",
"Excel export with names":"Excel-Export mit Titeln",
"Xlsx export":"Excel-Export",
"Export":"Exportieren",
"Create PDF":"PDF-Datei erstellen",
"Download":"Herunterladen",
"CSV-export":"CSV-Ausfuhr",
"CSV-import":"CSV-Einfuhr",
"Adding version":"Hinzufügen einer Version",
"Last version will be removed":"Die letzte Version wird gelöscht",
"File %s verions":"Überprüfung der Datei %s",
"versions(%s)":"Versionen (%s)",
"Leave a comment":"Hinterlassen Sie einen Kommentar",
"Last version will be replaced":"Die letzte Version wird überschrieben",
"No, create new version":"Nein, erstellen Sie eine neue Version",
"Rewrite last version by this file":"Ersetzen Sie die letzte Version durch diese Datei",
"Rewrite or create?":"Ersetzen oder eine neue Version erstellen?",
"File for version must be same type as main one: %s":"Die Datei für die Version muss vom gleichen Typ sein wie die Hauptdatei: %s"
}

	}
;