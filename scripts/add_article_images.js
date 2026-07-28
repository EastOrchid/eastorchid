const fs = require('fs');
const dir = 'D:\\.openclaw\\workspace\\eastorchid';

function addArticleImages(filePath, images) {
    let content = fs.readFileSync(filePath, 'utf-8');
    const original = content;

    images.forEach(img => {
        const placeholder = img.placeholder;
        const figureHtml = `<figure style="margin:1.5rem 0;">
  <img src="${img.src}" alt="${img.alt}" style="max-width:100%;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
  <figcaption style="font-size:0.85rem;color:var(--text-light);margin-top:0.5rem;line-height:1.5;">
    ${img.caption}<br>
    <em>Photo by ${img.photographer}, via ${img.source}, ${img.license}</em>
  </figcaption>
</figure>`;

        if (content.includes(placeholder)) {
            content = content.replace(placeholder, figureHtml);
            console.log('  ✓ Inserted: ' + img.label);
        } else {
            console.log('  ✗ Placeholder not found: ' + placeholder);
        }
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log('✅ Saved: ' + filePath.split('\\').pop());
    }
}

// === Article 011: Hanlan ===
addArticleImages(dir + '\\articles\\species\\hanlan-cymbidium-kanran.html', [
    {
        placeholder: '<!-- [Hero Image: Cymbidium kanran blooming in winter] -->',
        label: 'Hanlan Hero (kouki variety)',
        src: '../../assets/orchid-library/photos/sources/hanlan/hanlan_kouki.jpg',
        alt: 'Cymbidium kanran (Hanlan) kouki variety - winter blooming flowers',
        caption: '<strong>Cymbidium kanran</strong> — Kouki variety, showing the characteristic star-shaped winter flowers with pale green sepals and maroon-spotted lip.',
        photographer: 'Keisotyo',
        source: 'Wikimedia Commons',
        license: 'CC BY-SA 3.0 / GFDL'
    },
    {
        placeholder: '<!-- [Image: Hanlan flower close-up showing star-like form] -->',
        label: 'Hanlan Flower Detail',
        src: '../../assets/orchid-library/photos/sources/hanlan/hanlan_flower.jpg',
        alt: 'Cymbidium kanran flower close-up - star-like form',
        caption: '<strong>Cymbidium kanran</strong> — Flower close-up revealing the narrow, elongated sepals and petals that create a star-shaped profile, characteristic of Hanlan.',
        photographer: 'Keisotyo',
        source: 'Wikimedia Commons',
        license: 'CC BY-SA 3.0'
    },
    {
        placeholder: '<!-- [Image: Hanlan leaves showing graceful arch] -->',
        label: 'Hanlan Whole Plant',
        src: '../../assets/orchid-library/photos/sources/hanlan/hanlan_whole.jpg',
        alt: 'Cymbidium kanran whole plant with graceful arching leaves',
        caption: '<strong>Cymbidium kanran</strong> — The whole plant displaying its slender, arching leaves, typically 30–60 cm in length with a refined silhouette.',
        photographer: 'KENPEI',
        source: 'Wikimedia Commons',
        license: 'GFDL'
    }
]);

// === Article 012: Molan ===
addArticleImages(dir + '\\articles\\species\\molan-cymbidium-sinense.html', [
    {
        placeholder: '<!-- [Hero Image: Cymbidium sinense in full bloom] -->',
        label: 'Molan Hero (flower close-up)',
        src: '../../assets/orchid-library/photos/sources/molan/molan_flower.jpg',
        alt: 'Cymbidium sinense (Molan) - Ink Orchid flowers in full bloom',
        caption: '<strong>Cymbidium sinense</strong> — The Ink Orchid in full bloom, displaying its characteristic rich maroon flowers on tall spikes.',
        photographer: 'Orchi',
        source: 'Wikimedia Commons',
        license: 'CC BY-SA 3.0'
    },
    {
        placeholder: '<!-- [Image: Molan dark green leaves and flower spike] -->',
        label: 'Molan Leaves',
        src: '../../assets/orchid-library/photos/sources/molan/molan_whole.jpg',
        alt: 'Cymbidium sinense dark glossy leaves and flower spike',
        caption: '<strong>Cymbidium sinense</strong> — Broad, dark, glossy leaves and emerging flower spike. The deep green, almost black leaves give Molan its name "Ink Orchid" (墨兰).',
        photographer: 'Averater',
        source: 'Wikimedia Commons',
        license: 'CC BY-SA 3.0'
    }
    // Molan has only 2 Wikimedia images; 3rd placeholder kept for future fill
]);

console.log('\nDONE');
