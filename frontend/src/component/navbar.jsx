import React, { useState, useEffect, useRef } from 'react';

export default function Navbar({
    stars,
    activePage,
    onNavigate,
    currentAvatar = '🚀',
    onSelectAvatar,
    streakCount = 3,
    onOpenSpinWheel
}) {
    const [showAvatarMenu, setShowAvatarMenu] = useState(false);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const menuRef = useRef(null);

    const availableAvatars = [
        { icon: '🚀', name: 'Astronot', title: 'Penjelajah Antariksa' },
        { icon: '🦁', name: 'Singa', title: 'Pemberani & Teliti' },
        { icon: '🐼', name: 'Panda', title: 'Santai & Cerdik' },
        { icon: '🦊', name: 'Rubah', title: 'Cepat & Tangkas' },
        { icon: '🐱', name: 'Kucing', title: 'Pintar & Lucu' },
        { icon: '🦄', name: 'Unicorn', title: 'Ajaib & Penuh Semangat' }
    ];

    // Tutup menu avatar saat klik di luar
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowAvatarMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Tutup drawer saat tombol Escape ditekan & kunci body scroll saat drawer terbuka
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setMobileDrawerOpen(false);
        };
        if (mobileDrawerOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [mobileDrawerOpen]);

    const navItems = [
        { key: 'home', label: 'Beranda', icon: '🏠', desc: 'Halaman Utama & Jelajah' },
        { key: 'syllabus', label: 'Silabus', icon: '🗺️', desc: 'Kursus Matematika & English' },
        { key: 'lessons', label: 'Materi', icon: '📖', desc: '12 Modul Bergambar & Lab' },
        { key: 'quiz-select', label: 'Kuis', icon: '🎯', desc: '28 Soal Latihan Seru' },
        { key: 'minigame', label: 'Game', icon: '⚡', desc: 'Hitung Kilat 30 Detik' },
        { key: 'badges', label: 'Lencana', icon: '🏅', desc: 'Koleksi Prestasi Juara' },
        { key: 'parents', label: 'Ortu', icon: '👨‍👩‍👧', desc: 'Pantau Perkembangan Anak' }
    ];

    const handleNavigate = (key) => {
        onNavigate(key);
        setMobileDrawerOpen(false);
    };

    // Cek apakah halaman aktif termasuk dalam menu "Lainnya" di bottom bar
    const isOtherActive = activePage === 'minigame' || activePage === 'badges' || activePage === 'parents';

    return (
        <>
            <header className="navbar-container">
                <div className="navbar-inner">
                    {/* 1. BRAND LOGO */}
                    <div
                        className="nav-brand-group"
                        onClick={() => handleNavigate('home')}
                        title="Kembali ke Beranda SMARTER"
                        role="button"
                        tabIndex={0}
                    >
                        <div className="nav-logo-badge">
                            <span className="logo-sparkle">✨</span>
                            <span className="logo-glyph">S+</span>
                        </div>
                        <div className="nav-brand-text">
                            <div className="brand-title-row">
                                <span className="brand-name-title">SMARTER</span>
                                <span className="brand-sparkle-dot">★</span>
                            </div>
                            <span className="brand-tagline">MATH &amp; ENGLISH • 6–10 THN</span>
                        </div>
                    </div>

                    {/* 2. NAVIGATION PILLS (Desktop & Laptop) */}
                    <nav className="nav-pill-menu" aria-label="Menu Utama Desktop">
                        {navItems.map((item) => {
                            const isActive = activePage === item.key ||
                                (item.key === 'quiz-select' && (activePage === 'quiz' || activePage === 'result'));
                            return (
                                <button
                                    key={item.key}
                                    type="button"
                                    className={`nav-pill-btn ${isActive ? 'nav-pill-active' : ''}`}
                                    onClick={() => handleNavigate(item.key)}
                                    title={item.desc}
                                >
                                    <span className="nav-pill-icon">{item.icon}</span>
                                    <span className="nav-pill-text">{item.label}</span>
                                    {isActive && <span className="nav-pill-dot" aria-hidden="true" />}
                                </button>
                            );
                        })}
                    </nav>

                    {/* 3. GAMIFIED USER STATUS (Kompak, Rapi, & Tidak Meluber) */}
                    <div className="nav-actions-group">
                        {/* Tombol Roda Putar Hadiah */}
                        {onOpenSpinWheel && (
                            <button 
                                type="button"
                                className="btn-nav-spin"
                                onClick={onOpenSpinWheel}
                                title="Putar Roda Keberuntungan & Menangkan Bintang!"
                            >
                                <span className="spin-wheel-icon">🎡</span>
                                <span className="spin-wheel-text">Hadiah</span>
                            </button>
                        )}

                        {/* Streak Api Ceria */}
                        <div className="nav-streak-pill" title={`Hebat! Kamu sudah rajin belajar ${streakCount} hari berturut-turut!`}>
                            <span className="streak-flame">🔥</span>
                            <span className="streak-num">{streakCount}</span>
                        </div>

                        {/* Star Pill 3D */}
                        <div className="nav-star-pill" title="Total Koleksi Bintang Kamu">
                            <span className="star-icon-3d">⭐</span>
                            <span className="star-count-num">{stars}</span>
                        </div>

                        {/* Avatar Profil Anak (Dropdown Rapi) */}
                        <div className="nav-avatar-wrapper" ref={menuRef}>
                            <button 
                                type="button"
                                className={`nav-avatar-toggle ${showAvatarMenu ? 'avatar-toggle-active' : ''}`}
                                onClick={() => setShowAvatarMenu(prev => !prev)}
                                title="Pilih karakter avatar kesukaanmu"
                                aria-label="Menu Avatar Profil"
                            >
                                <span className="avatar-current-emoji">{currentAvatar}</span>
                                <span className="avatar-arrow">▾</span>
                            </button>

                                {showAvatarMenu && (
                                    <div className="avatar-menu-popover">
                                        <div className="avatar-popover-header">
                                            <span className="popover-badge">Karakter Kamu</span>
                                            <h4>Pilih Karakter Favorit:</h4>
                                        </div>
                                        <div className="avatar-grid-picker">
                                            {availableAvatars.map((av) => (
                                                <button
                                                    key={av.name}
                                                    type="button"
                                                    className={`avatar-choice-card ${currentAvatar === av.icon ? 'choice-selected' : ''}`}
                                                    onClick={() => {
                                                        if (onSelectAvatar) onSelectAvatar(av.icon);
                                                        setShowAvatarMenu(false);
                                                    }}
                                                >
                                                    <span className="choice-emoji">{av.icon}</span>
                                                    <span className="choice-name">{av.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Tombol Hamburger Drawer (Tampil di Tablet & Mobile) */}
                            <button
                                type="button"
                                className="btn-hamburger-menu"
                                onClick={() => setMobileDrawerOpen(true)}
                                aria-label="Buka Menu Navigasi"
                                title="Buka Menu Lengkap"
                            >
                                <span className="hamburger-line"></span>
                                <span className="hamburger-line"></span>
                                <span className="hamburger-line"></span>
                            </button>
                        </div>
                    </div>
            </header>

            {/* Mobile Bottom Navigation Bar (5 Tombol Proporsional & Nyaman Ditekan) */}
            <nav className="mobile-bottom-nav" aria-label="Navigasi Bawah Ponsel">
                <button
                    type="button"
                    className={`mobile-nav-btn ${activePage === 'home' ? 'mobile-nav-active' : ''}`}
                    onClick={() => handleNavigate('home')}
                >
                    <span className="mobile-nav-icon">🏠</span>
                    <span className="mobile-nav-label">Beranda</span>
                </button>

                <button
                    type="button"
                    className={`mobile-nav-btn ${activePage === 'syllabus' ? 'mobile-nav-active' : ''}`}
                    onClick={() => handleNavigate('syllabus')}
                >
                    <span className="mobile-nav-icon">🗺️</span>
                    <span className="mobile-nav-label">Silabus</span>
                </button>

                <button
                    type="button"
                    className={`mobile-nav-btn ${activePage === 'lessons' ? 'mobile-nav-active' : ''}`}
                    onClick={() => handleNavigate('lessons')}
                >
                    <span className="mobile-nav-icon">📖</span>
                    <span className="mobile-nav-label">Materi</span>
                </button>

                <button
                    type="button"
                    className={`mobile-nav-btn ${(activePage === 'quiz-select' || activePage === 'quiz' || activePage === 'result') ? 'mobile-nav-active' : ''}`}
                    onClick={() => handleNavigate('quiz-select')}
                >
                    <span className="mobile-nav-icon">🎯</span>
                    <span className="mobile-nav-label">Kuis</span>
                </button>

                <button
                    type="button"
                    className={`mobile-nav-btn ${isOtherActive || mobileDrawerOpen ? 'mobile-nav-active' : ''}`}
                    onClick={() => setMobileDrawerOpen(prev => !prev)}
                >
                    <span className="mobile-nav-icon">☰</span>
                    <span className="mobile-nav-label">Menu</span>
                </button>
            </nav>

            {/* Drawer Menu Samping untuk Mobile & Tablet */}
            {mobileDrawerOpen && (
                <div className="mobile-drawer-overlay" onClick={() => setMobileDrawerOpen(false)}>
                    <aside
                        className="mobile-drawer-panel"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Panel Navigasi Samping"
                    >
                        {/* Drawer Header */}
                        <div className="drawer-header">
                            <div className="drawer-user-info">
                                <div className="drawer-avatar-circle">
                                    <span>{currentAvatar}</span>
                                </div>
                                <div className="drawer-user-text">
                                    <span className="drawer-welcome-title">Halo Petualang! ✨</span>
                                    <div className="drawer-chips-row">
                                        <span className="drawer-chip-star">⭐ {stars}</span>
                                        <span className="drawer-chip-streak">🔥 {streakCount} Hari</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn-close-drawer"
                                onClick={() => setMobileDrawerOpen(false)}
                                aria-label="Tutup Menu"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Drawer Tombol Hadiah Cepat */}
                        {onOpenSpinWheel && (
                            <div className="drawer-promo-box">
                                <button
                                    type="button"
                                    className="btn-drawer-spin"
                                    onClick={() => {
                                        setMobileDrawerOpen(false);
                                        onOpenSpinWheel();
                                    }}
                                >
                                    <span className="drawer-spin-icon">🎡</span>
                                    <div className="drawer-spin-text">
                                        <strong>Putar Roda Hadiah Ajaib</strong>
                                        <span>Menangkan Bintang &amp; Mahkota!</span>
                                    </div>
                                </button>
                            </div>
                        )}

                        {/* Drawer Menu List */}
                        <div className="drawer-menu-list">
                            <span className="drawer-section-label">PILIH MENU BELAJAR</span>
                            {navItems.map((item) => {
                                const isActive = activePage === item.key ||
                                    (item.key === 'quiz-select' && (activePage === 'quiz' || activePage === 'result'));
                                return (
                                    <button
                                        key={item.key}
                                        type="button"
                                        className={`drawer-menu-btn ${isActive ? 'drawer-btn-active' : ''}`}
                                        onClick={() => handleNavigate(item.key)}
                                    >
                                        <span className="drawer-item-icon">{item.icon}</span>
                                        <div className="drawer-item-content">
                                            <span className="drawer-item-label">{item.label}</span>
                                            <span className="drawer-item-desc">{item.desc}</span>
                                        </div>
                                        {isActive && <span className="drawer-active-dot">●</span>}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Ganti Avatar Cepat di Drawer */}
                        <div className="drawer-avatar-section">
                            <span className="drawer-section-label">PILIH AVATAR FAVORIT</span>
                            <div className="drawer-avatar-row">
                                {availableAvatars.map((av) => (
                                    <button
                                        key={av.name}
                                        type="button"
                                        className={`drawer-av-btn ${currentAvatar === av.icon ? 'av-active' : ''}`}
                                        onClick={() => {
                                            if (onSelectAvatar) onSelectAvatar(av.icon);
                                        }}
                                        title={av.name}
                                    >
                                        <span>{av.icon}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            )}
        </>
    );
}
