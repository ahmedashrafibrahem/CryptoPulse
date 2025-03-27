const https = require('https');
const fs = require('fs');
const path = require('path');

const images = [
    {
        name: 'featured.jpg',
        url: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&q=80'
    },
    {
        name: 'bitcoin-mining.jpg',
        url: 'https://images.unsplash.com/photo-1625726411847-8cbb60cc71e6?w=800&q=80'
    },
    {
        name: 'defi.jpg',
        url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80'
    },
    {
        name: 'nft.jpg',
        url: 'https://images.unsplash.com/photo-1645378999013-0ec8756484a6?w=800&q=80'
    },
    {
        name: 'ethereum.jpg',
        url: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800&q=80'
    },
    {
        name: 'security.jpg',
        url: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&q=80'
    },
    {
        name: 'bank.jpg',
        url: 'https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800&q=80'
    }
];

const downloadImage = (url, filename) => {
    return new Promise((resolve, reject) => {
        const filepath = path.join(__dirname, 'assets', 'blog', filename);
        const file = fs.createWriteStream(filepath);

        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded: ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => {
                console.error(`Error downloading ${filename}:`, err.message);
                reject(err);
            });
        });
    });
};

async function downloadAllImages() {
    try {
        for (const image of images) {
            await downloadImage(image.url, image.name);
        }
        console.log('All images downloaded successfully!');
    } catch (error) {
        console.error('Error downloading images:', error);
    }
}

downloadAllImages(); 