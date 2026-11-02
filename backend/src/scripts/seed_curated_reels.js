const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config({ path: 'backend/.env' });

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

const { connectDB, getGridFSBucket } = require('../config/db');
const Marriage = require('../models/Marriage');
const { Event } = require('../models/Event');

// Valid minimal MP4 container header
const SAMPLE_MP4_BUFFER = Buffer.from(
  '000000186674797069736f6d0000020069736f6d69736f32617663310000000866726565000001006d646174',
  'hex'
);

const CURATED_REELS = {
  RAJSIM24: [
    {
      ceremony: 'SANGEET',
      title: 'Zara Sa Jhoom Loon — Sangeet Finale Choreography',
      duration: '02:45',
      curator: 'Simran & Raj',
      plays: 1840,
      poster: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCA55Hy4h3141dkGq_vL33-UITtTVym4N09dB435L9BjwGMwIw7qcGByK20-Lsb-u1AdvBVBotHwhFsD_xZGKn3aKbQ-b_v6gX7Oq384UMS9cyoHkNSiTJDV16jyYXE88p46TpdxVynimUhuHMtJRT3u_w38tGH8CCSOjmkeksIROJ0jOI2J9A-DB_vXZ_r0fS1NbZsl-5D6bSeDQHUE9EZFTXYjyBpQtT1Ka6rOok'
    },
    {
      ceremony: 'HALDI',
      title: 'The Golden Haldi Glow — Candid Marigold Shower',
      duration: '01:30',
      curator: "Bauji's Patriarch Blessing",
      plays: 940,
      poster: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAl4Vx7mJmEXstmCeOn1bUixfHWsEupWLRip3rsJ0bhIcIP2eZstjzJ83o5pG9uHPUAWKYRSqxoIYpd8m61iExk-v93aqLRVMq2x1vYsAcXX4fxKbkn0CSFI9VZBGPwrFn64qGzhTibRO5kB20GnrCjBltv0G8JSpIopkHoNqhplARD8eMVUKsHWDpAHlu7tsshMZzHbHVqniTRFWw0nkgKvWykZlXWgUHGz7kf42k'
    },
    {
      ceremony: 'MEHNDI',
      title: 'Chenab Flute & Kashmiri Sunset Ritual',
      duration: '03:15',
      curator: 'Host Concierge Protocol',
      plays: 1120,
      poster: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCr8JaetGPE7YDWY2Tkchy9X0cn6zz9VIBwVFNELtgTAqvBkLdRwZSl8kdZZ5QKyZyo98B-q2cVFZldcWeWQlQg8fT0v2FNJL8wdVlPCCuymd4-mu-dIYe1xkGYJSBekNvHOGJ8lvlUODhwx_uULIQOmCMBXiACsZN75CV2f8bA6-wDtgu60O8jPxKDYsq0Mcg6FmClli07FIXMm1O3j109A30cv4GgoIdlfb1xV8U'
    },
    {
      ceremony: 'MARRIAGE',
      title: 'Saat Phere & Sindoor Daan — Sacred Rites & Vows',
      duration: '04:10',
      curator: 'Official Studio Cinematographer',
      plays: 3490,
      poster: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbSFnFnI5Jpuh7ZvGS3KHTjNtzsxn8QClt8G1aEU_khuiHUXftjAUcu-p9vNEMI-JMpDPb9BN4GRuhajwvB-ztl8XyeKA1qvKfmj5XKAlLIDbe_Me-D9NIu0rO56VD6LfDF0SYO7fuVQZk7xSgh_Sk2mc1JykfqYjlf4hnAGRMBsd1xmlZcO9CfZJE9zN3Pjj88uorqmbaMzrU2tWQb8eRyG45powg3Ql5fZxWlK0'
    }
  ],
  LAILAM25: [
    {
      ceremony: 'SANGEET',
      title: 'Hafiz Hafiz — Sufi Musical Night in the Valley',
      duration: '03:30',
      curator: 'Qais & Laila',
      plays: 2150,
      poster: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwZlcHb_KVUMvBiZhacxOUxbjv9rYLP52FrP0hNeO5AuTcxEUpEnjINTU_47yEacFb_9IlmAslUSaFNBYVtJ3uTPDgVQRMRh-nJlO3WnRTF9ebW2trgiHhtykoYA8O7bM5PNbzgeS8HBzOwYuFSXJmuaYXjz8rUBRBjcBXe58Yor5miYy_VkclG4OdFRA2SoWL4_6DHNwLl5-z6ziJgt7_w_0DU7nns2FViIwomk'
    },
    {
      ceremony: 'HALDI',
      title: 'O Meri Laila — Golden Chinar Blossom Ritual',
      duration: '02:15',
      curator: 'Chinar Elders',
      plays: 1420,
      poster: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6fO2qwvTXCfSdcSEAgwTCIMP1jaIcPkXdwV1FvCCfRf-5VXAht5OOoK8UVDtX1oKoT7d5ct1kJud_LU-NKa4K2WFtWFsbkcpXkVrOeiyWbILkWUk0yl1B0bLlluiXV-4HRdQKfXgX_tfqnEVrxhD9ovCQkgVUBOCAXAvTTc1-C8m24DOCobWWg9XTZrEW73NIl0UmbSPaiEJF3KsOxOvq6wQoNjplpbCLpORhFno'
    },
    {
      ceremony: 'MARRIAGE',
      title: 'Snowcrest Nikaah & Eternal Sacred Vows',
      duration: '04:45',
      curator: 'Himalayan Cine Studio',
      plays: 2890,
      poster: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbSFnFnI5Jpuh7ZvGS3KHTjNtzsxn8QClt8G1aEU_khuiHUXftjAUcu-p9vNEMI-JMpDPb9BN4GRuhajwvB-ztl8XyeKA1qvKfmj5XKAlLIDbe_Me-D9NIu0rO56VD6LfDF0SYO7fuVQZk7xSgh_Sk2mc1JykfqYjlf4hnAGRMBsd1xmlZcO9CfZJE9zN3Pjj88uorqmbaMzrU2tWQb8eRyG45powg3Ql5fZxWlK0'
    }
  ],
  HEERRAN26: [
    {
      ceremony: 'SANGEET',
      title: 'Chenab Flute & Heer Di Sangeet Night',
      duration: '03:20',
      curator: 'Dido Ranjha',
      plays: 1650,
      poster: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwZlcHb_KVUMvBiZhacxOUxbjv9rYLP52FrP0hNeO5AuTcxEUpEnjINTU_47yEacFb_9IlmAslUSaFNBYVtJ3uTPDgVQRMRh-nJlO3WnRTF9ebW2trgiHhtykoYA8O7bM5PNbzgeS8HBzOwYuFSXJmuaYXjz8rUBRBjcBXe58Yor5miYy_VkclG4OdFRA2SoWL4_6DHNwLl5-z6ziJgt7_w_0DU7nns2FViIwomk'
    },
    {
      ceremony: 'HALDI',
      title: 'Royal Marwar Turmeric & Saffron Bath',
      duration: '01:50',
      curator: 'Sial Family Chooda Rites',
      plays: 1100,
      poster: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6fO2qwvTXCfSdcSEAgwTCIMP1jaIcPkXdwV1FvCCfRf-5VXAht5OOoK8UVDtX1oKoT7d5ct1kJud_LU-NKa4K2WFtWFsbkcpXkVrOeiyWbILkWUk0yl1B0bLlluiXV-4HRdQKfXgX_tfqnEVrxhD9ovCQkgVUBOCAXAvTTc1-C8m24DOCobWWg9XTZrEW73NIl0UmbSPaiEJF3KsOxOvq6wQoNjplpbCLpORhFno'
    },
    {
      ceremony: 'MARRIAGE',
      title: 'Anand Karaj Under Imperial Mandap',
      duration: '04:15',
      curator: 'Royal Heritage Archives',
      plays: 3120,
      poster: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbSFnFnI5Jpuh7ZvGS3KHTjNtzsxn8QClt8G1aEU_khuiHUXftjAUcu-p9vNEMI-JMpDPb9BN4GRuhajwvB-ztl8XyeKA1qvKfmj5XKAlLIDbe_Me-D9NIu0rO56VD6LfDF0SYO7fuVQZk7xSgh_Sk2mc1JykfqYjlf4hnAGRMBsd1xmlZcO9CfZJE9zN3Pjj88uorqmbaMzrU2tWQb8eRyG45powg3Ql5fZxWlK0'
    }
  ],
  BUNNYNA27: [
    {
      ceremony: 'SANGEET',
      title: 'Dilliwaali Girlfriend & Balam Pichkari Sangeet',
      duration: '03:40',
      curator: 'Aditi & Avi',
      plays: 4210,
      poster: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEVot-vS2GnsXbBB4zTZwgLOQZB44-F2CG2MJSbPBtnVFreWoYfeD19x6LsJdusK1z85b04V5SN9gQUWXAc6BiSrYM0oFgaDXn21SfNJKacDmjRPBfA8J2uCGvJ_Vf0XUQ5yTK7l7_-K1pQZkT8obSKKqtgrKob3W-kGwf2SKx3J1nvu0cxTfto7MEgYv8z70KQeVsPOmfJ9wy3ttfuoJONcP1bn-FY2P_ur4J0bk'
    },
    {
      ceremony: 'HALDI',
      title: 'Sunshine Pichola Marigold Splash',
      duration: '01:45',
      curator: 'Bunny & Naina',
      plays: 1890,
      poster: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtm2bhCNM2CXP-0DTysfeL0mLmn3hW_JL5sh0moUFIqXzksahCLNtHGeTw9GNEsqXGfWHc4g-Qkfh007Skqs7fEvDCEp6P4tSJBwjEFK8kQZWfCaV7ys-f7kSTqc05YbVM_EbUeJ6o1dtKpSZM-LAihQNHQPreD9OAod4DJ1zJjEu4za-DG3YjFO8ysFmpBr3X02AJ-LseKk4amMB3vxtgnzQ3FoTmD6VMY2bGYOw'
    },
    {
      ceremony: 'MARRIAGE',
      title: 'Kabira Royal Pheras on Floating Pichola',
      duration: '04:30',
      curator: 'Udaivilas Cinematography',
      plays: 3870,
      poster: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbSFnFnI5Jpuh7ZvGS3KHTjNtzsxn8QClt8G1aEU_khuiHUXftjAUcu-p9vNEMI-JMpDPb9BN4GRuhajwvB-ztl8XyeKA1qvKfmj5XKAlLIDbe_Me-D9NIu0rO56VD6LfDF0SYO7fuVQZk7xSgh_Sk2mc1JykfqYjlf4hnAGRMBsd1xmlZcO9CfZJE9zN3Pjj88uorqmbaMzrU2tWQb8eRyG45powg3Ql5fZxWlK0'
    }
  ]
};

async function uploadReel(bucket, metadata, filename) {
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: 'video/mp4',
      metadata
    });
    uploadStream.on('error', (err) => reject(err));
    uploadStream.on('finish', () => resolve(uploadStream.id));
    uploadStream.end(SAMPLE_MP4_BUFFER);
  });
}

async function seedCuratedReels() {
  console.log('Connecting to MongoDB Atlas...');
  await connectDB();
  const db = mongoose.connection.db;
  const bucket = getGridFSBucket();

  console.log('\n--- Seeding Official Curated Video Reels (PRD 4.7) ---');

  for (const [code, reels] of Object.entries(CURATED_REELS)) {
    const marriage = await Marriage.findOne({ marriageCode: code });
    if (!marriage) {
      console.log(`Marriage ${code} not found, skipping.`);
      continue;
    }

    // Remove existing video files for this marriage to avoid duplicates
    const existingVideos = await db.collection('uploads.files').find({
      $or: [
        { 'metadata.marriageCode': code, 'metadata.mediaType': 'VIDEO' },
        { 'metadata.marriageId': marriage._id.toString(), 'metadata.mediaType': 'VIDEO' }
      ]
    }).toArray();

    for (const v of existingVideos) {
      try {
        await bucket.delete(v._id);
      } catch {}
    }

    let reelCount = 0;
    for (const [idx, r] of reels.entries()) {
      const filename = `${code.toLowerCase()}-${r.ceremony.toLowerCase()}-curated-reel-${idx + 1}.mp4`;
      const metadata = {
        marriageId: marriage._id.toString(),
        marriageCode: code,
        ceremony: r.ceremony,
        uploaderName: r.curator,
        uploaderEmail: 'host@makemymarriage.com',
        mediaType: 'VIDEO',
        title: r.title,
        duration: r.duration,
        posterUrl: r.poster,
        plays: r.plays,
        uploadDate: new Date()
      };

      await uploadReel(bucket, metadata, filename);
      reelCount++;

      // Update event video count
      await Event.findOneAndUpdate(
        { marriageId: marriage._id, eventType: r.ceremony },
        { $set: { 'eventStats.videoCount': 1 } }
      );
    }

    // Update marriage global stats
    await Marriage.findByIdAndUpdate(marriage._id, {
      $set: { 'globalStats.totalVideos': reelCount }
    });

    console.log(`✅ ${code}: Seeded ${reelCount} official curated reels (${marriage.partnerOneName} & ${marriage.partnerTwoName})`);
  }

  console.log('\nAll official video reels seeded successfully!');
  process.exit(0);
}

seedCuratedReels().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});

