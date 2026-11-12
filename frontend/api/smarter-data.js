let userStars = 120;

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

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    return res.status(200).json({
        stars: userStars,
        activities
    });
}
