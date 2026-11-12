let userStars = 120;

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    let amount = 10;
    if (req.body) {
        if (typeof req.body === 'string') {
            try {
                const parsed = JSON.parse(req.body);
                if (parsed.amount) amount = Number(parsed.amount);
            } catch (e) { }
        } else if (req.body.amount) {
            amount = Number(req.body.amount);
        }
    }

    userStars += amount;

    return res.status(200).json({
        message: "Bintang berhasil ditambah!",
        totalStars: userStars
    });
}

