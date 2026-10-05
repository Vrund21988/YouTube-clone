// ==========================================
// YOUTUBE API KEY
// ==========================================

const API_KEY = "AIzaSyBd0OVDJLn1Rgikl91ioQOpSiU7hkYdla8";


// ==========================================
// LOAD HOME VIDEOS
// ==========================================

async function loadVideos() {

    const app = document.getElementById("app");

    app.innerHTML = `
        <h2>Recommended Videos</h2>
        <p>Loading videos...</p>
    `;

    try {

        const url =
            `https://www.googleapis.com/youtube/v3/videos` +
            `?part=snippet,statistics,status` +
            `&chart=mostPopular` +
            `&regionCode=IN` +
            `&maxResults=50` +
            `&key=${API_KEY}`;

        const response = await fetch(url);

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        const videos = data.items.filter(video =>
            video.status.embeddable !== false
        );

        displayVideos(videos, "Recommended Videos");

    } catch (error) {

        app.innerHTML = `
            <h2>❌ YouTube API Error</h2>
            <p>${error.message}</p>
        `;

        console.error(error);
    }
}


// ==========================================
// DISPLAY VIDEOS
// ==========================================

function displayVideos(videos, title) {

    const app = document.getElementById("app");

    if (videos.length === 0) {

        app.innerHTML = `
            <h2>No videos found</h2>
        `;

        return;
    }

    let html = `
        <h2>${title}</h2>

        <div class="video-grid">
    `;

    videos.forEach(video => {

        const videoId = video.id;
        const snippet = video.snippet;
        const statistics = video.statistics || {};

        const titleText = snippet.title;
        const channel = snippet.channelTitle;

        const views =
            statistics.viewCount
                ? Number(statistics.viewCount).toLocaleString()
                : "0";

        const thumbnail =
            snippet.thumbnails.high?.url ||
            snippet.thumbnails.medium?.url ||
            snippet.thumbnails.default?.url;

        html += `
            <div class="video-card"
                 onclick="playVideo('${videoId}')">

                <div class="thumbnail">

                    <img
                        src="${thumbnail}"
                        alt="${escapeHTML(titleText)}"
                    >

                </div>

                <h3>${escapeHTML(titleText)}</h3>

                <p>${escapeHTML(channel)}</p>

                <span>${views} views</span>

            </div>
        `;
    });

    html += `
        </div>
    `;

    app.innerHTML = html;
}


// ==========================================
// SEARCH VIDEOS
// ==========================================

async function searchVideos() {

    const input = document.querySelector(".search-box input");

    const query = input.value.trim();

    if (!query) {

        loadVideos();

        return;
    }

    const app = document.getElementById("app");

    app.innerHTML = `
        <h2>Search results for "${escapeHTML(query)}"</h2>
        <p>Searching YouTube...</p>
    `;

    try {

        const url =
            `https://www.googleapis.com/youtube/v3/search` +
            `?part=snippet` +
            `&q=${encodeURIComponent(query)}` +
            `&type=video` +
            `&maxResults=50` +
            `&key=${API_KEY}`;

        const response = await fetch(url);

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        const videoIds = data.items
            .map(item => item.id.videoId)
            .filter(Boolean);

        if (videoIds.length === 0) {

            app.innerHTML = `
                <h2>No videos found</h2>
                <p>Try another search.</p>
            `;

            return;
        }

        // Get video statistics and embeddable status
        const detailsUrl =
            `https://www.googleapis.com/youtube/v3/videos` +
            `?part=snippet,statistics,status` +
            `&id=${videoIds.join(",")}` +
            `&key=${API_KEY}`;

        const detailsResponse = await fetch(detailsUrl);

        const detailsData = await detailsResponse.json();

        if (detailsData.error) {
            throw new Error(detailsData.error.message);
        }

        const videos = detailsData.items.filter(video =>
            video.status.embeddable !== false
        );

        displayVideos(videos, `Search results for "${query}"`);

    } catch (error) {

        app.innerHTML = `
            <h2>❌ Search Error</h2>
            <p>${error.message}</p>
        `;

        console.error(error);
    }
}


// ==========================================
// PLAY VIDEO
// ==========================================

function playVideo(videoId) {

    const app = document.getElementById("app");

    app.innerHTML = `

        <button
            onclick="loadVideos()"
            class="back-button">
            ← Back to Home
        </button>

        <div class="player-container">

            <iframe
                src="https://www.youtube.com/embed/${videoId}"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen>
            </iframe>

        </div>

    `;
}


// ==========================================
// SIDEBAR PAGES
// ==========================================

function showPage(page) {

    if (page === "home") {

        loadVideos();

        return;
    }

    if (page === "trending") {

        loadVideos();

        return;
    }

    if (page === "videos") {

        loadVideos();

        return;
    }

    if (page === "shorts") {

        searchForShorts();

        return;
    }
}


// ==========================================
// SHORTS
// ==========================================

async function searchForShorts() {

    const input = document.querySelector(".search-box input");

    input.value = "YouTube Shorts";

    searchVideos();
}


// ==========================================
// SEARCH BUTTON
// ==========================================

function setupSearch() {

    const input = document.querySelector(".search-box input");

    const button = document.querySelector(".search-box button");

    if (!input || !button) {
        return;
    }

    button.addEventListener("click", searchVideos);

    input.addEventListener("keydown", function(event) {

        if (event.key === "Enter") {

            searchVideos();

        }

    });
}


// ==========================================
// PREVENT HTML SPECIAL CHARACTERS
// ==========================================

function escapeHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================
// START APP
// ==========================================

document.addEventListener("DOMContentLoaded", function() {

    setupSearch();

    loadVideos();

});