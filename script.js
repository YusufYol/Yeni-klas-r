function initAppEngine() {
    // UI Elements
    const splashScreen = document.getElementById('splash-screen');
    const appContainer = document.getElementById('app');
    const mainContent = document.getElementById('main-content');
    const notificationContainer = document.getElementById('notification-container');

    // --- AdSense Helpers ---
    function getAdHTML(type = 'display') {
        const clientID = 'ca-pub-6510717509739190';
        let slotID = ''; // User should provide specific slot IDs for better performance
        
        // Defaulting to auto-sized responsive ads
        let adContent = `
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="${clientID}"
                 data-ad-slot="${slotID}"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
        `;

        if (type === 'feed') {
            adContent = `
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-format="fluid"
                     data-ad-layout-key="-fb+5w+4e-db+86"
                     data-ad-client="${clientID}"
                     data-ad-slot="${slotID}"></ins>
            `;
        }

        return `
            <div class="ad-container ad-${type}-container">
                <span class="ad-label">REKLAM</span>
                ${adContent}
            </div>
        `;
    }

    function triggerAds() {
        try {
            (adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense push failed:", e);
        }
    }

    function refreshAds() {
        // Find all new ad tags and push them
        const ads = document.querySelectorAll('.adsbygoogle:not([data-adsbygoogle-status])');
        ads.forEach(() => {
            triggerAds();
        });
    }

    // --- Date Formatter ---
    function formatDate(dateStr) {
        if (!dateStr) return '';
        // "YYYY-MM-DD ..." formatını "GG.AA.YYYY" yap
        const parts = dateStr.split(' ')[0].split('-');
        if (parts.length === 3) {
            return `${parts[2]}.${parts[1]}.${parts[0]}`;
        }
        return dateStr;
    }


    // 1. Data Helper
    function getCategoryData(cat) {
        if (!cat) return { news: [], pilots: [], teams: [], standings: {}, calendar: [], resultsHistory: {} };
        
        // URL'den gelen cat parametresini decode et
        let decodedCat = cat;
        try {
            decodedCat = decodeURIComponent(cat).trim();
        } catch (e) {
            console.warn("Category decoding failed:", cat);
        }

        // 1. Direkt eşleşme dene
        if (APP_DATA[decodedCat]) return APP_DATA[decodedCat];

        // 2. Normalizasyon fonksiyonu
        const normalize = (str) => {
            return str.toLowerCase()
                      .replace(/ı/g, 'i')
                      .replace(/ş/g, 's')
                      .replace(/ğ/g, 'g')
                      .replace(/ç/g, 'c')
                      .replace(/ö/g, 'o')
                      .replace(/ü/g, 'u')
                      .replace(/[\s\-]+/g, '') // boşluk ve tireleri sil
                      .trim();
        };

        const target = normalize(decodedCat);

        // 3. Özel eşleşmeler (F1 vb kısaltmalar)
        if (target === 'f1' || target === 'formula1') return APP_DATA['formula 1'];
        if (target === 'motogp') return APP_DATA['motogp'];

        // 4. Tüm anahtarları tarayarak normalize edilmiş hallerini karşılaştır
        const keys = Object.keys(APP_DATA);
        for (let key of keys) {
            if (normalize(key) === target) {
                return APP_DATA[key];
            }
        }

        return { news: [], pilots: [], teams: [], standings: {}, calendar: [], resultsHistory: {} };
    }

    // Global Event Logic
    function getGlobalNextEvent() {
        const now = new Date(); // Dinamik güncel tarih
        const allEvents = [];

        Object.keys(APP_DATA).forEach(catKey => {
            const catData = APP_DATA[catKey];
            if (catData.calendar) {
                catData.calendar.forEach(event => {
                    if (event.isoDate) {
                        allEvents.push({
                            ...event,
                            category: catKey.toUpperCase()
                        });
                    }
                });
            }
        });

        // Etkinliklerin bitiş zamanlarını hesapla
        allEvents.forEach(e => {
            let raceHour = 23;
            let raceMinute = 59;
            
            if (e.sessions && e.sessions.length > 0) {
                // Ana yarışı bul
                const raceSession = e.sessions.find(s => s.name.toLowerCase().includes('yarış') && !s.name.toLowerCase().includes('sprint') && !s.name.toLowerCase().includes('sıralama'));
                const sessionToUse = raceSession || e.sessions[e.sessions.length - 1];
                
                if (sessionToUse && sessionToUse.time) {
                    const timeParts = sessionToUse.time.split(':');
                    if (timeParts.length >= 2) {
                        raceHour = parseInt(timeParts[0], 10);
                        raceMinute = parseInt(timeParts[1], 10);
                    }
                }
            }
            
            const parts = e.isoDate.split('-');
            if (parts.length === 3) {
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const day = parseInt(parts[2], 10);
                
                e.endDateTime = new Date(year, month, day, raceHour, raceMinute, 0);
                // Yarış saatinden 3 saat sonrasına kadar ekranda kalması için 3 saat ekle
                e.endDateTime.setHours(e.endDateTime.getHours() + 3);
            } else {
                e.endDateTime = new Date(e.isoDate); 
                e.endDateTime.setHours(23, 59, 59);
            }
        });

        // Sadece "Sıradaki" ve bitiş zamanı şu andan büyük olanları filtrele, sonra tarihe göre sırala
        const upcoming = allEvents.filter(e => e.status === "Sıradaki" && e.endDateTime > now);
        upcoming.sort((a, b) => a.endDateTime - b.endDateTime);

        return upcoming[0] || null;
    }

    // 2. Splash Screen Logic
    setTimeout(() => {
        if (splashScreen) {
            splashScreen.style.opacity = '0';
            setTimeout(() => {
                splashScreen.style.display = 'none';
                appContainer.classList.remove('hidden');
                initApp();
            }, 500);
        } else {
            appContainer.classList.remove('hidden');
            initApp();
        }
    }, 2000);

    function initApp() {
        // Handle browser back button
        window.onpopstate = function (event) {
            const isLocal = window.location.protocol === 'file:';
            if (isLocal && window.location.hash) {
                let path = window.location.hash.substring(1) || 'home';
                try { path = decodeURIComponent(path); } catch (e) {}
                const parts = path.split('/');
                const view = parts[0] || 'home';
                const cat = parts[1] || 'f1';
                const round = parts[2] || null;
                handleRoute(view, cat, false, round);
            } else if (event.state) {
                handleRoute(event.state.view, event.state.cat, false, event.state.round);
            } else {
                // Determine path for initial server load
                let path = window.location.pathname === '/' ? 'home' : window.location.pathname.substring(1);
                try { path = decodeURIComponent(path); } catch (e) {}
                const parts = path.split('/');
                const view = parts[0] || 'home';
                const cat = parts[1] || 'f1';
                const round = parts[2] || null;
                handleRoute(view, cat, false, round);
            }
        };

        // Detect if running locally (file://) or on a server
        const isLocal = window.location.protocol === 'file:';
        let path = '';

        if (isLocal) {
            path = window.location.hash.substring(1) || 'home';
        } else {
            path = window.location.pathname === '/' ? 'home' : window.location.pathname.substring(1);
        }

        // URL'yi decode et (özellikle boşluklu kategoriler ve haber başlıkları için)
        try {
            path = decodeURIComponent(path);
        } catch (e) {
            console.warn("Path decoding failed:", path);
        }

        const parts = path.split('/');
        const view = parts[0] || 'home';
        const cat = parts[1] || 'f1';
        const round = parts[2] || null;

        // Direkt link ile gelindiyse history stack oluştur
        if (view !== 'home' && !window.history.state) {
            window.isDirectLink = true;
            window.currentView = view;
            window.currentCat = cat;
            window.currentRound = round;
            window.currentPathStr = path;
            
            const injectHistoryOnce = () => {
                if (!window.isDirectLink) return;
                window.isDirectLink = false;
                
                if (isLocal) {
                    window.history.replaceState({ view: 'home', cat: null, round: null }, null, window.location.pathname + '#home');
                    window.history.pushState({ view: window.currentView, cat: window.currentCat, round: window.currentRound }, null, window.location.pathname + '#' + window.currentPathStr);
                } else {
                    const currentUrl = window.location.pathname + window.location.search + window.location.hash;
                    window.history.replaceState({ view: 'home', cat: null, round: null }, "", window.APP_ROOT || '/');
                    window.history.pushState({ view: window.currentView, cat: window.currentCat, round: window.currentRound }, "", currentUrl);
                }
            };

            document.addEventListener('touchstart', injectHistoryOnce, { once: true, passive: true });
            document.addEventListener('scroll', injectHistoryOnce, { once: true, passive: true });
            document.addEventListener('mousedown', injectHistoryOnce, { once: true, passive: true });

            handleRoute(view, cat, false, round);
        } else {
            handleRoute(view, cat, false, round);
        }

        setupNavigation();
        initNotificationSystem(); // Initialize notifications
    }

    // 2. Navigation & Routing
    function setupNavigation() {
        document.querySelectorAll('.nav-link, .nav-link-bottom, .nav-link-home, .nav-link-top').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = link.dataset.view;
                const cat = link.dataset.cat;
                handleRoute(view, cat);
            });
        });

        document.querySelector('.header-logo-text').addEventListener('click', () => {
            handleRoute('home');
        });
    }

    function handleRoute(view, cat, pushState = true, round = null) {
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (pushState) {
            const isLocal = window.location.protocol === 'file:';
            const path = cat ? `${view}/${cat}${round ? `/${round}` : ''}` : view;

            if (isLocal) {
                window.location.hash = path;
            } else {
                const finalPath = path === 'home' ? '/' : `/${path}`;
                history.pushState({ view, cat, round }, "", finalPath);
            }
        }

        switch (view) {
            case 'news':
                renderCategoryNews(cat);
                break;
            case 'pilots':
                renderPilotsAndTeams(cat);
                break;
            case 'standings':
                renderStandings(cat);
                break;
            case 'calendar':
                renderCalendar(cat);
                break;
            case 'results':
                renderResults(cat, round);
                break;
            case 'track-detail':
                renderTrackDetail(cat);
                break;
            case 'news-detail':
                renderNewsDetail(cat, round);
                break;
            case 'pilot-detail':
                showPilotDetail(cat, round);
                break;
            case 'team-detail':
                showTeamDetail(cat, round);
                break;
            case 'about':
                renderAbout();
                break;
            case 'home':
                renderHome();
                break;
            default:
                renderHome();
        }

        // Refresh AdSense ads for new content
        setTimeout(refreshAds, 300);
    }

    // 3. Renderers
    function renderHome() {
        const nextEvent = getGlobalNextEvent();

        mainContent.innerHTML = `
            <div id="home-top-banner-container"></div>
            <div id="hero-news-container"></div>
            ${getAdHTML('display')}
            <section id="main-news-feed" class="news-feed">
                <h2 id="news-section-title" class="section-title">GÜNCEL HABERLER</h2>
                <div id="news-container"></div>
            </section>
        `;
        
        renderHomeTopBanner(document.getElementById('home-top-banner-container'), nextEvent);
        renderAllNewsUI(document.getElementById('news-container'), document.getElementById('news-section-title'), document.getElementById('hero-news-container'));
    }

    function renderHomeTopBanner(container, event) {
        if (!container) return;
        if (!event) {
            container.innerHTML = '';
            return;
        }

        // Find the main race session
        const raceSession = event.sessions?.find(s => s.name.toLowerCase().includes('yarış') && !s.name.toLowerCase().includes('sprint') && !s.name.toLowerCase().includes('sıralama')) || event.sessions?.[event.sessions.length - 1];

        // Find previous event
        let prevEventHtml = '';
        if (event.category) {
            const catData = getCategoryData(event.category.toLowerCase());
            if (catData && catData.calendar) {
                const now = new Date();
                const pastEvents = catData.calendar.filter(e => {
                    if (e.status !== "Tamamlandı") return false;
                    const parts = e.isoDate.split('-');
                    let eDate = new Date();
                    if (parts.length === 3) {
                        eDate = new Date(parts[0], parts[1]-1, parts[2]);
                    } else {
                        eDate = new Date(e.isoDate);
                    }
                    return eDate < now;
                });
                if (pastEvents.length > 0) {
                    pastEvents.sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate));
                    const prevEvent = pastEvents[0];
                    if (prevEvent) {
                        prevEventHtml = `<span style="cursor:pointer; color:#777; font-weight:700; font-size:0.75rem; text-decoration:none; transition: color 0.2s;" onmouseover="this.style.color='var(--primary-red)'" onmouseout="this.style.color='#777'" onclick="handleRoute('results', '${event.category.toLowerCase()}', true, '${prevEvent.round || prevEvent.track}')">ÖNCEKİ YARIŞ SONUÇLARI &gt;</span>`;
                    }
                }
            }
        }

        container.innerHTML = `
            <div class="top-race-wrapper" style="border: 1px solid rgba(0,0,0,0.1); border-radius: 12px; margin-bottom: 20px; overflow: hidden; background: white; box-shadow: 0 4px 10px rgba(0,0,0,0.03);">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; padding: 12px 15px; border-bottom: 1px solid rgba(0,0,0,0.05); background: #fdfdfd;">
                    <span style="color: var(--primary-red); font-size: 0.8rem; font-weight: 800; text-transform: uppercase;">HAFTA SONU TAKVİMİ</span>
                    ${prevEventHtml}
                </div>
                <div class="top-race-banner-content" id="top-race-banner-click" style="padding: 15px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div class="banner-left" style="display: flex; flex-direction: column;">
                        <span class="banner-title" style="font-size: 0.95rem; font-weight: 800; color: var(--asphalt-black); text-transform: uppercase; margin-bottom: 4px;">${event.gp} (${event.category})</span>
                        <span class="banner-session" style="font-size: 0.85rem; font-weight: 600; color: #666;">Pazar: Yarış ${raceSession ? raceSession.time : ''}</span>
                    </div>
                    <div class="banner-right" style="font-size: 0.85rem; font-weight: 700; color: #888;">
                        ${formatDate(event.isoDate)}
                    </div>
                </div>
            </div>
            <div id="weekend-summary-modal" style="display:none; margin-bottom:25px"></div>
        `;


        document.getElementById('top-race-banner-click').onclick = () => {
            const modal = document.getElementById('weekend-summary-modal');
            if (modal.style.display === 'none') {
                renderWeekendUI(modal, null, event, true);
                modal.style.display = 'block';
                modal.scrollIntoView({ behavior: 'smooth' });
            } else {
                modal.style.display = 'none';
            }
        };
    }


    function renderWeekendUI(containerSummary, containerTrack, event, isModal = false) {
        if (!event) return;

        const trackStats = CIRCUITS_DB[event.track] || CIRCUITS_DB["Sakhir"];
        const sessions = event.sessions || [];

        const summaryContent = `
            <div class="weekend-summary" style="margin-bottom: ${isModal ? '0' : '20px'}">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px;">
                    <div style="display:flex; align-items:center; gap:12px; height:24px">
                        <span class="tag" style="background:var(--primary-red); color:white; padding:0 12px; height:24px; display:inline-flex; align-items:center; border-radius:12px; font-weight:800; font-size:0.7rem; line-height:1">${event.category}</span>
                        <span style="color:var(--primary-red); font-weight:800; font-size:0.65rem; text-transform:uppercase; letter-spacing:1px; display:inline-flex; align-items:center; height:100%">Hafta Sonu Programı</span>
                    </div>
                    <span style="font-size:0.75rem; color:#666; font-weight:600">${formatDate(event.isoDate)}</span>
                </div>
                <h2 class="weekend-title" style="font-size:1.6rem; margin-top:10px">${event.gp}</h2>
                <p class="news-date" style="font-size:0.9rem; opacity:0.8; margin-bottom:15px">${event.track}, ${event.country}</p>
                
                <div style="background:rgba(255,255,255,0.05); border-radius:12px; padding:10px; border:1px solid rgba(0,0,0,0.05)">
                    <ul class="weekend-sessions">
                        ${sessions.map(s => `
                            <li class="session-item ${s.status === 'Tamamlandı' ? 'completed' : ''}" style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid rgba(0,0,0,0.05)">
                                <span style="font-size:0.85rem; font-weight:600">${s.name}</span>
                                <span style="font-size:0.85rem; font-weight:700; color:var(--primary-red)">${s.time}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <!-- Track Preview Section -->
                <div class="track-preview-box">
                    <div class="track-preview-header">
                        <span class="track-preview-title">Pist Detayı</span>
                        <span class="tag" style="margin-bottom:0; font-size:0.6rem; opacity:0.7">BİLGİ</span>
                    </div>
                    <div style="font-size:0.85rem; margin-bottom:10px; font-weight:700">${event.track}</div>
                    <div class="track-preview-stats">
                        <span><span style="opacity:0.6">Mesafe:</span> ${trackStats.len}</span>
                        <span><span style="opacity:0.6">Viraj:</span> ${trackStats.turns}</span>
                    </div>
                    <button class="track-preview-btn" id="go-to-track-detail">TÜM PİST DETAYLARINI GÖR</button>
                </div>
            </div>
        `;

        if (containerSummary) {
            containerSummary.innerHTML = summaryContent;
            document.getElementById('go-to-track-detail').onclick = (e) => {
                e.stopPropagation();
                window.currentTrackEvent = event;
                handleRoute('track-detail', event.category.toLowerCase());
            };
        }

        if (containerTrack) {
            containerTrack.innerHTML = ''; // Homepage'den kaldırıyoruz çünkü özetin içinde
            containerTrack.style.display = 'none';
        }
    }


    function renderTrackDetail(cat) {
        const event = window.currentTrackEvent || getGlobalNextEvent();
        if (!event) return;

        const trackStats = CIRCUITS_DB[event.track] || CIRCUITS_DB["Sakhir"];

        mainContent.innerHTML = `
            <div class="track-detail-view fade-in">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px">
                     <h2 class="section-title" style="margin:0">${event.track.toUpperCase()}</h2>
                     <span class="tag" style="background:var(--primary)">${event.category}</span>
                </div>
                
                <div class="track-hero-card">
                    <p class="track-description">${trackStats.description || 'Pist detayları yakında eklenecek.'}</p>
                    
                    <div class="track-stats-grid">
                        <div class="stat-card">
                            <span class="stat-label">Açılış</span>
                            <span class="stat-value">${trackStats.opened || '-'}</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-label">Mesafe</span>
                            <span class="stat-value">${trackStats.len}</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-label">Viraj Sayısı</span>
                            <span class="stat-value">${trackStats.turns}</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-label">Pist Rekoru</span>
                            <span class="stat-value">${trackStats.record}</span>
                        </div>
                    </div>
                </div>

                <h3 class="subsection-title">Tarihi Başarılar</h3>
                <div class="track-history-list">
                    <div class="history-item">
                        <span class="history-label">İlk Kazanan</span>
                        <span class="history-value">${trackStats.firstWinner || '-'}</span>
                    </div>
                    <div class="history-item">
                        <span class="history-label">En Çok Kazanan (Pilot)</span>
                        <span class="history-value">${trackStats.mostWinsPilot || '-'}</span>
                    </div>
                    <div class="history-item">
                        <span class="history-label">En Çok Kazanan (Takım)</span>
                        <span class="history-value">${trackStats.mostWinsTeam || '-'}</span>
                    </div>
                </div>

                <div style="margin-top:40px; display:flex; justify-content:center">
                    <button class="back-btn" onclick="window.goBack()">← GERİ DÖN</button>
                </div>
            </div>
        `;
    }

    function renderAllNewsUI(container, titleElem, heroContainer = null) {
        const allNews = [];
        Object.keys(APP_DATA).forEach(cat => {
            const catData = getCategoryData(cat);
            if (catData && catData.news) {
                const len = catData.news.length;
                catData.news.forEach((n, idx) => {
                    allNews.push({ ...n, _revIdx: len - idx });
                });
            }
        });

        if (allNews.length > 0) {
            allNews.sort((a, b) => {
                let dateA = new Date(a.date);
                let dateB = new Date(b.date);
                if (isNaN(dateA.getTime())) dateA = new Date(0);
                if (isNaN(dateB.getTime())) dateB = new Date(0);

                const dateCompare = dateB - dateA;
                if (dateCompare !== 0) return dateCompare;
                
                const revCompare = (a._revIdx || 0) - (b._revIdx || 0);
                if (revCompare !== 0) return revCompare;

                const idA = parseInt(a.id) || 0;
                const idB = parseInt(b.id) || 0;
                return idB - idA;
            });
        }

        if (container) {
            container.innerHTML = '';
            
            if (heroContainer && allNews.length > 0) {
                const heroNews = allNews[0];
                heroContainer.innerHTML = '';
                heroContainer.appendChild(createHeroNewsCard(heroNews));
                
                // Render remaining news
                allNews.slice(1).forEach((news, idx) => {
                    container.appendChild(createNewsCard(news));
                    if ((idx + 1) % 4 === 0) {
                        const adDiv = document.createElement('div');
                        adDiv.innerHTML = getAdHTML('feed');
                        container.appendChild(adDiv);
                    }
                });
            } else {
                allNews.forEach((news, idx) => {
                    container.appendChild(createNewsCard(news));
                    if ((idx + 1) % 4 === 0) {
                        const adDiv = document.createElement('div');
                        adDiv.innerHTML = getAdHTML('feed');
                        container.appendChild(adDiv);
                    }
                });
            }
        }
    }

    function createHeroNewsCard(news) {
        const div = document.createElement('div');
        div.className = 'hero-news-card';
        
        // Get first line of content
        let summary = news.content || '';
        if (summary.includes('<br>')) {
            summary = summary.split('<br>')[0];
        } else if (summary.length > 150) {
            summary = summary.substring(0, 150) + '...';
        }

        div.innerHTML = `
            <img src="${window.APP_ROOT}${news.img}" alt="hero news" class="hero-news-img">
            <div class="hero-news-overlay">
                <span class="hero-news-cat">${news.cat}</span>
                <h2 class="hero-news-title">${news.title}</h2>
                <p class="hero-news-summary">${summary}</p>
            </div>
        `;
        div.onclick = () => handleRoute('news-detail', news.cat, true, news.id);
        return div;
    }


    function createNewsCard(news) {
        const div = document.createElement('div');
        div.className = 'news-card';
        // Extract only the date part format "YYYY-MM-DD" if it contains time
        const displayDate = (news.date || '').split(' ')[0].split('T')[0];
        div.innerHTML = `
            <div class="news-img-container">
                <img src="${window.APP_ROOT}${news.img}" alt="news" class="news-img">
            </div>
            <div class="news-info">
                <span class="news-cat">${news.cat}</span>
                <h3 class="news-title">${news.title}</h3>
                <span class="news-date">${formatDate(news.date)}</span>
            </div>
        `;
        div.onclick = () => handleRoute('news-detail', news.cat, true, news.id);
        return div;
    }

    function renderCategoryNews(cat) {
        const categoryData = getCategoryData(cat);
        const news = categoryData.news || [];

        let titleText = 'HABERLER';
        const formattedCat = cat.toLowerCase().replace(/ı/g, 'i');
        if (formattedCat === 'formula 1' || formattedCat === 'formula 1' || formattedCat === 'f1') {
            titleText = 'FORMULA 1 HABERLERİ';
        } else if (cat.toLowerCase() === 'motogp') {
            titleText = 'MOTOGP HABERLERİ';
        } else if (cat.toLowerCase() === 'milli sporcularımız') {
            titleText = 'MİLLİ SPORCULARIMIZIN HABERLERİ';
        }

        mainContent.innerHTML = `
            <h2 class="section-title">${titleText}</h2>
            <div class="search-container">
                <span class="search-icon">🔍</span>
                <input type="text" id="news-search" class="search-input" placeholder="Haber başlığı veya içerik ara...">
            </div>
            <div id="news-container" class="news-feed fade-in"></div>
        `;

        const container = document.getElementById('news-container');
        const searchInput = document.getElementById('news-search');

        const displayNews = (filter = '') => {
            container.innerHTML = '';
            const filtered = news.filter(n =>
                n.title.toLowerCase().includes(filter.toLowerCase()) ||
                n.content.toLowerCase().includes(filter.toLowerCase())
            ).sort((a, b) => {
                let dateA = new Date(a.date);
                let dateB = new Date(b.date);
                if (isNaN(dateA.getTime())) dateA = new Date(0);
                if (isNaN(dateB.getTime())) dateB = new Date(0);

                const dateCompare = dateB - dateA;
                if (dateCompare !== 0) return dateCompare;
                return (b.id || 0) - (a.id || 0);
            });

            filtered.forEach((n, idx) => {
                const card = createNewsCard(n);
                card.classList.add('fade-in');
                container.appendChild(card);
                if ((idx + 1) % 4 === 0) {
                    const adDiv = document.createElement('div');
                    adDiv.innerHTML = getAdHTML('feed');
                    container.appendChild(adDiv);
                }
            });
        };

        searchInput.addEventListener('input', (e) => displayNews(e.target.value));
        displayNews();
    }

    function renderPilotsAndTeams(cat) {
        const categoryData = getCategoryData(cat);
        const pilots = categoryData.pilots || [];
        const teams = categoryData.teams || [];

        const titleText = cat.toLowerCase() === 'milli sporcularımız' ? cat.toUpperCase() : `${cat.toUpperCase()} PİLOTLAR VE TAKIMLAR`;
        mainContent.innerHTML = `
            <h2 class="section-title">${titleText}</h2>
            <div class="search-container">
                <span class="search-icon">🔍</span>
                <input type="text" id="pilot-search" class="search-input" placeholder="Pilot veya takım ara...">
            </div>
            <div id="profiles-container" class="fade-in"></div>
        `;

        const container = document.getElementById('profiles-container');
        const searchInput = document.getElementById('pilot-search');

        const displayProfiles = (filter = '') => {
            const f = filter.toLowerCase();
            const isMilli = cat.toLowerCase() === 'milli sporcularımız';

            // Filter pilots that match the name or team
            const filteredPilots = pilots.filter(p =>
                p.name.toLowerCase().includes(f) ||
                p.team.toLowerCase().includes(f)
            );

            // Logic enhancement: If a pilot matches, their team should also appear in the teams section.
            const matchingTeamNamesFromPilots = filteredPilots.map(p => p.team.toLowerCase().replace(/ı/g, 'i'));

            const filteredTeams = isMilli ? [] : teams.filter(t => {
                const teamName = t.name.toLowerCase().replace(/ı/g, 'i');
                return teamName.includes(f.replace(/ı/g, 'i')) ||
                    matchingTeamNamesFromPilots.some(tp => tp.includes(teamName) || teamName.includes(tp));
            });

            let html = `
                <div class="profile-view">
                    <h3>Pilotlar</h3>
                    <div class="news-feed">
                        ${filteredPilots.length > 0 ? filteredPilots.map(p => `
                            <div class="news-card pilot-card fade-in" data-id="${p.id}" ${!isMilli ? `onclick="handleRoute('pilot-detail', '${cat}', true, '${p.id}')"` : ''} style="${!isMilli ? 'cursor:pointer' : 'cursor:default'}">
                                <div class="news-info">
                                    <h3 class="news-title">${p.name}</h3>
                                    <p>${p.team}</p>
                                </div>
                            </div>
                        `).join('') : '<p style="padding:15px; color:#999">Pilot bulunamadı.</p>'}
                    </div>
            `;

            if (!isMilli) {
                html += `
                    <h3 style="margin-top:30px">Takımlar</h3>
                    <div class="news-feed">
                        ${filteredTeams.length > 0 ? filteredTeams.map(t => `
                            <div class="news-card team-card fade-in" data-id="${t.id}" onclick="handleRoute('team-detail', '${cat}', true, '${t.id}')" style="cursor:pointer">
                                <div class="news-info">
                                    <h3 class="news-title">${t.name}</h3>
                                </div>
                            </div>
                        `).join('') : '<p style="padding:15px; color:#999">Takım bulunamadı.</p>'}
                    </div>
                `;
            }

            html += `</div>`;
            container.innerHTML = html;
        };

        searchInput.addEventListener('input', (e) => displayProfiles(e.target.value));
        displayProfiles();
    }

    function renderStandings(cat) {
        const categoryData = getCategoryData(cat);
        const pStands = categoryData.standings?.pilots || [];
        const tStands = categoryData.standings?.teams || [];

        if (pStands.length === 0 && tStands.length === 0) {
            mainContent.innerHTML = `
                <h2 class="section-title">${cat.toUpperCase()} PUAN DURUMU</h2>
                <p style="padding:20px; text-align:center; opacity:0.7;">Bu kategori için puan durumu bilgisi bulunmamaktadır.</p>
                <div style="margin-top:20px; display:flex; justify-content:center">
                    <button class="back-btn" onclick="window.goBack()">← GERİ DÖN</button>
                </div>
            `;
            return;
        }

        mainContent.innerHTML = `
            <h2 class="section-title">${cat.toUpperCase()} 2026 PUAN DURUMU</h2>
            ${pStands.length > 0 ? `
            <h3>Pilotlar Klasmanı</h3>
            <div class="standings-table-container">
                <table class="standings-table">
                    <thead><tr><th>Sıra</th><th>Pilot</th><th>Puan</th></tr></thead>
                    <tbody>${pStands.map(s => `<tr><td>${s.pos}</td><td><b>${s.name}</b><br><small>${s.team}</small></td><td>${s.pts}</td></tr>`).join('')}</tbody>
                </table>
            </div>` : ''}
            
            ${tStands.length > 0 ? `
            <h3 style="margin-top:30px">Takımlar Klasmanı</h3>
            <div class="standings-table-container">
                <table class="standings-table">
                    <thead><tr><th>Sıra</th><th>Takım</th><th>Puan</th></tr></thead>
                    <tbody>${tStands.map(s => `<tr><td>${s.pos}</td><td><b>${s.name}</b></td><td>${s.pts}</td></tr>`).join('')}</tbody>
                </table>
            </div>` : ''}
            <div style="margin-top:40px; display:flex; justify-content:center">
                <button class="back-btn" onclick="window.goBack()">← GERİ DÖN</button>
            </div>
        `;
    }

    function renderCalendar(cat) {
        const categoryData = getCategoryData(cat);
        const calendar = categoryData.calendar || [];

        mainContent.innerHTML = `
            <h2 class="section-title">${cat.toUpperCase()} 2026 TAKVİMİ</h2>
            <div class="search-container">
                <span class="search-icon">🔍</span>
                <input type="text" id="calendar-search" class="search-input" placeholder="Pist veya ülke ara...">
            </div>
            <div id="calendar-container" class="calendar-list fade-in"></div>
        `;

        const container = document.getElementById('calendar-container');
        const searchInput = document.getElementById('calendar-search');

        const displayCalendar = (filter = '') => {
            const f = filter.toLowerCase();
            const filtered = calendar.filter(c =>
                c.gp.toLowerCase().includes(f) ||
                c.country.toLowerCase().includes(f) ||
                c.track.toLowerCase().includes(f)
            );
            container.innerHTML = filtered.map(c => {
                const hasResults = (c.status === 'Tamamlandı');
                const sessionsHtml = c.sessions ? `
                    <div class="calendar-sessions">
                        ${c.sessions.map(s => `
                            <div class="session-row">
                                <span class="session-name">${s.name}</span>
                                <span class="session-time">${s.time}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '';

                return `
                    <div class="calendar-item ${c.status.toLowerCase().replace(/ı/g, 'i')} fade-in">
                        <div class="cal-round">R${c.round}</div>
                        <div class="cal-info">
                            <div class="cal-gp" style="font-weight:700; font-size:1.1rem">${c.gp}</div>
                            <div class="cal-details">${c.track}, ${c.country} | ${c.date}</div>
                            ${hasResults ? `<button class="btn-cal-results" onclick="handleRoute('results', '${cat}', true, ${c.round})">Sonuçları Gör</button>` : ''}
                        </div>
                        <div class="cal-status ${c.status === 'Sıradaki' ? 'status-next' : ''}">${c.status}</div>
                        ${c.status === 'Sıradaki' ? sessionsHtml : ''}
                    </div>
                `;
            }).join('');
        };

        searchInput.addEventListener('input', (e) => displayCalendar(e.target.value));
        displayCalendar();
    }

    window.handleRoute = handleRoute;
    window.showPilotDetail = showPilotDetail;
    window.showTeamDetail = showTeamDetail;
    
    window.goBack = function() {
        if (window.isDirectLink) {
            window.isDirectLink = false;
            handleRoute('home', null, true);
        } else {
            window.history.back();
        }
    };

    function renderResults(cat, round = null) {
        let results = [];
        let gpInfo = null;
        const categoryData = getCategoryData(cat);

        if (round) {
            results = categoryData.resultsHistory[round] || [];
            gpInfo = categoryData.calendar.find(c => c.round == round);
        } else {
            const rounds = Object.keys(categoryData.resultsHistory || {}).map(Number);
            const latestRound = rounds.length > 0 ? Math.max(...rounds) : null;
            if (latestRound) {
                results = categoryData.resultsHistory[latestRound];
                gpInfo = categoryData.calendar.find(c => c.round == latestRound);
            }
        }

        const title = gpInfo ? `${gpInfo.gp} - ${gpInfo.country}` : `${cat.toUpperCase()} SON YARIŞ SONUÇLARI`;
        const circuitInfo = gpInfo ? `${gpInfo.track} Pisti | ${gpInfo.date}` : '';

        mainContent.innerHTML = `
            <button class="back-btn" onclick="window.goBack()">← GERİ DÖN</button>
            <h2 class="section-title">${title}</h2>
            <div class="results-circuit-info">${circuitInfo}</div>
            
            <div class="results-table-container">
                <table class="results-table">
                    <thead>
                        <tr>
                            <th>Sıra</th>
                            <th>Pilot</th>
                            <th>Süre</th>
                            <th>Fark</th>
                            <th>Puan</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${results.map((r, index) => {
            const isPodium = r.pos === 1 || r.pos === 2 || r.pos === 3;
            const podiumClass = isPodium ? `podium-${r.pos}` : '';
            return `
                                <tr class="${r.status === 'DNF' || r.status === 'DNS' || r.status === 'NC' ? 'dnf-row' : ''}">
                                    <td class="${podiumClass}">${r.pos}</td>
                                    <td><b>${r.pilot}</b><br><small>${r.team}</small></td>
                                    <td class="${r.fastest ? 'fastest-lap-purple' : ''}">${r.time}</td>
                                    <td>${r.gap || '-'}</td>
                                    <td><span class="pts-badge ${r.pos === 1 ? 'win' : ''}">${r.pts > 0 ? `+${r.pts}` : '0'}</span></td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
            </div>
            
            <div style="margin-top:15px; font-size:0.8rem; color:#666">
                <span class="fastest-lap-purple" style="border:none">Mor Sütun:</span> En Hızlı Tur Süresi. | 
                <span style="color:#999; font-weight:bold">DNF:</span> Yarış Dışı.
            </div>
        `;
    }

    function showPilotDetail(cat, id) {
        const categoryData = getCategoryData(cat);
        const pilot = (categoryData.pilots || []).find(p => p.id === id);
        
        if (!pilot) {
            console.error("Pilot not found:", cat, id);
            renderHome();
            return;
        }
        mainContent.innerHTML = `
            <button class="back-btn" onclick="window.goBack()">← GERİ DÖN</button>
            <div class="profile-header">
                <img src="${window.APP_ROOT}${pilot.img || ''}" class="profile-img">
                <div>
                    <h2>${pilot.name}</h2>
                    <p>${pilot.team}</p>
                </div>
            </div>
            <div class="stats-grid">
                <div class="stat-item"><div class="stat-label">Şampiyonluk</div><div class="stat-value" style="color:var(--primary-red)">${pilot.titles}</div></div>
            </div>
        `;
    }

    function showTeamDetail(cat, id) {
        const categoryData = getCategoryData(cat);
        const team = (categoryData.teams || []).find(t => t.id === id);
        
        if (!team) {
            console.error("Team not found:", cat, id);
            renderHome();
            return;
        }

        let statsHtml = '';
        if (team["team titles"] !== undefined) {
            statsHtml += `<div class="stat-item"><div class="stat-label">Takım Şampiyonluğu</div><div class="stat-value" style="color:var(--primary-red)">${team["team titles"]}</div></div>`;
        }
        if (team["constructor titles"] !== undefined) {
            statsHtml += `<div class="stat-item"><div class="stat-label">Üretici Şampiyonluğu</div><div class="stat-value" style="color:var(--primary-red)">${team["constructor titles"]}</div></div>`;
        }
        if (team.titles !== undefined) {
            statsHtml += `<div class="stat-item"><div class="stat-label">Şampiyonluk</div><div class="stat-value" style="color:var(--primary-red)">${team.titles}</div></div>`;
        }

        mainContent.innerHTML = `
            <button class="back-btn" onclick="window.goBack()">← GERİ DÖN</button>
            <div class="profile-header">
                <img src="${window.APP_ROOT}${team.img || ''}" class="profile-img team-logo">
                <div>
                    <h2>${team.name}</h2>
                </div>
            </div>
            <div class="stats-grid">
                ${statsHtml}
            </div>
        `;
    }

    function setupAccordions() {
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const item = header.parentElement;
                const isActive = item.classList.contains('active');
                document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));
                if (!isActive) item.classList.add('active');
            });
        });
    }

    function renderNewsDetail(cat, id) {
        const categoryData = getCategoryData(cat);
        const news = (categoryData.news || []).find(n => n.id == id);
        
        if (!news) {
            console.error("News not found:", cat, id);
            renderHome();
            return;
        }

        const displayDate = formatDate(news.date);

        const authorHtml = news.author ? `
            <div class="news-author-section">
                <img src="${window.APP_ROOT}${news.authorImg}" alt="${news.author}" class="author-avatar">
                <div class="author-info">
                    <span class="author-label">Haber Yazarı</span>
                    <span class="author-name">${news.author}</span>
                </div>
            </div>
        ` : '';

        mainContent.innerHTML = `
            <div class="news-detail-container">
                <button class="back-btn" onclick="window.goBack()">← GERİ DÖN</button>
                <img src="${window.APP_ROOT}${news.img}" alt="news cover" class="news-detail-img">
                ${getAdHTML('display')}
                <div class="news-detail-body">
                    <span class="news-detail-cat">${news.cat}</span>
                    <h1 class="news-detail-title">${news.title}</h1>
                    <span class="news-detail-date">${displayDate}</span>
                    ${authorHtml}
                    <div class="news-detail-content">
                        ${news.content}
                    </div>
                </div>
                ${getAdHTML('display')}
            </div>
        `;
    }

    function renderAbout() {
        mainContent.innerHTML = `
            <div class="about-page-wrapper">
                <div class="about-content">
                    <h2 class="section-title">HAKKIMIZDA</h2>
                    <div class="bio-section">
                        <p class="bio-text">Racing News Türkiye ekibi, motorsporlarının adrenalin dolu dünyasını dijitalle buluşturan, yarış tutkunları için geliştirilmiş kapsamlı bir haber ve veri platformudur. Formula 1'in stratejik derinliğinden MotoGP'nin iki teker üzerindeki mücadelesine; Milli Sporcularımızın başarılarına kadar motorsporlarının her dalını tek bir çatı altında topluyoruz. Amacımız, sadece haber sunmak değil; yarış takvimleri, pist istatistikleri ve anlık bildirimlerle kullanıcılarımıza pit duvarındaymış hissi veren bir deneyim sunmaktır.</p>
                    </div>
                </div>
                
                <div class="about-social">
                    <span class="social-text">BİZİ TAKİP EDİN</span>
                    <div class="social-row">
                        <a href="https://instagram.com" class="sm-link" target="_blank"><img src="${window.APP_ROOT}Resimler/Sosyal Medya Logoları/Instagram.png" alt="Instagram"></a>
                        <a href="https://twitter.com" class="sm-link" target="_blank"><img src="${window.APP_ROOT}Resimler/Sosyal Medya Logoları/X.png" alt="X"></a>
                        <a href="https://tiktok.com" class="sm-link" target="_blank"><img src="${window.APP_ROOT}Resimler/Sosyal Medya Logoları/Tiktok.png" alt="TikTok"></a>
                        <a href="https://youtube.com" class="sm-link" target="_blank"><img src="${window.APP_ROOT}Resimler/Sosyal Medya Logoları/Youtube.png" alt="YouTube"></a>
                    </div>
                </div>
            </div>
        `;
    }

    // --- Notification System ---
    function initNotificationSystem() {
        // 1. Service Worker Registration
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register(`${window.APP_ROOT}sw.js`)
                .then(reg => {
                    console.log('SW Registered');
                    setupNativePrompt();
                })
                .catch(err => console.warn('SW Registration Failed', err));
        }

        function setupNativePrompt() {
            if (!("Notification" in window)) return;

            // If permission is already handled, just check for news
            if (Notification.permission !== 'default') {
                if (Notification.permission === 'granted') checkNewNews();
                return;
            }

            // To support iPhone (iOS) and modern browsers, we must wait for a user interaction.
            // This will trigger the native browser "site wants to send you notifications" message.
            const triggerPrompt = () => {
                if (Notification.permission === 'default') {
                    Notification.requestPermission().then(permission => {
                        console.log('Notification permission:', permission);
                        if (permission === 'granted') {
                            checkNewNews();
                        }
                    });
                }
                // Remove listeners after first interaction
                document.removeEventListener('click', triggerPrompt);
                document.removeEventListener('touchstart', triggerPrompt);
                window.removeEventListener('scroll', triggerPrompt);
            };

            document.addEventListener('click', triggerPrompt);
            document.addEventListener('touchstart', triggerPrompt);
            window.addEventListener('scroll', triggerPrompt);
        }

        // 2. Check for New News
        const checkNewNews = () => {
            if (Notification.permission !== 'granted') return;

            let latestNews = null;
            Object.keys(APP_DATA).forEach(cat => {
                const catNews = APP_DATA[cat].news || [];
                catNews.forEach(n => {
                    if (!latestNews || parseInt(n.id) > parseInt(latestNews.id)) {
                        latestNews = n;
                    }
                });
            });

            if (latestNews) {
                const lastSeenId = localStorage.getItem('last_seen_news_id') || 0;
                if (parseInt(latestNews.id) > parseInt(lastSeenId)) {
                    // Update last seen ID when news is detected
                    localStorage.setItem('last_seen_news_id', latestNews.id);
                    showBrowserNotification(latestNews);
                }
            }
        };

        const showBrowserNotification = (news) => {
            if ('serviceWorker' in navigator && Notification.permission === 'granted') {
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification(news.title, {
                        body: 'Yeni bir haber eklendi! Detaylar için tıklayın.',
                        icon: `${window.APP_ROOT}Resimler/Logo/Racing News TR Logo.jpeg`,
                        data: { url: window.location.origin + window.APP_ROOT + (window.location.protocol === 'file:' ? '#' : '') + 'news-detail/' + encodeURIComponent(news.cat) + '/' + news.id },
                        vibrate: [200, 100, 200],
                        badge: `${window.APP_ROOT}Resimler/Logo/Racing News TR Logo.jpeg`
                    });
                });
            }
        };

        // Periodically check for new news while the app is open
        setInterval(checkNewNews, 60000); // Every minute
    }

    // Helper for back navigation
    window.goBack = function() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            handleRoute('home');
        }
    };
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAppEngine);
} else {
    initAppEngine();
}