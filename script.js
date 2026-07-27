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
        const upcoming = allEvents.filter(e => (e.status === "Sıradaki" || e.status === "Siradaki") && e.endDateTime > now);
        upcoming.sort((a, b) => {
            // Aynı tarihe denk gelen yarışlarda Formula 1'i öne al
            if (a.isoDate === b.isoDate) {
                if (a.category === 'FORMULA 1' && b.category !== 'FORMULA 1') return -1;
                if (b.category === 'FORMULA 1' && a.category !== 'FORMULA 1') return 1;
            }
            return a.endDateTime - b.endDateTime;
        });

        return upcoming[0] || null;
    }

    // 2. Splash Screen Removed for AdSense Compliance
    if (appContainer) {
        appContainer.classList.remove('hidden');
    }
    initApp();

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
                
                // If it's a dropdown toggle (no view defined), toggle its active state
                if (!view) {
                    const parent = link.closest('.nav-item.dropdown');
                    if (parent) {
                        const isActive = parent.classList.contains('active');
                        document.querySelectorAll('.nav-item.dropdown').forEach(d => {
                            d.classList.remove('active');
                            const content = d.querySelector('.dropdown-content');
                            if (content) {
                                content.style.position = '';
                                content.style.left = '';
                                content.style.top = '';
                                content.style.transform = '';
                            }
                        });
                        
                        if (!isActive) {
                            parent.classList.add('active');
                            const content = parent.querySelector('.dropdown-content');
                            // Only apply JS positioning if it's mobile (window width <= 768)
                            if (window.innerWidth <= 768 && content) {
                                const rect = parent.getBoundingClientRect();
                                const headerRect = document.querySelector('.main-header').getBoundingClientRect();
                                content.style.position = 'fixed';
                                content.style.top = headerRect.bottom + 'px';
                                // Center it horizontally relative to the item
                                const contentWidth = 180; // from CSS width
                                let leftPos = rect.left + (rect.width / 2) - (contentWidth / 2);
                                // Keep it within screen bounds
                                if (leftPos < 10) leftPos = 10;
                                if (leftPos + contentWidth > window.innerWidth - 10) {
                                    leftPos = window.innerWidth - contentWidth - 10;
                                }
                                content.style.left = leftPos + 'px';
                                content.style.width = contentWidth + 'px';
                            }
                        }
                    }
                    return;
                }
                // Close dropdowns upon navigation
                document.querySelectorAll('.nav-item.dropdown').forEach(d => {
                    d.classList.remove('active');
                    const content = d.querySelector('.dropdown-content');
                    if (content) {
                        content.style.position = '';
                        content.style.left = '';
                        content.style.top = '';
                        content.style.transform = '';
                    }
                });
                handleRoute(view, cat);
            });
        });

        // Close dropdowns if clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-item.dropdown')) {
                document.querySelectorAll('.nav-item.dropdown').forEach(d => {
                    d.classList.remove('active');
                    const content = d.querySelector('.dropdown-content');
                    if (content) {
                        content.style.position = '';
                        content.style.left = '';
                        content.style.top = '';
                        content.style.transform = '';
                    }
                });
            }
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
            case 'privacy':
                renderPrivacy();
                break;
            case 'terms':
                renderTerms();
                break;
            case 'contact':
                renderContact();
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
                let dateA = new Date(a.date ? a.date.replace(' ', 'T') : 0);
                let dateB = new Date(b.date ? b.date.replace(' ', 'T') : 0);
                if (isNaN(dateA.getTime())) dateA = new Date(0);
                if (isNaN(dateB.getTime())) dateB = new Date(0);

                const dateCompare = dateB - dateA;
                if (dateCompare !== 0) return dateCompare;
                
                const idA = parseInt(a.id) || 0;
                const idB = parseInt(b.id) || 0;
                return idB - idA;
            });
        }

        const latest6News = allNews.slice(0, 6);
        const top12News = allNews.slice(0, 12);

        mainContent.innerHTML = `
            <div class="home-page-container fade-in">
                <!-- 1. Hero News Carousel (Son 6 Haber) & Ticker -->
                <section class="hero-slider-section">
                    <div class="hero-slider-container" id="hero-slider">
                        <div class="slider-track" id="slider-track"></div>
                        <button class="slider-arrow prev" id="slider-prev" aria-label="Önceki Slide">❮</button>
                        <button class="slider-arrow next" id="slider-next" aria-label="Sonraki Slide">❯</button>
                        <div class="slider-dots" id="slider-dots"></div>
                    </div>
                    <div class="news-ticker-bar">
                        <div class="ticker-label">
                            <span class="ticker-badge">SON HABERLER</span>
                        </div>
                        <div class="ticker-content-wrapper">
                            <div class="ticker-items" id="ticker-items"></div>
                        </div>
                    </div>
                </section>

                <!-- 2. Race Weekend & Track Details Widget -->
                <div id="home-weekend-widget-container"></div>

                ${getAdHTML('display')}

                <!-- 3. News Feed Grid ("HABERLER" - Son 12 Haber) -->
                <section id="main-news-feed" class="news-feed" style="margin-top: 30px;">
                    <h2 id="news-section-title" class="section-title">HABERLER</h2>
                    <div id="news-container" class="news-feed-grid"></div>
                </section>
            </div>
        `;

        // Initialize Carousel & Ticker
        initHeroSlider(latest6News);
        initNewsTicker(allNews);

        // Render Race Weekend & Track Details Widget
        renderRaceWeekendWidget(document.getElementById('home-weekend-widget-container'), nextEvent);

        // Render Top 12 News Box Grid
        const newsContainer = document.getElementById('news-container');
        if (newsContainer && top12News.length > 0) {
            top12News.forEach((news) => {
                newsContainer.appendChild(createNewsCard(news));
            });
        }
    }

    function initHeroSlider(newsList) {
        const container = document.getElementById('hero-slider');
        const track = document.getElementById('slider-track');
        const dotsContainer = document.getElementById('slider-dots');
        const prevBtn = document.getElementById('slider-prev');
        const nextBtn = document.getElementById('slider-next');

        if (!container || !track || !newsList || newsList.length === 0) return;

        let currentIndex = 0;
        const totalSlides = Math.min(newsList.length, 6);
        const slidesData = newsList.slice(0, totalSlides);
        let autoInterval = null;

        track.innerHTML = slidesData.map(n => {
            let summary = n.content || '';
            if (summary.includes('<br>')) {
                summary = summary.split('<br>')[0];
            }
            if (summary.length > 140) {
                summary = summary.substring(0, 140) + '...';
            }
            const imgUrl = n.img ? (n.img.startsWith('Resimler/') ? `${window.APP_ROOT}${n.img}` : n.img) : 'Resimler/Logo/logo.png';
            const badge = n.customBadge ? formatBadge(n.customBadge) : (n.cat ? n.cat.toUpperCase() : 'HABER');

            return `
                <div class="slide-item" onclick="handleRoute('news-detail', '${n.cat}', true, '${n.id}')">
                    <img src="${imgUrl}" alt="${n.title}" class="slide-img" onerror="this.onerror=null; this.src='Resimler/Logo/logo.png'">
                    <div class="slide-overlay">
                        <span class="slide-cat-badge">${badge}</span>
                        <h2 class="slide-title">${n.title}</h2>
                        <p class="slide-summary">${summary}</p>
                    </div>
                </div>
            `;
        }).join('');

        if (dotsContainer) {
            dotsContainer.innerHTML = slidesData.map((_, i) => `
                <span class="slider-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>
            `).join('');
        }

        const updateSlider = () => {
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            if (dotsContainer) {
                const dots = dotsContainer.querySelectorAll('.slider-dot');
                dots.forEach((d, i) => {
                    if (i === currentIndex) d.classList.add('active');
                    else d.classList.remove('active');
                });
            }
        };

        const nextSlide = () => {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateSlider();
        };

        const prevSlide = () => {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateSlider();
        };

        const startAutoPlay = () => {
            stopAutoPlay();
            autoInterval = setInterval(nextSlide, 6000);
        };

        const stopAutoPlay = () => {
            if (autoInterval) clearInterval(autoInterval);
        };

        if (prevBtn) {
            prevBtn.onclick = (e) => {
                e.stopPropagation();
                prevSlide();
                startAutoPlay();
            };
        }

        if (nextBtn) {
            nextBtn.onclick = (e) => {
                e.stopPropagation();
                nextSlide();
                startAutoPlay();
            };
        }

        if (dotsContainer) {
            dotsContainer.querySelectorAll('.slider-dot').forEach(dot => {
                dot.onclick = (e) => {
                    e.stopPropagation();
                    currentIndex = parseInt(dot.dataset.index, 10);
                    updateSlider();
                    startAutoPlay();
                };
            });
        }

        // Touch Swipe Support
        let touchStartX = 0;
        let touchEndX = 0;

        container.ontouchstart = (e) => {
            touchStartX = e.changedTouches[0].screenX;
            stopAutoPlay();
        };

        container.ontouchend = (e) => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 40) {
                nextSlide();
            } else if (touchEndX - touchStartX > 40) {
                prevSlide();
            }
            startAutoPlay();
        };

        container.onmouseenter = stopAutoPlay;
        container.onmouseleave = startAutoPlay;

        startAutoPlay();
    }

    function initNewsTicker(newsList) {
        const tickerContainer = document.getElementById('ticker-items');
        if (!tickerContainer || !newsList || newsList.length === 0) return;

        const ticker20News = newsList.slice(0, 20);
        const tickerItems = ticker20News.map(n => {
            const badge = n.customBadge ? n.customBadge.toUpperCase() : (n.cat ? n.cat.toUpperCase() : 'HABER');
            return `
                <span class="ticker-item" onclick="handleRoute('news-detail', '${n.cat}', true, '${n.id}')">
                    [ ${badge} ] ${n.title}
                </span>
            `;
        }).join('');

        tickerContainer.innerHTML = tickerItems + tickerItems;
    }

    function renderRaceWeekendWidget(container, event) {
        if (!container) return;
        if (!event) {
            container.innerHTML = '';
            return;
        }

        const trackStats = CIRCUITS_DB[event.track] || CIRCUITS_DB["Silverstone (MotoGP)"] || CIRCUITS_DB["Sakhir"];
        const td = event.trackDetails || {};

        const trackLen = td.len || event.len || trackStats?.len || '5.891 km';
        const trackTurns = td.turns || event.turns || trackStats?.turns || '18';
        const trackRecord = td.record || trackStats?.record || '1:57.233 (Fabio Quartararo)';
        const trackOpened = td.opened || trackStats?.opened || '1977';
        const trackMostWinsPilot = td.mostWinsPilot || trackStats?.mostWinsPilot || '-';
        const trackMostWinsTeam = td.mostWinsTeam || trackStats?.mostWinsTeam || '-';
        const sessions = event.sessions || [];

        const catName = event.category ? event.category.toUpperCase() : 'F1';
        const rawGp = event.gp || '';
        const gpTitle = rawGp.replace(/i/g, 'I').replace(/İ/g, 'I').toUpperCase();

        const trackImg = event.trackImg || trackStats?.img || '';

        let prevEventHtml = '';
        if (event.category) {
            const catData = getCategoryData(event.category.toLowerCase());
            if (catData && catData.calendar) {
                const now = new Date();
                const pastEvents = catData.calendar.filter(e => {
                    if (e.status !== "Tamamlandı" && e.status !== "Tamamlandi") return false;
                    const parts = e.isoDate.split('-');
                    let eDate = new Date();
                    if (parts.length === 3) eDate = new Date(parts[0], parts[1]-1, parts[2]);
                    else eDate = new Date(e.isoDate);
                    return eDate < now;
                });
                if (pastEvents.length > 0) {
                    pastEvents.sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate));
                    const prevEvent = pastEvents[0];
                    if (prevEvent) {
                        prevEventHtml = `
                            <button class="widget-btn-results" onclick="handleRoute('results', '${event.category.toLowerCase()}', true, '${prevEvent.round || prevEvent.track}')">
                                ÖNCEKİ YARIŞ SONUÇLARI ❯
                            </button>
                        `;
                    }
                }
            }
        }

        container.innerHTML = `
            <section class="weekend-widget-section">
                <div class="weekend-widget-card">
                    <div class="weekend-widget-header">
                        <div class="widget-header-tabs">
                            <span class="widget-tab">HAFTA SONU TAKVİMİ</span>
                            <span class="widget-cat-badge">${catName}</span>
                        </div>
                        ${prevEventHtml}
                    </div>

                    <div class="weekend-widget-body">
                        <!-- Left Col: Sessions List -->
                        <div class="weekend-col sessions-col">
                            <div class="gp-title-badge" lang="en">${gpTitle}</div>
                            <div class="gp-subtext">${formatDate(event.isoDate)} • ${event.country}</div>
                            
                            <ul class="sessions-list">
                                ${sessions.map(s => `
                                    <li class="session-row ${(s.status === 'Tamamlandı' || s.status === 'Tamamlandi') ? 'completed' : ''}">
                                        <span class="session-name">${s.name}</span>
                                        <span class="session-time">${s.time}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>

                        <!-- Center Col: Track Photo Container (Clean Light Box, No Clicks) -->
                        <div class="weekend-col track-graphic-col">
                            <div class="track-img-wrapper">
                                ${trackImg ? `
                                    <img src="${trackImg}" alt="${event.track}" class="track-photo-img" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';">
                                    <div class="track-img-placeholder" style="display:none;">
                                        <span style="font-size:0.85rem; font-weight:700; color:#888888;">🏁 PİST FOTOĞRAFI</span>
                                    </div>
                                ` : `
                                    <div class="track-img-placeholder">
                                        <span style="font-size:0.85rem; font-weight:700; color:#888888;">🏁 PİST FOTOĞRAFI</span>
                                    </div>
                                `}
                            </div>
                        </div>

                        <!-- Right Col: Track Details ("Pist Detayları") -->
                        <div class="weekend-col track-details-col">
                            <h4 class="track-details-title">PİST DETAYLARI</h4>
                            <div class="track-name-badge">${event.track}</div>
                            
                            <div class="track-specs-list">
                                <div class="spec-row">
                                    <span class="spec-label">Pist Mesafesi</span>
                                    <span class="spec-val">${trackLen}</span>
                                </div>
                                <div class="spec-row">
                                    <span class="spec-label">Viraj Sayısı</span>
                                    <span class="spec-val">${trackTurns}</span>
                                </div>
                                <div class="spec-row">
                                    <span class="spec-label">Pist Rekoru</span>
                                    <span class="spec-val">${trackRecord}</span>
                                </div>
                                <div class="spec-row">
                                    <span class="spec-label">Takvime Eklenme Yılı</span>
                                    <span class="spec-val">${trackOpened}</span>
                                </div>
                                <div class="spec-row">
                                    <span class="spec-label">En Çok Kazanan (Pilot)</span>
                                    <span class="spec-val">${trackMostWinsPilot}</span>
                                </div>
                                <div class="spec-row">
                                    <span class="spec-label">En Çok Kazanan (Takım)</span>
                                    <span class="spec-val">${trackMostWinsTeam}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }


    function renderTrackDetail(cat) {
        const event = window.currentTrackEvent || getGlobalNextEvent();
        if (!event) return;

        const trackStats = CIRCUITS_DB[event.track] || CIRCUITS_DB["Sakhir"];
        const td = event.trackDetails || {};

        const trackLen = td.len || event.len || trackStats?.len || '4,381 km';
        const trackTurns = td.turns || event.turns || trackStats?.turns || '14';
        const trackOpened = td.opened || trackStats?.opened || '-';
        const trackRecord = td.record || trackStats?.record || '-';
        const trackFirstWinner = td.firstWinner || trackStats?.firstWinner || '-';
        const trackMostWinsPilot = td.mostWinsPilot || trackStats?.mostWinsPilot || '-';
        const trackMostWinsTeam = td.mostWinsTeam || trackStats?.mostWinsTeam || '-';
        const trackDesc = td.description || trackStats?.description || 'Pist detayları yakında eklenecek.';

        const catName = event?.category ? event.category.toUpperCase() : (cat?.toLowerCase() === 'motogp' ? 'MOTOGP' : 'FORMULA 1');

        mainContent.innerHTML = `
            <div class="track-detail-view fade-in">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
                     <h2 class="section-title" lang="en" style="margin:0;">${event.track}</h2>
                     <span class="track-cat-badge" style="background:#ffffff; color:var(--primary-red); border:1px solid #e0e0e0; padding:8px 18px; border-radius:30px; font-weight:800; font-size:0.8rem; letter-spacing:0.5px; box-shadow:0 4px 12px rgba(0,0,0,0.06); text-transform:uppercase;">${catName}</span>
                </div>
                
                <div class="track-hero-card">
                    <p class="track-description">${trackDesc}</p>
                    
                    <div class="track-stats-grid">
                        <div class="stat-card">
                            <span class="stat-label">Açılış</span>
                            <span class="stat-value">${trackOpened}</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-label">Mesafe</span>
                            <span class="stat-value">${trackLen}</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-label">Viraj Sayısı</span>
                            <span class="stat-value">${trackTurns}</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-label">Pist Rekoru</span>
                            <span class="stat-value">${trackRecord}</span>
                        </div>
                    </div>
                </div>

                <h3 class="subsection-title">Tarihi Başarılar</h3>
                <div class="track-history-list">
                    <div class="history-item">
                        <span class="history-label">İlk Kazanan</span>
                        <span class="history-value">${trackFirstWinner}</span>
                    </div>
                    <div class="history-item">
                        <span class="history-label">En Çok Kazanan (Pilot)</span>
                        <span class="history-value">${trackMostWinsPilot}</span>
                    </div>
                    <div class="history-item">
                        <span class="history-label">En Çok Kazanan (Takım)</span>
                        <span class="history-value">${trackMostWinsTeam}</span>
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
                let dateA = new Date(a.date ? a.date.replace(' ', 'T') : 0);
                let dateB = new Date(b.date ? b.date.replace(' ', 'T') : 0);
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
            allNews.splice(10); // Limit to last 10 news
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

    function formatBadge(text) {
        if (!text) return '';
        return text.toLocaleUpperCase('tr-TR');
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
                <span class="hero-news-cat">${news.customBadge ? formatBadge(news.customBadge) : news.cat}</span>
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
                <span class="news-cat">${news.customBadge ? formatBadge(news.customBadge) : news.cat}</span>
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
        const formattedCat = cat.toLocaleLowerCase('tr-TR');
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

    function normalizeName(str) {
        if (!str) return '';
        return str.toLowerCase()
            .replace(/ı/g, 'i')
            .replace(/İ/g, 'i')
            .replace(/ş/g, 's')
            .replace(/ğ/g, 'g')
            .replace(/ç/g, 'c')
            .replace(/ö/g, 'o')
            .replace(/ü/g, 'u')
            .replace(/#\d+/g, '')
            .replace(/[^a-z0-9]/g, '')
            .trim();
    }

    function getEnrichedPilots(cat) {
        const categoryData = getCategoryData(cat);
        const pilots = categoryData.pilots || [];
        const teams = categoryData.teams || [];
        const pStands = categoryData.standings?.pilots || [];

        const list = [];
        const processedPilotIds = new Set();

        if (pStands.length > 0) {
            pStands.forEach(s => {
                const normSName = normalizeName(s.name);
                const matchedP = pilots.find(p => {
                    const normPName = normalizeName(p.name);
                    return normPName === normSName || normPName.includes(normSName) || normSName.includes(normPName);
                });

                const matchedT = teams.find(t => {
                    const normTName = normalizeName(t.name);
                    const normSTeam = normalizeName(s.team);
                    return normTName === normSTeam || normTName.includes(normSTeam) || normSTeam.includes(normTName);
                });

                const pilotId = matchedP ? matchedP.id : s.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                if (matchedP) processedPilotIds.add(matchedP.id);

                const catFolder = cat.toLowerCase().includes('motogp') ? 'MotoGP Pilot ve Takımlar' : 'Formula 1 Pilot ve Takımlar';
                const cleanNameForImg = s.name.replace(/#\d+/g, '').trim();

                list.push({
                    id: pilotId,
                    name: matchedP ? matchedP.name : s.name,
                    team: s.team || (matchedP ? matchedP.team : ''),
                    country: matchedP?.country || s.country || '',
                    flag: matchedP?.flag || s.flag || (matchedP?.country ? `Resimler/Bayraklar/${matchedP.country.toLowerCase()}.png` : ''),
                    pos: s.pos,
                    pts: s.pts,
                    img: matchedP?.img || `Resimler/${catFolder}/${cleanNameForImg}.png`,
                    teamImg: matchedT?.img || ''
                });
            });
        }

        pilots.forEach(p => {
            if (!processedPilotIds.has(p.id)) {
                const matchedT = teams.find(t => {
                    const normTName = normalizeName(t.name);
                    const normPTeam = normalizeName(p.team);
                    return normTName === normPTeam || normTName.includes(normPTeam) || normPTeam.includes(normTName);
                });
                list.push({
                    id: p.id,
                    name: p.name,
                    team: p.team || '',
                    country: p.country || '',
                    flag: p.flag || (p.country ? `Resimler/Bayraklar/${p.country.toLowerCase()}.png` : ''),
                    pos: null,
                    pts: null,
                    img: p.img,
                    teamImg: matchedT?.img || ''
                });
            }
        });

        return list;
    }

    function getEnrichedTeams(cat) {
        const categoryData = getCategoryData(cat);
        const teams = categoryData.teams || [];
        const tStands = categoryData.standings?.teams || [];

        const list = [];
        const processedTeamIds = new Set();

        if (tStands.length > 0) {
            tStands.forEach(s => {
                const normSName = normalizeName(s.name);
                const matchedT = teams.find(t => {
                    const normTName = normalizeName(t.name);
                    return normTName === normSName || normTName.includes(normSName) || normSName.includes(normTName);
                });

                const teamId = matchedT ? matchedT.id : s.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                if (matchedT) processedTeamIds.add(matchedT.id);

                list.push({
                    id: teamId,
                    name: matchedT ? matchedT.name : s.name,
                    country: matchedT?.country || s.country || '',
                    flag: matchedT?.flag || s.flag || (matchedT?.country ? `Resimler/Bayraklar/${matchedT.country.toLowerCase()}.png` : ''),
                    pos: s.pos,
                    pts: s.pts,
                    img: matchedT?.img || ''
                });
            });
        }

        teams.forEach(t => {
            if (!processedTeamIds.has(t.id)) {
                list.push({
                    id: t.id,
                    name: t.name,
                    country: t.country || '',
                    flag: t.flag || (t.country ? `Resimler/Bayraklar/${t.country.toLowerCase()}.png` : ''),
                    pos: null,
                    pts: null,
                    img: t.img
                });
            }
        });

        return list;
    }

    function renderPilotsTableHTML(pilots, cat, isMilli = false) {
        if (!pilots || pilots.length === 0) {
            return `<p style="padding:15px; color:#999">Pilot bulunamadı.</p>`;
        }

        // Group / Sort pilots by team name so teammates are stacked next to each other
        const sortedPilots = [...pilots].sort((a, b) => {
            const teamA = (a.team || '').toLowerCase();
            const teamB = (b.team || '').toLowerCase();
            if (teamA && !teamB) return -1;
            if (!teamA && teamB) return 1;
            if (teamA < teamB) return -1;
            if (teamA > teamB) return 1;
            return (a.name || '').localeCompare(b.name || '');
        });

        return `
            <div class="pilots-teams-table-wrapper fade-in">
                <table class="pilots-teams-table">
                    <thead>
                        <tr>
                            <th style="width: 45px; text-align:center;">#</th>
                            <th style="width: 60px; text-align:center;">BAYRAK</th>
                            <th>PİLOT</th>
                            ${!isMilli ? `<th>TAKIM</th>` : ''}
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedPilots.map((p, idx) => {
                            const flagSrc = p.flag ? (p.flag.startsWith('Resimler/') ? `${window.APP_ROOT}${p.flag}` : p.flag) : '';
                            const imgPath = p.img ? (p.img.startsWith('Resimler/') ? `${window.APP_ROOT}${p.img}` : p.img) : 'Resimler/Logo/logo.png';
                            const pilotDisplayName = (isMilli && p.team) ? `${p.name} (${p.team})` : p.name;
                            return `
                                <tr class="table-row-item" ${!isMilli ? `onclick="handleRoute('pilot-detail', '${cat}', true, '${p.id}')"` : ''} style="${!isMilli ? 'cursor:pointer' : 'cursor:default'}">
                                    <td style="text-align:center; font-weight:700; color:#888;">${idx + 1}</td>
                                    <td style="text-align:center;">
                                        ${flagSrc ? `
                                            <img src="${flagSrc}" alt="${p.country || 'Bayrak'}" class="pilot-flag-icon" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='inline-block';">
                                            <span class="flag-placeholder-icon" style="display:none;">🏁</span>
                                        ` : `<span class="flag-placeholder-icon">🏁</span>`}
                                    </td>
                                    <td>
                                        <div class="pilot-table-cell">
                                            ${!isMilli ? `<img src="${imgPath}" alt="${p.name}" class="table-thumb-img" onerror="this.onerror=null; this.src='Resimler/Logo/logo.png'">` : ''}
                                            <span class="table-item-name">${pilotDisplayName}</span>
                                        </div>
                                    </td>
                                    ${!isMilli ? `
                                    <td>
                                        <span class="table-team-name">${p.team || '-'}</span>
                                    </td>` : ''}
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    function renderTeamsTableHTML(teams, cat) {
        if (!teams || teams.length === 0) {
            return `<p style="padding:15px; color:#999">Takım bulunamadı.</p>`;
        }

        return `
            <div class="pilots-teams-table-wrapper fade-in">
                <table class="pilots-teams-table">
                    <thead>
                        <tr>
                            <th style="width: 45px; text-align:center;">#</th>
                            <th style="width: 60px; text-align:center;">BAYRAK</th>
                            <th>TAKIM</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${teams.map((t, idx) => {
                            const flagSrc = t.flag ? (t.flag.startsWith('Resimler/') ? `${window.APP_ROOT}${t.flag}` : t.flag) : '';
                            const imgPath = t.img ? (t.img.startsWith('Resimler/') ? `${window.APP_ROOT}${t.img}` : t.img) : 'Resimler/Logo/logo.png';
                            return `
                                <tr class="table-row-item" onclick="handleRoute('team-detail', '${cat}', true, '${t.id}')" style="cursor:pointer">
                                    <td style="text-align:center; font-weight:700; color:#888;">${idx + 1}</td>
                                    <td style="text-align:center;">
                                        ${flagSrc ? `
                                            <img src="${flagSrc}" alt="${t.country || 'Bayrak'}" class="pilot-flag-icon" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='inline-block';">
                                            <span class="flag-placeholder-icon" style="display:none;">🏁</span>
                                        ` : `<span class="flag-placeholder-icon">🏁</span>`}
                                    </td>
                                    <td>
                                        <div class="pilot-table-cell">
                                            <img src="${imgPath}" alt="${t.name}" class="table-thumb-img" onerror="this.onerror=null; this.src='Resimler/Logo/logo.png'">
                                            <span class="table-item-name" lang="en">${t.name}</span>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    function renderPilotPodiumHTML(p, cat, isMilli = false) {
        const rankClass = p.pos === 1 ? 'rank-1' : p.pos === 2 ? 'rank-2' : 'rank-3';
        const posClass = p.pos === 1 ? 'gold' : p.pos === 2 ? 'silver' : 'bronze';
        const ptsText = p.pts !== undefined && p.pts !== null ? `${p.pts} PUAN` : '';
        const posText = p.pos ? `${p.pos}.` : '-';
        const imgPath = p.img ? (p.img.startsWith('Resimler/') ? `${window.APP_ROOT}${p.img}` : p.img) : 'Resimler/Logo/logo.png';
        const teamImgPath = p.teamImg ? (p.teamImg.startsWith('Resimler/') ? `${window.APP_ROOT}${p.teamImg}` : p.teamImg) : '';

        return `
            <div class="podium-card ${rankClass} fade-in" data-id="${p.id}" ${!isMilli ? `onclick="handleRoute('pilot-detail', '${cat}', true, '${p.id}')"` : ''} style="${!isMilli ? 'cursor:pointer' : 'cursor:default'}">
                <div class="card-header-badge">
                    <span class="card-pos-badge ${posClass}">${posText}</span>
                    ${ptsText ? `<span class="card-pts-badge">${ptsText}</span>` : ''}
                </div>
                <div class="pilot-img-wrapper" style="${p.pos === 1 ? 'width:130px; height:130px; border-width:4px;' : ''}">
                    <img src="${imgPath}" alt="${p.name}" class="pilot-card-img" onerror="this.onerror=null; this.src='Resimler/Logo/logo.png'">
                </div>
                <div class="pilot-card-content">
                    <h3 class="pilot-card-name" lang="en" style="${p.pos === 1 ? 'font-size:1.15rem;' : ''}">${p.name}</h3>
                    ${p.team ? `
                    <div class="pilot-card-team">
                        ${teamImgPath ? `<img src="${teamImgPath}" alt="team logo" class="pilot-card-team-logo" onerror="this.style.display='none'">` : ''}
                        <span>${p.team}</span>
                    </div>` : ''}
                </div>
            </div>
        `;
    }

    function renderTeamPodiumHTML(t, cat) {
        const rankClass = t.pos === 1 ? 'rank-1' : t.pos === 2 ? 'rank-2' : 'rank-3';
        const posClass = t.pos === 1 ? 'gold' : t.pos === 2 ? 'silver' : 'bronze';
        const ptsText = t.pts !== undefined && t.pts !== null ? `${t.pts} PUAN` : '';
        const posText = t.pos ? `${t.pos}.` : '-';
        const imgPath = t.img ? (t.img.startsWith('Resimler/') ? `${window.APP_ROOT}${t.img}` : t.img) : 'Resimler/Logo/logo.png';

        return `
            <div class="podium-card ${rankClass} fade-in" data-id="${t.id}" onclick="handleRoute('team-detail', '${cat}', true, '${t.id}')" style="cursor:pointer">
                <div class="card-header-badge">
                    <span class="card-pos-badge ${posClass}">${posText}</span>
                    ${ptsText ? `<span class="card-pts-badge">${ptsText}</span>` : ''}
                </div>
                <div class="team-img-wrapper" style="${t.pos === 1 ? 'height:100px;' : ''}">
                    <img src="${imgPath}" alt="${t.name}" class="team-card-img" onerror="this.onerror=null; this.src='Resimler/Logo/logo.png'">
                </div>
                <div class="team-card-content">
                    <h3 class="team-card-name" lang="en" style="${t.pos === 1 ? 'font-size:1.15rem;' : ''}">${t.name}</h3>
                </div>
            </div>
        `;
    }

    function renderPilotCardHTML(p, cat, isMilli = false) {
        const posClass = p.pos === 1 ? 'gold' : p.pos === 2 ? 'silver' : p.pos === 3 ? 'bronze' : '';
        const ptsText = p.pts !== undefined && p.pts !== null ? `${p.pts} PUAN` : '';
        const posText = p.pos ? `${p.pos}.` : '-';
        const imgPath = p.img ? (p.img.startsWith('Resimler/') ? `${window.APP_ROOT}${p.img}` : p.img) : 'Resimler/Logo/logo.png';
        const teamImgPath = p.teamImg ? (p.teamImg.startsWith('Resimler/') ? `${window.APP_ROOT}${p.teamImg}` : p.teamImg) : '';
        const showHeaderBadge = p.pos !== null && p.pos !== undefined;

        return `
            <div class="pilot-grid-card fade-in" data-id="${p.id}" ${!isMilli ? `onclick="handleRoute('pilot-detail', '${cat}', true, '${p.id}')"` : ''} style="${!isMilli ? 'cursor:pointer' : 'cursor:default'}">
                ${showHeaderBadge ? `
                <div class="card-header-badge">
                    <span class="card-pos-badge ${posClass}">${posText}</span>
                    ${ptsText ? `<span class="card-pts-badge">${ptsText}</span>` : ''}
                </div>` : ''}
                ${!isMilli ? `
                <div class="pilot-img-wrapper">
                    <img src="${imgPath}" alt="${p.name}" class="pilot-card-img" onerror="this.onerror=null; this.src='Resimler/Logo/logo.png'">
                </div>` : ''}
                <div class="pilot-card-content">
                    <h3 class="pilot-card-name" lang="en">${p.name}</h3>
                    ${p.team ? `
                    <div class="pilot-card-team">
                        ${teamImgPath ? `<img src="${teamImgPath}" alt="team logo" class="pilot-card-team-logo" onerror="this.style.display='none'">` : ''}
                        <span>${p.team}</span>
                    </div>` : ''}
                </div>
            </div>
        `;
    }

    function renderTeamCardHTML(t, cat) {
        const posClass = t.pos === 1 ? 'gold' : t.pos === 2 ? 'silver' : t.pos === 3 ? 'bronze' : '';
        const ptsText = t.pts !== undefined && t.pts !== null ? `${t.pts} PUAN` : '';
        const posText = t.pos ? `${t.pos}.` : '-';
        const imgPath = t.img ? (t.img.startsWith('Resimler/') ? `${window.APP_ROOT}${t.img}` : t.img) : 'Resimler/Logo/logo.png';

        return `
            <div class="team-grid-card fade-in" data-id="${t.id}" onclick="handleRoute('team-detail', '${cat}', true, '${t.id}')" style="cursor:pointer">
                <div class="card-header-badge">
                    <span class="card-pos-badge ${posClass}">${posText}</span>
                    ${ptsText ? `<span class="card-pts-badge">${ptsText}</span>` : ''}
                </div>
                <div class="team-img-wrapper">
                    <img src="${imgPath}" alt="${t.name}" class="team-card-img" onerror="this.onerror=null; this.src='Resimler/Logo/logo.png'">
                </div>
                <div class="team-card-content">
                    <h3 class="team-card-name" lang="en">${t.name}</h3>
                </div>
            </div>
        `;
    }

    function renderPilotsAndTeams(cat) {
        const isMilli = cat.toLowerCase() === 'milli sporcularımız';
        const titleText = isMilli ? 'MİLLİ SPORCULARIMIZ PİLOTLAR' : `${cat.toLocaleUpperCase('tr-TR')} PİLOTLAR VE TAKIMLAR`;

        const pilotsList = getEnrichedPilots(cat);
        const teamsList = isMilli ? [] : getEnrichedTeams(cat);

        mainContent.innerHTML = `
            <h2 class="section-title">${titleText}</h2>
            <div class="dashboard-header-container">
                <div class="search-container">
                    <input type="text" id="pilot-search" class="search-input" placeholder="${isMilli ? 'Pilot ara...' : 'Pilot veya takım ara...'}">
                </div>
                ${!isMilli ? `
                <div class="dashboard-tabs">
                    <button class="dashboard-tab-btn active" id="tab-all">HEPSİ</button>
                    <button class="dashboard-tab-btn" id="tab-pilots">PİLOTLAR</button>
                    <button class="dashboard-tab-btn" id="tab-teams">TAKIMLAR</button>
                </div>` : ''}
            </div>
            <div id="dashboard-content" class="fade-in"></div>
        `;

        const searchInput = document.getElementById('pilot-search');
        const contentDiv = document.getElementById('dashboard-content');
        let currentTab = 'all';

        const updateDisplay = () => {
            const filter = (searchInput.value || '').toLowerCase();

            const filteredPilots = pilotsList.filter(p =>
                p.name.toLowerCase().includes(filter) ||
                p.team.toLowerCase().includes(filter)
            );

            const filteredTeams = teamsList.filter(t =>
                t.name.toLowerCase().includes(filter)
            );

            let html = '';

            if (isMilli) {
                html += renderPilotsTableHTML(filteredPilots, cat, isMilli);
            } else {
                if (currentTab === 'all' || currentTab === 'pilots') {
                    html += `<h3 class="subsection-title" style="margin-bottom:15px; border-left:4px solid var(--primary-red); padding-left:10px;">Pilotlar</h3>`;
                    html += renderPilotsTableHTML(filteredPilots, cat, false);
                }

                if (currentTab === 'all' || currentTab === 'teams') {
                    html += `<h3 class="subsection-title" style="margin-top:35px; margin-bottom:15px; border-left:4px solid var(--primary-red); padding-left:10px;">Takımlar</h3>`;
                    html += renderTeamsTableHTML(filteredTeams, cat);
                }
            }

            contentDiv.innerHTML = html;
        };

        if (!isMilli) {
            const tabAll = document.getElementById('tab-all');
            const tabPilots = document.getElementById('tab-pilots');
            const tabTeams = document.getElementById('tab-teams');

            const setTab = (tab) => {
                currentTab = tab;
                [tabAll, tabPilots, tabTeams].forEach(b => b.classList.remove('active'));
                if (tab === 'all') tabAll.classList.add('active');
                if (tab === 'pilots') tabPilots.classList.add('active');
                if (tab === 'teams') tabTeams.classList.add('active');
                updateDisplay();
            };

            tabAll.onclick = () => setTab('all');
            tabPilots.onclick = () => setTab('pilots');
            tabTeams.onclick = () => setTab('teams');
        }

        searchInput.addEventListener('input', updateDisplay);
        updateDisplay();
    }

    function renderStandings(cat) {
        const pilotsList = getEnrichedPilots(cat).filter(p => p.pos !== null && p.pos !== undefined);
        const teamsList = getEnrichedTeams(cat).filter(t => t.pos !== null && t.pos !== undefined);

        if (pilotsList.length === 0 && teamsList.length === 0) {
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
            <div class="dashboard-header-container">
                <div class="search-container">
                    <input type="text" id="standings-search" class="search-input" placeholder="Pilot veya takım ara...">
                </div>
                <div class="dashboard-tabs">
                    <button class="dashboard-tab-btn active" id="tab-p-standings">PİLOTLAR KLASMANI</button>
                    <button class="dashboard-tab-btn" id="tab-t-standings">TAKIMLAR KLASMANI</button>
                </div>
            </div>
            <div id="standings-content" class="fade-in"></div>
        `;

        const searchInput = document.getElementById('standings-search');
        const contentDiv = document.getElementById('standings-content');
        let activeTab = 'pilots';

        const updateDisplay = () => {
            const filter = (searchInput.value || '').toLowerCase();

            let html = '';
            if (activeTab === 'pilots') {
                const filtered = pilotsList.filter(p =>
                    p.name.toLowerCase().includes(filter) ||
                    p.team.toLowerCase().includes(filter)
                );

                if (filtered.length === 0) {
                    html += `<p style="padding:15px; color:#999">Pilot bulunamadı.</p>`;
                } else if (!filter) {
                    const top3 = filtered.filter(p => p.pos >= 1 && p.pos <= 3).sort((a, b) => a.pos - b.pos);
                    const others = filtered.filter(p => p.pos > 3);

                    if (top3.length > 0) {
                        html += `
                            <div class="podium-section">
                                <div class="podium-grid">
                                    ${top3.map(p => renderPilotPodiumHTML(p, cat, false)).join('')}
                                </div>
                            </div>
                        `;
                    }

                    if (others.length > 0) {
                        html += `
                            <div class="two-column-grid">
                                ${others.map(p => renderPilotCardHTML(p, cat, false)).join('')}
                            </div>
                        `;
                    }
                } else {
                    html += `
                        <div class="two-column-grid">
                            ${filtered.map(p => renderPilotCardHTML(p, cat, false)).join('')}
                        </div>
                    `;
                }
            } else {
                const filtered = teamsList.filter(t =>
                    t.name.toLowerCase().includes(filter)
                );

                if (filtered.length === 0) {
                    html += `<p style="padding:15px; color:#999">Takım bulunamadı.</p>`;
                } else if (!filter) {
                    const top3 = filtered.filter(t => t.pos >= 1 && t.pos <= 3).sort((a, b) => a.pos - b.pos);
                    const others = filtered.filter(t => t.pos > 3);

                    if (top3.length > 0) {
                        html += `
                            <div class="podium-section">
                                <div class="podium-grid">
                                    ${top3.map(t => renderTeamPodiumHTML(t, cat)).join('')}
                                </div>
                            </div>
                        `;
                    }

                    if (others.length > 0) {
                        html += `
                            <div class="two-column-grid">
                                ${others.map(t => renderTeamCardHTML(t, cat)).join('')}
                            </div>
                        `;
                    }
                } else {
                    html += `
                        <div class="two-column-grid">
                            ${filtered.map(t => renderTeamCardHTML(t, cat)).join('')}
                        </div>
                    `;
                }
            }

            contentDiv.innerHTML = html;
        };

        const tabP = document.getElementById('tab-p-standings');
        const tabT = document.getElementById('tab-t-standings');

        tabP.onclick = () => {
            activeTab = 'pilots';
            tabP.classList.add('active');
            tabT.classList.remove('active');
            updateDisplay();
        };

        tabT.onclick = () => {
            activeTab = 'teams';
            tabT.classList.add('active');
            tabP.classList.remove('active');
            updateDisplay();
        };

        searchInput.addEventListener('input', updateDisplay);
        updateDisplay();
    }

    function renderCalendar(cat) {
        const categoryData = getCategoryData(cat);
        const calendar = categoryData.calendar || [];

        mainContent.innerHTML = `
            <h2 class="section-title">${cat.toUpperCase()} 2026 TAKVİMİ</h2>
            <div class="search-container">
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
                const hasResults = (c.status === 'Tamamlandı' || c.status === 'Tamamlandi');
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
                            <div class="cal-gp" lang="en" style="font-weight:700; font-size:1.1rem">${c.gp}</div>
                            <div class="cal-details"><span lang="en">${c.track}</span>, ${c.country} | ${c.date}</div>
                            ${hasResults ? `<button class="btn-cal-results" onclick="handleRoute('results', '${cat}', true, ${c.round})">Sonuçları Gör</button>` : ''}
                        </div>
                        <div class="cal-status ${(c.status === 'Sıradaki' || c.status === 'Siradaki') ? 'status-next' : ''}">${c.status}</div>
                        ${(c.status === 'Sıradaki' || c.status === 'Siradaki') ? sessionsHtml : ''}
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

        let titleHtml = '';
        if (gpInfo) {
            titleHtml = `<span lang="en">${gpInfo.gp}</span> - <span>${gpInfo.country}</span>`;
        } else {
            titleHtml = `<span>${cat.toUpperCase()} SON YARIŞ SONUÇLARI</span>`;
        }
        const circuitInfo = gpInfo ? `<span lang="en">${gpInfo.track}</span> Pisti | ${gpInfo.date}` : '';

        mainContent.innerHTML = `
            <button class="back-btn" onclick="window.goBack()">← GERİ DÖN</button>
            <h2 class="section-title">${titleHtml}</h2>
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
                    <span class="news-detail-cat">${news.customBadge ? formatBadge(news.customBadge) : news.cat}</span>
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

    function renderPrivacy() {
        mainContent.innerHTML = `
            <div class="policy-container fade-in">
                <h1>Gizlilik Politikası</h1>
                <p>Racing News Türkiye olarak ziyaretçilerimizin gizliliğine önem veriyoruz. Bu sayfa, web sitemizi ziyaretiniz sırasında toplanan kişisel verilerin nasıl kullanıldığını ve korunduğunu açıklamaktadır.</p>
                
                <h2>Google AdSense ve Çerezler (Cookies)</h2>
                <ul>
                    <li>Üçüncü taraf satıcılar (Google dahil), kullanıcıların web sitemize veya diğer web sitelerine yaptıkları önceki ziyaretleri temel alan reklamlar yayınlamak için çerezleri (cookies) kullanır.</li>
                    <li>Google'ın reklam çerezlerini kullanması, Google ve iş ortaklarının kullanıcılarımıza, sitemize ve/veya internetteki diğer sitelere yaptıkları ziyaretleri temel alan reklamlar sunmasına olanak tanır.</li>
                    <li>Kullanıcılar, <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer">Reklam Merkezi</a>'ni ziyaret ederek kişiselleştirilmiş reklamcılığı devre dışı bırakabilirler.</li>
                </ul>

                <h2>Toplanan Bilgiler</h2>
                <p>Web sitemiz standart sunucu günlükleri tutmaktadır. Bu günlükler; IP adresleri, tarayıcı türü, internet servis sağlayıcısı, yönlendirme/çıkış sayfaları, platform türü, tarih/saat damgası ve tıklama sayısı gibi verileri içerir. Bu bilgiler eğilimleri analiz etmek, siteyi yönetmek, kullanıcının site içindeki hareketlerini izlemek ve genel demografik bilgileri toplamak amacıyla kullanılır. Bu veriler kişisel olarak tanımlanabilir bilgilerle ilişkilendirilmez.</p>

                <h2>Dış Bağlantılar</h2>
                <p>Racing News Türkiye, içeriğindeki haber ve yazılarda farklı internet adreslerine bağlantılar verebilir. Sitemiz, link verdiği sitelerin içeriklerinden veya gizlilik prensiplerinden sorumlu değildir.</p>
            </div>
        `;
    }

    function renderTerms() {
        mainContent.innerHTML = `
            <div class="policy-container fade-in">
                <h1>Kullanım Koşulları</h1>
                <p>Racing News Türkiye web sitesine ("Site") erişerek ve kullanarak, aşağıdaki kullanım koşullarını kabul etmiş sayılırsınız.</p>
                
                <h2>Telif Hakkı ve İçerik Kullanımı</h2>
                <p>Sitemizde yer alan tüm metinler, grafikler, logolar, resimler ve yazılımlar Racing News Türkiye'ye aittir veya lisanslıdır. Sitemizdeki içerikler, kişisel ve ticari olmayan kullanım amaçlarıyla okunabilir ve paylaşılabilir. Ancak, içeriklerimizin kopyalanması, çoğaltılması veya ticari amaçla kullanılması önceden yazılı izin alınmaksızın yasaktır.</p>

                <h2>Sorumluluk Reddi</h2>
                <p>Sitemizde sunulan haberler, bilgiler ve istatistikler yalnızca genel bilgilendirme amacı taşır. Racing News Türkiye, sitedeki bilgilerin doğruluğu, güncelliği veya eksiksizliği konusunda hiçbir garanti vermez. Site kullanımından doğabilecek doğrudan veya dolaylı zararlardan sitemiz sorumlu tutulamaz.</p>

                <h2>Değişiklik Hakkı</h2>
                <p>Racing News Türkiye, bu "Kullanım Koşulları" metnini dilediği zaman önceden haber vermeksizin değiştirme hakkını saklı tutar. Değişiklikler sitede yayınlandığı andan itibaren geçerlilik kazanır.</p>
            </div>
        `;
    }

    function renderContact() {
        mainContent.innerHTML = `
            <div class="policy-container contact-box fade-in">
                <h1>İletişim</h1>
                <p>Görüş, öneri ve reklam teklifleriniz için bizimle iletişime geçebilirsiniz.</p>
                <a href="mailto:rntadobe@gmail.com" class="contact-email">rntadobe@gmail.com</a>
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