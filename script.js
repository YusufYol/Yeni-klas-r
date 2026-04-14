function initAppEngine() {
    // UI Elements
    const splashScreen = document.getElementById('splash-screen');
    const appContainer = document.getElementById('app');
    const menuToggle = document.getElementById('menu-toggle');
    const sideDrawer = document.getElementById('side-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const mainContent = document.getElementById('main-content');
    const notificationContainer = document.getElementById('notification-container');

    // 1. Data Helper
    function getCategoryData(cat) {
        if (!cat) return {};
        let c = cat.toLowerCase().trim();
        // Türkçe karakterleri normalize et
        let normalized = c.replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ç/g, 'c').replace(/ö/g, 'o').replace(/ü/g, 'u');
        
        let data = APP_DATA[cat] || APP_DATA[c] || APP_DATA[normalized];
        
        // F1 ve diğerleri için eşleşme kontrolü
        if (!data) {
            if (normalized === 'f1' || normalized === 'formula1' || normalized === 'formula 1') data = APP_DATA['formula 1'];
            if (normalized === 'motogp') data = APP_DATA['motogp'];
        }

        return data || {};
    }

    // Global Event Logic
    function getGlobalNextEvent() {
        const today = new Date(); // Dinamik güncel tarih
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

        // Filter for upcoming "Sıradaki" events and sort by date
        const upcoming = allEvents.filter(e => e.status === "Sıradaki" && new Date(e.isoDate) >= today);
        upcoming.sort((a, b) => new Date(a.isoDate) - new Date(b.isoDate));

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
            if (event.state) {
                handleRoute(event.state.view, event.state.cat, false, event.state.round);
            } else {
                handleRoute('home', 'f1', false);
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

        const parts = path.split('/');
        const view = parts[0] || 'home';
        const cat = parts[1] || 'f1';
        const round = parts[2] || null;
        handleRoute(view, cat, false, round);

        setupNavigation();
        setupAccordions();

    }

    // 2. Navigation & Routing
    function toggleDrawer() {
        sideDrawer.classList.toggle('active');
        drawerOverlay.classList.toggle('active');
    }

    function setupNavigation() {
        menuToggle.addEventListener('click', toggleDrawer);
        drawerOverlay.addEventListener('click', toggleDrawer);

        document.querySelectorAll('.nav-link, .nav-link-bottom, .nav-link-home').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = link.dataset.view;
                const cat = link.dataset.cat;
                if (sideDrawer.classList.contains('active')) toggleDrawer();
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
    }

    // 3. Renderers
    function renderHome() {
        const nextEvent = getGlobalNextEvent();

        mainContent.innerHTML = `
            <section id="weekend-summary" class="weekend-summary"></section>
            <section id="track-info" class="track-info-section"></section>
            <section id="main-news-feed" class="news-feed">
                <h2 id="news-section-title" class="section-title">GÜNCEL HABERLER</h2>
                <div id="news-container"></div>
            </section>
        `;
        renderWeekendUI(document.getElementById('weekend-summary'), document.getElementById('track-info'), nextEvent);
        renderAllNewsUI(document.getElementById('news-container'), document.getElementById('news-section-title'));
    }

    function renderWeekendUI(containerSummary, containerTrack, event) {
        if (!event) return;

        const trackStats = CIRCUITS_DB[event.track] || CIRCUITS_DB["Sakhir"];
        const sessions = event.sessions || [];

        containerSummary.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px;">
                <div style="display:flex; align-items:center; gap:12px; height:24px">
                    <span class="tag" style="background:var(--primary-red); color:white; padding:0 12px; height:24px; display:inline-flex; align-items:center; border-radius:12px; font-weight:800; font-size:0.7rem; line-height:1">${event.category}</span>
                    <span style="color:var(--primary-red); font-weight:800; font-size:0.65rem; text-transform:uppercase; letter-spacing:1px; display:inline-flex; align-items:center; height:100%">Hafta Sonu Programı</span>
                </div>
                <span style="font-size:0.75rem; color:#666; font-weight:600">${event.isoDate}</span>
            </div>
            <h2 class="weekend-title" style="font-size:1.6rem; margin-top:10px">${event.gp}</h2>
            <p class="news-date" style="font-size:0.9rem; opacity:0.8; margin-bottom:15px">${event.track}, ${event.country}</p>
            
            <div style="background:rgba(255,255,255,0.05); border-radius:12px; padding:10px; border:1px solid rgba(255,255,255,0.1)">
                <ul class="weekend-sessions">
                    ${sessions.map(s => `
                        <li class="session-item ${s.status === 'Tamamlandı' ? 'completed' : ''}" style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.05)">
                            <span style="font-size:0.85rem; font-weight:600">${s.name}</span>
                            <span style="font-size:0.85rem; font-weight:700; color:var(--primary-red)">${s.time}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;

        containerTrack.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px">
                <h3 style="margin:0; font-size:1.1rem">${event.track} Detayları</h3>
                <span class="tag" style="background:rgba(255,255,255,0.1); font-size:0.6rem">PİST BİLGİSİ</span>
            </div>
            <div style="font-size:0.85rem; opacity:0.9; margin-bottom:15px">
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px">
                    <p style="margin:2px 0"><span style="opacity:0.6">Mesafe:</span> <b>${trackStats.len}</b></p>
                    <p style="margin:2px 0"><span style="opacity:0.6">Viraj:</span> <b>${trackStats.turns}</b></p>
                    <p style="margin:2px 0"><span style="opacity:0.6">Rekor:</span> <b>${trackStats.record}</b></p>
                    <p style="margin:2px 0"><span style="opacity:0.6">Açılış:</span> <b>${trackStats.opened}</b></p>
                </div>
            </div>
            <button class="btn-details" id="track-detail-btn" style="width:100%; padding:12px; border-radius:10px; background:white; color:black; font-weight:700; border:none; cursor:pointer">Pist Detaylarını Gör</button>
        `;

        document.getElementById('track-detail-btn').onclick = () => {
            // Store current context for track-detail view
            window.currentTrackEvent = event;
            handleRoute('track-detail', event.category.toLowerCase());
        };
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
                    <button class="back-btn" onclick="window.history.back()">← GERİ DÖN</button>
                </div>
            </div>
        `;
    }

    function renderAllNewsUI(container, titleElem) {
        const allNews = [];
        Object.keys(APP_DATA).forEach(cat => {
            const catData = getCategoryData(cat);
            if (catData && catData.news) {
                allNews.push(...catData.news);
            }
        });

        // Hata ayıklama için konsola yazdır
        console.log("Toplam Yüklenen Haber Sayısı:", allNews.length);
        if (allNews.length > 0) {
            allNews.sort((a, b) => {
                const dateCompare = new Date(b.date) - new Date(a.date);
                if (dateCompare !== 0) return dateCompare;
                
                // Aynı gün içindeki haberlerde, ID'si büyük olan (enson eklenen) en üstte olur.
                const idA = parseInt(a.id) || 0;
                const idB = parseInt(b.id) || 0;
                return idB - idA;
            });
            console.log("En Güncel Haber:", allNews[0].title);
        }

        if (container) {
            container.innerHTML = '';
            // Anasayfada sadece son 15-20 haberi gösterelim veya hepsini gösterelim (kullanıcı isteğine göre)
            allNews.forEach(news => container.appendChild(createNewsCard(news)));
        }
    }

    function createNewsCard(news) {
        const div = document.createElement('div');
        div.className = 'news-card';
        div.innerHTML = `
            <div class="news-img-container">
                <img src="${window.APP_ROOT}${news.img}" alt="news" class="news-img">
            </div>
            <div class="news-info">
                <span class="news-cat">${news.cat}</span>
                <h3 class="news-title">${news.title}</h3>
                <span class="news-date">${news.date}</span>
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
                const dateCompare = new Date(b.date) - new Date(a.date);
                if (dateCompare !== 0) return dateCompare;
                return (b.id || 0) - (a.id || 0);
            });

            filtered.forEach(n => {
                const card = createNewsCard(n);
                card.classList.add('fade-in');
                container.appendChild(card);
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
                    <button class="back-btn" onclick="window.history.back()">← GERİ DÖN</button>
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
                <button class="back-btn" onclick="window.history.back()">← GERİ DÖN</button>
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
            <button class="back-btn" onclick="window.history.back()">← GERİ DÖN</button>
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
        const pilot = getCategoryData(cat).pilots.find(p => p.id === id);
        mainContent.innerHTML = `
            <button class="back-btn" onclick="window.history.back()">← GERİ DÖN</button>
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
        const team = getCategoryData(cat).teams.find(t => t.id === id);
        mainContent.innerHTML = `
            <button class="back-btn" onclick="window.history.back()">← GERİ DÖN</button>
            <div class="profile-header">
                <img src="${window.APP_ROOT}${team.img || ''}" class="profile-img team-logo">
                <div>
                    <h2>${team.name}</h2>
                </div>
            </div>
            <div class="stats-grid">
                <div class="stat-item"><div class="stat-label">Şampiyonluk</div><div class="stat-value" style="color:var(--primary-red)">${team.titles}</div></div>
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
        const news = getCategoryData(cat).news.find(n => n.id == id);
        if (!news) return;

        mainContent.innerHTML = `
            <div class="news-detail-container">
                <button class="back-btn" onclick="window.history.back()">← GERİ DÖN</button>
                <img src="${window.APP_ROOT}${news.img}" alt="news cover" class="news-detail-img">
                <div class="news-detail-body">
                    <span class="news-detail-cat">${news.cat}</span>
                    <h1 class="news-detail-title">${news.title}</h1>
                    <span class="news-detail-date">${news.date}</span>
                    <div class="news-detail-content">
                        ${news.content}
                    </div>
                </div>
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
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAppEngine);
} else {
    initAppEngine();
}