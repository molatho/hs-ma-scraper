# hs-ma-Scraper

Simple scraper that extracts publicly available information of [Hochschule Mannheim (HSMA)](https://hs-mannheim.de/) from its websites. The gathered data is used for the HSMA.Info app.

## Components

### Scraper
Performs requests to HSMA's sites, parses the returned HTML and extracts valuable information (e.g. timetables, professors and faculties)

### DataExport
Dumps the gathered data to disk. It will create a minimized "_all.json" file for both `timetable` and `professors` as well as single files for courses and individual professors.

### GitHandler
If any changes were made by Scraper and DataExport to the current dataset, GitHandler will create a commit and issue a push to the `data`-branch.

### RoomProcessor
When supplied with timetable-date, RoomProcessor extracts information about room occupancy per individual room.

## Todo
* ~~~Consume timetable~~~
* ~~~Consume professors~~~
* Consume faculties'/institues' info pages
* Consume university's/faculties' newsfeed
* ~~~Dump occupancy information (using timetable data)~~~
* ~~~Implement pushing to git~~~