import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Navbar from './component/navbar.jsx';
import ActivityCard from './component/activitycard.jsx';

/* ══════════════════════════════════════════════════════════════
   1. SOUND EFFECTS (Web Audio API - Ceria & Audio Tick Roda)
   ══════════════════════════════════════════════════════════════ */
const playTone = (type, soundEnabled = true) => {
    if (!soundEnabled) return;
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        
        if (type === 'correct') {
            const notes = [523.25, 659.25, 783.99, 1046.5];
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
                gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.07);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.28);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + idx * 0.07);
                osc.stop(ctx.currentTime + idx * 0.07 + 0.28);
            });
        } else if (type === 'wrong') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(260, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.25);
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.25);
        } else if (type === 'tick') {
            // Suara Detik Jarum Roda Berputar (Carnival Tick)
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(580, ctx.currentTime);
            gain.gain.setValueAtTime(0.07, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.035);
        } else if (type === 'jackpot' || type === 'fanfare') {
            // Melodi Kemenangan Roda Putar
            const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
                gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.09);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + idx * 0.09);
                osc.stop(ctx.currentTime + idx * 0.09 + 0.35);
            });
        } else if (type === 'star' || type === 'chest') {
            const notes = [659.25, 880, 1174.66, 1567.98];
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
                gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.2);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + idx * 0.05);
                osc.stop(ctx.currentTime + idx * 0.05 + 0.2);
            });
        }
    } catch {
        // Fallback
    }
};

/* ══════════════════════════════════════════════════════════════
   2. PARTIKEL CONFETTI MANDIRI (Zero-Dependency Canvas)
   ══════════════════════════════════════════════════════════════ */
const fireConfetti = () => {
    try {
        const canvas = document.getElementById('confetti-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const colors = ['#3A86FF', '#FFBE0B', '#FF6B6B', '#22C55E', '#A855F7', '#EC4899', '#06B6D4'];
        const shapes = ['circle', 'rect', 'star'];

        for (let i = 0; i < 80; i++) {
            particles.push({
                x: window.innerWidth / 2 + (Math.random() * 200 - 100),
                y: window.innerHeight / 2 - 50,
                vx: (Math.random() - 0.5) * 18,
                vy: (Math.random() - 0.7) * 20,
                size: Math.random() * 8 + 6,
                color: colors[Math.floor(Math.random() * colors.length)],
                shape: shapes[Math.floor(Math.random() * shapes.length)],
                rotation: Math.random() * 360,
                vRot: (Math.random() - 0.5) * 12,
                alpha: 1
            });
        }

        let animationFrame;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let alive = false;

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.45;
                p.vx *= 0.98;
                p.rotation += p.vRot;
                p.alpha -= 0.015;

                if (p.alpha > 0) {
                    alive = true;
                    ctx.save();
                    ctx.globalAlpha = p.alpha;
                    ctx.translate(p.x, p.y);
                    ctx.rotate((p.rotation * Math.PI) / 180);
                    ctx.fillStyle = p.color;

                    if (p.shape === 'circle') {
                        ctx.beginPath();
                        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                        ctx.fill();
                    } else if (p.shape === 'rect') {
                        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                    } else {
                        ctx.fillText('⭐', -p.size / 2, p.size / 2);
                    }
                    ctx.restore();
                }
            });

            if (alive) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                cancelAnimationFrame(animationFrame);
            }
        };

        animate();
    } catch {
        // Fallback
    }
};

/* ══════════════════════════════════════════════════════════════
   3. DATA SEKTOR RODA HADIAH (8 Sektor Menarik & Berwarna)
   ══════════════════════════════════════════════════════════ */
const wheelSlices = [
    { label: '+50', name: 'JACKPOT EMAS!', color: '#FFBE0B', textColor: '#78350F', icon: '🌟', stars: 50, isJackpot: true },
    { label: '+10', name: 'Bintang Biru', color: '#3A86FF', textColor: '#FFFFFF', icon: '⭐', stars: 10 },
    { label: '+25', name: 'Peti Rahasia', color: '#10B981', textColor: '#FFFFFF', icon: '🎁', stars: 25 },
    { label: '+15', name: 'Kilat Bonus', color: '#FF6B6B', textColor: '#FFFFFF', icon: '⚡', stars: 15 },
    { label: '+30', name: 'Mahkota Juara', color: '#EC4899', textColor: '#FFFFFF', icon: '👑', stars: 30 },
    { label: '+20', name: 'Kue Pesta', color: '#8B5CF6', textColor: '#FFFFFF', icon: '🧁', stars: 20 },
    { label: '+40', name: 'Permata Ajaib', color: '#06B6D4', textColor: '#FFFFFF', icon: '💎', stars: 40 },
    { label: '+35', name: 'Roket Bintang', color: '#F97316', textColor: '#FFFFFF', icon: '🚀', stars: 35 }
];

/* ══════════════════════════════════════════════════════════════
   4. TEBAKAN & KATA BIJAK MASKOT KOKO SI ROBOT 🤖
   ══════════════════════════════════════════════════════════════ */
const kokoQuotes = [
    { text: 'Halo Sahabat Juara! Matematika itu rahasia para pahlawan super lho! 🦸‍♂️✨', tag: 'Semangat' },
    { text: 'Trik Sulap 9: Menjumlahkan angka dengan 9 sama dengan tambah 10 lalu kurang 1! Coba: 6 + 9 = 15! 🎩', tag: 'Trik Cepat' },
    { text: 'Tebakan Lucu: Jam berapa yang bisa dimakan? Jam-batan keju! Hahaha! 🧀😂', tag: 'Lelucon' },
    { text: 'Tahukah kamu? Angka nol (0) punya bentuk bulat seperti donat cokelat! 🍩', tag: 'Fakta Unik' },
    { text: 'Kamu sudah hebat banget hari ini! Jangan lupa putar Roda Hadiah untuk dapat bintang gratis ya! 🎡⭐', tag: 'Hadiah' },
    { text: 'Tebak Bangun: Aku punya 3 sisi lurus dan 3 sudut runcing. Siapa aku? Betul, Segitiga! 🔺🍕', tag: 'Teka-Teki' }
];

/* ══════════════════════════════════════════════════════════════
   5. BANK MATERI EDUKASI (12 Topik Lengkap & Ilustratif)
   ══════════════════════════════════════════════════════════════ */
const lessonsData = [
    {
        id: 'learn-numbers',
        icon: '123',
        theme: 'blue',
        category: 'operasi',
        tag: 'Dasar (6–7 Thn)',
        title: 'Penjumlahan Ceria',
        summary: 'Belajar cara mudah menjumlahkan angka menggunakan jari, buah segar, dan trik teman sepuluh.',
        tips: 'Trik Teman 10: Angka yang jika dijumlahkan jadi 10! Contoh: 1+9, 2+8, 3+7, 4+6, 5+5.',
        content: [
            {
                heading: 'Apa itu Penjumlahan?',
                text: 'Penjumlahan adalah proses menggabungkan dua kelompok benda menjadi satu kelompok yang lebih besar. Simbolnya adalah tanda tambah (+).',
                visual: '🍎 🍎  +  🍎 🍎 🍎  =  🍎 🍎 🍎 🍎 🍎 (2 + 3 = 5 Apel)'
            },
            {
                heading: 'Trik Berhitung Maju dengan Jari',
                text: 'Untuk 5 + 3: Simpan angka 5 di kepala, lalu buka 3 jari tangan. Hitung maju: 6, 7, 8! Hasilnya adalah 8!',
                visual: '🧠 (5) ➔ 👆(6) ➔ ✌️(7) ➔ 🤟(8) = Selesai!'
            },
            {
                heading: 'Latihan Bersama',
                text: 'Coba hitung: 4 burung di pohon ditambah 3 burung yang baru datang. 4 + 3 = 7 burung!',
                visual: '🐦🐦🐦🐦 + 🐦🐦🐦 = 7 Burung Ceria'
            }
        ]
    },
    {
        id: 'explore-shapes',
        icon: '●▲',
        theme: 'coral',
        category: 'geometri',
        tag: 'Geometri Cilik (6–8 Thn)',
        title: 'Mengenal Bangun Datar 2D',
        summary: 'Yuk jelajahi segitiga, persegi, persegi panjang, dan lingkaran di sekitar rumahmu!',
        tips: 'Ingat ya: Lingkaran itu istimewa karena garisnya melengkung halus dan tidak punya sudut tajam!',
        content: [
            {
                heading: 'Segitiga (3 Sisi & 3 Sudut)',
                text: 'Segitiga punya 3 garis lurus (sisi) dan 3 titik pojok (sudut). Contoh di dunia nyata: potongan pizza, atap rumah, dan gantungan baju.',
                visual: '🔺 Sisi 1, Sisi 2, Sisi 3 • Contoh: 🍕 Pizza Lezat'
            },
            {
                heading: 'Persegi (4 Sisi Sama Panjang)',
                text: 'Persegi memiliki 4 sisi yang panjangnya persis sama dan 4 sudut siku-siku. Contoh: jendela rumah, biskuit kotak, dan papan catur.',
                visual: '⬜ 4 Sisi Kembar • Contoh: 🧇 Waffle & Biskuit'
            },
            {
                heading: 'Lingkaran (Garis Melengkung)',
                text: 'Lingkaran bundar sempurna tanpa sudut. Contoh: koin uang, roda sepeda, jam dinding, dan piring makan.',
                visual: '🔴 Bundar Sempurna • Contoh: 🪙 Koin & 🍩 Donat'
            }
        ]
    },
    {
        id: 'solve-challenges',
        icon: '★',
        theme: 'yellow',
        category: 'operasi',
        tag: 'Logika & Pengurangan (6–8 Thn)',
        title: 'Pengurangan & Logika',
        summary: 'Mengambil, membagikan, dan menghitung sisa benda dengan trik hitung mundur.',
        tips: 'Trik Hitung Mundur: 12 - 3 berarti dari 12 mundur 3 langkah: 11, 10, 9!',
        content: [
            {
                heading: 'Apa itu Pengurangan?',
                text: 'Pengurangan adalah proses mengambil sejumlah benda dari kumpulan yang ada. Simbolnya adalah tanda kurang (-). Hasilnya disebut selisih atau sisa.',
                visual: '🧁🧁🧁🧁🧁 (5 kue) dimakan 2 ➔ tersisa 🧁🧁🧁 (3 kue)'
            },
            {
                heading: 'Menyelesaikan Soal Cerita',
                text: 'Budi memiliki 10 balon warna-warni. Saat bermain, 3 balon meletus. Berapa sisa balon Budi? 10 - 3 = 7 balon tersisa!',
                visual: '🎈🎈🎈🎈🎈🎈🎈🎈🎈🎈 - 💥💥💥 = 🎈🎈🎈🎈🎈🎈🎈 (7 Balon)'
            }
        ]
    },
    {
        id: 'daily-quiz',
        icon: '⏱',
        theme: 'blue',
        category: 'operasi',
        tag: 'Trik Perkalian (7–9 Thn)',
        title: 'Rahasia Perkalian Mudah',
        summary: 'Perkalian adalah penjumlahan berulang yang cepat dan menyenangkan!',
        tips: 'Semua angka yang dikalikan dengan 0 hasilnya 0. Dikalikan dengan 1 hasilnya angka itu sendiri!',
        content: [
            {
                heading: 'Konsep Penjumlahan Berulang',
                text: '3 × 4 itu artinya angka 4 dijumlahkan sebanyak 3 kali: 4 + 4 + 4 = 12. Jadi, 3 × 4 = 12!',
                visual: '📦(🍎🍎🍎🍎) + 📦(🍎🍎🍎🍎) + 📦(🍎🍎🍎🍎) = 12 Apel'
            },
            {
                heading: 'Trik Perkalian 2 (Kelipatan Genap)',
                text: 'Perkalian 2 sama saja dengan menjumlahkan angka dengan dirinya sendiri! Contoh: 2 × 6 = 6 + 6 = 12.',
                visual: '2 × 5 = 5 + 5 = 10  |  2 × 8 = 8 + 8 = 16'
            },
            {
                heading: 'Trik Perkalian 5 (Selalu Berakhiran 0 atau 5)',
                text: 'Hasil kali 5 selalu punya pola indah: 5, 10, 15, 20, 25, 30, 35, 40, 45, 50!',
                visual: '🖐️ 5 ➔ 10 ➔ 15 ➔ 20 ➔ 25 ➔ 30'
            }
        ]
    },
    {
        id: 'pattern-matching',
        icon: '▲●▲',
        theme: 'coral',
        category: 'logika',
        tag: 'Detektif Pola (6–9 Thn)',
        title: 'Menebak Pola & Barisan',
        summary: 'Jadilah detektif matematika! Temukan keteraturan angka, bentuk, dan warna rahasia.',
        tips: 'Cari selisih antara angka pertama dan kedua. Jika bertambah 2, teruskan bertambah 2!',
        content: [
            {
                heading: 'Pola Bilangan Loncat',
                text: 'Perhatikan barisan: 2, 4, 6, 8, ... Setiap angka bertambah +2. Maka angka berikutnya adalah 8 + 2 = 10!',
                visual: '2 (+2)➔ 4 (+2)➔ 6 (+2)➔ 8 (+2)➔ [ 10 ]'
            },
            {
                heading: 'Pola Bentuk & Warna Berulang',
                text: 'Jika ada barisan: Merah, Biru, Merah, Biru, Merah, ... maka yang berikutnya adalah Biru!',
                visual: '🔴 🔵 🔴 🔵 🔴 [ 🔵 ]'
            }
        ]
    },
    {
        id: 'fun-measurement',
        icon: '📏',
        theme: 'yellow',
        category: 'sehari-hari',
        tag: 'Ukuran & Waktu (7–10 Thn)',
        title: 'Pengukuran Panjang & Jam',
        summary: 'Belajar membandingkan tinggi badan, berat benda, serta membaca jarum jam dinding.',
        tips: 'Jarum pendek menunjukkan jam, jarum panjang menunjukkan menit. 1 jam ada 60 menit!',
        content: [
            {
                heading: 'Mengukur Panjang (cm dan Meter)',
                text: 'Benda kecil seperti pensil diukur dengan sentimeter (cm). Benda besar seperti lemari diukur dengan meter (m). 1 meter = 100 cm!',
                visual: '✏️ Pensil = 15 cm  vs  🚪 Pintu = 2 meter (200 cm)'
            },
            {
                heading: 'Membaca Jam Dinding',
                text: 'Jika jarum pendek menunjuk ke angka 3, dan jarum panjang menunjuk tepat ke angka 12, maka waktu menunjukkan pukul 03.00 tepat.',
                visual: '⏰ Jarum Pendek di 3 + Panjang di 12 = Pukul 03:00'
            }
        ]
    },
    {
        id: 'division-basics',
        icon: '➗',
        theme: 'blue',
        category: 'operasi',
        tag: 'Operasi Hitung (8–9 Thn)',
        title: 'Pembagian Ceria & Bagi Rata',
        summary: 'Belajar membagi kue, permen, dan kelereng bersama teman secara adil tanpa sisa!',
        tips: 'Membagi adalah kebalikan dari perkalian. Kalau 3 × 4 = 12, maka 12 ÷ 3 = 4!',
        content: [
            {
                heading: 'Konsep Berbagi Sama Rata',
                text: 'Membagi artinya membagikan sejumlah benda ke dalam kelompok-kelompok kecil dengan jumlah yang persis sama. Simbolnya adalah titik dua (÷).',
                visual: '🍬🍬🍬🍬🍬🍬 (6 permen) dibagi 2 anak = masing-masing dapat 🍬🍬🍬 (3 permen)'
            },
            {
                heading: 'Pengurangan Berulang Sampai Habis',
                text: '12 ÷ 4 artinya angka 12 dikurangi 4 terus-menerus sampai habis: 12 - 4 - 4 - 4 = 0. Karena dikurangi sebanyak 3 kali, maka 12 ÷ 4 = 3!',
                visual: '12 ➔ (-4) ➔ 8 ➔ (-4) ➔ 4 ➔ (-4) ➔ 0  (Total 3 langkah!)'
            },
            {
                heading: 'Trik Bilangan Genap',
                text: 'Semua bilangan genap (yang berakhiran 0, 2, 4, 6, 8) selalu bisa dibagi 2 tanpa sisa! Contoh: 14 ÷ 2 = 7, 20 ÷ 2 = 10.',
                visual: '✌️ Genap selalu punya pasangan kembar sempurna!'
            }
        ]
    },
    {
        id: 'fractions-fun',
        icon: '🍕',
        theme: 'coral',
        category: 'operasi',
        tag: 'Pecahan Dasar (7–8 Thn)',
        title: 'Pecahan Seru (½, ⅓, ¼)',
        summary: 'Membagi satu benda utuh menjadi beberapa potong sama besar seperti pizza, semangka, dan kue tart!',
        tips: 'Angka atas disebut Pembilang (bagian yang kita ambil), angka bawah disebut Penyebut (total semua potongan)!',
        content: [
            {
                heading: 'Mengenal Setengah (1/2)',
                text: 'Jika kamu membelah 1 buah apel menjadi 2 potongan kembar sama besar, setiap potongan bernilai 1/2 (setengah atau seperdua).',
                visual: '🍎 ➔ 🍎/2 (Satu bagian dari 2 potong kembar)'
            },
            {
                heading: 'Mengenal Seperempat (1/4)',
                text: 'Jika 1 loyang pizza dipotong menjadi 4 bagian yang sama besar, maka 1 potong pizza bernilai 1/4 (seperempat). Jika kamu makan 2 potong, artinya kamu makan 2/4 yang nilainya sama dengan 1/2!',
                visual: '🍕 Dibagi 4 potong ➔ 1 potong = 1/4 loyang'
            },
            {
                heading: 'Membandingkan Besar Pecahan',
                text: 'Semakin banyak kue dipotong, setiap potongannya justru semakin kecil! Jadi 1/2 kue jauh lebih besar daripada 1/4 kue.',
                visual: '🍰 1/2 (Besar)  >  🍰 1/4 (Sedang)  >  🍰 1/8 (Kecil)'
            }
        ]
    },
    {
        id: 'money-math',
        icon: '🪙',
        theme: 'yellow',
        category: 'sehari-hari',
        tag: 'Kecakapan Hidup (7–10 Thn)',
        title: 'Mengenal Uang & Belanja Pintar',
        summary: 'Belajar menghitung koin rupiah, uang kertas, dan menghitung uang kembalian saat jajan di kantin sekolah!',
        tips: 'Cara hitung kembalian cepat: Uang yang kamu serahkan dikurangi total harga barang belanjaanmu!',
        content: [
            {
                heading: 'Mengenal Pecahan Uang Rupiah',
                text: 'Di Indonesia, kita memakai mata uang Rupiah (Rp). Ada uang koin logam (Rp500, Rp1.000) dan uang kertas (Rp2.000, Rp5.000, Rp10.000, Rp20.000).',
                visual: '🪙 Rp500 + 🪙 Rp500 = 🪙 Rp1.000'
            },
            {
                heading: 'Menjumlahkan Uang Belanja',
                text: 'Saat jajan di kantin, hitung semua barangmu dulu: Roti (Rp3.000) + Susu Kotak (Rp4.000). 3.000 + 4.000 = Rp7.000 yang harus dibayar.',
                visual: '🥖 Rp3.000  +  🥛 Rp4.000  =  🧾 Total Rp7.000'
            },
            {
                heading: 'Menghitung Uang Kembalian',
                text: 'Jika kamu membayar dengan selembar uang Rp10.000 untuk belanjaan Rp7.000, kembalianmu adalah: 10.000 - 7.000 = Rp3.000!',
                visual: '💵 Rp10.000 - 🧾 Rp7.000 = 🪙 Rp3.000 (Kembalian)'
            }
        ]
    },
    {
        id: '3d-shapes',
        icon: '🧊',
        theme: 'blue',
        category: 'geometri',
        tag: 'Geometri 3D (8–10 Thn)',
        title: 'Menjelajah Bangun Ruang 3D',
        summary: 'Mengenal kubus dadu, balok kardus, tabung kaleng biskuit, kerucut tumpeng, dan bola tendang!',
        tips: 'Bangun ruang itu memiliki isi (volume) dan bisa diisi benda lain di dalamnya, berbeda dengan bangun datar yang tipis!',
        content: [
            {
                heading: 'Kubus (Dadu Mainan & Rubik)',
                text: 'Kubus memiliki 6 sisi berbentuk persegi yang semuanya persis sama, 12 rusuk (garis tepi), dan 8 titik sudut pojok.',
                visual: '🎲 Dadu: 6 Sisi Persegi Kembar • 12 Rusuk • 8 Sudut'
            },
            {
                heading: 'Balok (Kotak Sepatu & Tempat Susu)',
                text: 'Balok mirip kubus, tetapi sisinya berbentuk persegi panjang. Memiliki ukuran panjang, lebar, dan tinggi yang berbeda.',
                visual: '📦 Kardus Paket & Kotak Susu yang kokoh'
            },
            {
                heading: 'Tabung, Kerucut & Bola',
                text: 'Tabung punya alas lingkaran (seperti kaleng minuman), kerucut punya ujung lancip (seperti topi ulang tahun), dan bola bundar tanpa sudut!',
                visual: '🥫 Kaleng Soda  •  🍦 Corong Es Krim  •  ⚽ Bola Sepak'
            }
        ]
    },
    {
        id: 'data-charts',
        icon: '📊',
        theme: 'coral',
        category: 'sehari-hari',
        tag: 'Statistika Cilik (8–10 Thn)',
        title: 'Diagram Gambar & Piktogram',
        summary: 'Belajar menyusun data hewan peliharaan, makanan favorit teman sekelas, dan membaca grafik batang ceria!',
        tips: 'Selalu periksa Kunci Piktogram (Legenda)! 1 gambar bintang bisa mewakili 1 orang anak atau 2 orang anak.',
        content: [
            {
                heading: 'Apa itu Piktogram (Diagram Gambar)?',
                text: 'Piktogram adalah cara menampilkan data menggunakan gambar lucu agar mudah dibaca dan dimengerti semua orang.',
                visual: '🍎 = 1 Siswa | Siswa suka apel: 🍎🍎🍎🍎 (4 Siswa)'
            },
            {
                heading: 'Membaca Diagram Batang',
                text: 'Tinggi batang menunjukkan banyaknya jumlah. Batang yang paling tinggi berarti pilihan yang paling banyak disukai teman-teman!',
                visual: 'Kucing: ▇▇▇▇▇ (5) | Kelinci: ▇▇▇ (3) | Ikan: ▇▇▇▇ (4)'
            },
            {
                heading: 'Mencari Selisih Data',
                text: 'Dari data di atas, berapa selisih anak yang suka kucing dibanding kelinci? 5 - 3 = 2 anak lebih banyak suka kucing!',
                visual: '📊 Kucing (5) - Kelinci (3) = Selisih 2 Anak'
            }
        ]
    },
    {
        id: 'math-tricks',
        icon: '✨',
        theme: 'yellow',
        category: 'logika',
        tag: 'Trik Sulap (Semua Usia)',
        title: 'Trik Sulap Berhitung Cepat',
        summary: 'Kuasai trik mental math rahasia untuk berhitung kilat di luar kepala dan mengejutkan temanmu!',
        tips: 'Trik Tambah 9: Tambahkan 10 dulu, lalu kurangi 1. Otak kita jauh lebih cepat menghitung angka 10!',
        content: [
            {
                heading: 'Trik Penjumlahan +9 Kilat',
                text: 'Menghitung 47 + 9? Jangan berhitung satu-satu! Cukup: 47 + 10 = 57, lalu kurangi 1 = 56! Kilat bukan?',
                visual: '38 + 9 ➔ (38 + 10) - 1 = 48 - 1 = 47!'
            },
            {
                heading: 'Trik Perkalian 9 Menggunakan 10 Jari',
                text: 'Rentangkan 10 jarimu. Untuk 9 × 3: tekuk jari ke-3 dari kiri. Ada 2 jari di kiri (puluhan) dan 7 jari di kanan (satuan). Hasilnya 27!',
                visual: '🖐️ Tekuk jari ke-3 ➔ [2] jari kiri & [7] jari kanan = 27!'
            },
            {
                heading: 'Trik Menemukan Bilangan Ganjil & Genap',
                text: 'Perhatikan hanya angka paling terakhirnya saja! Jika angka terakhir adalah 0, 2, 4, 6, 8 maka bilangan itu GENAP. Jika 1, 3, 5, 7, 9 maka GANJIL!',
                visual: 'Contoh: 1.486 ➔ angka terakhir 6 = Bilangan Genap! 🎉'
            }
        ]
    }
];

/* ══════════════════════════════════════════════════════════════
   5B. BANK MATERI BAHASA INGGRIS ANAK (12 Modul Lengkap & Audio)
   ══════════════════════════════════════════════════════════════ */
const englishLessonsData = [
    {
        id: 'en-alphabet',
        icon: '🔤',
        theme: 'coral',
        category: 'basics',
        tag: 'Level 1 (Usia 6–7 Thn)',
        title: 'The Alphabet & Phonics Song',
        summary: 'Belajar 26 huruf alfabet bahasa Inggris, bunyi fonik pertama, dan 5 huruf vokal ajaib (A, E, I, O, U) dengan audio pelafalan jelas.',
        tips: 'Ingat 5 Vokal Ajaib: A, E, I, O, U! Huruf vokal ini ada di hampir semua kata bahasa Inggris.',
        flashcards: [
            { word: 'Apple', pron: 'A-pel', meaning: 'Apel 🍎', emoji: '🍎' },
            { word: 'Ball', pron: 'Bol', meaning: 'Bola ⚽', emoji: '⚽' },
            { word: 'Cat', pron: 'Kat', meaning: 'Kucing 🐱', emoji: '🐱' },
            { word: 'Dog', pron: 'Dog', meaning: 'Anjing 🐶', emoji: '🐶' },
            { word: 'Elephant', pron: 'El-e-fant', meaning: 'Gajah 🐘', emoji: '🐘' },
            { word: 'Fish', pron: 'Fisy', meaning: 'Ikan 🐟', emoji: '🐟' }
        ],
        content: [
            {
                heading: '5 Huruf Vokal Ajaib (Magic Vowels)',
                text: 'Dalam bahasa Inggris ada 5 huruf vokal utama: A, E, I, O, dan U. Ucapkan bunyinya dengan riang!',
                visual: '🅰️ A-pple ➔ 🅴 E-lephant ➔ 🅸 I-gloo ➔ 🅾️ O-ctopus ➔ 🆄 U-mbrella'
            },
            {
                heading: 'Mengenal Bunyi Huruf (Phonics Sounds)',
                text: 'Setiap huruf memiliki nama dan bunyi suara. Contoh: Huruf "B" berbunyi /buh/ seperti dalam kata "Ball", dan huruf "C" berbunyi /k/ seperti dalam kata "Cat".',
                visual: '🔤 B ➔ /b/ ➔ Ball ⚽ | 🔤 C ➔ /k/ ➔ Cat 🐱 | 🔤 D ➔ /d/ ➔ Dog 🐶'
            },
            {
                heading: 'Membaca Kata Pertama (First Reading)',
                text: 'Gabungkan bunyi huruf menjadi satu kata yang utuh: C + A + T = CAT (Kucing)!',
                visual: '🐱 C (/k/) + A (/æ/) + T (/t/) ➔ CAT! Kamu sudah bisa membaca!'
            }
        ]
    },
    {
        id: 'en-first-words',
        icon: '✨',
        theme: 'yellow',
        category: 'basics',
        tag: 'Level 1 (Usia 6–7 Thn)',
        title: 'Sight Words & Kalimat Pertama',
        summary: 'Mengenal kata-kata dasar bahasa Inggris yang paling sering dipakai dalam buku cerita bergambar anak.',
        tips: 'Sight Words adalah kata yang langsung kita kenali saat melihatnya tanpa perlu mengeja satu per satu!',
        flashcards: [
            { word: 'Sun', pron: 'San', meaning: 'Matahari ☀️', emoji: '☀️' },
            { word: 'Star', pron: 'Star', meaning: 'Bintang ⭐', emoji: '⭐' },
            { word: 'Book', pron: 'Buk', meaning: 'Buku 📘', emoji: '📘' },
            { word: 'Tree', pron: 'Tri', meaning: 'Pohon 🌳', emoji: '🌳' },
            { word: 'Happy', pron: 'Hep-pi', meaning: 'Gembira 😊', emoji: '😊' },
            { word: 'Big', pron: 'Big', meaning: 'Besar 🐘', emoji: '🐘' }
        ],
        content: [
            {
                heading: 'Kata-Kata Sakti: I, See, Can, Like',
                text: 'Kata sakti ini bisa digabung untuk membuat kalimat pertamamu: "I see" artinya "Aku melihat", dan "I like" artinya "Aku suka".',
                visual: '👀 "I see a star" (Aku melihat bintang ⭐) | ❤️ "I like apples" (Aku suka apel 🍎)'
            },
            {
                heading: 'Latihan Membaca Kalimat Bergambar',
                text: 'Ayo coba baca kalimat ini bersama-sama dengan suara lantang:',
                visual: '☀️ "The sun is big and bright!" (Matahari itu besar dan bersinar terang!)'
            }
        ]
    },
    {
        id: 'en-numbers',
        icon: '🔢',
        theme: 'blue',
        category: 'numbers-colors',
        tag: 'Level 1–2 (Usia 6–8 Thn)',
        title: 'Counting Numbers 1 to 20',
        summary: 'Belajar menghitung angka 1 sampai 20 dalam bahasa Inggris dengan mainan seru dan petualangan berhitung.',
        tips: 'Ingat: Angka 13 sampai 19 selalu berakhiran kata "-teen"! Contoh: four-teen (14), six-teen (16).',
        flashcards: [
            { word: 'One', pron: 'Wan', meaning: 'Satu 1️⃣', emoji: '1️⃣' },
            { word: 'Two', pron: 'Tu', meaning: 'Dua 2️⃣', emoji: '2️⃣' },
            { word: 'Three', pron: 'Tri', meaning: 'Tiga 3️⃣', emoji: '3️⃣' },
            { word: 'Five', pron: 'Faif', meaning: 'Lima 5️⃣', emoji: '5️⃣' },
            { word: 'Seven', pron: 'Se-ven', meaning: 'Tujuh 7️⃣', emoji: '7️⃣' },
            { word: 'Ten', pron: 'Ten', meaning: 'Sepuluh 🔟', emoji: '🔟' },
            { word: 'Twenty', pron: 'Twen-ti', meaning: 'Dua puluh 2️⃣0️⃣', emoji: '2️⃣0️⃣' }
        ],
        content: [
            {
                heading: 'Angka 1 sampai 10 (Numbers 1 to 10)',
                text: 'Mari kita ucapkan bersama: One (1), Two (2), Three (3), Four (4), Five (5), Six (6), Seven (7), Eight (8), Nine (9), Ten (10).',
                visual: '1️⃣ One ➔ 2️⃣ Two ➔ 3️⃣ Three ➔ 4️⃣ Four ➔ 5️⃣ Five ➔ 🔟 Ten!'
            },
            {
                heading: 'Menghitung Benda di Kamarmu',
                text: 'Saat melihat 3 mainan mobil-mobilan, kita sebut: "Three toy cars!". Saat melihat 5 buku: "Five books!".',
                visual: '🚗🚗🚗 = Three cars | 🎈🎈🎈🎈 = Four balloons'
            },
            {
                heading: 'Angka Belasan (11 to 20)',
                text: 'Eleven (11), Twelve (12), Thirteen (13), Fourteen (14), Fifteen (15), Sixteen (16), Seventeen (17), Eighteen (18), Nineteen (19), Twenty (20)!',
                visual: '🔟 + 3️⃣ = 13 (Thirteen) | 🔟 + 🔟 = 20 (Twenty!)'
            }
        ]
    },
    {
        id: 'en-colors',
        icon: '🌈',
        theme: 'yellow',
        category: 'numbers-colors',
        tag: 'Level 1–2 (Usia 6–8 Thn)',
        title: 'Rainbow Colors & Magic Paints',
        summary: 'Mengenal warna-warni pelangi ceria dan menyusun kalimat deskripsi warna benda kesukaan di sekitarmu.',
        tips: 'Dalam bahasa Inggris, kata warna selalu diletakkan SEBELUM nama benda: "Red Apple", bukan "Apple Red"!',
        flashcards: [
            { word: 'Red', pron: 'Red', meaning: 'Merah 🔴', emoji: '🔴' },
            { word: 'Blue', pron: 'Blu', meaning: 'Biru 🔵', emoji: '🔵' },
            { word: 'Yellow', pron: 'Ye-low', meaning: 'Kuning 🟡', emoji: '🟡' },
            { word: 'Green', pron: 'Grin', meaning: 'Hijau 🟢', emoji: '🟢' },
            { word: 'Purple', pron: 'Per-pel', meaning: 'Ungu 🟣', emoji: '🟣' },
            { word: 'Orange', pron: 'O-rinj', meaning: 'Jingga 🟠', emoji: '🟠' },
            { word: 'Pink', pron: 'Pingk', meaning: 'Merah Muda 🌸', emoji: '🌸' },
            { word: 'White', pron: 'Wait', meaning: 'Putih ⚪', emoji: '⚪' }
        ],
        content: [
            {
                heading: 'Warna-Warna Pelangi Utama',
                text: 'Pelangi memiliki warna Red (Merah), Orange (Jingga), Yellow (Kuning), Green (Hijau), Blue (Biru), and Purple (Ungu).',
                visual: '🔴 Red ➔ 🟠 Orange ➔ 🟡 Yellow ➔ 🟢 Green ➔ 🔵 Blue ➔ 🟣 Purple 🌈'
            },
            {
                heading: 'Menebak Warna di Alam Sekitar',
                text: 'Langit berwarna biru: "The sky is blue ☁️". Rumput berwarna hijau: "The grass is green 🌱". Matahari berwarna kuning: "The sun is yellow ☀️".',
                visual: '☁️ Blue Sky | 🌱 Green Grass | ☀️ Yellow Sun | 🍓 Red Strawberry'
            }
        ]
    },
    {
        id: 'en-animals',
        icon: '🦁',
        theme: 'coral',
        category: 'vocab',
        tag: 'Level 2–3 (Usia 7–9 Thn)',
        title: 'Zoo & Farm Animals',
        summary: 'Menjelajahi dunia satwa kebun binatang dan hewan peliharaan lucu beserta bunyi suaranya.',
        tips: 'Gunakan kata "An" sebelum hewan berawalan huruf vokal: An Elephant 🐘, An Owl 🦉.',
        flashcards: [
            { word: 'Lion', pron: 'Lai-en', meaning: 'Singa 🦁', emoji: '🦁' },
            { word: 'Cat', pron: 'Kat', meaning: 'Kucing 🐱', emoji: '🐱' },
            { word: 'Dog', pron: 'Dog', meaning: 'Anjing 🐶', emoji: '🐶' },
            { word: 'Elephant', pron: 'El-e-fant', meaning: 'Gajah 🐘', emoji: '🐘' },
            { word: 'Monkey', pron: 'Mang-ki', meaning: 'Monyet 🐵', emoji: '🐵' },
            { word: 'Tiger', pron: 'Tai-ger', meaning: 'Harimau 🐯', emoji: '🐯' },
            { word: 'Rabbit', pron: 'Re-bit', meaning: 'Kelinci 🐰', emoji: '🐰' },
            { word: 'Bird', pron: 'Berd', meaning: 'Burung 🐦', emoji: '🐦' }
        ],
        content: [
            {
                heading: 'Hewan Sahabat di Rumah (Pets)',
                text: 'Hewan yang bisa kita rawat di rumah disebut Pets: Cat (kucing 🐱), Dog (anjing 🐶), Rabbit (kelinci 🐰), dan Fish (ikan 🐠).',
                visual: '🐱 Cat says "Meow!" | 🐶 Dog says "Woof!" | 🐦 Bird says "Tweet!"'
            },
            {
                heading: 'Satwa Hebat Kebun Binatang (Zoo Animals)',
                text: 'Lion adalah Raja Hutan yang gagah 🦁, Elephant adalah gajah berbelalai panjang 🐘, dan Monkey suka melompat di pohon 🐵!',
                visual: '🦁 Lion (Singa) | 🐘 Elephant (Gajah) | 🐵 Monkey (Monyet) | 🐯 Tiger (Harimau)'
            }
        ]
    },
    {
        id: 'en-fruits-food',
        icon: '🍎',
        theme: 'blue',
        category: 'vocab',
        tag: 'Level 2–3 (Usia 7–9 Thn)',
        title: 'Delicious Fruits & Healthy Food',
        summary: 'Kosakata aneka buah manis bergizi, makanan sarapan lezat, dan minuman sehat dalam bahasa Inggris.',
        tips: 'Katakan "I like eating..." untuk makanan kesukaanmu, dan katakan "Yummy! 😋" jika rasanya lezat!',
        flashcards: [
            { word: 'Banana', pron: 'Be-ne-ne', meaning: 'Pisang 🍌', emoji: '🍌' },
            { word: 'Apple', pron: 'A-pel', meaning: 'Apel 🍎', emoji: '🍎' },
            { word: 'Orange', pron: 'O-rinj', meaning: 'Jeruk 🍊', emoji: '🍊' },
            { word: 'Strawberry', pron: 'Stro-be-ri', meaning: 'Stroberi 🍓', emoji: '🍓' },
            { word: 'Milk', pron: 'Milk', meaning: 'Susu 🥛', emoji: '🥛' },
            { word: 'Bread', pron: 'Bred', meaning: 'Roti 🍞', emoji: '🍞' },
            { word: 'Egg', pron: 'Eg', meaning: 'Telur 🥚', emoji: '🥚' },
            { word: 'Pizza', pron: 'Pit-sa', meaning: 'Piza 🍕', emoji: '🍕' }
        ],
        content: [
            {
                heading: 'Buah-Buahan Manis & Segar (Fruits)',
                text: 'Ada Banana (pisang 🍌), Apple (apel 🍎), Orange (jeruk 🍊), Watermelon (semangka 🍉), dan Strawberry (stroberi 🍓).',
                visual: '🍌 Sweet Banana | 🍎 Crisp Apple | 🍊 Juicy Orange | 🍉 Fresh Watermelon'
            },
            {
                heading: 'Menu Sarapan Bergizi (Healthy Breakfast)',
                text: 'Setiap pagi minumlah Fresh Milk (susu segar 🥛) dan makan Bread with Egg (roti dan telur 🍞🥚) agar tubuh bertenaga!',
                visual: '🥛 Glass of milk + 🍞 Slice of bread + 🥚 Boiled egg = Healthy Breakfast!'
            }
        ]
    },
    {
        id: 'en-school',
        icon: '🎒',
        theme: 'purple',
        category: 'daily',
        tag: 'Level 2–3 (Usia 7–9 Thn)',
        title: 'My School Bag & Classroom Items',
        summary: 'Menyebutkan perlengkapan sekolah di tas dan instruksi menyenangkan di ruang kelas.',
        tips: 'Pensil untuk menulis adalah "Pencil", buku untuk membaca adalah "Book", dan penghapus adalah "Eraser"!',
        flashcards: [
            { word: 'Book', pron: 'Buk', meaning: 'Buku 📘', emoji: '📘' },
            { word: 'Pencil', pron: 'Pen-sil', meaning: 'Pensil ✏️', emoji: '✏️' },
            { word: 'Eraser', pron: 'I-rei-ser', meaning: 'Penghapus 🧼', emoji: '🧼' },
            { word: 'Ruler', pron: 'Ru-ler', meaning: 'Penggaris 📏', emoji: '📏' },
            { word: 'Backpack', pron: 'Bek-pek', meaning: 'Tas Punggung 🎒', emoji: '🎒' },
            { word: 'Scissors', pron: 'Si-serz', meaning: 'Gunting ✂️', emoji: '✂️' }
        ],
        content: [
            {
                heading: 'Di Dalam Tas Sekolah (School Bag)',
                text: 'Keluarkan perlengkapan belajarmu: Book (buku 📘), Pencil (pensil ✏️), Eraser (penghapus 🧼), dan Ruler (penggaris 📏).',
                visual: '🎒 Backpack ➔ 📘 Book + ✏️ Pencil + 🧼 Eraser + 📏 Ruler!'
            },
            {
                heading: 'Perintah Ramah di Ruang Kelas (Classroom English)',
                text: 'Dengarkan arahan guru: "Open your book!" (Buka bukumu!), "Raise your hand!" (Angkat tanganmu!), "Sit down, please" (Silakan duduk).',
                visual: '✋ Raise your hand! | 📖 Open your book! | 🤫 Listen carefully!'
            }
        ]
    },
    {
        id: 'en-family',
        icon: '👨‍👩‍👧',
        theme: 'yellow',
        category: 'daily',
        tag: 'Level 2–4 (Usia 7–10 Thn)',
        title: 'My Beloved Family',
        summary: 'Belajar sapaan kasih sayang untuk ayah, ibu, kakak, adik, kakek, dan nenek tercinta.',
        tips: 'Panggilan akrab penuh kasih sayang: Dad (Ayah), Mom (Ibu), Grandpa (Kakek), dan Grandma (Nenek)!',
        flashcards: [
            { word: 'Father', pron: 'Fa-dher', meaning: 'Ayah 👨', emoji: '👨' },
            { word: 'Mother', pron: 'Ma-dher', meaning: 'Ibu 👩', emoji: '👩' },
            { word: 'Brother', pron: 'Bra-dher', meaning: 'Saudara Laki-laki 👦', emoji: '👦' },
            { word: 'Sister', pron: 'Sis-ter', meaning: 'Saudara Perempuan 👧', emoji: '👧' },
            { word: 'Baby', pron: 'Bei-bi', meaning: 'Bayi Lucu 👶', emoji: '👶' },
            { word: 'Grandfather', pron: 'Gren-fa-dher', meaning: 'Kakek 👴', emoji: '👴' },
            { word: 'Grandmother', pron: 'Gren-ma-dher', meaning: 'Nenek 👵', emoji: '👵' },
            { word: 'Family', pron: 'Fe-mi-li', meaning: 'Keluarga ❤️', emoji: '❤️' }
        ],
        content: [
            {
                heading: 'Keluarga Inti Tercinta',
                text: 'Father adalah Ayah 👨, Mother adalah Ibu 👩, Brother adalah kakak/adik laki-laki 👦, dan Sister adalah saudara perempuan 👧.',
                visual: '👨 Father + 👩 Mother + 👦 Brother + 👧 Sister = Happy Family ❤️'
            },
            {
                heading: 'Memperkenalkan Keluargamu',
                text: 'Ucapkan kalimat ramah ini: "This is my father. This is my mother. I love my family so much!"',
                visual: '🏡 "We are a happy family!" (Kami adalah keluarga yang bahagia!)'
            }
        ]
    },
    {
        id: 'en-greetings',
        icon: '👋',
        theme: 'coral',
        category: 'conversation',
        tag: 'Level 3–4 (Usia 8–10 Thn)',
        title: 'Daily Greetings & Polite Manners',
        summary: 'Percakapan sopan santun: sapaan pagi, terima kasih, minta tolong, dan menanyakan kabar.',
        tips: 'Selalu gunakan kata "Please" saat meminta tolong, dan "Thank you" saat menerima bantuan atau hadiah!',
        flashcards: [
            { word: 'Hello', pron: 'He-lo', meaning: 'Halo 👋', emoji: '👋' },
            { word: 'Good morning', pron: 'Gud mor-ning', meaning: 'Selamat pagi 🌅', emoji: '🌅' },
            { word: 'Good afternoon', pron: 'Gud af-ter-nun', meaning: 'Selamat siang ☀️', emoji: '☀️' },
            { word: 'Good night', pron: 'Gud nait', meaning: 'Selamat tidur 🌙', emoji: '🌙' },
            { word: 'Thank you', pron: 'Teng-kyu', meaning: 'Terima kasih 🙏', emoji: '🙏' },
            { word: 'Please', pron: 'Pliz', meaning: 'Tolong / Silakan ✨', emoji: '✨' },
            { word: 'You are welcome', pron: 'Yu ar wel-kam', meaning: 'Sama-sama 😊', emoji: '😊' },
            { word: 'Goodbye', pron: 'Gud-bai', meaning: 'Selamat tinggal 👋', emoji: '👋' }
        ],
        content: [
            {
                heading: 'Sapaan Sesuai Waktu (Greetings)',
                text: 'Pagi hari ucapkan "Good morning 🌅", siang hari ucapkan "Good afternoon ☀️", dan malam sebelum tidur ucapkan "Good night 🌙".',
                visual: '🌅 Good morning (Pagi) ➔ ☀️ Good afternoon (Siang) ➔ 🌙 Good night (Tidur)'
            },
            {
                heading: 'Tiga Kata Ajaib (Magic Words)',
                text: 'Anak hebat selalu ingat: "Please" (tolong), "Thank you" (terima kasih), dan "I am sorry" (maafkan saya).',
                visual: '✨ "Please help me" ➔ 🎁 "Thank you so much!" ➔ 💖 "You are welcome!"'
            },
            {
                heading: 'Menanyakan Kabar Teman',
                text: 'Tanya temanmu: "How are you today?" Temanmu akan menjawab: "I am fine, thank you! How about you?"',
                visual: '🤝 "Hello! How are you?" ➔ 😊 "I am happy and great!"'
            }
        ]
    },
    {
        id: 'en-shapes',
        icon: '🔺',
        theme: 'blue',
        category: 'shapes',
        tag: 'Level 3–4 (Usia 8–10 Thn)',
        title: 'Shapes & The World Around Us',
        summary: 'Mengenal bentuk segitiga, lingkaran, persegi, bintang, dan hati di lingkungan sekitarmu.',
        tips: 'Circle itu bundar tanpa sudut. Triangle memiliki 3 sudut (Tri = tiga). Square punya 4 sisi sama panjang!',
        flashcards: [
            { word: 'Circle', pron: 'Ser-kel', meaning: 'Lingkaran 🔴', emoji: '🔴' },
            { word: 'Square', pron: 'Skwer', meaning: 'Persegi 🟦', emoji: '🟦' },
            { word: 'Triangle', pron: 'Trai-eng-gel', meaning: 'Segitiga 🔺', emoji: '🔺' },
            { word: 'Rectangle', pron: 'Rek-teng-gel', meaning: 'Persegi Panjang ▭', emoji: '▭' },
            { word: 'Star', pron: 'Star', meaning: 'Bintang ⭐', emoji: '⭐' },
            { word: 'Heart', pron: 'Hart', meaning: 'Hati ❤️', emoji: '❤️' },
            { word: 'Diamond', pron: 'Dai-mend', meaning: 'Belah Ketupat 💎', emoji: '💎' }
        ],
        content: [
            {
                heading: '4 Bentuk Geometri Utama (Main Shapes)',
                text: 'Circle (lingkaran 🔴), Square (persegi empat 🟦), Triangle (segitiga 🔺), dan Rectangle (persegi panjang ▭).',
                visual: '🔴 Circle (Roda) | 🟦 Square (Dadu) | 🔺 Triangle (Pizza) | ▭ Rectangle (Pintu)'
            },
            {
                heading: 'Detektif Bentuk di Rumah',
                text: 'Jam dinding berbentuk Circle! Potongan pizza berbentuk Triangle! Layar TV berbentuk Rectangle!',
                visual: '🕒 "The clock is a circle!" | 🍕 "The slice is a triangle!"'
            }
        ]
    },
    {
        id: 'en-math-operations',
        icon: '📐',
        theme: 'purple',
        category: 'conversation',
        tag: 'Level 4 (Usia 9–10 Thn)',
        title: 'Math in English (Plus & Minus)',
        summary: 'Menggabungkan bahasa Inggris dan berhitung: penjumlahan dan pengurangan dalam kalimat bahasa Inggris!',
        tips: 'Tanda tambah (+) dibaca "Plus", tanda kurang (-) dibaca "Minus", dan tanda sama dengan (=) dibaca "Equals"!',
        flashcards: [
            { word: 'Plus', pron: 'Plas', meaning: 'Tambah (+) ➕', emoji: '➕' },
            { word: 'Minus', pron: 'Mai-nes', meaning: 'Kurang (-) ➖', emoji: '➖' },
            { word: 'Equals', pron: 'I-kwels', meaning: 'Sama Dengan (=) 🟰', emoji: '🟰' },
            { word: 'Number', pron: 'Nam-ber', meaning: 'Angka 🔢', emoji: '🔢' },
            { word: 'Count', pron: 'Kaunt', meaning: 'Menghitung 🖐️', emoji: '🖐️' },
            { word: 'Total', pron: 'To-tel', meaning: 'Jumlah Total 🎯', emoji: '🎯' },
            { word: 'Math', pron: 'Met', meaning: 'Matematika 🧮', emoji: '🧮' }
        ],
        content: [
            {
                heading: 'Penjumlahan Bahasa Inggris (Addition)',
                text: 'Cara membaca "2 + 3 = 5": "Two plus three equals five!". Sangat keren dan mudah diucapkan!',
                visual: '2️⃣ + 3️⃣ = 5️⃣ ➔ "Two plus three equals five!"'
            },
            {
                heading: 'Pengurangan Bahasa Inggris (Subtraction)',
                text: 'Cara membaca "7 - 4 = 3": "Seven minus four equals three!".',
                visual: '7️⃣ - 4️⃣ = 3️⃣ ➔ "Seven minus four equals three!"'
            },
            {
                heading: 'Tantangan Menghitung Cepat',
                text: 'Coba jawab ini dalam bahasa Inggris: "What is four plus four?" Jawabannya: "Four plus four equals eight!"',
                visual: '4️⃣ + 4️⃣ = 8️⃣ ➔ "Eight! You are a Math Champion!" 🏆'
            }
        ]
    },
    {
        id: 'en-body-action',
        icon: '🏃‍♂️',
        theme: 'coral',
        category: 'daily',
        tag: 'Level 2–4 (Usia 7–10 Thn)',
        title: 'My Body & Action Verbs',
        summary: 'Mengenal anggota tubuh (mata, telinga, tangan, kaki) dan kata kerja aksi ceria (lompat, tepuk tangan, senyum).',
        tips: 'Ingat lagu ceria: "Head, shoulders, knees and toes, knees and toes!" sambil memegang bagian tubuhmu.',
        flashcards: [
            { word: 'Eyes', pron: 'Aiz', meaning: 'Mata 👀', emoji: '👀' },
            { word: 'Ears', pron: 'Irz', meaning: 'Telinga 👂', emoji: '👂' },
            { word: 'Nose', pron: 'Nouz', meaning: 'Hidung 👃', emoji: '👃' },
            { word: 'Mouth', pron: 'Maut', meaning: 'Mulut 👄', emoji: '👄' },
            { word: 'Hands', pron: 'Hendz', meaning: 'Tangan ✋', emoji: '✋' },
            { word: 'Feet', pron: 'Fit', meaning: 'Kaki 🦶', emoji: '🦶' },
            { word: 'Jump', pron: 'Jamp', meaning: 'Melompat 🦘', emoji: '🦘' },
            { word: 'Smile', pron: 'Smail', meaning: 'Tersenyum 😊', emoji: '😊' }
        ],
        content: [
            {
                heading: 'Bagian Wajah & Tubuh Kita',
                text: 'Dua mata untuk melihat: Two eyes 👀. Dua telinga untuk mendengar: Two ears 👂. Satu hidung untuk bernapas: One nose 👃.',
                visual: '👀 Eyes (Mata) | 👂 Ears (Telinga) | 👃 Nose (Hidung) | 👄 Mouth (Mulut)'
            },
            {
                heading: 'Gerakan Ceria (Action Verbs)',
                text: 'Mari bergerak: "Clap your hands!" (Tepuk tanganmu 👏), "Jump high!" (Lompat tinggi 🦘), dan "Smile big!" (Tersenyumlah lebar 😊).',
                visual: '👏 Clap! ➔ 🦘 Jump! ➔ 🏃 Run! ➔ 😊 Smile!'
            }
        ]
    }
];

/* ══════════════════════════════════════════════════════════════
   6. BANK SOAL LENGKAP (16 Soal)
   ══════════════════════════════════════════════════════════════ */
const questionBank = {
    'learn-numbers': {
        title: 'Learn Numbers',
        subtitle: 'Penjumlahan Ceria',
        icon: '123',
        color: '#3A86FF',
        questions: [
            {
                id: 1, type: 'PENJUMLAHAN DASAR',
                question: '5 + 3 = ?',
                visual: '⭐⭐⭐⭐⭐ (5)  +  ⭐⭐⭐ (3)',
                options: [
                    { label: 'A', value: '7' },
                    { label: 'B', value: '8' },
                    { label: 'C', value: '9' }
                ],
                correct: '8',
                explanation: 'Lima ditambah tiga sama dengan delapan. 5 + 3 = 8! 🎉'
            },
            {
                id: 2, type: 'PENJUMLAHAN DASAR',
                question: '7 + 4 = ?',
                visual: '🔵🔵🔵🔵🔵🔵🔵 (7)  +  🔵🔵🔵🔵 (4)',
                options: [
                    { label: 'A', value: '10' },
                    { label: 'B', value: '11' },
                    { label: 'C', value: '12' }
                ],
                correct: '11',
                explanation: 'Tujuh ditambah empat sama dengan sebelas. 7 + 4 = 11! ✨'
            },
            {
                id: 3, type: 'PENJUMLAHAN CERITA',
                question: 'Ibu membeli 6 apel, lalu Ayah membawa 6 apel lagi. Berapa total apel?',
                visual: '🍎🍎🍎🍎🍎🍎  +  🍎🍎🍎🍎🍎🍎',
                options: [
                    { label: 'A', value: '10' },
                    { label: 'B', value: '12' },
                    { label: 'C', value: '14' }
                ],
                correct: '12',
                explanation: 'Enam ditambah enam adalah dua belas apel. 6 + 6 = 12! 🍎'
            }
        ]
    },
    'explore-shapes': {
        title: 'Explore Shapes',
        subtitle: 'Geometri & Bangun Datar',
        icon: '●▲',
        color: '#FF6B6B',
        questions: [
            {
                id: 4, type: 'GEOMETRI',
                question: 'Berapa jumlah sisi pada segitiga?',
                visual: '🔺 Segitiga',
                options: [
                    { label: 'A', value: '3' },
                    { label: 'B', value: '4' },
                    { label: 'C', value: '5' }
                ],
                correct: '3',
                explanation: 'Segitiga memiliki 3 sisi. Kata "segi-tiga" berarti tiga sisi! 🔺'
            },
            {
                id: 5, type: 'GEOMETRI',
                question: 'Bentuk apa yang memiliki 4 sisi sama panjang dan 4 sudut siku-siku?',
                visual: '⬜ Tebak Bentuknya!',
                options: [
                    { label: 'A', value: 'Segitiga' },
                    { label: 'B', value: 'Persegi' },
                    { label: 'C', value: 'Lingkaran' }
                ],
                correct: 'Persegi',
                explanation: 'Persegi punya 4 sisi sama panjang dan 4 sudut siku-siku! ⬜'
            },
            {
                id: 6, type: 'PENGAMATAN',
                question: 'Benda mana di bawah ini yang berbentuk lingkaran bundar?',
                visual: '🚲 Roda Sepeda  |  📺 Televisi  |  📦 Kotak Kardus',
                options: [
                    { label: 'A', value: 'Roda Sepeda' },
                    { label: 'B', value: 'Televisi' },
                    { label: 'C', value: 'Kotak Kardus' }
                ],
                correct: 'Roda Sepeda',
                explanation: 'Roda sepeda berbentuk lingkaran bundar agar bisa berputar lancar! 🚲'
            }
        ]
    },
    'solve-challenges': {
        title: 'Solve Challenges',
        subtitle: 'Pengurangan & Logika',
        icon: '★',
        color: '#FFBE0B',
        questions: [
            {
                id: 7, type: 'PENGURANGAN',
                question: '15 - 7 = ?',
                visual: '🍎🍎🍎🍎🍎🍎🍎🍎🍎🍎🍎🍎🍎🍎🍎 ambil 7',
                options: [
                    { label: 'A', value: '7' },
                    { label: 'B', value: '8' },
                    { label: 'C', value: '9' }
                ],
                correct: '8',
                explanation: 'Lima belas dikurangi tujuh sama dengan delapan. 15 - 7 = 8! 🍎'
            },
            {
                id: 8, type: 'LOGIKA CERITA',
                question: 'Ani punya 12 kelereng. Dia berikan 5 ke Budi. Berapa sisa kelereng Ani?',
                visual: '🔮 12 kelereng → berikan 5',
                options: [
                    { label: 'A', value: '5' },
                    { label: 'B', value: '7' },
                    { label: 'C', value: '8' }
                ],
                correct: '7',
                explanation: '12 dikurangi 5 sama dengan 7 kelereng tersisa! 12 - 5 = 7 🔮'
            },
            {
                id: 9, type: 'PENGURANGAN',
                question: '20 - 9 = ?',
                visual: '20 kue dikurangi 9 kue',
                options: [
                    { label: 'A', value: '11' },
                    { label: 'B', value: '12' },
                    { label: 'C', value: '9' }
                ],
                correct: '11',
                explanation: '20 dikurangi 9 hasilnya adalah 11! 20 - 9 = 11 ✨'
            }
        ]
    },
    'daily-quiz': {
        title: 'Daily Math Quiz',
        subtitle: 'Perkalian & Kelipatan',
        icon: '⏱',
        color: '#3A86FF',
        questions: [
            {
                id: 10, type: 'PERKALIAN',
                question: '3 × 4 = ?',
                visual: '🟢🟢🟢 × 4 kelompok (4 + 4 + 4)',
                options: [
                    { label: 'A', value: '10' },
                    { label: 'B', value: '12' },
                    { label: 'C', value: '14' }
                ],
                correct: '12',
                explanation: 'Tiga dikali empat sama dengan dua belas. 3 × 4 = 12! 🟢'
            },
            {
                id: 11, type: 'PERKALIAN',
                question: '6 × 2 = ?',
                visual: '🟡🟡🟡🟡🟡🟡 × 2 kelompok (6 + 6)',
                options: [
                    { label: 'A', value: '10' },
                    { label: 'B', value: '12' },
                    { label: 'C', value: '14' }
                ],
                correct: '12',
                explanation: 'Enam dikali dua sama dengan dua belas. 6 × 2 = 12! 🟡'
            },
            {
                id: 12, type: 'PERKALIAN',
                question: '5 × 3 = ?',
                visual: '5 kelompok berisi masing-masing 3 bintang ⭐',
                options: [
                    { label: 'A', value: '15' },
                    { label: 'B', value: '18' },
                    { label: 'C', value: '20' }
                ],
                correct: '15',
                explanation: 'Lima dikali tiga sama dengan lima belas. 5 × 3 = 15! ⭐'
            }
        ]
    },
    'pattern-matching': {
        title: 'Pattern Matching',
        subtitle: 'Pola & Urutan',
        icon: '▲●▲',
        color: '#FF6B6B',
        questions: [
            {
                id: 13, type: 'POLA ANGKA',
                question: '2, 4, 6, 8, ... ?',
                visual: '🔢 Temukan angka berikutnya (Loncat 2)!',
                options: [
                    { label: 'A', value: '9' },
                    { label: 'B', value: '10' },
                    { label: 'C', value: '12' }
                ],
                correct: '10',
                explanation: 'Polanya bertambah 2! 2→4→6→8→10. Jawabannya 10! 🔢'
            },
            {
                id: 14, type: 'POLA ANGKA',
                question: '1, 3, 5, 7, ... ?',
                visual: '🔢 Angka ganjil berurutan bertambah 2!',
                options: [
                    { label: 'A', value: '8' },
                    { label: 'B', value: '9' },
                    { label: 'C', value: '11' }
                ],
                correct: '9',
                explanation: 'Polanya bertambah 2! 1→3→5→7→9. Jawabannya 9! 🎯'
            }
        ]
    },
    'fun-measurement': {
        title: 'Fun Measurement',
        subtitle: 'Pengukuran & Waktu',
        icon: '📏',
        color: '#FFBE0B',
        questions: [
            {
                id: 15, type: 'PENGUKURAN',
                question: 'Mana yang lebih panjang?',
                visual: '📏 50 cm  vs  1 meter (100 cm)',
                options: [
                    { label: 'A', value: '50 cm' },
                    { label: 'B', value: '1 meter' },
                    { label: 'C', value: 'Sama saja' }
                ],
                correct: '1 meter',
                explanation: '1 meter = 100 cm, jadi 1 meter lebih panjang dari 50 cm! 📏'
            },
            {
                id: 16, type: 'WAKTU',
                question: '1 jam sama dengan berapa menit?',
                visual: '⏰ Putaran jarum jam panjang satu putaran penuh',
                options: [
                    { label: 'A', value: '30 menit' },
                    { label: 'B', value: '60 menit' },
                    { label: 'C', value: '100 menit' }
                ],
                correct: '60 menit',
                explanation: '1 jam = 60 menit! Jarum panjang berputar 60 menit untuk 1 jam penuh ⏰'
            }
        ]
    },
    'division-basics': {
        title: 'Division Basics',
        subtitle: 'Pembagian Ceria',
        icon: '➗',
        color: '#3A86FF',
        questions: [
            {
                id: 17, type: 'PEMBAGIAN RATA',
                question: '12 butir permen dibagikan rata ke 3 kantong. Berapa permen di setiap kantong?',
                visual: '🍬🍬🍬🍬🍬🍬🍬🍬🍬🍬🍬🍬 (12 Permen) ÷ 3 Kantong',
                options: [
                    { label: 'A', value: '3 permen' },
                    { label: 'B', value: '4 permen' },
                    { label: 'C', value: '5 permen' }
                ],
                correct: '4 permen',
                explanation: '12 dibagi 3 sama dengan 4. Setiap kantong berisi 4 permen manis! 🍬'
            },
            {
                id: 18, type: 'PEMBAGIAN CEPAT',
                question: '20 ÷ 4 = ?',
                visual: '🍎🍎🍎🍎🍎 × 4 baris = 20 Apel',
                options: [
                    { label: 'A', value: '4' },
                    { label: 'B', value: '5' },
                    { label: 'C', value: '6' }
                ],
                correct: '5',
                explanation: '20 dibagi 4 adalah 5, karena 5 × 4 = 20! 🎉'
            }
        ]
    },
    'fractions-fun': {
        title: 'Fractions Fun',
        subtitle: 'Pecahan Seru & Lezat',
        icon: '🍕',
        color: '#FF6B6B',
        questions: [
            {
                id: 19, type: 'PECAHAN DASAR',
                question: 'Satu loyang pizza dipotong menjadi 4 bagian sama besar. Berapa nilai 1 potong pizza itu?',
                visual: '🍕 1 potong diambil dari total 4 potong pizza',
                options: [
                    { label: 'A', value: '½' },
                    { label: 'B', value: '¼' },
                    { label: 'C', value: '⅓' }
                ],
                correct: '¼',
                explanation: '1 potong dari total 4 potong disebut seperempat atau 1/4! 🍕'
            },
            {
                id: 20, type: 'MEMBANDINGKAN PECAHAN',
                question: 'Manakah potongan kue yang ukurannya LEBIH BESAR?',
                visual: '🍰 ½ potong kue vs 🍰 ¼ potong kue',
                options: [
                    { label: 'A', value: '½ bagian' },
                    { label: 'B', value: '¼ bagian' },
                    { label: 'C', value: 'Sama besar' }
                ],
                correct: '½ bagian',
                explanation: 'Setengah (1/2) lebih besar daripada seperempat (1/4) karena kuenya hanya dibagi dua! 🍰'
            }
        ]
    },
    'money-math': {
        title: 'Money Math',
        subtitle: 'Uang & Belanja Pintar',
        icon: '🪙',
        color: '#FFBE0B',
        questions: [
            {
                id: 21, type: 'HITUNG BELANJA',
                question: 'Budi membeli pensil Rp2.000 dan penghapus Rp1.000. Berapa total belanjaan Budi?',
                visual: '✏️ Rp2.000  +  🧼 Rp1.000  =  🧾 ?',
                options: [
                    { label: 'A', value: 'Rp2.500' },
                    { label: 'B', value: 'Rp3.000' },
                    { label: 'C', value: 'Rp4.000' }
                ],
                correct: 'Rp3.000',
                explanation: 'Rp2.000 + Rp1.000 = Rp3.000! Hebat, kamu pintar berbelanja! 🪙'
            },
            {
                id: 22, type: 'UANG KEMBALIAN',
                question: 'Kamu membayar buku Rp7.000 dengan selembar uang Rp10.000. Berapa kembalianmu?',
                visual: '💵 Rp10.000  -  📘 Rp7.000  =  🪙 ?',
                options: [
                    { label: 'A', value: 'Rp2.000' },
                    { label: 'B', value: 'Rp3.000' },
                    { label: 'C', value: 'Rp4.000' }
                ],
                correct: 'Rp3.000',
                explanation: '10.000 - 7.000 = Rp3.000 kembalianmu. Jangan lupa simpan uangnya di celengan ya! 🐷'
            }
        ]
    },
    '3d-shapes': {
        title: '3D Shapes',
        subtitle: 'Bangun Ruang 3D',
        icon: '🧊',
        color: '#3A86FF',
        questions: [
            {
                id: 23, type: 'TEBAK BENTUK RUANG',
                question: 'Benda manakah di bawah ini yang berbentuk KUBUS?',
                visual: '🎲 Dadu  vs  ⚽ Bola  vs  🥫 Kaleng',
                options: [
                    { label: 'A', value: 'Bola tendang' },
                    { label: 'B', value: 'Dadu permainan' },
                    { label: 'C', value: 'Kaleng susu' }
                ],
                correct: 'Dadu permainan',
                explanation: 'Dadu permainan berbentuk kubus dengan 6 sisi persegi yang sama besar! 🎲'
            },
            {
                id: 24, type: 'CIRI BANGUN RUANG',
                question: 'Berapa banyak titik sudut pojok pada sebuah KUBUS?',
                visual: '🧊 Hitung semua titik pojok kubus',
                options: [
                    { label: 'A', value: '6 sudut' },
                    { label: 'B', value: '8 sudut' },
                    { label: 'C', value: '12 sudut' }
                ],
                correct: '8 sudut',
                explanation: 'Kubus memiliki 8 titik sudut pojok dan 12 rusuk garis tepi! 🧊'
            }
        ]
    },
    'data-charts': {
        title: 'Data & Charts',
        subtitle: 'Diagram & Piktogram',
        icon: '📊',
        color: '#FF6B6B',
        questions: [
            {
                id: 25, type: 'PIKTOGRAM',
                question: 'Pada piktogram: 🐱🐱🐱🐱. Jika 1 gambar 🐱 = 2 kucing, berapa total kucing?',
                visual: '🐱 = 2 kucing | Ada 4 gambar kucing ceria',
                options: [
                    { label: 'A', value: '6 kucing' },
                    { label: 'B', value: '8 kucing' },
                    { label: 'C', value: '10 kucing' }
                ],
                correct: '8 kucing',
                explanation: '4 gambar × 2 kucing = 8 ekor kucing lucu! Meoww! 🐱'
            },
            {
                id: 26, type: 'DIAGRAM BATANG',
                question: 'Data warna favorit: Merah (5 anak), Biru (9 anak), Kuning (4 anak). Warna apa yang paling disukai?',
                visual: '📊 Merah: 5 | Biru: 9 | Kuning: 4',
                options: [
                    { label: 'A', value: 'Merah' },
                    { label: 'B', value: 'Biru' },
                    { label: 'C', value: 'Kuning' }
                ],
                correct: 'Biru',
                explanation: 'Warna Biru memiliki angka tertinggi (9 anak), jadi Biru yang paling populer! 🎨'
            }
        ]
    },
    'math-tricks': {
        title: 'Math Tricks',
        subtitle: 'Trik Mental Math Ajaib',
        icon: '✨',
        color: '#FFBE0B',
        questions: [
            {
                id: 27, type: 'TRIK CEPAT +9',
                question: 'Gunakan trik cepat: 45 + 9 = ? (Trik: 45 + 10 - 1)',
                visual: '🧠 45 + 10 = 55 ➔ 55 - 1 = ?',
                options: [
                    { label: 'A', value: '53' },
                    { label: 'B', value: '54' },
                    { label: 'C', value: '56' }
                ],
                correct: '54',
                explanation: '45 + 10 = 55, lalu dikurangi 1 = 54. Trik kilat yang ajaib! ✨'
            },
            {
                id: 28, type: 'TRIK JARI PERKALIAN 9',
                question: 'Berapakah hasil dari 9 × 4 menggunakan trik 10 jari tangan?',
                visual: '🖐️ Tekuk jari ke-4: di kiri ada 3 jari, di kanan ada 6 jari!',
                options: [
                    { label: 'A', value: '34' },
                    { label: 'B', value: '36' },
                    { label: 'C', value: '45' }
                ],
                correct: '36',
                explanation: '3 jari puluhan dan 6 jari satuan = 36! 9 × 4 = 36! 🎉'
            }
        ]
    },
    'en-alphabet': {
        title: 'Alphabet & Phonics',
        subtitle: 'Huruf & Bunyi Vokal Ajaib',
        icon: '🔤',
        color: '#FF6B6B',
        questions: [
            {
                id: 101, type: 'HURUF AWAL',
                question: 'Huruf apakah yang mengawali kata "Apple" 🍎?',
                visual: '🍎 _ p p l e',
                options: [
                    { label: 'A', value: 'A' },
                    { label: 'B', value: 'B' },
                    { label: 'C', value: 'C' }
                ],
                correct: 'A',
                explanation: 'A for Apple! Bunyi foniknya adalah /æ/. Hebat! 🍎'
            },
            {
                id: 102, type: 'VOKAL AJAIB',
                question: 'Manakah di bawah ini yang merupakan huruf vokal ajaib (vowel)?',
                visual: 'A • E • I • O • U',
                options: [
                    { label: 'A', value: 'E' },
                    { label: 'B', value: 'K' },
                    { label: 'C', value: 'P' }
                ],
                correct: 'E',
                explanation: 'Huruf E adalah salah satu dari 5 vokal ajaib: A, E, I, O, U! ✨'
            }
        ]
    },
    'en-first-words': {
        title: 'First Words',
        subtitle: 'Kata-Kata Sakti Bahasa Inggris',
        icon: '✨',
        color: '#FFBE0B',
        questions: [
            {
                id: 103, type: 'SIGHT WORD',
                question: 'Arti dari kalimat "I see a star" adalah...',
                visual: '👀 "I see a star" ⭐',
                options: [
                    { label: 'A', value: 'Saya melihat bintang' },
                    { label: 'B', value: 'Saya suka bintang' },
                    { label: 'C', value: 'Saya makan bintang' }
                ],
                correct: 'Saya melihat bintang',
                explanation: 'I (Saya) see (melihat) a star (sebuah bintang)! Luar biasa! ⭐'
            }
        ]
    },
    'en-numbers': {
        title: 'Numbers 1 to 20',
        subtitle: 'Berhitung Angka Bahasa Inggris',
        icon: '🔢',
        color: '#3A86FF',
        questions: [
            {
                id: 104, type: 'TEBAK ANGKA',
                question: 'Berapakah bahasa Inggris dari angka 7️⃣?',
                visual: '7️⃣ = ?',
                options: [
                    { label: 'A', value: 'Five' },
                    { label: 'B', value: 'Seven' },
                    { label: 'C', value: 'Nine' }
                ],
                correct: 'Seven',
                explanation: 'Angka 7 adalah "Seven" /se-ven/! Hebat! 7️⃣'
            },
            {
                id: 105, type: 'HITUNG BALON',
                question: 'Ada 4 balon merah 🎈🎈🎈🎈. Dalam bahasa Inggris kita sebut...',
                visual: '🎈🎈🎈🎈',
                options: [
                    { label: 'A', value: 'Three balloons' },
                    { label: 'B', value: 'Four balloons' },
                    { label: 'C', value: 'Five balloons' }
                ],
                correct: 'Four balloons',
                explanation: 'Ada 4 balon, jadi "Four balloons"! 🎈'
            }
        ]
    },
    'en-colors': {
        title: 'Rainbow Colors',
        subtitle: 'Warna-Warni Pelangi',
        icon: '🌈',
        color: '#FFBE0B',
        questions: [
            {
                id: 106, type: 'TEBAK WARNA',
                question: 'Warna buah pisang matang (Banana 🍌) adalah...',
                visual: '🍌 Yellow Banana',
                options: [
                    { label: 'A', value: 'Yellow' },
                    { label: 'B', value: 'Red' },
                    { label: 'C', value: 'Blue' }
                ],
                correct: 'Yellow',
                explanation: 'Pisang matang berwarna kuning yaitu "Yellow" /ye-low/! 🍌'
            }
        ]
    },
    'en-animals': {
        title: 'Zoo Animals',
        subtitle: 'Satwa & Hewan Lucu',
        icon: '🦁',
        color: '#FF6B6B',
        questions: [
            {
                id: 107, type: 'TEBAK HEWAN',
                question: 'Hewan apakah yang berbunyi "Meoww"? 🐱',
                visual: '🐱 Meoww!',
                options: [
                    { label: 'A', value: 'Cat' },
                    { label: 'B', value: 'Dog' },
                    { label: 'C', value: 'Lion' }
                ],
                correct: 'Cat',
                explanation: 'Kucing dalam bahasa Inggris adalah "Cat"! 🐱'
            }
        ]
    },
    'en-fruits-food': {
        title: 'Fruits & Food',
        subtitle: 'Buah & Makanan Sehat',
        icon: '🍎',
        color: '#3A86FF',
        questions: [
            {
                id: 108, type: 'BUAH SEHAT',
                question: 'Apa bahasa Inggris dari buah apel merah 🍎?',
                visual: '🍎 Red Fruit',
                options: [
                    { label: 'A', value: 'Apple' },
                    { label: 'B', value: 'Orange' },
                    { label: 'C', value: 'Banana' }
                ],
                correct: 'Apple',
                explanation: 'Apel dalam bahasa Inggris adalah "Apple"! 🍎'
            }
        ]
    },
    'en-school': {
        title: 'School Items',
        subtitle: 'Perlengkapan Sekolah',
        icon: '🎒',
        color: '#8338EC',
        questions: [
            {
                id: 109, type: 'ALAT TULIS',
                question: 'Alat yang kita gunakan untuk menulis di buku ✏️ adalah...',
                visual: '✏️ Writing tool',
                options: [
                    { label: 'A', value: 'Pencil' },
                    { label: 'B', value: 'Eraser' },
                    { label: 'C', value: 'Ruler' }
                ],
                correct: 'Pencil',
                explanation: 'Pensil adalah "Pencil" /pen-sil/! ✏️'
            }
        ]
    },
    'en-family': {
        title: 'My Family',
        subtitle: 'Keluarga Tercinta',
        icon: '👨‍👩‍👧',
        color: '#FFBE0B',
        questions: [
            {
                id: 110, type: 'KELUARGA',
                question: 'Sebutan bahasa Inggris untuk Ibu tersayang 👩 adalah...',
                visual: '👩 Beloved Mother',
                options: [
                    { label: 'A', value: 'Mother' },
                    { label: 'B', value: 'Father' },
                    { label: 'C', value: 'Brother' }
                ],
                correct: 'Mother',
                explanation: 'Ibu adalah "Mother" atau "Mom"! 👩❤️'
            }
        ]
    },
    'en-greetings': {
        title: 'Daily Greetings',
        subtitle: 'Sapaan Ramah & Sopan',
        icon: '👋',
        color: '#FF6B6B',
        questions: [
            {
                id: 111, type: 'SAPAAN PAGI',
                question: 'Saat matahari terbit di pagi hari 🌅, sapaan yang tepat adalah...',
                visual: '🌅 Morning Sun',
                options: [
                    { label: 'A', value: 'Good morning' },
                    { label: 'B', value: 'Good night' },
                    { label: 'C', value: 'Goodbye' }
                ],
                correct: 'Good morning',
                explanation: 'Selamat pagi adalah "Good morning"! 🌅'
            }
        ]
    },
    'en-shapes': {
        title: 'Shapes in English',
        subtitle: 'Bentuk Bangun Datar',
        icon: '🔺',
        color: '#3A86FF',
        questions: [
            {
                id: 112, type: 'TEBAK BENTUK',
                question: 'Bentuk lingkaran sempurna seperti bola dan donat 🍩 adalah...',
                visual: '🔴 Round shape',
                options: [
                    { label: 'A', value: 'Circle' },
                    { label: 'B', value: 'Triangle' },
                    { label: 'C', value: 'Square' }
                ],
                correct: 'Circle',
                explanation: 'Lingkaran adalah "Circle" /ser-kel/! 🔴'
            }
        ]
    },
    'en-math-operations': {
        title: 'Math in English',
        subtitle: 'Operasi Hitung Bahasa Inggris',
        icon: '📐',
        color: '#8338EC',
        questions: [
            {
                id: 113, type: 'MATH IN ENGLISH',
                question: 'Bagaimana cara membaca "3 + 2 = 5" dalam bahasa Inggris?',
                visual: '3️⃣ + 2️⃣ = 5️⃣',
                options: [
                    { label: 'A', value: 'Three plus two equals five' },
                    { label: 'B', value: 'Three minus two equals five' },
                    { label: 'C', value: 'Three times two equals five' }
                ],
                correct: 'Three plus two equals five',
                explanation: '3 (Three) + (plus) 2 (two) = (equals) 5 (five)! Luar biasa pintarnya! 🎉'
            }
        ]
    },
    'en-body-action': {
        title: 'My Body & Action',
        subtitle: 'Tubuh & Gerak Aktif',
        icon: '🏃‍♂️',
        color: '#FF6B6B',
        questions: [
            {
                id: 114, type: 'ANGGOTA TUBUH',
                question: 'Bagian tubuh yang kita gunakan untuk melihat 👀 adalah...',
                visual: '👀 Looking tool',
                options: [
                    { label: 'A', value: 'Eyes' },
                    { label: 'B', value: 'Ears' },
                    { label: 'C', value: 'Nose' }
                ],
                correct: 'Eyes',
                explanation: 'Mata adalah "Eyes" /aiz/! 👀'
            }
        ]
    }
};

/* ══════════════════════════════════════════════════════════════
   6B. DATA SILABUS KURSUS (Matematika & Bahasa Inggris Cilik)
   ══════════════════════════════════════════════════════════════ */
const syllabusData = {
    math: {
        id: 'math',
        title: 'Kursus Silabus Matematika Cilik Juara',
        subtitle: 'Kurikulum Berjenjang Usia 6–10 Tahun (SD Kelas 1–4)',
        badge: '🧮 Kursus Matematika',
        icon: '📐',
        theme: 'blue',
        duration: '16 Pekan Belajar',
        targetAge: 'Usia 6–10 Tahun',
        desc: 'Kurikulum terstruktur mulai dari berhitung jari dasar, operasi tambah-kurang-kali-bagi, logika pecahan pizza, hingga geometri 3D dan trik sulap berhitung.',
        levels: [
            {
                level: 1,
                name: 'Tingkat 1: Fondasi Angka & Berhitung Awal',
                age: 'Usia 6–7 Tahun (SD Kelas 1)',
                color: '#3A86FF',
                icon: '🌱',
                goal: 'Mengenal angka 1–50, berhitung maju-mundur menggunakan jari, konsep penjumlahan sederhana, dan mengenal bangun datar di sekitar rumah.',
                milestones: [
                    { week: 'Pekan 1–2', topic: 'Mengenal Angka 1-20 & Berhitung Jari', lessonId: 'learn-numbers', stars: 20, done: true },
                    { week: 'Pekan 3–4', topic: 'Trik Teman Sepuluh (1+9, 2+8, 3+7)', lessonId: 'learn-numbers', stars: 25, done: true },
                    { week: 'Pekan 5–6', topic: 'Segitiga, Persegi, dan Lingkaran 2D', lessonId: 'explore-shapes', stars: 30, done: false }
                ]
            },
            {
                level: 2,
                name: 'Tingkat 2: Petualangan Operasi Hitung (+ - × ÷)',
                age: 'Usia 7–8 Tahun (SD Kelas 2)',
                color: '#FF6B6B',
                icon: '⚡',
                goal: 'Pengurangan logika cerita, perkalian berulang dasar 1–5, pengenalan pecahan pizza 1/2 dan 1/4, serta membaca jarum jam dinding.',
                milestones: [
                    { week: 'Pekan 7–8', topic: 'Pengurangan Logika & Cerita Balon', lessonId: 'solve-challenges', stars: 30, done: false },
                    { week: 'Pekan 9–10', topic: 'Rahasia Perkalian Mudah (2 & 5)', lessonId: 'daily-quiz', stars: 35, done: false },
                    { week: 'Pekan 11–12', topic: 'Pecahan Seru ½, ⅓, ¼ Kue & Pizza', lessonId: 'fractions-fun', stars: 35, done: false }
                ]
            },
            {
                level: 3,
                name: 'Tingkat 3: Pengukuran Nyata, Uang & Geometri 3D',
                age: 'Usia 8–9 Tahun (SD Kelas 3)',
                color: '#FFBE0B',
                icon: '🚀',
                goal: 'Tabel perkalian 1–10 hingga 100, pembagian bagi-rata permen, kubus dadu & balok kardus, serta berbelanja uang rupiah di kantin sekolah.',
                milestones: [
                    { week: 'Pekan 13–14', topic: 'Tabel Perkalian 1–10 Hingga 100', lessonId: 'daily-quiz', stars: 40, done: false },
                    { week: 'Pekan 15–16', topic: 'Pembagian Adil & Bagi-Bagi Rata', lessonId: 'division-basics', stars: 40, done: false },
                    { week: 'Pekan 17–18', topic: 'Hitung Uang Rupiah & Kembalian', lessonId: 'money-math', stars: 45, done: false },
                    { week: 'Pekan 19–20', topic: 'Bangun Ruang 3D (Kubus, Balok, Bola)', lessonId: '3d-shapes', stars: 45, done: false }
                ]
            },
            {
                level: 4,
                name: 'Tingkat 4: Master Logika, Pola & Statistika Cilik',
                age: 'Usia 9–10 Tahun (SD Kelas 4)',
                color: '#8338EC',
                icon: '👑',
                goal: 'Membaca diagram batang & piktogram data, detektif pola loncat berulang, serta trik mental math sulap angka sembilan.',
                milestones: [
                    { week: 'Pekan 21–22', topic: 'Detektif Pola Bilangan & Warna', lessonId: 'pattern-matching', stars: 50, done: false },
                    { week: 'Pekan 23–24', topic: 'Membaca Diagram Batang & Piktogram', lessonId: 'data-charts', stars: 50, done: false },
                    { week: 'Pekan 25–26', topic: 'Trik Sulap Mental Math Kilat (+9)', lessonId: 'math-tricks', stars: 60, done: false }
                ]
            }
        ]
    },
    english: {
        id: 'english',
        title: 'Kursus Silabus Bahasa Inggris: Kids English Explorer',
        subtitle: 'Kurikulum Bahasa Inggris Komunikatif & Ceria untuk Anak SD (Usia 6–10 Tahun)',
        badge: '🇬🇧 Kursus Bahasa Inggris',
        icon: '🌍',
        theme: 'coral',
        duration: '16 Pekan Belajar',
        targetAge: 'Usia 6–10 Tahun',
        desc: 'Belajar kosakata harian bahasa Inggris, fonik pelafalan suara asli, berhitung angka dalam bahasa Inggris, warna pelangi, hingga percakapan ramah sehari-hari.',
        levels: [
            {
                level: 1,
                name: 'Level 1: Alphabet, Phonics & Magic Sounds',
                age: 'Usia 6–7 Tahun (Beginner)',
                color: '#FF6B6B',
                icon: '🔤',
                goal: 'Menguasai 26 huruf alfabet dalam bahasa Inggris, bunyi fonik pertama, dan kosakata benda kesukaan anak dengan audio pelafalan jelas.',
                flashcards: [
                    { word: 'Apple', pron: 'A-pel', meaning: 'Apel 🍎', emoji: '🍎' },
                    { word: 'Cat', pron: 'Kat', meaning: 'Kucing 🐱', emoji: '🐱' },
                    { word: 'Sun', pron: 'San', meaning: 'Matahari ☀️', emoji: '☀️' },
                    { word: 'Star', pron: 'Star', meaning: 'Bintang ⭐', emoji: '⭐' }
                ],
                milestones: [
                    { week: 'Pekan 1–2', topic: 'The Alphabet Song & Letter Sounds (A-M)', lessonId: 'en-alphabet', stars: 20, done: true },
                    { week: 'Pekan 3–4', topic: 'Letter Sounds (N-Z) & 5 Magic Vowels', lessonId: 'en-alphabet', stars: 25, done: false },
                    { week: 'Pekan 5–6', topic: 'First Words (Apple, Cat, Sun, Star)', lessonId: 'en-first-words', stars: 30, done: false }
                ]
            },
            {
                level: 2,
                name: 'Level 2: Numbers, Rainbow Colors & My Family',
                age: 'Usia 7–8 Tahun (Elementary 1)',
                color: '#3A86FF',
                icon: '🌈',
                goal: 'Menghitung numbers 1 to 20, menyebutkan warna pelangi dalam bahasa Inggris, dan memperkenalkan anggota keluarga tersayang.',
                flashcards: [
                    { word: 'Red', pron: 'Red', meaning: 'Merah 🔴', emoji: '🔴' },
                    { word: 'Blue', pron: 'Blu', meaning: 'Biru 🔵', emoji: '🔵' },
                    { word: 'Yellow', pron: 'Ye-low', meaning: 'Kuning 🟡', emoji: '🟡' },
                    { word: 'Seven', pron: 'Se-ven', meaning: 'Tujuh 7️⃣', emoji: '7️⃣' }
                ],
                milestones: [
                    { week: 'Pekan 7–8', topic: 'Numbers 1 to 20 & Counting Toys', lessonId: 'en-numbers', stars: 30, done: false },
                    { week: 'Pekan 9–10', topic: 'Rainbow Colors (Red, Blue, Green, Yellow)', lessonId: 'en-colors', stars: 35, done: false },
                    { week: 'Pekan 11–12', topic: 'My Family (Mom, Dad, Brother, Sister)', lessonId: 'en-family', stars: 35, done: false }
                ]
            },
            {
                level: 3,
                name: 'Level 3: Animals, Delicious Fruits & School Items',
                age: 'Usia 8–9 Tahun (Elementary 2)',
                color: '#FFBE0B',
                icon: '🦁',
                goal: 'Menyebutkan hewan kebun binatang, buah segar, dan perlengkapan sekolah seperti pencil, book, eraser, and backpack.',
                flashcards: [
                    { word: 'Lion', pron: 'Lai-en', meaning: 'Singa 🦁', emoji: '🦁' },
                    { word: 'Banana', pron: 'Be-ne-ne', meaning: 'Pisang 🍌', emoji: '🍌' },
                    { word: 'Pencil', pron: 'Pen-sil', meaning: 'Pensil ✏️', emoji: '✏️' },
                    { word: 'Book', pron: 'Buk', meaning: 'Buku 📘', emoji: '📘' }
                ],
                milestones: [
                    { week: 'Pekan 13–14', topic: 'Zoo & Farm Animals (Lion, Elephant, Bird)', lessonId: 'en-animals', stars: 40, done: false },
                    { week: 'Pekan 15–16', topic: 'Yummy Fruits & Foods (Banana, Milk, Bread)', lessonId: 'en-fruits-food', stars: 40, done: false },
                    { week: 'Pekan 17–18', topic: 'In My School Bag (Pencil, Book, Eraser)', lessonId: 'en-school', stars: 45, done: false }
                ]
            },
            {
                level: 4,
                name: 'Level 4: Daily Greetings & Math in English',
                age: 'Usia 9–10 Tahun (Advanced Kids)',
                color: '#06D6A0',
                icon: '🎓',
                goal: 'Percakapan sapaan sopan, perkenalan diri ramah, dan berhitung matematika dalam bahasa Inggris ("Three plus five equals eight!").',
                flashcards: [
                    { word: 'Good morning', pron: 'Gud mor-ning', meaning: 'Selamat pagi 🌅', emoji: '🌅' },
                    { word: 'Thank you', pron: 'Teng-kyu', meaning: 'Terima kasih 🙏', emoji: '🙏' },
                    { word: 'Triangle', pron: 'Trai-eng-gel', meaning: 'Segitiga 🔺', emoji: '🔺' },
                    { word: 'Circle', pron: 'Ser-kel', meaning: 'Lingkaran 🔴', emoji: '🔴' }
                ],
                milestones: [
                    { week: 'Pekan 19–20', topic: 'Daily Greetings ("Hello! How are you?")', lessonId: 'en-greetings', stars: 50, done: false },
                    { week: 'Pekan 21–22', topic: 'Shapes in English (Circle, Square, Triangle)', lessonId: 'en-shapes', stars: 50, done: false },
                    { week: 'Pekan 23–24', topic: 'Math in English ("Five plus five is ten!")', lessonId: 'en-math-operations', stars: 60, done: false }
                ]
            }
        ]
    }
};

/* ══════════════════════════════════════════════════════════════
   7. ACTIVITY CARDS DATA
   ══════════════════════════════════════════════════════════════ */
const activityCards = [
    {
        id: 1, icon: '123', badge: 'Populer', badgeStyle: 'badge-yellow',
        title: '1. Learn Numbers', categoryKey: 'learn-numbers',
        desc: 'Master basic addition with fingers and stars! Belajar penjumlahan ceria.',
        level: 'Tingkat: Dasar (6–7 Thn)', theme: 'blue', btnStyle: 'btn-yellow'
    },
    {
        id: 2, icon: '●▲', badge: 'Geometri', badgeStyle: 'badge-translucent',
        title: '2. Explore Shapes', categoryKey: 'explore-shapes',
        desc: 'Find triangles, circles and squares! Kenali bentuk seru di sekitarmu.',
        level: 'Tingkat: Eksplorasi', theme: 'coral', btnStyle: 'btn-white'
    },
    {
        id: 3, icon: '★', badge: 'Teka-teki', badgeStyle: 'badge-dark',
        title: '3. Solve Challenges', categoryKey: 'solve-challenges',
        desc: 'Subtraction adventures! Pengurangan dan puzzle matematika ceria.',
        level: 'Tingkat: Sedang (8–9 Thn)', theme: 'yellow', btnStyle: 'btn-blue'
    },
    {
        id: 4, icon: '⏱', badge: 'Bonus Harian', badgeStyle: 'badge-green',
        title: '4. Daily Math Quiz', categoryKey: 'daily-quiz',
        desc: 'Multiplication made easy! Rahasia perkalian cepat berhadiah bintang.',
        level: 'Hadiah: +20 Bintang', theme: 'blue', btnStyle: 'btn-yellow'
    },
    {
        id: 5, icon: '▲●▲', badge: 'Logika', badgeStyle: 'badge-translucent',
        title: '5. Pattern Matching', categoryKey: 'pattern-matching',
        desc: 'Crack the mystery sequence! Tebak pola barisan angka dan warna.',
        level: 'Tingkat: Pengamatan', theme: 'coral', btnStyle: 'btn-white'
    },
    {
        id: 6, icon: '📏', badge: 'Pengukuran', badgeStyle: 'badge-coral',
        title: '6. Fun Measurement', categoryKey: 'fun-measurement',
        desc: 'Measure lengths, weights & clocks! Pengukuran dan membaca jam.',
        level: 'Tingkat: Pengukuran', theme: 'yellow', btnStyle: 'btn-blue'
    }
];

/* ══════════════════════════════════════════════════════════════
   8. MINI GAME POOL
   ══════════════════════════════════════════════════════════════ */
const speedGamePool = [
    { text: '3 + 4 = 7', isTrue: true },
    { text: '5 + 5 = 11', isTrue: false },
    { text: '10 - 4 = 6', isTrue: true },
    { text: '2 × 3 = 8', isTrue: false },
    { text: '8 + 2 = 10', isTrue: true },
    { text: '7 - 3 = 5', isTrue: false },
    { text: '3 × 3 = 9', isTrue: true },
    { text: '12 - 6 = 6', isTrue: true },
    { text: '4 + 6 = 9', isTrue: false },
    { text: '5 × 2 = 10', isTrue: true },
    { text: '15 - 5 = 9', isTrue: false },
    { text: '6 + 7 = 13', isTrue: true }
];

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT: APP
   ══════════════════════════════════════════════════════════════ */
export default function App() {
    const [page, setPage] = useState('home');
    const [stars, setStars] = useState(120);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [topicFilter, setTopicFilter] = useState('all');
    const [userAvatar, setUserAvatar] = useState('🚀');
    const [streakCount, setStreakCount] = useState(3);

    /* ── State Kuis ── */
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [starsEarned, setStarsEarned] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [quizTimer, setQuizTimer] = useState(45);
    const [totalQuizTime, setTotalQuizTime] = useState(0);

    /* ── State Materi ── */
    const [lessonSubject, setLessonSubject] = useState('math'); // 'math' | 'english'
    const [activeLessonId, setActiveLessonId] = useState('learn-numbers');
    const [multTableNumber, setMultTableNumber] = useState(3);
    const [showPythagorasModal, setShowPythagorasModal] = useState(false);
    const [selectedGridCell, setSelectedGridCell] = useState({ r: 5, c: 5 });
    const [lessonFilter, setLessonFilter] = useState('all');
    const [lessonSearch, setLessonSearch] = useState('');
    const [completedLessons, setCompletedLessons] = useState(['learn-numbers']);
    const [pizzaSlices, setPizzaSlices] = useState(4);
    const [cashierTotal, setCashierTotal] = useState(0);

    /* ── State Mini Game ── */
    const [speedActive, setSpeedActive] = useState(false);
    const [speedTimer, setSpeedTimer] = useState(30);
    const [speedScore, setSpeedScore] = useState(0);
    const [speedCombo, setSpeedCombo] = useState(0);
    const [speedQIndex, setSpeedQIndex] = useState(0);
    const [speedGameOver, setSpeedGameOver] = useState(false);

    /* ── State Roda Hadiah Carnival Ajaib ── */
    const [showSpinModal, setShowSpinModal] = useState(false);
    const [isSpinning, setIsSpinning] = useState(false);
    const [spinResultSlice, setSpinResultSlice] = useState(null);
    const [wheelAngle, setWheelAngle] = useState(0);
    const [spinTickets, setSpinTickets] = useState(3);

    /* ── State Peti Harta Karun ── */
    const [chestOpened, setChestOpened] = useState(false);

    /* ── State Maskot Koko ── */
    const [kokoQuoteIndex, setKokoQuoteIndex] = useState(0);
    const [showKokoBubble, setShowKokoBubble] = useState(true);

    /* ── State Teka-Teki Misteri ── */
    const [riddleSolved, setRiddleSolved] = useState(false);

    /* ── State Orang Tua ── */
    const [quizzesCompleted, setQuizzesCompleted] = useState(3);
    const [screenTimeLimit, setScreenTimeLimit] = useState(30);

    /* ── State Silabus Kursus ── */
    const [syllabusTrack, setSyllabusTrack] = useState('math'); // 'math' | 'english'
    const [activeSyllabusLevel, setActiveSyllabusLevel] = useState(1);
    const [speakingWord, setSpeakingWord] = useState(null);

    /* ── Level Info Dinamis ── */
    const levelInfo = useMemo(() => {
        if (stars < 130) {
            return { title: 'Lv.1 Penjelajah 🎒', max: 130, rankName: 'Penjelajah Pemula' };
        } else if (stars < 160) {
            return { title: 'Lv.2 Detektif 🔍', max: 160, rankName: 'Detektif Angka Cilik' };
        } else if (stars < 200) {
            return { title: 'Lv.3 Roket Juara 🚀', max: 200, rankName: 'Bintang Berhitung' };
        } else {
            return { title: 'Lv.4 Master Emas 👑', max: 300, rankName: 'Master Matematika Hebat' };
        }
    }, [stars]);

    /* ── Fetch Bintang dari Backend ── */
    useEffect(() => {
        fetch('http://localhost:5000/api/smarter-data')
            .then(r => r.json())
            .then(data => {
                if (data && typeof data.stars === 'number') {
                    setStars(data.stars);
                }
            })
            .catch(() => { });
    }, []);

    /* ── Timer Kuis ── */
    useEffect(() => {
        if (page !== 'quiz' || showFeedback) return;
        if (quizTimer <= 0) return;
        const interval = setInterval(() => setQuizTimer(t => t - 1), 1000);
        return () => clearInterval(interval);
    }, [page, quizTimer, showFeedback]);

    /* ── Timer Game Kilat ── */
    useEffect(() => {
        if (!speedActive || speedTimer <= 0) {
            if (speedActive && speedTimer <= 0) {
                setSpeedActive(false);
                setSpeedGameOver(true);
                const earned = speedScore * 5;
                if (earned > 0) {
                    addStarsBackend(earned);
                    fireConfetti();
                }
            }
            return;
        }
        const interval = setInterval(() => setSpeedTimer(t => t - 1), 1000);
        return () => clearInterval(interval);
    }, [speedActive, speedTimer, speedScore]);

    /* ── Navigasi ── */
    const navigateTo = useCallback((targetPage) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setPage(targetPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    /* ── Tambah Bintang ke Backend ── */
    const addStarsBackend = (amount = 10) => {
        playTone('star', soundEnabled);
        fetch('http://localhost:5000/api/add-stars', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount })
        })
            .then(r => r.json())
            .then(data => {
                if (data && data.totalStars) setStars(data.totalStars);
                else setStars(prev => prev + amount);
            })
            .catch(() => setStars(prev => prev + amount));
    };

    /* ── Tandai Materi Selesai (+5 Bintang) ── */
    const handleMarkLessonComplete = (lessonId) => {
        if (!completedLessons.includes(lessonId)) {
            setCompletedLessons(prev => [...prev, lessonId]);
            addStarsBackend(5);
            fireConfetti();
        }
    };

    /* ── Pelafalan Kosakata Bahasa Inggris (Native English Voice) ── */
    const speakEnglish = (word) => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        setSpeakingWord(word);
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        utterance.pitch = 1.15;
        const voices = window.speechSynthesis.getVoices();
        const enVoice = voices.find(v => v.lang && v.lang.includes('en') && (
            v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('zira') ||
            v.name.toLowerCase().includes('samantha') ||
            v.name.toLowerCase().includes('google') ||
            v.name.toLowerCase().includes('natural')
        )) || voices.find(v => v.lang && v.lang.includes('en'));
        if (enVoice) utterance.voice = enVoice;
        utterance.onend = () => setSpeakingWord(null);
        utterance.onerror = () => setSpeakingWord(null);
        window.speechSynthesis.speak(utterance);
    };

    /* ── Mulai Kuis ── */
    const startQuiz = (categoryKey) => {
        setSelectedCategory(categoryKey);
        setCurrentQ(0);
        setScore(0);
        setStarsEarned(0);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setQuizTimer(45);
        setTotalQuizTime(0);
        navigateTo('quiz');
    };

    /* ── Jawab Kuis ── */
    const handleAnswerQuiz = (value) => {
        if (showFeedback) return;
        const cat = questionBank[selectedCategory];
        const q = cat.questions[currentQ];
        const correct = value === q.correct;

        setSelectedAnswer(value);
        setIsCorrect(correct);
        setShowFeedback(true);
        setTotalQuizTime(prev => prev + (45 - quizTimer));

        if (correct) {
            playTone('correct', soundEnabled);
            fireConfetti();
            setScore(prev => prev + 1);
            setStarsEarned(prev => prev + 10);
            addStarsBackend(10);
        } else {
            playTone('wrong', soundEnabled);
        }
    };

    /* ── Soal Berikutnya ── */
    const nextQuizQuestion = () => {
        const cat = questionBank[selectedCategory];
        if (currentQ + 1 < cat.questions.length) {
            setCurrentQ(prev => prev + 1);
            setSelectedAnswer(null);
            setShowFeedback(false);
            setQuizTimer(45);
        } else {
            setQuizzesCompleted(prev => prev + 1);
            fireConfetti();
            navigateTo('result');
        }
    };

    /* ── PUTAR RODA CARNIVAL AJAIB (DENGAN SOUND TICKS & SVG EXACT STOP) ── */
    const handleSpinWheel = () => {
        if (isSpinning) return;
        setIsSpinning(true);
        setSpinResultSlice(null);

        // Pilih sektor pemenang secara acak
        const winningIndex = Math.floor(Math.random() * wheelSlices.length);
        const winningSlice = wheelSlices[winningIndex];

        // 8 sektor = 45 derajat per sektor
        // Sektor i membentang dari i*45 sampai (i+1)*45 derajat.
        // Jarum berada di posisi jam 12 (paling atas / 270 deg)
        // Hitung sudut persis agar jarum menunjuk tepat ke tengah sektor pemenang!
        const sliceCenterDeg = winningIndex * 45 + 22.5;
        const extraFullSpins = (5 + Math.floor(Math.random() * 3)) * 360;
        
        // Target rotasi: rotasi penuh + posisi yang menyejajarkan tengah sektor ke jarum jam 12
        const targetAngle = wheelAngle + extraFullSpins + (360 - (sliceCenterDeg % 360));
        setWheelAngle(targetAngle);

        // Rangkaian efek suara detikan jarum (tick-tick-tick) yang bertahap melambat!
        const tickDelays = [100, 200, 320, 460, 620, 800, 1000, 1220, 1460, 1720, 2000, 2300, 2620, 2960];
        tickDelays.forEach(d => {
            setTimeout(() => {
                playTone('tick', soundEnabled);
            }, d);
        });

        // Waktu berhenti setelah 3.2 detik
        setTimeout(() => {
            setIsSpinning(false);
            setSpinResultSlice(winningSlice);
            addStarsBackend(winningSlice.stars);
            setSpinTickets(prev => Math.max(0, prev - 1));
            playTone(winningSlice.isJackpot ? 'jackpot' : 'fanfare', soundEnabled);
            fireConfetti();
        }, 3200);
    };

    /* ── Buka Peti Harta Karun ── */
    const openTreasureChest = () => {
        if (chestOpened) return;
        playTone('chest', soundEnabled);
        fireConfetti();
        setChestOpened(true);
        addStarsBackend(20);
    };

    /* ── Maskot Koko ── */
    const handleKokoClick = () => {
        playTone('correct', soundEnabled);
        setKokoQuoteIndex(prev => (prev + 1) % kokoQuotes.length);
        setShowKokoBubble(true);
    };

    /* ── Teka-Teki Misteri ── */
    const solveRiddle = (answer) => {
        if (answer === '12') {
            playTone('correct', soundEnabled);
            fireConfetti();
            setRiddleSolved(true);
            addStarsBackend(15);
        } else {
            playTone('wrong', soundEnabled);
        }
    };

    /* ── Mini Game Speed ── */
    const startSpeedGame = () => {
        setSpeedTimer(30);
        setSpeedScore(0);
        setSpeedCombo(0);
        setSpeedQIndex(0);
        setSpeedGameOver(false);
        setSpeedActive(true);
    };

    const handleSpeedAnswer = (userChoice) => {
        if (!speedActive) return;
        const currentItem = speedGamePool[speedQIndex % speedGamePool.length];
        const isRight = userChoice === currentItem.isTrue;

        if (isRight) {
            playTone('correct', soundEnabled);
            setSpeedScore(prev => prev + 1);
            setSpeedCombo(prev => prev + 1);
            if ((speedScore + 1) % 3 === 0) fireConfetti();
        } else {
            playTone('wrong', soundEnabled);
            setSpeedCombo(0);
        }
        setSpeedQIndex(prev => prev + 1);
    };

    const filteredCards = useMemo(() => {
        if (topicFilter === 'all') return activityCards;
        return activityCards.filter(c => c.categoryKey === topicFilter);
    }, [topicFilter]);

    const currentCat = selectedCategory ? questionBank[selectedCategory] : null;
    const currentQuestion = currentCat ? currentCat.questions[currentQ] : null;
    const totalQuestions = currentCat ? currentCat.questions.length : 0;
    const progressPercent = currentCat ? ((currentQ + 1) / totalQuestions) * 100 : 0;

    /* ══════════════════════════════════════════════════════════
       MODAL: RODA PUTAR HADIAH CARNIVAL AJAIB (ULTRA MENARIK)
       ══════════════════════════════════════════════════════════ */
    const renderSpinModal = () => {
        if (!showSpinModal) return null;

        // Lampu LED keliling roda (16 lampu berputar)
        const bulbCount = 16;
        const bulbs = Array.from({ length: bulbCount }).map((_, i) => {
            const angle = (i * 360) / bulbCount;
            const rad = (angle * Math.PI) / 180;
            const r = 166; // radius lampu
            const x = 180 + r * Math.cos(rad);
            const y = 180 + r * Math.sin(rad);
            return { x, y, id: i };
        });

        return (
            <div className="modal-backdrop" onClick={() => !isSpinning && setShowSpinModal(false)}>
                <div className="carnival-spin-card" onClick={e => e.stopPropagation()}>
                    <button 
                        className="modal-close-btn"
                        onClick={() => !isSpinning && setShowSpinModal(false)}
                        disabled={isSpinning}
                    >
                        ✕
                    </button>

                    {/* Header Roda Karnaval */}
                    <div className="carnival-header">
                        <span className="carnival-badge">🎡 ARENA KEBERUNTUNGAN SMARTER</span>
                        <h2 className="carnival-title">Roda Bintang Karnaval! ✨</h2>
                        <div className="ticket-counter-pill">
                            <span>🎟️ Tiket Putar: <strong>{spinTickets} Tiket</strong></span>
                        </div>
                    </div>

                    {/* Arena Roda Putar 3D & Lampu LED */}
                    <div className="carnival-stage-wrap">
                        {/* Jarum Penunjuk Emas Beranimasi (Pointer Needle) */}
                        <div className={`carnival-gold-pointer ${isSpinning ? 'pointer-wobble' : ''}`}>
                            <div className="pointer-gem">💎</div>
                            <div className="pointer-arrow-shape"></div>
                        </div>

                        {/* Lampu-Lampu LED Karnaval di Luar Rim */}
                        <div className="carnival-marquee-rim">
                            {bulbs.map(b => (
                                <div 
                                    key={b.id} 
                                    className={`carnival-bulb ${b.id % 2 === 0 ? 'bulb-gold' : 'bulb-white'}`}
                                    style={{ left: `${b.x - 7}px`, top: `${b.y - 7}px` }}
                                />
                            ))}

                            {/* RODA SVG PRESISI TINGGI DENGAN 8 SEKTOR BERWARNA */}
                            <svg 
                                className="carnival-svg-wheel" 
                                viewBox="0 0 360 360"
                                style={{
                                    transform: `rotate(${wheelAngle}deg)`,
                                    transition: isSpinning ? 'transform 3.2s cubic-bezier(0.12, 0.95, 0.22, 1)' : 'none'
                                }}
                            >
                                <defs>
                                    <filter id="shadowSlice" x="-10%" y="-10%" width="120%" height="120%">
                                        <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.3"/>
                                    </filter>
                                </defs>

                                {/* 8 Sektor Berwarna (45° per potong) */}
                                {wheelSlices.map((slice, i) => {
                                    const startAngle = (i * 45) * (Math.PI / 180);
                                    const endAngle = ((i + 1) * 45) * (Math.PI / 180);
                                    const r = 155;
                                    const cx = 180;
                                    const cy = 180;

                                    const x1 = cx + r * Math.cos(startAngle);
                                    const y1 = cy + r * Math.sin(startAngle);
                                    const x2 = cx + r * Math.cos(endAngle);
                                    const y2 = cy + r * Math.sin(endAngle);

                                    const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;

                                    // Sudut tengah teks & ikon
                                    const textAngle = i * 45 + 22.5;

                                    return (
                                        <g key={i}>
                                            <path 
                                                d={pathData} 
                                                fill={slice.color} 
                                                stroke="#FFFFFF" 
                                                strokeWidth="3.5"
                                            />
                                            {/* Teks & Ikon Terputar Sempurna */}
                                            <g transform={`translate(${cx}, ${cy}) rotate(${textAngle}) translate(95, 0)`}>
                                                <text 
                                                    transform="rotate(90)" 
                                                    textAnchor="middle" 
                                                    dominantBaseline="central"
                                                    fill={slice.textColor}
                                                    fontFamily="Fredoka"
                                                    fontWeight="700"
                                                    fontSize="14"
                                                >
                                                    {slice.icon} {slice.label}
                                                </text>
                                            </g>
                                        </g>
                                    );
                                })}

                                {/* Garis Emas Luar */}
                                <circle cx="180" cy="180" r="155" fill="none" stroke="#F59E0B" strokeWidth="6" />
                            </svg>

                            {/* Hub Emas Tengah (Center Golden Medallion) */}
                            <div className="wheel-center-medallion" onClick={!isSpinning ? handleSpinWheel : undefined}>
                                <div className="center-inner-star">⭐</div>
                                <span className="center-text-spin">PUTAR</span>
                            </div>
                        </div>
                    </div>

                    {/* Kotak Pengumuman Kemenangan Ceria */}
                    {spinResultSlice && (
                        <div className={`carnival-win-card ${spinResultSlice.isJackpot ? 'win-card-jackpot' : ''}`}>
                            <span className="win-card-icon">{spinResultSlice.icon}</span>
                            <div className="win-card-info">
                                <span className="win-badge-pop">{spinResultSlice.isJackpot ? '🎉 JACKPOT UTAMA! 🎉' : '🌟 HADIAH DIDAPATKAN!'}</span>
                                <h3>Kamu Memenangkan <strong>+{spinResultSlice.stars} Bintang!</strong></h3>
                                <p>Bintang berhasil masuk ke kantong koleksimu!</p>
                            </div>
                        </div>
                    )}

                    {/* Tombol Aksi Putar 3D */}
                    <div className="carnival-actions">
                        <button 
                            className={`btn-3d btn-primary btn-carnival-spin ${isSpinning ? 'btn-spinning-state' : ''}`}
                            onClick={handleSpinWheel}
                            disabled={isSpinning}
                        >
                            {isSpinning ? '🌀 Roda Sedang Berputar Kencang...' : '🎡 PUTAR RODA BINTANG (GRATIS)!'}
                        </button>
                    </div>

                    {/* Preview Hadiah yang Tersedia */}
                    <div className="prizes-preview-strip">
                        <span>Pilihan Hadiah:</span>
                        <div className="preview-pills">
                            <span className="p-pill p-gold">🌟 +50 Jackpot</span>
                            <span className="p-pill">💎 +40</span>
                            <span className="p-pill">🚀 +35</span>
                            <span className="p-pill">👑 +30</span>
                            <span className="p-pill">🎁 +25</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    /* ══════════════════════════════════════════════════════════
       MODAL: TABEL PERKALIAN 100 PYTHAGORAS (10×10 LENGKAP)
       ══════════════════════════════════════════════════════════ */
    const renderPythagorasModal = () => {
        if (!showPythagorasModal) return null;

        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        return (
            <div className="modal-backdrop" onClick={() => setShowPythagorasModal(false)}>
                <div className="pythagoras-modal-card" onClick={e => e.stopPropagation()}>
                    <div className="pythagoras-header">
                        <div>
                            <span className="popover-badge">🔢 TABEL 1–10 HINGGA 100</span>
                            <h2>Tabel Perkalian 100 Lengkap (10×10)</h2>
                            <p>Klik kotak angka mana saja untuk melihat hasil perkalian ajaibnya!</p>
                        </div>
                        <button 
                            className="btn-modal-close" 
                            onClick={() => setShowPythagorasModal(false)}
                            title="Tutup tabel"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Spotlight Kartu Terpilih */}
                    <div className="pythagoras-spotlight">
                        <span className="spotlight-equation">
                            {selectedGridCell.r} × {selectedGridCell.c} = <strong>{selectedGridCell.r * selectedGridCell.c}</strong>
                        </span>
                        <span className="spotlight-note">
                            {selectedGridCell.r === selectedGridCell.c ? '✨ Angka Kembar Kuadrat!' : `${selectedGridCell.r} kelompok berisi ${selectedGridCell.c}`}
                            {selectedGridCell.r * selectedGridCell.c === 100 && ' 🏆 Nilai Maksimal 100 Sempurna!'}
                        </span>
                    </div>

                    {/* Matriks 10×10 Grid Interaktif */}
                    <div className="pythagoras-grid-wrapper">
                        <div className="pythagoras-grid">
                            {/* Pojok Kiri Atas */}
                            <div className="grid-cell grid-corner">×</div>

                            {/* Header Kolom (1–10) */}
                            {numbers.map(c => (
                                <div key={`col-${c}`} className={`grid-cell grid-col-head ${selectedGridCell.c === c ? 'cell-head-active' : ''}`}>
                                    {c}
                                </div>
                            ))}

                            {/* Baris dan Isi Sel (1..10 × 1..10) */}
                            {numbers.map(r => (
                                <React.Fragment key={`row-wrap-${r}`}>
                                    {/* Header Baris */}
                                    <div className={`grid-cell grid-row-head ${selectedGridCell.r === r ? 'cell-head-active' : ''}`}>
                                        {r}
                                    </div>

                                    {/* 10 Kolom Isi */}
                                    {numbers.map(c => {
                                        const product = r * c;
                                        const isSelected = selectedGridCell.r === r && selectedGridCell.c === c;
                                        const isRowHighlighted = selectedGridCell.r === r;
                                        const isColHighlighted = selectedGridCell.c === c;
                                        const isDiagonal = r === c;
                                        const isHundred = product === 100;

                                        return (
                                            <div
                                                key={`cell-${r}-${c}`}
                                                className={`grid-cell grid-data-cell ${isSelected ? 'cell-selected' : ''} ${isRowHighlighted || isColHighlighted ? 'cell-cross-highlight' : ''} ${isDiagonal ? 'cell-diagonal' : ''} ${isHundred ? 'cell-hundred' : ''}`}
                                                onClick={() => {
                                                    setSelectedGridCell({ r, c });
                                                    playTone('tick', soundEnabled);
                                                }}
                                                title={`${r} × ${c} = ${product}`}
                                            >
                                                {product}
                                            </div>
                                        );
                                    })}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    <div className="pythagoras-footer-tip">
                        <span>💡 <strong>Tips Cerdas:</strong> Kotak berwarna emas melintang diagonal adalah angka kembar (1×1=1, 2×2=4 ... 10×10=100)!</span>
                        <button className="btn-3d btn-primary" onClick={() => setShowPythagorasModal(false)}>
                            Tutup Tabel 👍
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    /* ══════════════════════════════════════════════════════════
       HALAMAN 1: BERANDA (HOME)
       ══════════════════════════════════════════════════════════ */
    const renderHome = () => (
        <div className="page page-enter">
            {/* Hero Banner Ceria */}
            <section className="hero-banner">
                <div className="hero-content">
                    <div className="hero-pill-badge">
                        <span className="badge-sparkle">🚀</span>
                        <span>Petualangan Matematika Anak Usia 6–10 Tahun</span>
                    </div>
                    <h1 className="hero-title">Belajar Matematika Jadi Paling Seru!</h1>
                    <h2 className="hero-subtitle">Learn. Play. Solve! ✨</h2>
                    <p className="hero-desc">
                        Kuasai rahasia angka dengan cara menyenangkan! Tonton trik berhitung cepat, pecahkan teka-teki rahasia, putar roda karnaval, dan jadilah juara hitung!
                    </p>
                    <div className="hero-actions">
                        <button className="btn-3d btn-primary btn-hero-start" onClick={() => navigateTo('lessons')}>
                            📖 Buka Materi Bergambar →
                        </button>
                        <button className="btn-3d btn-syllabus-shortcut" onClick={() => navigateTo('syllabus')}>
                            🗺️ Silabus Kursus (Math &amp; English)
                        </button>
                        <button className="btn-3d btn-secondary-white" onClick={() => navigateTo('quiz-select')}>
                            🎯 Latihan Soal Interaktif
                        </button>
                        <button className="btn-3d btn-spin-promo" onClick={() => setShowSpinModal(true)}>
                            🎡 Roda Hadiah!
                        </button>
                    </div>
                </div>
                <div className="hero-watermark">+ × ÷ =</div>
            </section>

            {/* Banner Pangkat & Kemajuan Level */}
            <div className="player-level-banner">
                <div className="level-avatar-box">
                    <span className="player-avatar-large">{userAvatar}</span>
                </div>
                <div className="level-progress-area">
                    <div className="level-title-row">
                        <span className="level-name">Pangkat Petualang: <strong>{levelInfo.rankName}</strong></span>
                        <span className="level-stars-status">⭐ {stars} / {levelInfo.max} Bintang</span>
                    </div>
                    <div className="level-bar-track">
                        <div 
                            className="level-bar-fill" 
                            style={{ width: `${Math.min(100, Math.round((stars / levelInfo.max) * 100))}%` }}
                        ></div>
                    </div>
                    <span className="level-hint">
                        💡 Kumpulkan <strong>{Math.max(0, levelInfo.max - stars)} bintang</strong> lagi untuk naik pangkat berikutnya!
                    </span>
                </div>
                <button className="btn-3d btn-badge-shortcut" onClick={() => navigateTo('badges')}>
                    Koleksi Lencana 🏅
                </button>
            </div>

            {/* Kotak Interaktif: Peti Harta Karun & Teka-Teki Misteri */}
            <div className="gamified-fun-grid">
                <div className="treasure-chest-card">
                    <div className="chest-visual-box" onClick={openTreasureChest}>
                        <span className="chest-emoji">{chestOpened ? '💎' : '🎁'}</span>
                        {!chestOpened && <span className="chest-badge-tap">Klik Buka!</span>}
                    </div>
                    <div className="chest-text-box">
                        <span className="fun-mini-tag">KOTAK KEBERUNTUNGAN</span>
                        <h4>Peti Hadiah Harian</h4>
                        {!chestOpened ? (
                            <p>Ada bonus <strong>+20 Bintang Rahasia</strong> di dalam peti ini. Buka sekarang yuk!</p>
                        ) : (
                            <p className="chest-opened-text">🎉 Hore! Peti terbuka &amp; <strong>+20 Bintang</strong> masuk ke kantongmu!</p>
                        )}
                        <button 
                            className={`btn-3d btn-chest-action ${chestOpened ? 'btn-chest-disabled' : ''}`}
                            onClick={openTreasureChest}
                            disabled={chestOpened}
                        >
                            {chestOpened ? '✅ Hadiah Sudah Diklaim' : '🎁 Buka Peti Rahasia!'}
                        </button>
                    </div>
                </div>

                <div className="daily-riddle-card">
                    <div className="riddle-icon">🐱</div>
                    <div className="riddle-content">
                        <span className="riddle-tag">TEKA-TEKI HARI INI</span>
                        <h3>Ada 3 kucing lucu. Setiap kucing punya 4 kaki. Berapa total kaki mereka?</h3>
                        {!riddleSolved ? (
                            <div className="riddle-choices">
                                <button className="riddle-btn" onClick={() => solveRiddle('7')}>7 Kaki</button>
                                <button className="riddle-btn" onClick={() => solveRiddle('10')}>10 Kaki</button>
                                <button className="riddle-btn riddle-highlight" onClick={() => solveRiddle('12')}>12 Kaki (3 × 4)</button>
                            </div>
                        ) : (
                            <div className="riddle-solved-banner">
                                🎉 TEPAT SEKALI! 3 × 4 = 12 kaki! Kamu dapat <strong>+15 Bintang</strong>! ⭐
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Action Ribbon */}
            <div className="quick-ribbon">
                <div className="ribbon-card" onClick={() => navigateTo('syllabus')}>
                    <span className="ribbon-icon">🗺️</span>
                    <div>
                        <h4>Silabus Kursus</h4>
                        <p>Matematika &amp; English</p>
                    </div>
                </div>
                <div className="ribbon-card" onClick={() => navigateTo('lessons')}>
                    <span className="ribbon-icon">📚</span>
                    <div>
                        <h4>Materi Bergambar</h4>
                        <p>12 Modul lengkap &amp; trik cepat</p>
                    </div>
                </div>
                <div className="ribbon-card" onClick={() => navigateTo('quiz-select')}>
                    <span className="ribbon-icon">🎯</span>
                    <div>
                        <h4>16 Soal Kuis</h4>
                        <p>Pilihan ganda + penjelasan</p>
                    </div>
                </div>
                <div className="ribbon-card" onClick={() => navigateTo('minigame')}>
                    <span className="ribbon-icon">⚡</span>
                    <div>
                        <h4>Hitung Kilat 30s</h4>
                        <p>Tantangan kecepatan seru</p>
                    </div>
                </div>
                <div className="ribbon-card" onClick={() => navigateTo('badges')}>
                    <span className="ribbon-icon">🏅</span>
                    <div>
                        <h4>Koleksi Lencana</h4>
                        <p>Buka prestasi bintangmu</p>
                    </div>
                </div>
            </div>

            {/* Topic Filter Bar */}
            <div className="section-header" id="topics-section">
                <div>
                    <div className="section-eyebrow">
                        <span className="eyebrow-text">PILIH PETUALANGAN KAMU</span>
                        <span className="eyebrow-pill">6 Modul Interaktif</span>
                    </div>
                    <h3 className="section-title">Mau Belajar Apa Hari Ini?</h3>
                    <p className="section-desc">Pilih modul materi di bawah untuk mulai memahami konsep dan berlatih soal!</p>
                </div>

                <div className="filter-pill-bar">
                    <button
                        className={`filter-btn ${topicFilter === 'all' ? 'filter-active' : ''}`}
                        onClick={() => setTopicFilter('all')}
                    >
                        Semua Topik
                    </button>
                    <button
                        className={`filter-btn ${topicFilter === 'learn-numbers' ? 'filter-active' : ''}`}
                        onClick={() => setTopicFilter('learn-numbers')}
                    >
                        Penjumlahan
                    </button>
                    <button
                        className={`filter-btn ${topicFilter === 'explore-shapes' ? 'filter-active' : ''}`}
                        onClick={() => setTopicFilter('explore-shapes')}
                    >
                        Geometri
                    </button>
                    <button
                        className={`filter-btn ${topicFilter === 'daily-quiz' ? 'filter-active' : ''}`}
                        onClick={() => setTopicFilter('daily-quiz')}
                    >
                        Perkalian
                    </button>
                </div>
            </div>

            {/* 6 Cards Grid */}
            <div className="cards-grid">
                {filteredCards.map(card => (
                    <ActivityCard
                        key={card.id}
                        card={card}
                        buttonLabel="Mulai Latihan →"
                        onSelectCard={() => startQuiz(card.categoryKey)}
                    />
                ))}
            </div>

            {/* Papan Sahabat Petualang */}
            <div className="friendly-leaderboard-card">
                <div className="leaderboard-header">
                    <span className="leaderboard-badge">🏆 PAPAN SAHABAT PINTAR</span>
                    <h3>Peringkat Bintang Pekan Ini</h3>
                </div>
                <div className="leaderboard-list">
                    <div className="leader-row">
                        <span className="leader-rank">🥇</span>
                        <span className="leader-avatar">🐰</span>
                        <span className="leader-name">Budi Kelinci Cepat</span>
                        <span className="leader-stars">240 ⭐</span>
                    </div>
                    <div className="leader-row leader-row-user">
                        <span className="leader-rank">🥈</span>
                        <span className="leader-avatar">{userAvatar}</span>
                        <span className="leader-name">Kamu (Petualang Hebat)</span>
                        <span className="leader-stars">{stars} ⭐</span>
                    </div>
                    <div className="leader-row">
                        <span className="leader-rank">🥉</span>
                        <span className="leader-avatar">🐱</span>
                        <span className="leader-name">Siti Kucing Manis</span>
                        <span className="leader-stars">110 ⭐</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="smarter-footer">
                <span>© 2026 SMARTER Math Education • Didesain khusus untuk anak usia 6–10 tahun</span>
                <div className="footer-controls">
                    <button 
                        className="sound-toggle-btn"
                        onClick={() => setSoundEnabled(prev => !prev)}
                        title="Nyalakan/Matikan Efek Suara"
                    >
                        {soundEnabled ? '🔊 Suara Ceria: Aktif' : '🔇 Suara Ceria: Mati'}
                    </button>
                    <span className="footer-safe">🛡️ Safe Kids Learning Zone</span>
                </div>
            </footer>

            {/* Maskot Koko Interaktif */}
            <div className="mascot-floating-wrap">
                {showKokoBubble && (
                    <div className="mascot-speech-bubble">
                        <button className="bubble-close-btn" onClick={() => setShowKokoBubble(false)}>✕</button>
                        <span className="mascot-bubble-tag">🤖 Koko Berkata:</span>
                        <p>{kokoQuotes[kokoQuoteIndex].text}</p>
                        <div className="bubble-actions">
                            <button className="bubble-action-btn" onClick={handleKokoClick}>
                                🎲 Ganti Cerita / Tebakan
                            </button>
                        </div>
                    </div>
                )}
                <div 
                    className="mascot-character-btn"
                    onClick={handleKokoClick}
                    title="Klik aku untuk tebakan dan kata-kata penyemangat!"
                >
                    <span className="mascot-face">🤖</span>
                    <span className="mascot-name-tag">KOKO</span>
                </div>
            </div>
        </div>
    );

    /* ══════════════════════════════════════════════════════════
       HALAMAN 2: MATERI BELAJAR (MATEMATIKA & BAHASA INGGRIS)
       ══════════════════════════════════════════════════════════ */
    const renderLessons = () => {
        const currentLessonsPool = lessonSubject === 'english' ? englishLessonsData : lessonsData;

        const filterCategories = lessonSubject === 'english' ? [
            { key: 'all', label: `🌟 Semua (${englishLessonsData.length})` },
            { key: 'basics', label: '🔤 Dasar & Fonik (2)' },
            { key: 'numbers-colors', label: '🔢 Angka & Warna (2)' },
            { key: 'vocab', label: '🦁 Hewan & Buah (2)' },
            { key: 'daily', label: '🎒 Sekolah & Keluarga (3)' },
            { key: 'conversation', label: '💬 Sapaan & Math (3)' }
        ] : [
            { key: 'all', label: `🌟 Semua (${lessonsData.length})` },
            { key: 'operasi', label: '🔢 Operasi Hitung (5)' },
            { key: 'geometri', label: '📐 Geometri & Ruang (2)' },
            { key: 'logika', label: '🧩 Logika & Pola (2)' },
            { key: 'sehari-hari', label: '🎒 Dunia Nyata (3)' }
        ];

        const filteredLessons = currentLessonsPool.filter(l => {
            const matchCat = lessonFilter === 'all' || l.category === lessonFilter;
            const q = lessonSearch.toLowerCase().trim();
            const matchSearch = !q || l.title.toLowerCase().includes(q) || l.summary.toLowerCase().includes(q) || l.tag.toLowerCase().includes(q);
            return matchCat && matchSearch;
        });

        const currentLesson = currentLessonsPool.find(l => l.id === activeLessonId) || currentLessonsPool[0];
        const isCompleted = completedLessons.includes(currentLesson.id);

        return (
            <div className="page page-enter">
                <div className="lessons-layout">
                    {/* Switcher Mata Pelajaran: Matematika & Bahasa Inggris */}
                    <div className="lessons-subject-bar">
                        <button
                            type="button"
                            className={`subject-pill-tab ${lessonSubject === 'math' ? 'subject-pill-active math-tab-active' : ''}`}
                            onClick={() => {
                                setLessonSubject('math');
                                setActiveLessonId('learn-numbers');
                                setLessonFilter('all');
                                setLessonSearch('');
                            }}
                        >
                            <span className="subject-pill-icon">🧮</span>
                            <div className="subject-pill-info">
                                <span className="subject-pill-name">Pelajaran Matematika Cilik</span>
                                <span className="subject-pill-sub">12 Modul • 3 Lab Interaktif • 28 Soal</span>
                            </div>
                            {lessonSubject === 'math' && <span className="subject-active-tag">✓ Aktif</span>}
                        </button>

                        <button
                            type="button"
                            className={`subject-pill-tab ${lessonSubject === 'english' ? 'subject-pill-active english-tab-active' : ''}`}
                            onClick={() => {
                                setLessonSubject('english');
                                setActiveLessonId('en-alphabet');
                                setLessonFilter('all');
                                setLessonSearch('');
                            }}
                        >
                            <span className="subject-pill-icon">🇬🇧</span>
                            <div className="subject-pill-info">
                                <span className="subject-pill-name">Pelajaran Bahasa Inggris (Kids English)</span>
                                <span className="subject-pill-sub">12 Modul • Audio Native Speaker • 14 Soal</span>
                            </div>
                            {lessonSubject === 'english' && <span className="subject-active-tag">✓ Aktif</span>}
                        </button>
                    </div>

                    {/* Header Modul */}
                    <div className="page-header-box">
                        <div className="page-header-left">
                            <span className="page-badge">
                                {lessonSubject === 'english' 
                                    ? '🇬🇧 12 MODUL MATERI BAHASA INGGRIS LENGKAP' 
                                    : '📖 12 MODUL MATERI MATEMATIKA BERGAMBAR'}
                            </span>
                            <h2 className="page-main-title">
                                {lessonSubject === 'english' 
                                    ? 'Kids English Explorer: Petualangan Bahasa Inggris' 
                                    : 'Pojok Belajar Matematika Ceria'}
                            </h2>
                            <p className="page-main-desc">
                                {lessonSubject === 'english' 
                                    ? 'Kuasai kosakata harian, fonik alfabet, berhitung bahasa Inggris, sapaan santun, dan dengarkan audio pengucapan asli native speaker! Selesaikan setiap modul untuk +5 Bintang ⭐' 
                                    : 'Pahami konsep dasar berhitung, geometri, uang, dan trik sulap matematika dengan cerita bergambar. Selesaikan materi untuk mengumpulkan +5 Bintang! ⭐'}
                            </p>
                        </div>
                        <div className="header-actions-group">
                            <button className="btn-3d btn-primary" onClick={() => startQuiz(currentLesson.id)}>
                                🎯 Kerjakan Kuis Topik Ini →
                            </button>
                        </div>
                    </div>

                    {/* Filter Kategori & Pencarian */}
                    <div className="lesson-controls-bar">
                        <div className="lesson-filter-chips">
                            {filterCategories.map(cat => (
                                <button
                                    key={cat.key}
                                    type="button"
                                    className={`lesson-chip ${lessonFilter === cat.key ? 'lesson-chip-active' : ''}`}
                                    onClick={() => setLessonFilter(cat.key)}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                        <div className="lesson-search-box">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                className="lesson-search-input"
                                placeholder={`Cari materi ${lessonSubject === 'english' ? 'Inggris (contoh: apple, animal)' : 'matematika (contoh: pizza, uang)'}...`}
                                value={lessonSearch}
                                onChange={e => setLessonSearch(e.target.value)}
                            />
                            {lessonSearch && (
                                <button type="button" className="search-clear-btn" onClick={() => setLessonSearch('')}>✕</button>
                            )}
                        </div>
                    </div>

                    <div className="lessons-container">
                        {/* Sidebar Modul */}
                        <div className="lessons-sidebar">
                            <div className="sidebar-header-row">
                                <h4 className="sidebar-title">Daftar Modul ({filteredLessons.length})</h4>
                                <span className="completed-badge-count">
                                    🏆 {completedLessons.filter(id => currentLessonsPool.some(l => l.id === id)).length}/{currentLessonsPool.length} Selesai
                                </span>
                            </div>

                            <div className="sidebar-list">
                                {filteredLessons.length > 0 ? (
                                    filteredLessons.map(lesson => {
                                        const done = completedLessons.includes(lesson.id);
                                        return (
                                            <div
                                                key={lesson.id}
                                                className={`lesson-nav-item ${activeLessonId === lesson.id ? 'lesson-nav-active' : ''}`}
                                                onClick={() => setActiveLessonId(lesson.id)}
                                            >
                                                <span className="lesson-nav-icon">{lesson.icon}</span>
                                                <div className="lesson-nav-info">
                                                    <span className="lesson-nav-title">{lesson.title}</span>
                                                    <span className="lesson-nav-tag">{lesson.tag}</span>
                                                </div>
                                                {done && (
                                                    <span className="lesson-done-badge" title="Materi ini sudah kamu pelajari!">
                                                        ✓ Paham
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="empty-search-box">
                                        <p>🔍 Tidak ada materi yang cocok dengan "{lessonSearch}".</p>
                                        <button 
                                            type="button" 
                                            className="btn-small-reset" 
                                            onClick={() => { setLessonSearch(''); setLessonFilter('all'); }}
                                        >
                                            Lihat Semua Modul
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Konten Utama Materi Terpilih */}
                        <div className="lesson-main-content">
                            <div className="lesson-header-card">
                                <div className="lesson-badge-row">
                                    <div className="badge-tag-wrap">
                                        <span className="lesson-tag-pill">{currentLesson.tag}</span>
                                        {isCompleted && (
                                            <span className="lesson-done-pill">✓ Sudah Kamu Pelajari</span>
                                        )}
                                    </div>
                                </div>

                                <div className="lesson-title-area">
                                    <span className="lesson-icon-large">{currentLesson.icon}</span>
                                    <div>
                                        <h1 className="lesson-title">{currentLesson.title}</h1>
                                        <p className="lesson-summary">{currentLesson.summary}</p>
                                    </div>
                                </div>
                                
                                <div className="lesson-pro-tip">
                                    <span className="tip-star">💡</span>
                                    <div>
                                        <strong>{lessonSubject === 'english' ? 'Trik Menghafal Cepat:' : 'Trik Super Cerdas:'}</strong>
                                        <p>{currentLesson.tips}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Khusus Materi Bahasa Inggris: Kartu Interaktif Pelafalan Kata Asli */}
                            {currentLesson.flashcards && currentLesson.flashcards.length > 0 && (
                                <div className="lesson-flashcards-box">
                                    <div className="flashcards-box-header">
                                        <div>
                                            <h4 className="fc-box-title">🔊 Kosakata Kunci &amp; Audio Pengucapan Asli</h4>
                                            <p className="fc-box-desc">Klik kartu atau tombol audio untuk mendengar pengucapan penutur asli (*native English*)!</p>
                                        </div>
                                        <span className="fc-count-pill">{currentLesson.flashcards.length} Kosakata</span>
                                    </div>

                                    <div className="lesson-flashcards-grid">
                                        {currentLesson.flashcards.map((fc, fcIdx) => {
                                            const isSpeakingThis = speakingWord === fc.word;
                                            return (
                                                <div 
                                                    key={fcIdx} 
                                                    className={`lesson-fc-card ${isSpeakingThis ? 'fc-speaking' : ''}`}
                                                    onClick={() => speakEnglish(fc.word)}
                                                    role="button"
                                                    tabIndex={0}
                                                >
                                                    <span className="fc-emoji-large">{fc.emoji}</span>
                                                    <div className="fc-info-wrap">
                                                        <strong className="fc-word-text">{fc.word}</strong>
                                                        <span className="fc-phonetic-badge">/{fc.pron}/</span>
                                                        <span className="fc-meaning-text">{fc.meaning}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="btn-fc-speak"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            speakEnglish(fc.word);
                                                        }}
                                                        title={`Dengarkan ${fc.word}`}
                                                    >
                                                        {isSpeakingThis ? '🔊 Mengucapkan...' : '🔈 Play Audio'}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Daftar Bab / Langkah Materi */}
                            <div className="lesson-sections-list">
                                {currentLesson.content.map((sec, idx) => (
                                    <div key={idx} className="lesson-card-item">
                                        <div className="lesson-step-number">{idx + 1}</div>
                                        <div className="lesson-card-body">
                                            <h3 className="sec-heading">{sec.heading}</h3>
                                            <p className="sec-text">{sec.text}</p>
                                            <div className="sec-visual-box">{sec.visual}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Jika Mata Pelajaran Matematika: Tampilkan Laboratorium Praktik & Mainan Interaktif */}
                            {lessonSubject === 'math' && (
                                <div className="interactive-lab-container">
                                    <div className="lab-section-header">
                                        <div className="lab-title-group">
                                            <span className="lab-badge">🎮 LABORATORIUM MATEMATIKA INTERAKTIF</span>
                                            <h3 className="lab-title">Arena Praktik &amp; Alat Hitung Ceria</h3>
                                            <p className="lab-subtitle">Yuk coba langsung mainan matematika di bawah ini untuk mengasah pemahamanmu!</p>
                                        </div>
                                    </div>

                                    <div className="lab-widgets-grid">
                                        {/* Widget 1: Tabel Perkalian Ajaib (1–10 Hingga 100) */}
                                        <div className="mult-widget-box lab-card">
                                            <div className="mult-widget-header">
                                                <h5>🔢 Tabel Perkalian 1–10</h5>
                                                <button 
                                                    type="button"
                                                    className="btn-open-pythagoras"
                                                    onClick={() => setShowPythagorasModal(true)}
                                                    title="Buka Tabel Kotak 10×10 Lengkap"
                                                >
                                                    📊 Matriks 100
                                                </button>
                                            </div>
                                            <p>Pilih angka perkalian (1 sampai 10):</p>
                                            <div className="mult-num-selector">
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                                    <button
                                                        key={n}
                                                        type="button"
                                                        className={`mult-btn ${multTableNumber === n ? 'mult-btn-active' : ''}`}
                                                        onClick={() => setMultTableNumber(n)}
                                                    >
                                                        {n}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="mult-display-list">
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                                                    <div key={i} className={`mult-row ${i === 10 ? 'mult-row-ten' : ''}`}>
                                                        <span>{multTableNumber} × {i}</span>
                                                        <strong>= {multTableNumber * i}</strong>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mult-footer-note">
                                                <span>Maksimal: {multTableNumber} × 10 = <strong>{multTableNumber * 10}</strong></span>
                                                {multTableNumber === 10 && <span className="tag-max-100">🏆 100!</span>}
                                            </div>
                                        </div>

                                        {/* Widget 2: Simulator Pecahan Pizza */}
                                        <div className="pizza-widget-box lab-card">
                                            <h5>🍕 Simulator Pecahan Pizza</h5>
                                            <p>Bagi pizza menjadi potongan sama rata:</p>
                                            <div className="pizza-slice-selector">
                                                {[2, 3, 4, 6, 8].map(n => (
                                                    <button
                                                        key={n}
                                                        type="button"
                                                        className={`mult-btn ${pizzaSlices === n ? 'mult-btn-active' : ''}`}
                                                        onClick={() => setPizzaSlices(n)}
                                                    >
                                                        1/{n}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="pizza-preview-area">
                                                <svg width="105" height="105" viewBox="0 0 140 140" className="pizza-svg">
                                                    <circle cx="70" cy="70" r="64" fill="#D97706" />
                                                    <circle cx="70" cy="70" r="58" fill="#F59E0B" />
                                                    {Array.from({ length: pizzaSlices }).map((_, idx) => {
                                                        const angleStart = (idx / pizzaSlices) * 2 * Math.PI - Math.PI / 2;
                                                        const angleEnd = ((idx + 1) / pizzaSlices) * 2 * Math.PI - Math.PI / 2;
                                                        const r = 54;
                                                        const x1 = 70 + r * Math.cos(angleStart);
                                                        const y1 = 70 + r * Math.sin(angleStart);
                                                        const x2 = 70 + r * Math.cos(angleEnd);
                                                        const y2 = 70 + r * Math.sin(angleEnd);
                                                        const isHighlighted = idx === 0;
                                                        return (
                                                            <path
                                                                key={idx}
                                                                d={`M 70 70 L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                                                                fill={isHighlighted ? '#FF6B6B' : '#FEF3C7'}
                                                                stroke="#B45309"
                                                                strokeWidth="2.5"
                                                            />
                                                        );
                                                    })}
                                                    <circle cx="70" cy="70" r="7" fill="#B45309" />
                                                </svg>
                                                <div className="pizza-info-box">
                                                    <strong>1 Potong = 1/{pizzaSlices}</strong>
                                                    <span>
                                                        {pizzaSlices === 2 ? 'Setengah loyang pizza (½)!' : `Satu bagian dari total ${pizzaSlices} potong!`}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Widget 3: Kasir Cilik (Hitung Uang) */}
                                        <div className="cashier-widget-box lab-card">
                                            <h5>🪙 Kasir Cilik (Hitung Uang)</h5>
                                            <p>Klik uang untuk menabung di dompetmu:</p>
                                            <div className="cashier-coins-grid">
                                                <button type="button" className="coin-btn" onClick={() => setCashierTotal(t => t + 500)}>+Rp500 🪙</button>
                                                <button type="button" className="coin-btn" onClick={() => setCashierTotal(t => t + 1000)}>+Rp1.000 🪙</button>
                                                <button type="button" className="coin-btn" onClick={() => setCashierTotal(t => t + 2000)}>+Rp2.000 💵</button>
                                                <button type="button" className="coin-btn" onClick={() => setCashierTotal(t => t + 5000)}>+Rp5.000 💵</button>
                                            </div>
                                            <div className="cashier-wallet-bar">
                                                <div className="wallet-text">
                                                    <span>Saldo Dompet:</span>
                                                    <strong>Rp {cashierTotal.toLocaleString('id-ID')}</strong>
                                                </div>
                                                {cashierTotal > 0 && (
                                                    <button type="button" className="cashier-reset-btn" onClick={() => setCashierTotal(0)} title="Kosongkan dompet">
                                                        🔄 Reset
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Jika Mata Pelajaran Bahasa Inggris: Tampilkan Studio Suara & Arena Percakapan Cilik */}
                            {lessonSubject === 'english' && (
                                <div className="interactive-lab-container english-lab-container">
                                    <div className="lab-section-header">
                                        <div className="lab-title-group">
                                            <span className="lab-badge">🔊 STUDIO SUARA NATIVE SPEAKER &amp; PERCAKAPAN</span>
                                            <h3 className="lab-title">Studio Latihan Pengucapan &amp; Kalimat Ceria</h3>
                                            <p className="lab-subtitle">Dengarkan audio penutur asli bahasa Inggris dan tirukan bunyinya dengan percaya diri!</p>
                                        </div>
                                    </div>

                                    <div className="english-studio-grid">
                                        <div className="en-studio-card lab-card">
                                            <h5>🎙️ Papan Suara Cepat (Soundboard)</h5>
                                            <p>Klik tombol untuk memutar suara pengucapan asli:</p>
                                            <div className="studio-soundboard-chips">
                                                {(currentLesson.flashcards || []).map((fc, i) => (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        className="soundboard-chip"
                                                        onClick={() => speakEnglish(fc.word)}
                                                    >
                                                        <span className="sb-emoji">{fc.emoji}</span>
                                                        <span className="sb-word">{fc.word}</span>
                                                        <span className="sb-audio-icon">🔊</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="en-studio-card lab-card">
                                            <h5>💬 Latihan Percakapan Ceria (Mini Dialogue)</h5>
                                            <p>Klik kartu untuk mendengarkan lafal kalimat utuh:</p>
                                            <div className="studio-dialogue-list">
                                                <div 
                                                    className="dialogue-card" 
                                                    onClick={() => speakEnglish("Good morning teacher! How are you today?")}
                                                    role="button"
                                                    tabIndex={0}
                                                >
                                                    <span className="dialogue-en">"Good morning teacher! How are you today?" 🌅</span>
                                                    <span className="dialogue-id">Selamat pagi guru! Bagaimana kabarmu hari ini?</span>
                                                    <button type="button" className="btn-listen-dialogue">🔊 Dengarkan</button>
                                                </div>
                                                <div 
                                                    className="dialogue-card" 
                                                    onClick={() => speakEnglish("I love learning English and math!")}
                                                    role="button"
                                                    tabIndex={0}
                                                >
                                                    <span className="dialogue-en">"I love learning English and math!" 🚀</span>
                                                    <span className="dialogue-id">Aku suka belajar bahasa Inggris dan matematika!</span>
                                                    <button type="button" className="btn-listen-dialogue">🔊 Dengarkan</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tombol Aksi di Bawah Materi */}
                            <div className="lesson-footer-action">
                                <div className="footer-action-text">
                                    <h4>{isCompleted ? '🎉 Hebat! Kamu sudah menguasai materi ini!' : 'Sudah paham konsep materi ini?'}</h4>
                                    <p>
                                        {isCompleted 
                                            ? 'Kamu telah mendapatkan +5 Bintang. Yuk lanjutkan uji kemampuanmu di kuis!'
                                            : 'Tandai bahwa kamu sudah paham untuk mengklaim +5 Bintang, lalu uji kemampuanmu di kuis!'}
                                    </p>
                                </div>
                                <div className="footer-btns-group">
                                    {!isCompleted && (
                                        <button
                                            className="btn-3d btn-yellow"
                                            onClick={() => handleMarkLessonComplete(currentLesson.id)}
                                        >
                                            ⭐ Tandai Sudah Paham (+5 ⭐)
                                        </button>
                                    )}
                                    <button 
                                        className="btn-3d btn-primary btn-quiz-now"
                                        onClick={() => startQuiz(currentLesson.id)}
                                    >
                                        🎯 Mulai Kuis {currentLesson.title} →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    

    /* ══════════════════════════════════════════════════════════
       HALAMAN 3: PILIH KUIS (12 Topik Lengkap & 28 Soal)
       ══════════════════════════════════════════════════════════ */
    const renderQuizSelect = () => {
        const filteredQuizLessons = lessonsData.filter(l => {
            if (topicFilter === 'all') return true;
            return l.category === topicFilter;
        });

        return (
            <div className="page page-enter">
                <div className="page-header-box">
                    <div className="page-header-left">
                        <span className="page-badge">🎯 28 SOAL LATIHAN BERGAMBAR</span>
                        <h2 className="page-main-title">Pilih Topik Soal &amp; Kuis Matematika</h2>
                        <p className="page-main-desc">
                            Tersedia 28 soal bergambar dari 12 topik lengkap dengan timer santai dan pembahasan ramah anak. Raih +10 Bintang setiap kali menjawab benar!
                        </p>
                    </div>
                </div>

                {/* Filter Kategori Kuis */}
                <div className="quiz-filter-chips">
                    {[
                        { key: 'all', label: '🌟 Semua Topik (12)' },
                        { key: 'operasi', label: '🔢 Operasi Hitung (5)' },
                        { key: 'geometri', label: '📐 Geometri & Ruang (2)' },
                        { key: 'logika', label: '🧩 Logika & Pola (2)' },
                        { key: 'sehari-hari', label: '🎒 Dunia Nyata (3)' }
                    ].map(cat => (
                        <button
                            key={cat.key}
                            className={`lesson-chip ${topicFilter === cat.key ? 'lesson-chip-active' : ''}`}
                            onClick={() => setTopicFilter(cat.key)}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="cards-grid">
                    {filteredQuizLessons.map(lesson => {
                        const qData = questionBank[lesson.id];
                        const qCount = qData ? qData.questions.length : 0;
                        return (
                            <div
                                key={lesson.id}
                                className={`activity-card card-${lesson.theme}`}
                                onClick={() => startQuiz(lesson.id)}
                            >
                                <div>
                                    <div className="card-top">
                                        <span className="card-icon">{lesson.icon}</span>
                                        <span className="card-badge badge-yellow">{lesson.tag}</span>
                                    </div>
                                    <h3 className="card-title">{lesson.title}</h3>
                                    <p className="card-desc">{lesson.summary}</p>
                                </div>

                                <div className="card-footer">
                                    <span className="footer-info">📝 {qCount} Soal Tersedia</span>
                                    <button className="play-btn btn-yellow">Mulai Kuis →</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    

    /* ══════════════════════════════════════════════════════════
       HALAMAN 4: KUIS BERJALAN
       ══════════════════════════════════════════════════════════ */
    const renderQuiz = () => {
        if (!currentCat || !currentQuestion) return null;

        const formatTime = (s) => {
            const m = String(Math.floor(s / 60)).padStart(2, '0');
            const sec = String(s % 60).padStart(2, '0');
            return `${m}:${sec}`;
        };

        return (
            <div className="page page-enter">
                <div className="quiz-topbar">
                    <button className="btn-3d btn-back" onClick={() => navigateTo('quiz-select')}>
                        ← Kembali ke Daftar Soal
                    </button>
                    <div className="quiz-topbar-center">
                        <span className="challenge-step">SOAL {currentQ + 1} DARI {totalQuestions}</span>
                        <h3 className="challenge-name">{currentCat.title}: {currentCat.subtitle}</h3>
                    </div>
                    <div className="quiz-topbar-right">
                        <span className="reward-pill">⭐ +10 Bintang</span>
                        <span className={`timer-pill ${quizTimer <= 10 ? 'timer-danger' : ''}`}>
                            ⏱ {formatTime(quizTimer)}
                        </span>
                    </div>
                </div>

                <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
                </div>

                <div className="quiz-container">
                    <div className="question-label">
                        <span className="ql-badge">PERTANYAAN {currentQ + 1} DARI {totalQuestions}</span>
                        <span className="ql-type">• {currentQuestion.type}</span>
                    </div>
                    <h2 className="question-heading">Hitung &amp; Pilih Jawaban yang Tepat!</h2>

                    <div className="question-box" style={{ background: currentCat.color }}>
                        <span className="equation-text">{currentQuestion.question}</span>
                        <div className="visual-stars">{currentQuestion.visual}</div>
                    </div>

                    <div className="answers-list">
                        {currentQuestion.options.map((opt) => {
                            let optClass = 'answer-option';
                            if (showFeedback && selectedAnswer === opt.value) {
                                optClass += isCorrect ? ' answer-correct' : ' answer-wrong';
                            }
                            if (showFeedback && opt.value === currentQuestion.correct && !isCorrect) {
                                optClass += ' answer-correct-reveal';
                            }
                            return (
                                <button
                                    key={opt.label}
                                    className={optClass}
                                    onClick={() => handleAnswerQuiz(opt.value)}
                                    disabled={showFeedback}
                                >
                                    <span className="opt-label">{opt.label}</span>
                                    <span className="opt-value">{opt.value}</span>
                                    {!showFeedback && <span className="opt-hint">Klik untuk memilih</span>}
                                    {showFeedback && selectedAnswer === opt.value && isCorrect && (
                                        <span className="opt-result opt-result-correct">✓ Hebat! Benar! 🎉</span>
                                    )}
                                    {showFeedback && selectedAnswer === opt.value && !isCorrect && (
                                        <span className="opt-result opt-result-wrong">✗ Coba lagi ya 😊</span>
                                    )}
                                    {showFeedback && opt.value === currentQuestion.correct && selectedAnswer !== opt.value && (
                                        <span className="opt-result opt-result-correct">✓ Ini Jawaban Tepat!</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {showFeedback && (
                        <div className={`feedback-box ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
                            <span className="feedback-icon">{isCorrect ? '🎉' : '💡'}</span>
                            <div className="feedback-text">
                                <strong>{isCorrect ? 'Awesome Job! Jawabanmu Benar!' : 'Yuk Pelajari Penjelasannya:'}</strong>
                                <p>{currentQuestion.explanation}</p>
                                {isCorrect && <span className="feedback-stars">+10 ⭐ Bintang ditambahkan ke profilmu!</span>}
                            </div>
                        </div>
                    )}

                    {showFeedback && (
                        <div className="quiz-actions">
                            <button className="btn-3d btn-primary btn-next" onClick={nextQuizQuestion}>
                                {currentQ + 1 < totalQuestions ? 'Soal Berikutnya →' : 'Lihat Hasil Akhir 🏆'}
                            </button>
                        </div>
                    )}

                    <div className="quiz-footer">
                        <span className="help-badge">💡 Tip: Perhatikan petunjuk gambar di kotak atas!</span>
                        <span className="score-badge">Skor: {score} dari {currentQ + (showFeedback ? 1 : 0)} Soal</span>
                    </div>
                </div>
            </div>
        );
    };

    

    /* ══════════════════════════════════════════════════════════
       HALAMAN 5: HASIL KUIS
       ══════════════════════════════════════════════════════════ */
    const renderResult = () => {
        if (!currentCat) return null;
        const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
        const avgTime = totalQuestions > 0 ? Math.round(totalQuizTime / totalQuestions) : 0;

        let emoji = '🏆';
        let title = 'Awesome Job!';
        let message = 'Hebat sekali! Kamu menyelesaikan tantangan ini dengan sangat baik!';
        if (accuracy === 100) {
            emoji = '👑';
            title = 'Sempurna 100%!';
            message = 'Luar biasa! Semua pertanyaan dijawab dengan tepat tanpa salah!';
        } else if (accuracy < 50) {
            emoji = '💪';
            title = 'Tetap Semangat!';
            message = 'Latihan membuatmu semakin pintar. Buka materi dan coba sekali lagi ya!';
        }

        return (
            <div className="page page-scale">
                <div className="result-container">
                    <span className="completed-badge">🟢 Kuis {currentCat.title} Selesai!</span>
                    <span className="total-stars-badge">⭐ Total: {stars} Stars</span>

                    <div className="trophy-box">{emoji}</div>
                    <h1 className="result-title">{title}</h1>
                    <p className="result-sub">{message}</p>

                    <div className="solved-card">
                        <span className="solved-label">HASIL JAWABAN KAMU</span>
                        <span className="solved-check">{score} / {totalQuestions} Soal Benar</span>
                        <span className="solved-equation">{accuracy}% Akurasi Jawaban 🎯</span>
                    </div>

                    <div className="stats-row">
                        <div className="stat-box stat-blue">
                            <span className="stat-value">+{starsEarned}</span>
                            <span className="stat-label">BINTANG BARU</span>
                        </div>
                        <div className="stat-box stat-green">
                            <span className="stat-value">{accuracy}%</span>
                            <span className="stat-label">AKURASI KUIS</span>
                        </div>
                        <div className="stat-box stat-yellow">
                            <span className="stat-value">{avgTime}s</span>
                            <span className="stat-label">RATA WAKTU</span>
                        </div>
                    </div>

                    <div className="result-buttons">
                        <button className="btn-3d btn-primary btn-continue" onClick={() => startQuiz(selectedCategory)}>
                            🔄 Ulangi Kuis Ini
                        </button>
                        <button className="btn-3d btn-coral btn-home" onClick={() => navigateTo('quiz-select')}>
                            🎯 Coba Topik Kuis Lainnya
                        </button>
                        <button className="btn-3d btn-secondary-white" onClick={() => navigateTo('lessons')}>
                            📖 Baca Materi Terkait
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    

    /* ══════════════════════════════════════════════════════════
       HALAMAN 6: MINI GAME HITUNG KILAT (SPEED MATH 30s)
       ══════════════════════════════════════════════════════════ */
    const renderMiniGame = () => {
        const currentSpeedQ = speedGamePool[speedQIndex % speedGamePool.length];

        return (
            <div className="page page-enter">
                <div className="page-header-box">
                    <div className="page-header-left">
                        <span className="page-badge">⚡ GAME CEPAT &amp; SERU</span>
                        <h2 className="page-main-title">Tantangan Hitung Kilat 30 Detik</h2>
                        <p className="page-main-desc">
                            Uji kecepatan berpikirmu! Tentukan apakah pernyataan matematika di bawah ini BENAR atau SALAH secepat mungkin!
                        </p>
                    </div>
                </div>

                {!speedActive && !speedGameOver && (
                    <div className="speed-start-card">
                        <div className="speed-icon-intro">⚡</div>
                        <h3>Siap Menguji Kecepatan Hitungmu?</h3>
                        <p>Kamu punya waktu 30 detik untuk menjawab sebanyak mungkin pernyataan matematika.</p>
                        <ul className="speed-rules">
                            <li>✨ Setiap jawaban benar memberi +1 Poin &amp; Combo</li>
                            <li>⭐ Raih Bintang ekstra di akhir permainan!</li>
                            <li>⏱ Waktu terus berjalan, jangan ragu!</li>
                        </ul>
                        <button className="btn-3d btn-primary btn-large" onClick={startSpeedGame}>
                            🚀 Mulai Sekarang (30 Detik)!
                        </button>
                    </div>
                )}

                {speedActive && (
                    <div className="speed-game-board">
                        <div className="speed-hud">
                            <div className="speed-timer-box">
                                <span>WAKTU</span>
                                <strong>⏱ {speedTimer}s</strong>
                            </div>
                            <div className="speed-score-box">
                                <span>SKOR</span>
                                <strong>{speedScore}</strong>
                            </div>
                            <div className="speed-combo-box">
                                <span>COMBO</span>
                                <strong>🔥 {speedCombo}x</strong>
                            </div>
                        </div>

                        <div className="speed-card">
                            <span className="speed-card-tag">Apakah pernyataan ini benar?</span>
                            <h1 className="speed-equation">{currentSpeedQ.text}</h1>
                        </div>

                        <div className="speed-buttons">
                            <button 
                                className="btn-3d btn-speed btn-speed-correct"
                                onClick={() => handleSpeedAnswer(true)}
                            >
                                ✅ BENAR
                            </button>
                            <button 
                                className="btn-3d btn-speed btn-speed-wrong"
                                onClick={() => handleSpeedAnswer(false)}
                            >
                                ❌ SALAH
                            </button>
                        </div>
                    </div>
                )}

                {speedGameOver && (
                    <div className="speed-result-card">
                        <div className="speed-trophy">🎉</div>
                        <h2>Waktu Habis! Hebat Banget!</h2>
                        <p>Kamu berhasil menjawab <strong>{speedScore}</strong> soal dengan benar!</p>
                        <div className="speed-reward-box">
                            <span>Hadiah Kamu:</span>
                            <h3>⭐ +{speedScore * 5} Bintang Ditambahkan!</h3>
                        </div>
                        <div className="speed-result-actions">
                            <button className="btn-3d btn-primary" onClick={startSpeedGame}>
                                🔄 Main Lagi
                            </button>
                            <button className="btn-3d btn-secondary-white" onClick={() => navigateTo('home')}>
                                🏠 Kembali ke Beranda
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    /* ══════════════════════════════════════════════════════════
       HALAMAN 7: LENCANA & PRESTASI
       ══════════════════════════════════════════════════════════ */
    const renderBadges = () => {
        const badgesList = [
            {
                id: 1, title: 'Bintang Pemula', icon: '⭐',
                desc: 'Memiliki 120 bintang di petualangan SMARTER.',
                unlocked: stars >= 120,
                progress: '100% Tercapai'
            },
            {
                id: 2, title: 'Master Penjumlahan', icon: '🧮',
                desc: 'Selesaikan tantangan kuis penjumlahan dasar.',
                unlocked: quizzesCompleted >= 1,
                progress: quizzesCompleted >= 1 ? 'Terbuka' : 'Selesaikan 1 Kuis'
            },
            {
                id: 3, title: 'Pakar Geometri Cilik', icon: '🔺',
                desc: 'Mengenal sisi segitiga, persegi, dan lingkaran.',
                unlocked: quizzesCompleted >= 2,
                progress: quizzesCompleted >= 2 ? 'Terbuka' : 'Selesaikan Kuis Geometri'
            },
            {
                id: 4, title: 'Juara Hitung Kilat', icon: '⚡',
                desc: 'Mainkan Mini Game Hitung Kilat 30 detik.',
                unlocked: speedScore > 0 || speedGameOver,
                progress: speedScore > 0 ? 'Terbuka' : 'Mainkan 1x Hitung Kilat'
            },
            {
                id: 5, title: 'Kolektor Bintang Emas', icon: '🌟',
                desc: 'Raih minimal 150 bintang dari berbagai kuis.',
                unlocked: stars >= 150,
                progress: `${Math.min(100, Math.round((stars / 150) * 100))}% (${stars}/150 Stars)`
            },
            {
                id: 6, title: 'Raja Matematika SMARTER', icon: '👑',
                desc: 'Selesaikan 5 kuis dengan akurasi tinggi.',
                unlocked: quizzesCompleted >= 5,
                progress: `${quizzesCompleted}/5 Kuis Selesai`
            }
        ];

        return (
            <div className="page page-enter">
                <div className="page-header-box">
                    <div className="page-header-left">
                        <span className="page-badge">🏅 PRESTASI &amp; PENGHARGAAN</span>
                        <h2 className="page-main-title">Koleksi Lencana Bintang</h2>
                        <p className="page-main-desc">
                            Setiap kamu belajar materi dan menyelesaikan kuis, lencana prestasimu akan terbuka satu per satu!
                        </p>
                    </div>
                    <div className="badges-header-badge">
                        <span>⭐ Koleksi Kamu</span>
                        <strong>{stars} Bintang</strong>
                    </div>
                </div>

                <div className="badges-grid">
                    {badgesList.map(b => (
                        <div key={b.id} className={`badge-card ${b.unlocked ? 'badge-unlocked' : 'badge-locked'}`}>
                            <div className="badge-card-icon">{b.icon}</div>
                            <div className="badge-card-info">
                                <h3>{b.title}</h3>
                                <p>{b.desc}</p>
                                <span className="badge-status-pill">
                                    {b.unlocked ? '✅ Terbuka' : `🔒 ${b.progress}`}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    

    /* ══════════════════════════════════════════════════════════
       HALAMAN 8: POJOK ORANG TUA & GURU
       ══════════════════════════════════════════════════════════ */
    const renderParents = () => (
        <div className="page page-enter">
            <div className="page-header-box">
                <div className="page-header-left">
                    <span className="page-badge">👨‍👩‍👧 PANDUAN PENDAMPINGAN ANAK</span>
                    <h2 className="page-main-title">Pojok Orang Tua &amp; Guru</h2>
                    <p className="page-main-desc">
                        Pantau kemajuan belajar matematika ananda, atur batas durasi layar, dan temukan tips mendampingi belajar yang ramah anak.
                    </p>
                </div>
            </div>

            <div className="parents-grid">
                <div className="parents-card">
                    <div className="parents-card-head">
                        <span className="parents-icon">📊</span>
                        <h3>Ringkasan Aktivitas Petualang Cilik</h3>
                    </div>
                    <div className="parents-metrics">
                        <div className="p-metric">
                            <span className="p-label">Total Bintang</span>
                            <strong className="p-value">⭐ {stars}</strong>
                        </div>
                        <div className="p-metric">
                            <span className="p-label">Kuis Selesai</span>
                            <strong className="p-value">📝 {quizzesCompleted} Sesi</strong>
                        </div>
                        <div className="p-metric">
                            <span className="p-label">Status Kurikulum</span>
                            <strong className="p-value" style={{ color: '#22C55E' }}>Aktif &amp; Lancar</strong>
                        </div>
                    </div>
                    <p className="parents-note">
                        💡 Rekomendasi: Ananda menunjukkan minat tinggi pada topik <strong>Penjumlahan</strong> dan <strong>Geometri</strong>. Disarankan melanjutkan ke latihan perkalian ringan.
                    </p>
                </div>

                <div className="parents-card">
                    <div className="parents-card-head">
                        <span className="parents-icon">⏱</span>
                        <h3>Batas Waktu Layar (Screen Time)</h3>
                    </div>
                    <p className="parents-desc">
                        Jaga keseimbangan mata anak dengan membatasi sesi belajar harian:
                    </p>
                    <div className="screen-time-options">
                        {[15, 30, 45, 60].map(mins => (
                            <button
                                key={mins}
                                className={`time-pill ${screenTimeLimit === mins ? 'time-pill-active' : ''}`}
                                onClick={() => setScreenTimeLimit(mins)}
                            >
                                {mins} Menit
                            </button>
                        ))}
                    </div>
                    <span className="screen-time-status">
                        ✓ Pengingat istirahat akan aktif setiap <strong>{screenTimeLimit} menit</strong>.
                    </span>
                </div>

                <div className="parents-card full-width-card">
                    <div className="parents-card-head">
                        <span className="parents-icon">❤️</span>
                        <h3>3 Tips Menyenangkan Belajar Matematika di Rumah</h3>
                    </div>
                    <div className="tips-list-grid">
                        <div className="tip-box">
                            <h4>1. Hubungkan dengan Kehidupan Nyata</h4>
                            <p>Ajak ananda menghitung buah saat belanja di pasar atau menghitung jumlah piring di meja makan saat menyiapkan makan malam.</p>
                        </div>
                        <div className="tip-box">
                            <h4>2. Beri Apresiasi pada Usaha</h4>
                            <p>Fokuslah memuji usahanya ("Kamu hebat sudah teliti menghitung!") daripada sekadar nilai akhir. Ini membangun growth mindset.</p>
                        </div>
                        <div className="tip-box">
                            <h4>3. Jangan Takut Salah</h4>
                            <p>Kesalahan berhitung adalah bagian dari proses belajar. Manfaatkan fitur 'Penjelasan Jawaban' di kuis SMARTER untuk berdiskusi bersama.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    /* ══════════════════════════════════════════════════════════
       RENDER HALAMAN SILABUS & ROADMAP KURSUS
       ══════════════════════════════════════════════════════════ */
    const renderSyllabus = () => {
        const currentCourse = syllabusData[syllabusTrack] || syllabusData.math;
        const currentLevelData = currentCourse.levels.find(l => l.level === activeSyllabusLevel) || currentCourse.levels[0];

        return (
            <div className="page page-enter syllabus-page">
                {/* Header Silabus */}
                <div className="syllabus-header-card">
                    <div className="syllabus-badge-chip">🗺️ SILABUS & KURIKULUM BERJENJANG</div>
                    <h1 className="syllabus-main-title">Pilih Kursus & Petualangan Belajarmu!</h1>
                    <p className="syllabus-subtitle-desc">
                        Kurikulum bertahap 16 pekan yang dirancang khusus untuk anak usia 6–10 tahun.
                        Pilih fokus belajar: <strong>Matematika Cilik</strong> atau <strong>Bahasa Inggris Anak (Kids English)</strong>!
                    </p>

                    {/* Switcher Kursus */}
                    <div className="syllabus-track-selector">
                        <button
                            type="button"
                            className={`track-pill-btn ${syllabusTrack === 'math' ? 'track-pill-active math-active' : ''}`}
                            onClick={() => {
                                setSyllabusTrack('math');
                                setActiveSyllabusLevel(1);
                            }}
                        >
                            <span className="track-icon">🧮</span>
                            <div className="track-info">
                                <span className="track-name">Kursus Matematika Cilik</span>
                                <span className="track-sub">16 Pekan • 4 Tingkat SD</span>
                            </div>
                            {syllabusTrack === 'math' && <span className="track-check">✓ Aktif</span>}
                        </button>

                        <button
                            type="button"
                            className={`track-pill-btn ${syllabusTrack === 'english' ? 'track-pill-active english-active' : ''}`}
                            onClick={() => {
                                setSyllabusTrack('english');
                                setActiveSyllabusLevel(1);
                            }}
                        >
                            <span className="track-icon">🇬🇧</span>
                            <div className="track-info">
                                <span className="track-name">Kids English Explorer</span>
                                <span className="track-sub">16 Pekan • Audio Phonics</span>
                            </div>
                            {syllabusTrack === 'english' && <span className="track-check">✓ Aktif</span>}
                        </button>
                    </div>
                </div>

                {/* Hero Banner Kursus Terpilih */}
                <div className={`course-hero-banner theme-${currentCourse.theme}`}>
                    <div className="course-hero-left">
                        <div className="course-hero-badge-row">
                            <span className="course-hero-badge">{currentCourse.badge}</span>
                            <span className="course-hero-badge duration">⏱️ {currentCourse.duration}</span>
                            <span className="course-hero-badge age">🎯 {currentCourse.targetAge}</span>
                        </div>
                        <h2 className="course-hero-title">{currentCourse.title}</h2>
                        <p className="course-hero-sub">{currentCourse.subtitle}</p>
                        <p className="course-hero-desc">{currentCourse.desc}</p>
                    </div>
                    <div className="course-hero-illustration">
                        <span className="course-hero-big-icon">{currentCourse.icon}</span>
                        <div className="course-hero-stats">
                            <div className="stat-bubble">
                                <strong>4</strong>
                                <span>Tingkatan</span>
                            </div>
                            <div className="stat-bubble">
                                <strong>12+</strong>
                                <span>Materi Inti</span>
                            </div>
                            <div className="stat-bubble">
                                <strong>500+</strong>
                                <span>Total ⭐</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Level Tabs Navigation */}
                <div className="syllabus-level-tabs">
                    {currentCourse.levels.map((lvl) => {
                        const isActive = activeSyllabusLevel === lvl.level;
                        return (
                            <button
                                key={lvl.level}
                                type="button"
                                className={`level-tab-btn ${isActive ? 'level-tab-active' : ''}`}
                                onClick={() => setActiveSyllabusLevel(lvl.level)}
                                style={{
                                    borderColor: isActive ? lvl.color : 'transparent',
                                    borderBottomColor: isActive ? lvl.color : '#e2e8f0'
                                }}
                            >
                                <span className="tab-lvl-icon">{lvl.icon}</span>
                                <div className="tab-lvl-text">
                                    <span className="tab-lvl-title">Tingkat {lvl.level}</span>
                                    <span className="tab-lvl-age">{lvl.age.split('(')[0].trim()}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Konten Tingkat / Level Terpilih */}
                <div className="syllabus-level-detail-card" style={{ borderTop: `6px solid ${currentLevelData.color}` }}>
                    <div className="level-detail-header">
                        <div className="level-title-wrap">
                            <div className="level-badge-number" style={{ background: currentLevelData.color }}>
                                {currentLevelData.icon} Tingkat {currentLevelData.level}
                            </div>
                            <h3>{currentLevelData.name}</h3>
                            <span className="level-age-chip">🎯 {currentLevelData.age}</span>
                        </div>
                    </div>

                    <div className="level-goal-box">
                        <div className="goal-icon">🎯</div>
                        <div className="goal-content">
                            <strong>Target Capaian Belajar:</strong>
                            <p>{currentLevelData.goal}</p>
                        </div>
                    </div>

                    {/* Jika Jalur Bahasa Inggris: Tampilkan Kartu Interaktif Suara Kosakata */}
                    {syllabusTrack === 'english' && currentLevelData.flashcards && (
                        <div className="english-flashcards-section">
                            <div className="flashcards-heading-row">
                                <div>
                                    <h4 className="flashcards-title">🔊 Kartu Suara Kosakata Cilik (Native English Audio)</h4>
                                    <p className="flashcards-sub">Klik kartu atau tombol suara untuk mendengar pengucapan asli native speaker!</p>
                                </div>
                                <span className="flashcards-count-badge">{currentLevelData.flashcards.length} Kosakata Kunci</span>
                            </div>

                            <div className="flashcards-grid">
                                {currentLevelData.flashcards.map((card, idx) => {
                                    const isThisSpeaking = speakingWord === card.word;
                                    return (
                                        <div
                                            key={idx}
                                            className={`flashcard-card ${isThisSpeaking ? 'flashcard-card-active' : ''}`}
                                            onClick={() => speakEnglish(card.word)}
                                            role="button"
                                            tabIndex={0}
                                        >
                                            <div className="flashcard-emoji">{card.emoji}</div>
                                            <div className="flashcard-body">
                                                <span className="flashcard-word">{card.word}</span>
                                                <span className="flashcard-pron">/{card.pron}/</span>
                                                <span className="flashcard-meaning">{card.meaning}</span>
                                            </div>
                                            <button
                                                type="button"
                                                className={`btn-card-audio ${isThisSpeaking ? 'btn-audio-speaking' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    speakEnglish(card.word);
                                                }}
                                                title={`Dengarkan ${card.word}`}
                                            >
                                                {isThisSpeaking ? '🔊 Berbicara...' : '🔈 Play Audio'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Milestones / Rencana Pekan Belajar */}
                    <div className="milestones-container">
                        <h4 className="milestones-title">📅 Rencana Pekan Belajar & Tantangan Berhadiah:</h4>
                        <div className="milestones-grid">
                            {currentLevelData.milestones.map((m, mIdx) => (
                                <div key={mIdx} className="milestone-card">
                                    <div className="milestone-time-badge">{m.week}</div>
                                    <div className="milestone-body">
                                        <h5 className="milestone-topic">{m.topic}</h5>
                                        <div className="milestone-reward-badge">
                                            <span>Reward: +{m.stars} ⭐ Bintang</span>
                                        </div>
                                    </div>
                                    <div className="milestone-action">
                                        {syllabusTrack === 'math' ? (
                                            <button
                                                type="button"
                                                className="btn-milestone-cta btn-math-cta"
                                                onClick={() => {
                                                    setLessonSubject('math');
                                                    setActiveLessonId(m.lessonId || 'learn-numbers');
                                                    navigateTo('lessons');
                                                }}
                                            >
                                                📖 Pelajari Materi
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className="btn-milestone-cta btn-en-cta"
                                                onClick={() => {
                                                    setLessonSubject('english');
                                                    setActiveLessonId(m.lessonId || 'en-alphabet');
                                                    navigateTo('lessons');
                                                }}
                                            >
                                                📖 Pelajari Modul Inggris →
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sertifikat & Motivasi */}
                <div className="syllabus-certificate-card">
                    <div className="cert-icon">🎓</div>
                    <div className="cert-info">
                        <h3>Sertifikat Kejuaraan SMARTER Academy</h3>
                        <p>
                            Selesaikan setiap pekan belajar dan kuis untuk membuka Sertifikat Kelulusan resmi dengan nama anak Anda,
                            siap diunduh dan dicetak sebagai bukti prestasi!
                        </p>
                    </div>
                    <button
                        type="button"
                        className="btn-cert-download"
                        onClick={() => {
                            fireConfetti();
                            alert(`🌟 Hebat! Kamu sedang menempuh kursus: ${currentCourse.title}. Terus rajin belajar setiap hari untuk membuka sertifikat kelulusan emasmu!`);
                        }}
                    >
                        🎖️ Cek Progres Kelulusan
                    </button>
                </div>
            </div>
        );
    };

    /* ══════════════════════════════════════════════════════════
       RENDER UTAMA APLIKASI
       ══════════════════════════════════════════════════════════ */
    return (
        <div className="app-root">
            <canvas id="confetti-canvas" className="confetti-canvas-overlay" />

            <div className="app-wrapper">
                <Navbar
                    stars={stars}
                    activePage={page}
                    onNavigate={(p) => navigateTo(p)}
                    currentAvatar={userAvatar}
                    onSelectAvatar={(av) => setUserAvatar(av)}
                    streakCount={streakCount}
                    onOpenSpinWheel={() => setShowSpinModal(true)}
                />

                {page === 'home' && renderHome()}
                {page === 'syllabus' && renderSyllabus()}
                {page === 'lessons' && renderLessons()}
                {page === 'quiz-select' && renderQuizSelect()}
                {page === 'quiz' && renderQuiz()}
                {page === 'result' && renderResult()}
                {page === 'minigame' && renderMiniGame()}
                {page === 'badges' && renderBadges()}
                {page === 'parents' && renderParents()}
            </div>

            {/* Modal Roda Karnaval Ajaib */}
            {renderSpinModal()}

            {/* Modal Tabel 100 Pythagoras (10×10) */}
            {renderPythagorasModal()}
        </div>
    );
}
