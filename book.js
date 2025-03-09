// ==UserScript==
// @name         Book helper
// @namespace    https://github.com/tizee-tampermonkey-scripts/tampermonkey-book-helper
// @downloadURL  https://raw.githubusercontent.com/tizee-tampermonkey-scripts/tampermonkey-book-helper/main/book.js
// @updateURL    https://raw.githubusercontent.com/tizee-tampermonkey-scripts/tampermonkey-book-helper/main/book.js
// @version      1.1.3
// @description  A helper for searching books inspired by douban book+
// @author       tizee
// @match        https://www.goodreads.com/book/show/*
// @match        https://book.douban.com/subject/*
// @match        https://www.google.com/books/edition/*
// @match        https://neodb.social/book/*
// @match        https://annas-archive.org/md5/*
// @match        https://z-lib.gs/book/*
// @icon         https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/1f4da.png
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {

    // idea:
    // 1. get book meta info(ISBN-13/title)
    // 2. construct search links for book website

    const webs = ['anna_archive', 'douban', 'goodreads', 'google_books', 'neodb', 'zlibrary',];

    const patterns = {
        'anna_archive': 'https://annas-archive.org/md5/*',
        'douban': 'https://book.douban.com/subject/*',
        'goodreads': 'https://www.goodreads.com/book/show/*',
        'google_books': 'https://www.google.com/books/edition/*',
        'neodb': 'https://neodb.social/book/*',
        'zlibrary': 'https://z-lib.gs/book/*',
    }

    // data uris of logos except for anna's archive
    const logos = {
        'anna_archive': 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgo8c3ZnIHdpZHRoPSIxMDUuODMzMzRtbSIgaGVpZ2h0PSIxMC43ODg2MDRtbSIgdmlld0JveD0iMCAwIDEwNS44MzMzNCAxMC43ODg2MDQiIHZlcnNpb249IjEuMSIgaWQ9InN2ZzEiIGlua3NjYXBlOnZlcnNpb249IjEuMyAoMGUxNTBlZDZjNCwgMjAyMy0wNy0yMSkiIHNvZGlwb2RpOmRvY25hbWU9IkFubmEncyBBcmNoaXZlIExvZ28gMjYuMTAuMjAyMy5zdmciIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIiB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHNvZGlwb2RpOm5hbWVkdmlldyBpZD0ibmFtZWR2aWV3MSIgcGFnZWNvbG9yPSIjZmZmZmZmIiBib3JkZXJjb2xvcj0iIzExMTExMSIgYm9yZGVyb3BhY2l0eT0iMSIgaW5rc2NhcGU6c2hvd3BhZ2VzaGFkb3c9IjAiIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwIiBpbmtzY2FwZTpwYWdlY2hlY2tlcmJvYXJkPSIxIiBpbmtzY2FwZTpkZXNrY29sb3I9IiNkMWQxZDEiIGlua3NjYXBlOmRvY3VtZW50LXVuaXRzPSJtbSIgaW5rc2NhcGU6em9vbT0iMC41NjM5MDk5MyIgaW5rc2NhcGU6Y3g9IjIwMC4zODY2MSIgaW5rc2NhcGU6Y3k9IjIwLjM5MzMyOCIgaW5rc2NhcGU6d2luZG93LXdpZHRoPSIxNjAwIiBpbmtzY2FwZTp3aW5kb3ctaGVpZ2h0PSI4MjkiIGlua3NjYXBlOndpbmRvdy14PSItOCIgaW5rc2NhcGU6d2luZG93LXk9Ii04IiBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIxIiBpbmtzY2FwZTpjdXJyZW50LWxheWVyPSJsYXllcjEiLz4KICA8ZGVmcyBpZD0iZGVmczEiPgogICAgPGNsaXBQYXRoIGNsaXBQYXRoVW5pdHM9InVzZXJTcGFjZU9uVXNlIiBpZD0iY2xpcFBhdGgyOSI+CiAgICAgIDxwYXRoIGQ9Ik0gMC4zMiwwIFYgMTEyMi41NjAxIEggNzkzLjc2MDAxIFYgMCBaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMzAyLjcyLC04NS4xNTAwMDIpIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGlkPSJwYXRoMjkiLz4KICAgIDwvY2xpcFBhdGg+CiAgICA8Y2xpcFBhdGggY2xpcFBhdGhVbml0cz0idXNlclNwYWNlT25Vc2UiIGlkPSJjbGlwUGF0aDI3Ij4KICAgICAgPHBhdGggZD0iTSAwLjMyLDAgViAxMTIyLjU2MDEgSCA3OTMuNzYwMDEgViAwIFoiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yODguNDUwMDEsLTkxLjg3OTk5NykiIGNsaXAtcnVsZT0iZXZlbm9kZCIgaWQ9InBhdGgyNyIvPgogICAgPC9jbGlwUGF0aD4KICAgIDxjbGlwUGF0aCBjbGlwUGF0aFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgaWQ9ImNsaXBQYXRoMjUiPgogICAgICA8cGF0aCBkPSJNIDAuMzIsMCBWIDExMjIuNTYwMSBIIDc5My43NjAwMSBWIDAgWiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTI3Mi4yNjk5OSwtNjkuMjkwMDAxKSIgY2xpcC1ydWxlPSJldmVub2RkIiBpZD0icGF0aDI1Ii8+CiAgICA8L2NsaXBQYXRoPgogICAgPGNsaXBQYXRoIGNsaXBQYXRoVW5pdHM9InVzZXJTcGFjZU9uVXNlIiBpZD0iY2xpcFBhdGgyMyI+CiAgICAgIDxwYXRoIGQ9Ik0gMC4zMiwwIFYgMTEyMi41NjAxIEggNzkzLjc2MDAxIFYgMCBaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjUzLjgzLC05MS44Nzk5OTcpIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGlkPSJwYXRoMjMiLz4KICAgIDwvY2xpcFBhdGg+CiAgICA8Y2xpcFBhdGggY2xpcFBhdGhVbml0cz0idXNlclNwYWNlT25Vc2UiIGlkPSJjbGlwUGF0aDIxIj4KICAgICAgPHBhdGggZD0iTSAwLjMyLDAgViAxMTIyLjU2MDEgSCA3OTMuNzYwMDEgViAwIFoiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMzkuMjUsLTkxLjQwMDAwMikiIGNsaXAtcnVsZT0iZXZlbm9kZCIgaWQ9InBhdGgyMSIvPgogICAgPC9jbGlwUGF0aD4KICAgIDxjbGlwUGF0aCBjbGlwUGF0aFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgaWQ9ImNsaXBQYXRoMTkiPgogICAgICA8cGF0aCBkPSJNIDAuMzIsMCBWIDExMjIuNTYwMSBIIDc5My43NjAwMSBWIDAgWiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIyMi40MiwtODAuMzQ5OTk4KSIgY2xpcC1ydWxlPSJldmVub2RkIiBpZD0icGF0aDE5Ii8+CiAgICA8L2NsaXBQYXRoPgogICAgPGNsaXBQYXRoIGNsaXBQYXRoVW5pdHM9InVzZXJTcGFjZU9uVXNlIiBpZD0iY2xpcFBhdGgxNyI+CiAgICAgIDxwYXRoIGQ9Ik0gMC4zMiwwIFYgMTEyMi41NjAxIEggNzkzLjc2MDAxIFYgMCBaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTk4LjUzOTk5LC05MS44Nzk5OTcpIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGlkPSJwYXRoMTciLz4KICAgIDwvY2xpcFBhdGg+CiAgICA8Y2xpcFBhdGggY2xpcFBhdGhVbml0cz0idXNlclNwYWNlT25Vc2UiIGlkPSJjbGlwUGF0aDE1Ij4KICAgICAgPHBhdGggZD0iTSAwLjMyLDAgViAxMTIyLjU2MDEgSCA3OTMuNzYwMDEgViAwIFoiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xNjkuNTMsLTg1Ljk0OTk5NykiIGNsaXAtcnVsZT0iZXZlbm9kZCIgaWQ9InBhdGgxNSIvPgogICAgPC9jbGlwUGF0aD4KICAgIDxjbGlwUGF0aCBjbGlwUGF0aFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgaWQ9ImNsaXBQYXRoMTMiPgogICAgICA8cGF0aCBkPSJNIDAuMzIsMCBWIDExMjIuNTYwMSBIIDc5My43NjAwMSBWIDAgWiIgY2xpcC1ydWxlPSJldmVub2RkIiBpZD0icGF0aDEzIi8+CiAgICA8L2NsaXBQYXRoPgogICAgPGNsaXBQYXRoIGNsaXBQYXRoVW5pdHM9InVzZXJTcGFjZU9uVXNlIiBpZD0iY2xpcFBhdGgxMSI+CiAgICAgIDxwYXRoIGQ9Ik0gMC4zMiwwIFYgMTEyMi41NjAxIEggNzkzLjc2MDAxIFYgMCBaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTMyLjgyMDAxLC05MS44Nzk5OTcpIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGlkPSJwYXRoMTEiLz4KICAgIDwvY2xpcFBhdGg+CiAgICA8Y2xpcFBhdGggY2xpcFBhdGhVbml0cz0idXNlclNwYWNlT25Vc2UiIGlkPSJjbGlwUGF0aDkiPgogICAgICA8cGF0aCBkPSJNIDAuMzIsMCBWIDExMjIuNTYwMSBIIDc5My43NjAwMSBWIDAgWiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTExMi4xNSwtOTEuODc5OTk3KSIgY2xpcC1ydWxlPSJldmVub2RkIiBpZD0icGF0aDkiLz4KICAgIDwvY2xpcFBhdGg+CiAgICA8Y2xpcFBhdGggY2xpcFBhdGhVbml0cz0idXNlclNwYWNlT25Vc2UiIGlkPSJjbGlwUGF0aDciPgogICAgICA8cGF0aCBkPSJNIDAuMzIsMCBWIDExMjIuNTYwMSBIIDc5My43NjAwMSBWIDAgWiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTg5LjcwOTk5OSwtOTEuODc5OTk3KSIgY2xpcC1ydWxlPSJldmVub2RkIiBpZD0icGF0aDciLz4KICAgIDwvY2xpcFBhdGg+CiAgICA8Y2xpcFBhdGggY2xpcFBhdGhVbml0cz0idXNlclNwYWNlT25Vc2UiIGlkPSJjbGlwUGF0aDUiPgogICAgICA8cGF0aCBkPSJNIDAuMzIsMCBWIDExMjIuNTYwMSBIIDc5My43NjAwMSBWIDAgWiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTY3Ljc1LC05MS44Nzk5OTcpIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGlkPSJwYXRoNSIvPgogICAgPC9jbGlwUGF0aD4KICA8L2RlZnM+CiAgPGcgaW5rc2NhcGU6bGFiZWw9IkxheWVyIDEiIGlua3NjYXBlOmdyb3VwbW9kZT0ibGF5ZXIiIGlkPSJsYXllcjEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC01Mi4xMjI5MTcsLTE0My4xMzk1OSkiPgogICAgPHBhdGggaWQ9InBhdGg0IiBkPSJNIDAsMCAtMS4xMiwtNC42NCBIIC04LjY2IEwgLTkuNzgsMCBoIC04LjE3MDAwMSBMIC05LjMsLTI0Ljk5IEggMCBMIDguMTcsMCBaIG0gLTQuODEsLTE5LjU0MDAwMSBoIC0wLjE2IGMgMCwwLjMyMDAwMiAwLDAuODAwMDAxIC0wLjE2LDEuNDQwMDAxIC0wLjE2LDAuNjQwMDAxIC0wLjk2LDMuMzYgLTIuMDgsOC4xNyBoIDQuNjQgbCAtMS43NiwtNi43MyBjIC0wLjE2LC0xLjEyMDAwMSAtMC4zMiwtMi4wOCAtMC40OCwtMi44ODAwMDEgeiIgc3R5bGU9ImZpbGw6IzAwMDAwMDtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIgdHJhbnNmb3JtPSJtYXRyaXgoMC40MDA5MTQyLDAsMCwwLjQwMDkxNDIsNTkuMzE5MzI3LDE1My43MzU3NSkiIGNsaXAtcGF0aD0idXJsKCNjbGlwUGF0aDUpIi8+CiAgICA8cGF0aCBpZD0icGF0aDYiIGQ9Im0gMCwwIHYgLTkuNzcgYyAwLC0xLjEyIC0wLjE2LC0xLjc2IC0wLjQ4LC0yLjQgLTAuMzIsLTAuNDggLTAuODEsLTAuNjQgLTEuNjEsLTAuNjQgLTAuNjQsMCAtMS4xMiwwLjE2IC0xLjQ0LDAuOCAtMC4zMiwwLjQ4IC0wLjY0LDEuMTIgLTAuNjQsMS45MiBWIDAgaCAtNy4zNyB2IC0xNy43ODAwMDEgaCA3LjM3IFYgLTE1LjA2IGggMC4xNiBjIDAuNjQsLTAuOTYgMS40NCwtMS43NiAyLjQsLTIuMzk5OTk5IEMgLTAuNjQsLTE3Ljk0MDAwMSAwLjQ4LC0xOC4yNiAxLjYsLTE4LjI2IGMgNC4wMSwwIDUuOTMsMi40IDUuOTMsNy4zNyBMIDcuNTMsMCBaIiBzdHlsZT0iZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIiB0cmFuc2Zvcm09Im1hdHJpeCgwLjQwMDkxNDIsMCwwLDAuNDAwOTE0Miw2OC4xMjM0MDMsMTUzLjczNTc1KSIgY2xpcC1wYXRoPSJ1cmwoI2NsaXBQYXRoNykiLz4KICAgIDxwYXRoIGlkPSJwYXRoOCIgZD0ibSAwLDAgdiAtOS43NyBjIDAsLTEuMTIgLTAuMTYsLTEuNzYgLTAuNDksLTIuNCAtMC4zMiwtMC40OCAtMC45NiwtMC42NCAtMS42LC0wLjY0IC0wLjY0LDAgLTEuMTIsMC4xNiAtMS42LDAuOCAtMC4zMiwwLjQ4IC0wLjQ4LDEuMTIgLTAuNDgsMS45MiBWIDAgaCAtNy4zNyB2IC0xNy43ODAwMDEgaCA3LjM3IHYgMi43MjAwMDEgMCBjIDAuNjQsLTAuOTYgMS40NCwtMS43NiAyLjQsLTIuMzk5OTk5IEMgLTAuODEsLTE3Ljk0MDAwMSAwLjMyLC0xOC4yNiAxLjYsLTE4LjI2IGMgMy44NSwwIDUuNzcsMi40IDUuNzcsNy4zNyBMIDcuMzcsMCBaIiBzdHlsZT0iZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIiB0cmFuc2Zvcm09Im1hdHJpeCgwLjQwMDkxNDIsMCwwLDAuNDAwOTE0Miw3Ny4xMTk5MTksMTUzLjczNTc1KSIgY2xpcC1wYXRoPSJ1cmwoI2NsaXBQYXRoOSkiLz4KICAgIDxwYXRoIGlkPSJwYXRoMTAiIGQ9Im0gMCwwIHYgLTIuNzIgaCAtMC4xNiBjIC0xLjEyLDIuMDggLTIuODgsMy4yIC01LjQ1LDMuMiAtMS42LDAgLTIuODgsLTAuNDggLTMuODQsLTEuNDQgLTAuOTcsLTEuMTIgLTEuNDUsLTIuNCAtMS40NSwtNC4wMSAwLC0zLjUyIDIuMDksLTUuNiA2LjQxLC02LjI0IEwgMCwtMTEuNjkgYyAwLC0wLjY0IC0wLjMyLC0xLjEyIC0wLjgsLTEuNDQgLTAuNDgsLTAuMzMgLTEuMjgsLTAuNjUgLTIuMDgsLTAuNjUgLTIuMDksMCAtNC4xNywwLjY1IC02LjQxLDEuNzcgdiAtNC44MSBjIDAuOTYsLTAuNDc5OTk5IDIuMjQsLTAuODAwMDAxIDMuNjgsLTEuMTIwMDAxIEMgLTQuMTcsLTE4LjEgLTIuODgsLTE4LjI2IC0xLjkyLC0xOC4yNiBjIDMuMDQsMCA1LjI5LDAuNjM5OTk5IDYuNTcsMS45MiAxLjQ0LDEuMjggMi4wOCwzLjUzIDIuMDgsNi41NyBWIDAgWiBtIC00LjQ5LC02LjA5IGMgMCwwLjQ4IDAuMTYsMC45NiAwLjQ4LDEuMjkgMC4zMywwLjMyIDAuODEsMC40OCAxLjI5LDAuNDggMC44LDAgMS40NCwtMC4zMiAxLjkyLC0wLjk3IEMgLTAuMzIsLTUuNzcgMCwtNi41NyAwLC03LjUzIHYgLTAuNjQgbCAtMi41NiwwLjMyIGMgLTEuMjgsMC4zMiAtMS45MywwLjggLTEuOTMsMS43NiB6IiBzdHlsZT0iZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIiB0cmFuc2Zvcm09Im1hdHJpeCgwLjQwMDkxNDIsMCwwLDAuNDAwOTE0Miw4NS40MDY4MiwxNTMuNzM1NzUpIiBjbGlwLXBhdGg9InVybCgjY2xpcFBhdGgxMSkiLz4KICAgIDxwYXRoIGlkPSJwYXRoMTIiIGQ9Ik0gMTQ3LjU3MDAxLDc0LjA5OTk5OCBIIDE0My4yNCBMIDE0NS4zMjAwMSw2Ni4yNSBIIDE1MS43MyBaIiBzdHlsZT0iZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIiBjbGlwLXBhdGg9InVybCgjY2xpcFBhdGgxMykiIHRyYW5zZm9ybT0ibWF0cml4KDAuNDAwOTE0MiwwLDAsMC40MDA5MTQyLDMyLjE1NzM4OSwxMTYuODk5NzUpIi8+CiAgICA8cGF0aCBpZD0icGF0aDE0IiBkPSJtIDAsMCBjIDAsMi4wOSAtMC44MSwzLjY5IC0yLjI1LDQuODEgLTEuNiwwLjk2IC0zLjY4LDEuNiAtNi41NywxLjYgLTAuOCwwIC0xLjc2LC0wLjE2IC0yLjg4LC0wLjMyIC0xLjEzLC0wLjE2IC0yLjA5LC0wLjMyIC0yLjg5LC0wLjQ4IFYgMC4zMiBjIDIuMjQsMC45NyA0LjAxLDEuNDUgNS40NSwxLjQ1IDEuNDQsMCAyLjI0LC0wLjMyIDIuMjQsLTEuMTMgMCwtMC4zMiAtMC4xNiwtMC40OCAtMC40OCwtMC44IC0wLjMyLC0wLjE2IC0xLjI4LC0wLjQ4IC0yLjcyLC0wLjk2IC0xLjYsLTAuNDggLTIuNzMsLTEuMTIgLTMuMzcsLTEuOTIgLTAuOCwtMC45NiAtMS4xMiwtMS45MiAtMS4xMiwtMy4zNiAwLC0xLjc3IDAuNjQsLTMuMjEgMi4yNCwtNC4zMyAxLjQ1LC0xLjEyIDMuNTMsLTEuNiA2LjEsLTEuNiAxLjYsMCAzLjIsMC4xNiA0Ljk2LDAuNjQgdiA0Ljk3IGMgLTAuNjQsLTAuMTYgLTEuNDQsLTAuNDggLTIuNCwtMC42NSAtMC44LC0wLjMyIC0xLjYsLTAuMzIgLTIuMDgsLTAuMzIgLTAuNDgsMCAtMC45NywwIC0xLjI5LDAuMTYgLTAuMzIsMC4xNiAtMC4zMiwwLjQ5IC0wLjMyLDAuNjUgMCwwLjMyIDAuMTYsMC42NCAwLjMyLDAuOTYgMC4zMiwwLjE2IDAuOTcsMC4zMiAxLjkzLDAuNjQgMS45MiwwLjY0IDMuMiwxLjI4IDQsMi4wOCBDIC0wLjMyLC0yLjQgMCwtMS4yOCAwLDAgWiIgc3R5bGU9ImZpbGw6IzAwMDAwMDtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIgdHJhbnNmb3JtPSJtYXRyaXgoMC40MDA5MTQyLDAsMCwwLjQwMDkxNDIsMTAwLjEyNDM4LDE1MS4zNTgzMykiIGNsaXAtcGF0aD0idXJsKCNjbGlwUGF0aDE1KSIvPgogICAgPHBhdGggaWQ9InBhdGgxNiIgZD0iTSAwLDAgLTEuMTMsLTQuNjQgSCAtOC41IEwgLTkuNzgsMCBoIC04LjE3MDAwMSBMIC05LjMsLTI0Ljk5IEggMCBMIDguMTcsMCBaIG0gLTQuODEsLTE5LjU0MDAwMSBoIC0wLjE2IGMgMCwwLjMyMDAwMiAwLDAuODAwMDAxIC0wLjE2LDEuNDQwMDAxIC0wLjE2LDAuNjQwMDAxIC0wLjgsMy4zNiAtMi4wOSw4LjE3IGggNC42NSBsIC0xLjYsLTYuNzMgYyAtMC4zMiwtMS4xMjAwMDEgLTAuNDgsLTIuMDggLTAuNjQsLTIuODgwMDAxIHoiIHN0eWxlPSJmaWxsOiMwMDAwMDA7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiIHRyYW5zZm9ybT0ibWF0cml4KDAuNDAwOTE0MiwwLDAsMC40MDA5MTQyLDExMS43NTQ4OSwxNTMuNzM1NzUpIiBjbGlwLXBhdGg9InVybCgjY2xpcFBhdGgxNykiLz4KICAgIDxwYXRoIGlkPSJwYXRoMTgiIGQ9Im0gMCwwIGMgLTAuMzIsMCAtMC42NCwtMC4xNiAtMS4xMiwtMC4zMiAtMC40OCwwIC0wLjgxLC0wLjE2IC0xLjEzLC0wLjE2IC0yLjU2LDAgLTMuNjgsMS40NCAtMy42OCw0LjMyIHYgNy42OSBoIC03LjU0IFYgLTYuMjUgaCA3LjU0IHYgMy4wNCAwIGMgMC40OCwtMS4xMiAxLjEyLC0xLjkyIDEuOTIsLTIuNTYgMC44LC0wLjQ4IDEuNzYsLTAuOCAyLjg5LC0wLjggMC40OCwwIDAuOCwwIDEuMTIsMC4xNiB6IiBzdHlsZT0iZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIiB0cmFuc2Zvcm09Im1hdHJpeCgwLjQwMDkxNDIsMCwwLDAuNDAwOTE0MiwxMjEuMzI4NzMsMTQ5LjExMzIxKSIgY2xpcC1wYXRoPSJ1cmwoI2NsaXBQYXRoMTkpIi8+CiAgICA8cGF0aCBpZD0icGF0aDIwIiBkPSJtIDAsMCBjIC0wLjQ4LDAuMzIgLTEuMTIsMC40OCAtMi4yNSwwLjY0IC0wLjk2LDAuMTYgLTIuMDgsMC4zMiAtMy41MiwwLjMyIC0xLjkzLDAgLTMuNTMsLTAuMzIgLTQuOTcsLTEuMTIgLTEuNiwtMC44IC0yLjczLC0xLjkyIC0zLjUzLC0zLjIgLTAuOCwtMS40NSAtMS4xMiwtMi44OSAtMS4xMiwtNC42NSAwLC0yLjA4IDAuMzIsLTMuODQgMS4yOCwtNS4yOSAwLjgsLTEuNDQgMi4wOSwtMi41NiAzLjY5LC0zLjM2IDEuNiwtMC43OTk5OTkgMy4zNywtMS4xMjAwMDEgNS42MSwtMS4xMjAwMDEgMS4xMiwwIDIuMDgsMCAzLjA0LDAuMTYgMC45NywwLjE2MDAwMiAxLjYxLDAuMzIwMDAyIDEuNzcsMC42NDAwMDEgdiA1Ljc3IGMgLTAuMzIsLTAuMzIgLTAuOCwtMC42NCAtMS42MSwtMC44IC0wLjY0LC0wLjE2IC0xLjI4LC0wLjMyIC0xLjkyLC0wLjMyIC0xLjQ0LDAgLTIuNTYsMC4zMiAtMy4yLDAuOTYgLTAuODEsMC44IC0xLjEzLDEuNzYgLTEuMTMsMy4wNCAwLDEuMTIgMC4zMiwyLjA4IDEuMTMsMi44OCAwLjY0LDAuNjQgMS42LDAuOTYgMy4wNCwwLjk2IDEuMjgsMCAyLjU3LC0wLjMyIDMuNjksLTAuOTYgeiIgc3R5bGU9ImZpbGw6IzAwMDAwMDtmaWxsLW9wYWNpdHk6MTtmaWxsLXJ1bGU6bm9uemVybztzdHJva2U6bm9uZSIgdHJhbnNmb3JtPSJtYXRyaXgoMC40MDA5MTQyLDAsMCwwLjQwMDkxNDIsMTI4LjA3NjEyLDE1My41NDMzMSkiIGNsaXAtcGF0aD0idXJsKCNjbGlwUGF0aDIxKSIvPgogICAgPHBhdGggaWQ9InBhdGgyMiIgZD0ibSAwLDAgdiAtMTAuMDkgYyAwLC0xLjc2IC0wLjY0LC0yLjcyIC0yLjA4LC0yLjcyIC0wLjY0LDAgLTEuMTIsMC4zMiAtMS40NCwwLjggLTAuNDgsMC40OCAtMC42NCwxLjEyIC0wLjY0LDEuOTIgViAwIGggLTcuMzggdiAtMjYuNDMgaCA3LjM4IHYgMTEuMDUgSCAtNCBjIDAuNjQsLTAuOTYgMS40NCwtMS42IDIuMjQsLTIuMDc5OTk5IEMgLTAuOCwtMTcuOTQwMDAxIDAuMTYsLTE4LjI2IDEuMjksLTE4LjI2IGMgMS45MiwwIDMuMzYsMC42Mzk5OTkgNC4zMiwxLjkyIDEuMTIsMS4xMiAxLjYxLDMuMDQgMS42MSw1LjQ1IEwgNy4yMiwwIFoiIHN0eWxlPSJmaWxsOiMwMDAwMDA7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiIHRyYW5zZm9ybT0ibWF0cml4KDAuNDAwOTE0MiwwLDAsMC40MDA5MTQyLDEzMy45MjE0NCwxNTMuNzM1NzUpIiBjbGlwLXBhdGg9InVybCgjY2xpcFBhdGgyMykiLz4KICAgIDxwYXRoIGlkPSJwYXRoMjQiIGQ9Ik0gMCwwIEMgMCwwLjk2IC0wLjQ5LDEuNzcgLTEuMTMsMi41NyAtMS45MywzLjIxIC0yLjg5LDMuNTMgLTQuMTcsMy41MyAtNS40NSwzLjUzIC02LjQyLDMuMjEgLTcuMjIsMi40MSAtOC4wMiwxLjc3IC04LjM0LDAuOTYgLTguMzQsMCBjIDAsLTEuMTIgMC4zMiwtMS45MiAxLjEyLC0yLjU2IDAuOCwtMC42NCAxLjc3LC0wLjk2IDMuMDUsLTAuOTYgMS4xMiwwIDIuMjQsMC4zMiAzLjA0LDAuOTYgQyAtMC40OSwtMS45MiAwLC0xLjEyIDAsMCBaIE0gLTcuODYsMjIuNTkgViA0LjgxIGggNy4zNyB2IDE3Ljc4IHoiIHN0eWxlPSJmaWxsOiMwMDAwMDA7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiIHRyYW5zZm9ybT0ibWF0cml4KDAuNDAwOTE0MiwwLDAsMC40MDA5MTQyLDE0MS4zMTQzLDE0NC42NzkxKSIgY2xpcC1wYXRoPSJ1cmwoI2NsaXBQYXRoMjUpIi8+CiAgICA8cGF0aCBpZD0icGF0aDI2IiBkPSJtIDAsMCBoIC04Ljk3IGwgLTUuOTMsLTE3Ljc4MDAwMSBoIDcuODUgTCAtNC45NywtOC4wMSBjIDAuMzMsMS40NCAwLjQ5LDIuNzIgMC42NSwzLjUzIHYgMCBjIDAsLTAuMzIgMC4xNiwtMC40OSAwLjE2LC0wLjgxIDAsLTAuMTYgMC45NiwtNC4zMiAyLjU2LC0xMi40OTAwMDEgaCA3LjY5IHoiIHN0eWxlPSJmaWxsOiMwMDAwMDA7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOm5vbmUiIHRyYW5zZm9ybT0ibWF0cml4KDAuNDAwOTE0MiwwLDAsMC40MDA5MTQyLDE0Ny44MDExLDE1My43MzU3NSkiIGNsaXAtcGF0aD0idXJsKCNjbGlwUGF0aDI3KSIvPgogICAgPHBhdGggaWQ9InBhdGgyOCIgZD0ibSAwLDAgYyAwLjE2LDAuNjQgMC42NCwxLjI4IDEuMjgsMS43NiAwLjgsMC40OSAxLjc2LDAuNjUgMy4wNSwwLjY1IDEuNzYsMCAzLjM2LC0wLjMyIDQuOTYsLTAuOTcgdiA0LjY1IGMgLTEuNzYsMC44IC00LDEuMTIgLTYuNTcsMS4xMiAtMy4wNCwwIC01LjYxLC0wLjggLTcuMjEsLTIuNCAtMS43NiwtMS42IC0yLjcyLC0zLjg1IC0yLjcyLC02LjU3IDAsLTEuOTIgMC40OCwtMy42OCAxLjEyLC01LjEzIDAuOCwtMS40NCAxLjkyLC0yLjU2IDMuNTIsLTMuMzYgMS40NSwtMC44IDMuMDUsLTEuMjggNC44MSwtMS4yOCAxLjkzLDAgMy41MywwLjMyIDQuODEsMS4xMiAxLjI4LDAuNjQgMi40LDEuNiAzLjA1LDMuMDQgMC42NCwxLjI5IDAuOTYsMi43MyAwLjk2LDQuNDkgViAwIFogTSA0LjQ5LC00IEMgNC40OSwtNi4wOCAzLjY4LC03LjA1IDIuMjQsLTcuMDUgMS42LC03LjA1IDEuMTIsLTYuNzMgMC44LC02LjI0IDAuMzIsLTUuNiAwLC00LjggMCwtNCBaIiBzdHlsZT0iZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lIiB0cmFuc2Zvcm09Im1hdHJpeCgwLjQwMDkxNDIsMCwwLDAuNDAwOTE0MiwxNTMuNTIyMTQsMTUxLjAzNzYpIiBjbGlwLXBhdGg9InVybCgjY2xpcFBhdGgyOSkiLz4KICA8L2c+Cjwvc3ZnPg==',
        'goodreads': 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgdmlld0JveD0iMCAwIDY3My44IDE0NCIgdmVyc2lvbj0iMS4xIiB5PSIwcHgiIHg9IjBweCIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDY3My44IDE0NCI+CjxwYXRoIGQ9Im02Ni43IDg2LjRoLTAuM2MtMy4zIDE0LjUtMTguMiAyMy0zMi4yIDIzLTIyLjkgMC0zNC4yLTE4LjItMzQuMi0zOS4yIDAtMjIgMTIuMS00MC4yIDM1LjItNDAuMiAxNS42IDAgMjcuOSAxMC40IDMxLjEgMjMuOGgwLjN2LTIxLjloMy4ydjc5LjNjMCAyMi4zLTEyLjggMzIuOC0zNC4xIDMyLjgtMTYuNiAwLTMwLjgtNy41LTMxLjMtMjUuOGgzLjJjMC42IDE2LjMgMTMuMSAyMi42IDI3LjkgMjIuNiAxOS44IDAgMzEuMS05LjQgMzEuMS0yOS43di0yNC43em0tMzEuNS01My4yYy0yMS4yIDAtMzIuMSAxNy4xLTMyLjEgMzcgMCAyMC4zIDEwLjggMzYuMSAzMC44IDM2LjEgMjEuMSAwIDMyLjYtMTYuMyAzMi42LTM2LjEgMC4yLTE4LjktMTAuNy0zNy0zMS4zLTM3eiIgZmlsbD0iIzM3MjIxMyIvPgo8cGF0aCBkPSJtMTE1LjggMzBjMjMuOSAwIDM2LjggMjAuNiAzNi44IDQyLjkgMCAyMi41LTEyLjkgNDIuOS0zNyA0Mi45LTIzLjkgMC0zNi45LTIwLjQtMzYuOS00Mi45IDAuMS0yMi4zIDEzLTQyLjkgMzcuMS00Mi45em0wIDgyLjZjMjEuOCAwIDMzLjYtMTkgMzMuNi0zOS43IDAtMjAuNC0xMS44LTM5LjctMzMuNi0zOS43LTIyLjIgMC0zMy44IDE5LjMtMzMuOCAzOS43IDAgMjAuNyAxMS42IDM5LjcgMzMuOCAzOS43eiIgZmlsbD0iIzM3MjIxMyIvPgo8cGF0aCBkPSJtMTk0LjYgMzBjMjMuOSAwIDM2LjggMjAuNiAzNi44IDQyLjkgMCAyMi41LTEyLjkgNDIuOS0zNyA0Mi45LTIzLjkgMC0zNi44LTIwLjQtMzYuOC00Mi45IDAtMjIuMyAxMi45LTQyLjkgMzctNDIuOXptMCA4Mi42YzIxLjkgMCAzMy42LTE5IDMzLjYtMzkuNyAwLTIwLjQtMTEuOC0zOS43LTMzLjYtMzkuNy0yMi4yIDAtMzMuOCAxOS4zLTMzLjggMzkuNy0wLjEgMjAuNyAxMS42IDM5LjcgMzMuOCAzOS43eiIgZmlsbD0iIzM3MjIxMyIvPgo8cGF0aCBkPSJtMzA0LjQgMGgzLjJ2MTEzLjloLTMuMnYtMjNoLTAuM2MtNC4xIDE0LjMtMTYuMSAyNC45LTMyLjggMjQuOS0yMS43IDAtMzQuOS0xOC0zNC45LTQyLjcgMC0yMyAxMi4zLTQzLjEgMzQuOS00My4xIDE3LjQgMCAyOSAxMC4xIDMyLjggMjQuOWgwLjN2LTU0Ljl6bS0zMy4xIDMzLjJjLTIyLjUgMC0zMS43IDIwLjktMzEuNyAzOS45IDAgMjEgMTAuNSAzOS41IDMxLjcgMzkuNSAyMS4xIDAgMzMuMi0xOC4zIDMzLjItMzkuNS0wLjEtMjUuNC0xMy4zLTM5LjktMzMuMi0zOS45eiIgZmlsbD0iIzM3MjIxMyIvPgo8cGF0aCBkPSJtMzIzLjEgMzEuNmg5LjJ2MTkuM2gwLjNjNS4xLTEzLjIgMTYuMy0yMS4xIDMxLjEtMjAuNHYxMGMtMTguMi0xLTMwLjYgMTIuNC0zMC42IDI5LjV2NDMuOWgtMTAuMXYtODIuM3oiIGZpbGw9IiMzNzIyMTMiLz4KPHBhdGggZD0ibTM3Mi40IDc1LjRjMC4xIDE0LjcgNy44IDMyLjQgMjcuMSAzMi40IDE0LjcgMCAyMi42LTguNiAyNS44LTIxaDEwLjFjLTQuMyAxOC43LTE1LjIgMjkuNS0zNS45IDI5LjUtMjYuMSAwLTM3LjEtMjAuMS0zNy4xLTQzLjUgMC0yMS43IDExLTQzLjUgMzcuMS00My41IDI2LjUgMCAzNyAyMy4xIDM2LjIgNDYuMmgtNjMuM3ptNTMuMi04LjRjLTAuNS0xNS4xLTkuOS0yOS40LTI2LjItMjkuNHMtMjUuNCAxNC40LTI3IDI5LjRoNTMuMnoiIGZpbGw9IiMzNzIyMTMiLz4KPHBhdGggZD0ibTQ0NC4zIDU2LjhjMC45LTE5LjMgMTQuNS0yNy42IDMzLjMtMjcuNiAxNC41IDAgMzAuMyA0LjUgMzAuMyAyNi41djQzLjdjMCAzLjggMS45IDYuMSA1LjkgNi4xIDEuMSAwIDIuNC0wLjMgMy4yLTAuNnY4LjRjLTIuMiAwLjUtMy44IDAuNi02LjYgMC42LTEwLjIgMC0xMS44LTUuNy0xMS44LTE0LjRoLTAuM2MtNyAxMC43LTE0LjIgMTYuNy0zMCAxNi43LTE1LjEgMC0yNy42LTcuNS0yNy42LTI0LjEgMC0yMy4xIDIyLjUtMjMuOSA0NC4yLTI2LjUgOC4zLTEgMTIuOS0yLjEgMTIuOS0xMS4yIDAtMTMuNi05LjctMTYuOS0yMS42LTE2LjktMTIuNCAwLTIxLjcgNS44LTIyIDE5LjJoLTkuOXptNTMuNiAxMi4xaC0wLjNjLTEuMyAyLjQtNS44IDMuMi04LjUgMy43LTE3LjEgMy0zOC4zIDIuOS0zOC4zIDE5IDAgMTAuMSA4LjkgMTYuMyAxOC4zIDE2LjMgMTUuMyAwIDI4LjktOS43IDI4LjctMjUuOHYtMTMuMnoiIGZpbGw9IiMzNzIyMTMiLz4KPHBhdGggZD0ibTU5Ni41IDExMy45aC05LjJ2LTE1LjdoLTAuM2MtNC4zIDEwLjctMTcuNCAxOC0yOS4zIDE4LTI1LjEgMC0zNy0yMC4yLTM3LTQzLjVzMTEuOS00My41IDM3LTQzLjVjMTIuMyAwIDI0LjIgNi4yIDI4LjUgMThoMC4zdi00Ny4yaDEwdjExMy45em0tMzguOS02LjFjMjEuNCAwIDI4LjktMTggMjguOS0zNS4xcy03LjUtMzUuMS0yOC45LTM1LjFjLTE5LjEgMC0yNyAxOC0yNyAzNS4xczcuOCAzNS4xIDI3IDM1LjF6IiBmaWxsPSIjMzcyMjEzIi8+CjxwYXRoIGQ9Im02NjAuOSA1NS42Yy0wLjUtMTIuNC0xMC0xOC0yMS41LTE4LTguOSAwLTE5LjQgMy41LTE5LjQgMTQuMiAwIDguOSAxMC4yIDEyLjEgMTcuMSAxMy45bDEzLjQgM2MxMS41IDEuOCAyMy40IDguNSAyMy40IDIyLjggMCAxNy45LTE3LjcgMjQuNy0zMyAyNC43LTE5LjEgMC0zMi4yLTguOS0zMy44LTI5aDEwYzAuOCAxMy41IDEwLjkgMjAuNiAyNC4zIDIwLjYgOS40IDAgMjIuNS00LjEgMjIuNS0xNS42IDAtOS42LTguOS0xMi43LTE4LTE1bC0xMi45LTIuOWMtMTMuMS0zLjUtMjMtOC0yMy0yMiAwLTE2LjcgMTYuNC0yMy4xIDMwLjktMjMuMSAxNi40IDAgMjkuNSA4LjYgMzAuMSAyNi41aC0xMC4xeiIgZmlsbD0iIzM3MjIxMyIvPgo8L3N2Zz4K',
        'google_books': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI3NCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDc0IDI0Ij48cGF0aCBmaWxsPSIjNDI4NUY0IiBkPSJNOS4yNCA4LjE5djIuNDZoNS44OGMtLjE4IDEuMzgtLjY0IDIuMzktMS4zNCAzLjEtLjg2Ljg2LTIuMiAxLjgtNC41NCAxLjgtMy42MiAwLTYuNDUtMi45Mi02LjQ1LTYuNTRzMi44My02LjU0IDYuNDUtNi41NGMxLjk1IDAgMy4zOC43NyA0LjQzIDEuNzZMMTUuNCAyLjVDMTMuOTQgMS4wOCAxMS45OCAwIDkuMjQgMCA0LjI4IDAgLjExIDQuMDQuMTEgOXM0LjE3IDkgOS4xMyA5YzIuNjggMCA0LjctLjg4IDYuMjgtMi41MiAxLjYyLTEuNjIgMi4xMy0zLjkxIDIuMTMtNS43NSAwLS41Ny0uMDQtMS4xLS4xMy0xLjU0SDkuMjR6Ii8+PHBhdGggZmlsbD0iI0VBNDMzNSIgZD0iTTI1IDYuMTljLTMuMjEgMC01LjgzIDIuNDQtNS44MyA1LjgxIDAgMy4zNCAyLjYyIDUuODEgNS44MyA1LjgxczUuODMtMi40NiA1LjgzLTUuODFjMC0zLjM3LTIuNjItNS44MS01LjgzLTUuODF6bTAgOS4zM2MtMS43NiAwLTMuMjgtMS40NS0zLjI4LTMuNTIgMC0yLjA5IDEuNTItMy41MiAzLjI4LTMuNTJzMy4yOCAxLjQzIDMuMjggMy41MmMwIDIuMDctMS41MiAzLjUyLTMuMjggMy41MnoiLz48cGF0aCBmaWxsPSIjNDI4NUY0IiBkPSJNNTMuNTggNy40OWgtLjA5Yy0uNTctLjY4LTEuNjctMS4zLTMuMDYtMS4zQzQ3LjUzIDYuMTkgNDUgOC43MiA0NSAxMmMwIDMuMjYgMi41MyA1LjgxIDUuNDMgNS44MSAxLjM5IDAgMi40OS0uNjIgMy4wNi0xLjMyaC4wOXYuODFjMCAyLjIyLTEuMTkgMy40MS0zLjEgMy40MS0xLjU2IDAtMi41My0xLjEyLTIuOTMtMi4wN2wtMi4yMi45MmMuNjQgMS41NCAyLjMzIDMuNDMgNS4xNSAzLjQzIDIuOTkgMCA1LjUyLTEuNzYgNS41Mi02LjA1VjYuNDloLTIuNDJ2MXptLTIuOTMgOC4wM2MtMS43NiAwLTMuMS0xLjUtMy4xLTMuNTIgMC0yLjA1IDEuMzQtMy41MiAzLjEtMy41MiAxLjc0IDAgMy4xIDEuNSAzLjEgMy41NC4wMSAyLjAzLTEuMzYgMy41LTMuMSAzLjV6Ii8+PHBhdGggZmlsbD0iI0ZCQkMwNSIgZD0iTTM4IDYuMTljLTMuMjEgMC01LjgzIDIuNDQtNS44MyA1LjgxIDAgMy4zNCAyLjYyIDUuODEgNS44MyA1LjgxczUuODMtMi40NiA1LjgzLTUuODFjMC0zLjM3LTIuNjItNS44MS01LjgzLTUuODF6bTAgOS4zM2MtMS43NiAwLTMuMjgtMS40NS0zLjI4LTMuNTIgMC0yLjA5IDEuNTItMy41MiAzLjI4LTMuNTJzMy4yOCAxLjQzIDMuMjggMy41MmMwIDIuMDctMS41MiAzLjUyLTMuMjggMy41MnoiLz48cGF0aCBmaWxsPSIjMzRBODUzIiBkPSJNNTggLjI0aDIuNTF2MTcuNTdINTh6Ii8+PHBhdGggZmlsbD0iI0VBNDMzNSIgZD0iTTY4LjI2IDE1LjUyYy0xLjMgMC0yLjIyLS41OS0yLjgyLTEuNzZsNy43Ny0zLjIxLS4yNi0uNjZjLS40OC0xLjMtMS45Ni0zLjctNC45Ny0zLjctMi45OSAwLTUuNDggMi4zNS01LjQ4IDUuODEgMCAzLjI2IDIuNDYgNS44MSA1Ljc2IDUuODEgMi42NiAwIDQuMi0xLjYzIDQuODQtMi41N2wtMS45OC0xLjMyYy0uNjYuOTYtMS41NiAxLjYtMi44NiAxLjZ6bS0uMTgtNy4xNWMxLjAzIDAgMS45MS41MyAyLjIgMS4yOGwtNS4yNSAyLjE3YzAtMi40NCAxLjczLTMuNDUgMy4wNS0zLjQ1eiIvPjwvc3ZnPg==',
        'douban': 'data:image/png;base64,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',
        'neodb': 'https://neodb.social/s/img/logo.svg',
        'zlibrary': 'https://z-lib.gs/img/logo.zlibrary.png'
    }

    function create_link_for_web(web, query, container, isbn = true) {
        switch (web) {
            case 'douban':
                create_link(logos.douban, build_douban_link(query), container, 32);
                break;
            case 'goodreads':
                create_link(logos.goodreads, build_goodreads_link(query), container, 32, 200);
                break;
            case 'google_books':
                create_link(logos.google_books, build_google_books_link(query, isbn), container, 32);
                break;
            case 'neodb':
                create_link(logos.neodb, build_neodb_link(query), container, 32, 100);
                break;
            case 'anna_archive':
                create_link(logos.anna_archive, build_anna_archive_link(query), container, 32, 200);
                break;
            case 'zlibrary':
                create_link(logos.zlibrary, build_zlibrary_link(query), container, 32, 126);
                break;
        }
    }

    function create_link(logo, link, container, height = 32, width = undefined) {
        const anchor = document.createElement('a');
        anchor.href = link;
        anchor.target = '_blank';
        anchor.style = 'background-color: transparent;';
        const image = document.createElement('img');
        image.src = logo;
        image.height = height;
        if(width) {
            image.width = width;
        }
        anchor.appendChild(image);
        const list_item = document.createElement('li');
        list_item.appendChild(anchor);
        list_item.style = 'border-bottom: 1px solid rgba(0, 0, 0, 0.08); margin: 10px auto;';
        container.appendChild(list_item);
    }

    function build_douban_link(query) {
        return `https://search.douban.com/book/subject_search?search_text=${query}`
  }

    function build_goodreads_link(query) {
        return `https://www.goodreads.com/search?q=${query}`
  }

    function build_google_books_link(query, isbn = true) {
        if(isbn) {
            return `https://www.google.com/search?tbo=p&tbm=bks&q=isbn:${query}`
    } else {
        return `https://www.google.com/search?tbo=p&tbm=bks&q=${query}`
    }
    }

    function build_neodb_link(query) {
        // search with title, query, author
        return `https://neodb.social/search?q=${query}&c=book`
  }

    function build_zlibrary_link(query) {
        return `https://z-lib.gs/s/${query}`
  }

    function build_anna_archive_link(query) {
        // search with title, query, author
        return `https://annas-archive.org/search?q=${query}`
  }

    function build_list(web, query, container, prepend = true, isbn = true)  {
        const helper_container = document.createElement('div');
        helper_container.setAttribute('id', 'book-helper')
        helper_container.style = `padding: 18px 16px; background-color: #f6f6f2; margin: 20px 0; width: 300px;`;
        // title
        const h2 = document.createElement('h2');
        h2.style = 'font-size: 15px; color: #007722;';
        const span = document.createElement('span');
        span.innerText = 'Search book in';
        h2.innerText = ' · · · · · · '
        h2.prepend(span);
        helper_container.appendChild(h2);
        // link list
        const included_webs = webs.filter((val, _ , __) => val != web);
        const links_container = document.createElement('ul');
        links_container.setAttribute('id', 'book-helper-list');
        links_container.style = 'list-style: none;';
        for (const web of included_webs) {
            create_link_for_web(web, query, links_container, isbn);
        }
        helper_container.appendChild(links_container);
        // footer
        const p = document.createElement('p');
        p.innerText = 'Powered by book-helper';
        p.style = 'margin: 0 auto; text-align: center; color: grey;';
        helper_container.appendChild(p);
        if(prepend) {
            container.prepend(helper_container);
        }else{
            container.appendChild(helper_container);
        }
    }

    function create_btns_douban() {
        let regexp = new RegExp(patterns.douban);
        if (!regexp.test(window.location.href)) {
            return;
        }
        // get ISBN from page
        const info = document.querySelector('#content #info').textContent.trim();
        const isbn_regexp = /ISBN: (\d+)*/;
        const isbn = info.match(isbn_regexp)[1];

        // create container and links
        const aside_container = document.querySelector('#content .aside')
        build_list('douban', isbn, aside_container, true, true);
    }

    function create_btns_goodreads() {
        let regexp = new RegExp(patterns.goodreads);
        if (!regexp.test(window.location.href)) {
            return;
        }
        const el = document.querySelector('.EditionDetails');
        if (!el) return;
        // get ISBN from page
        const info = document.querySelector('.EditionDetails').textContent.trim();
        console.debug(info);

        const isbn_regexp = /ISBN(\d+) \(ISBN10/;
        const isbn = info.match(isbn_regexp);

        // create container and links
        const aside_container = document.querySelector('.BookPage__leftColumn .Sticky')
        if(!isbn) {
            // search with title
            const title = document.querySelector('.BookPageTitleSection__title h1').textContent.trim();
            build_list('goodreads', title, aside_container, false, false);
        } else {
            build_list('goodreads', isbn[1], aside_container, false, true);
        }
    }

    function create_btns_neodb() {
        let regexp = new RegExp(patterns.neodb);
        if (!regexp.test(window.location.href)) {
            return;
        }
        // get ISBN from page
        const info = document.querySelector('#item-metadata').textContent.trim();
        console.debug(info);
        const isbn_regexp = /ISBN: (\d+)/;
        const ISBN = info.match(isbn_regexp);

        // create container and links
        const aside_container = document.querySelector('#item-sidebar')
        if(!ISBN) {
            // search with title
            const title = document.querySelector('#item-title h1').textContent.trim();
            build_list('neodb', title, aside_container, false);
        } else {
            build_list('neodb', ISBN[1], aside_container, false);
        }
    }

    function create_btns_anna() {
        let regexp = new RegExp(patterns.anna_archive);
        if (!regexp.test(window.location.href)) {
            return;
        }
        // get ISBN from page
        const info = document.querySelector('.js-md5-codes-tabs').textContent.trim();
        console.debug(info);
        const isbn_regexp = /ISBN-13(\d+-\d+-\d+-\d+-\d+)/;
        const isbn = info.match(isbn_regexp);

        // create container and links
        const aside_container = document.querySelector('.main')
        if(!isbn) {
            // search with title
            const title = document.querySelector('.text-3xl.font-bold').textContent.trim();
            build_list('anna_archive', title, aside_container, true, false);
        } else {
            build_list('anna_archive', isbn[1].replace(/-/g,''), aside_container, true, true);
        }
    }

    function create_btns_googlebooks() {
        let regexp = new RegExp(patterns.google_books);
        if (!regexp.test(window.location.href)) {
            return;
        }
        // create container and links
        const aside_container = document.querySelector('#main')
        // search with title
        const title = document.querySelector('div[role="heading"]').textContent.trim();
        build_list('google_books', title, aside_container, true, false);
    }

    function create_btns_zlibrary() {
        let regexp = new RegExp(patterns.zlibrary);
        if (!regexp.test(window.location.href)) {
            return;
        }
        // get ISBN from page
        const info = document.querySelector(`div.bookProperty.property_isbn.${CSS.escape('13')}`).textContent.trim();
        const isbn = info.split(':').map((v)=> v.trim());

        // create container and links
        const aside_container = document.querySelector('div.row.cardBooks');
        if(!isbn[1]) {
            // search with title
            const title = document.querySelector('h1[itemprop="name"]').textContent.trim();
            build_list('zlibrary', title, aside_container, false, false);
        } else {
            build_list('zlibrary', isbn[1], aside_container, false, true);
        }
    }
    function initialize() {
        create_btns_douban();
        create_btns_goodreads();
        create_btns_neodb();
        create_btns_anna();
        create_btns_googlebooks();
        create_btns_zlibrary();
    }
    // Setup Observers and Event Listeners
    if (document.readyState === "loading") {
        window.addEventListener("DOMContentLoaded", initialize);
    } else {
        initialize();
    }
    // Observer for dynamic content changes
    const observer = new MutationObserver(() => {
        if (!document.getElementById("book-helper")) {
            initialize();
        }
    });

    observer.observe(document.documentElement || document.body, {
        childList: true,
        subtree: true,
    });
}())
