const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Data awal jumlah bintang pemain
let userStars = 120;

// Data 6 Kartu Aktivitas SMARTER
const activities = [
    {
        id: 1,
        badge: "Populer",
        icon: "123",
        title: "1. Learn Numbers",
        desc: "Count and master basic addition! Belajar berhitung dan penjumlahan dasar yang asyik.",
        level: "Tingkat: Dasar (6-7 Thn)",
        theme: "blue"
    },
    {
        id: 2,
        badge: "Geometri",
        icon: "●▲",
        title: "2. Explore Shapes",
        desc: "Find circles and squares around you! Kenali berbagai macam bangun ruang di sekitarmu.",
        level: "Tingkat: Eksplorasi",
        theme: "coral"
    },
    {
        id: 3,
        badge: "Teka-teki",
        icon: "★",
        title: "3. Solve Challenges",
        desc: "Fun math puzzles! Asah logika berpikir cepat dengan game teka-teki logika ceria.",
        level: "Tingkat: Sedang (8-9 Thn)",
        theme: "yellow"
    },
    {
        id: 4,
        badge: "Bonus Harian",
        icon: "⚡",
        title: "4. Daily Math Quiz",
        desc: "Collect stars with 5 quick questions! Jawab 5 pertanyaan kilat setiap hari untuk dapat bintang.",
        level: "Hadiah: +20 Bintang",
        theme: "blue"
    },
    {
        id: 5,
        badge: "Logika",
        icon: "▲●▲",
        title: "5. Pattern Matching",
        desc: "Find the missing sequence! Temukan pola urutan angka dan warna yang tersembunyi.",
        level: "Tingkat: Pengamatan",
        theme: "coral"
    },
    {
        id: 6,
        badge: "Pengukuran",
        icon: "📏",
        title: "6. Fun Measurement",
        desc: "Compare sizes and lengths easily! Belajar mengukur panjang benda, berat, dan volume.",
        level: "Tingkat: Pengukuran",
        theme: "yellow"
    }
];

// Mengirim data ke Frontend React
app.get('/api/smarter-data', (req, res) => {
    res.json({
        stars: userStars,
        activities: activities
    });
});

// Menambah bintang (default +10 atau sesuai payload)
app.post('/api/add-stars', (req, res) => {
    const amount = (req.body && req.body.amount) ? Number(req.body.amount) : 10;
    userStars += amount;
    res.json({
        message: "Bintang berhasil ditambah!",
        totalStars: userStars
    });
});

app.listen(PORT, () => {
    console.log(`Server Backend SMARTER berjalan di http://localhost:${PORT}`);
});