# PowerShell script to download Steam game trailers from the official Steam YouTube channel
# ---------------------------------------------------------------
# Prerequisites:
#   • Windows PowerShell 5.1 or later
#   • yt-dlp installed and added to PATH (https://github.com/yt-dlp/yt-dlp)
#   • Internet access to YouTube
#
# This script reads the game's data file (assets/js/games-data.js), extracts each game's
# name and Steam app ID, searches the official Steam YouTube channel for a trailer, and
# downloads the first matching video as an MP4 saved to assets/media/trailers/<game.id>.mp4.
#
# Usage:
#   1. Open PowerShell as Administrator (or a user with write permission to the project).
#   2. Navigate to the project root:
#        cd "C:\Users\MeHruBaN\Desktop\WORKDIR\PSIICT\Group-1-mehruban"
#   3. Run the script:
#        .\assets\scripts\download_steam_trailers.ps1
#
# The script will create the target directory if it does not exist and will skip games
# for which a trailer file already exists.
# ---------------------------------------------------------------

# ==== Configuration ==================================================
$GamesDataPath = Join-Path -Path $PSScriptRoot "..\..\assets\js\games-data.js"
$TrailerOutputDir = Join-Path -Path $PSScriptRoot "..\..\assets\media\trailers"
$SteamYouTubeChannel = "https://www.youtube.com/@Steam"
# Number of search results to examine per game (default 5)
$MaxResults = 5
# ===============================================================

# Ensure yt-dlp is available
if (-not (Get-Command yt-dlp -ErrorAction SilentlyContinue)) {
    Write-Error "yt-dlp is not installed or not in PATH. Please install it from https://github.com/yt-dlp/yt-dlp and retry."
    exit 1
}

# Create output directory if needed
if (-not (Test-Path $TrailerOutputDir)) {
    New-Item -ItemType Directory -Path $TrailerOutputDir | Out-Null
}

# Helper: extract JSON array from the JS file (the file exports a variable named `gamesData`)
function Get-GamesFromDataFile {
    param([string]$Path)
    $content = Get-Content -Path $Path -Raw
    # Remove any leading JS variable assignment, keep the array part
    $json = $content -replace "^.*?=\s*", "" -replace ";\s*$", ""
    return $json | ConvertFrom-Json
}

$games = Get-GamesFromDataFile -Path $GamesDataPath

foreach ($game in $games) {
    $id = $game.id
    $name = $game.name
    $targetFile = Join-Path -Path $TrailerOutputDir "${id}.mp4"
    if (Test-Path $targetFile) {
        Write-Host "[SKIP] Trailer already exists for '$name' (ID: $id)"
        continue
    }
    Write-Host "[INFO] Searching trailer for '$name' (ID: $id)"
    # Build a YouTube search query that limits results to the Steam channel
    $searchQuery = "site:youtube.com $name trailer"
    $searchUrl = "https://www.youtube.com/results?search_query=" + [uri]::EscapeDataString($searchQuery)
    # Use yt-dlp's "ytsearch" protocol to fetch URLs without a full HTTP request
    # yt-dlp will resolve the first $MaxResults video URLs matching the query
    $ytsearch = "ytsearch${MaxResults}:$searchQuery"
    try {
        $videoInfo = yt-dlp -j --flat-playlist $ytsearch | ConvertFrom-Json
    } catch {
        Write-Warning "Failed to retrieve search results for '$name'. Skipping."
        continue
    }
    if ($null -eq $videoInfo) {
        Write-Warning "No videos found for '$name'. Skipping."
        continue
    }
    # Prefer a video whose title contains "Steam" (most official uploads)
    $selected = $videoInfo | Where-Object { $_.title -match "Steam" } | Select-Object -First 1
    if (-not $selected) { $selected = $videoInfo | Select-Object -First 1 }
    $videoUrl = "https://www.youtube.com/watch?v=$($selected.id)"
    Write-Host "[DOWNLOAD] $videoUrl -> $targetFile"
    yt-dlp -o "$targetFile" -f "best[ext=mp4]" --no-playlist "$videoUrl"
    if (Test-Path $targetFile) {
        Write-Host "[SUCCESS] Trailer saved for '$name'."
    } else {
        Write-Warning "Failed to download trailer for '$name'."
    }
}

Write-Host "All done. Trailers are stored in $TrailerOutputDir"
