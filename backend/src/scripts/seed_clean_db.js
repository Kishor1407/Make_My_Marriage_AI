const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const { connectDB, getGridFSBucket } = require('../config/db');
const User = require('../models/User');
const Marriage = require('../models/Marriage');
const { Event } = require('../models/Event');
const Invitation = require('../models/Invitation');
const { generateQRCodeDataUrl } = require('../utils/qrcode');

// Curated high-res luxury Indian wedding imagery
const WEDDING_IMAGES = {
  rajSimran: {
    cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwZlcHb_KVUMvBiZhacxOUxbjv9rYLP52FrP0hNeO5AuTcxEUpEnjINTU_47yEacFb_9IlmAslUSaFNBYVtJ3uTPDgVQRMVRh-nJlO3WnRTF9ebW2trgiHhtykoYA8O7bM5PNbzgeS8HBzOwYuFSXJmuaYXjz8rUBRBjcBXe58Yor5miYy_VkclG4OdFRA2SoWL4_6DHNwLl5-z6ziJgt7_w_0DU7nns2FViIwomk',
    haldi1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtm2bhCNM2CXP-0DTysfeL0mLmn3hW_JL5sh0moUFIqXzksahCLNtHGeTw9GNEsqXGfWHc4g-Qkfh007Skqs7fEvDCEp6P4tSJBwjEFK8kQZWfCaV7ys-f7kSTqc05YbVM_EbUeJ6o1dtKpSZM-LAihQNHQPreD9OAod4DJ1zJjEu4za-DG3YjFO8ysFmpBr3X02AJ-LseKk4amMB3vxtgnzQ3FoTmD6VMY2bGYOw',
    mehndi1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARYmudv2I8_HaPYAiB0j8uXFIhb2eWvx7LjfVbfbksRW5bgFlKeffut-uorqvIRzz2j8maeuzNjjtYtVq8G9ltoo3GPK5rd7co2jSDMOu-aHNFbg7eukoOn_AfrClX5DjRp4T2SzSvswIW6SgLuBAWQL-WXMUqsAiYVCbG8gcVnoPcTZmHli9eoJ0A3_1e25yhQp8m-OL-H-8aFRC3ioczAepIgiHrBLTSDiBBMAI',
    sangeet1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfERpum8GTxwenz_dTA4ZZXs-UqnZoZgWfe86mb6kEQyDx-6aXfmXAeYZVsT9Q6kPtyWL7AQ_qNsOeuQrPuupahnyTX5PwlN4pZr1fXvJAxOQNdkwOCKd67kXnbah6k-onOQAMVKXpUCinE91S3YwHSBLPN8pZbc2z4HHw23nudcJuoD-6sgZHnmz0n6uNBXiUpmVUiSFhUf1o4xA59KcantMWTK7Ax58eQdZshfM'
  },
  lailaMajnu: {
    cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBc9C1voRVWDpitAXvHixh6nqQ4Fr79mnyuw9Xe3IcAQgZAd-Uv3awiaBCqPc9wnryGg6K_YtjvXw33aS0iPw333R8nNhGrxKssGs9kAEFQutT4sDRp5swxSF4PKKzpyne6cjdxSMvTeL4C-gEgct3msqLoQmVt6GrsyBYVuNDf8XOEWyRE8h2qqZjSVu1Q0NDPzcE68G9R3cAcloU2HG0DmHfapfJmWYtk0quRUrg',
    haldi1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXToPktDIvWBZh-n4fPZKZRABxtpV9HSwbb3fpd5yxYMWWT7HNp6PG_wH1MFu4tXzaAsdmpPiUPbdrA5OVKioECHzexLD9HPWasiD9q4RYSFsbeRjwtqRfcpZYoXjzDzW5T5UXK01-6XZYT7hvlDPWadWI3j36Nu1_VmlDudf3Upvv-C4y1DuJ5g7Xvc-xRR-ODdXr5WMJ9BcR_m7H6fsOxMfU5Fz6tmegARyfZMw'
  },
  heerRanjha: {
    cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSFCd_cy05beANlWSREfxP3NXg8ctYEY9AVrp-_XUcFVt_w_abbeTJoNmpWgcl8BVyWp4mMIEKmkoQCot9EjdJ8Qctuj_og0TdF89uVPf1ArAbEHmfMvwAjzk11O8dlquI1hLl94jYCQPEmyWg6L3oF39f_dnAAHfgwtKtVrHHwXAxAnTWY3rVge3SuEwTHGpMbYt9YVQpN3S6n00H5ow31iMzhlMSaFkbEID1-jQ',
    haldi1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6fO2qwvTXCfSdcSEAgwTCIMP1jaIcPkXdwV1FvCCfRf-5VXAht5OOoK8UVDtX1oKoT7d5ct1kJud_LU-NKa4K2WFtWFsbkcpXkVrOeiyWbILkWUk0yl1B0bLlluiXV-4HRdQKfXgX_tfqnEVrxhD9ovCQkgVUBOCAXAvTTc1-C8m24DOCobWWg9XTZrEW73NIl0UmbSPaiEJF3KsOxOvq6wQoNjplpbCLpORhFno'
  },
  bunnyNaina: {
    cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEVot-vS2GnsXbBB4zTZwgLOQZB44-F2CG2MJSbPBtnVFreWoYfeD19x6LsJdusK1z85b04V5SN9gQUWXAc6BiSrYM0oFgaDXn21SfNJKacDmjRPBfA8J2uCGvJ_Vf0XUQ5yTK7l7_-K1pQZkT8obSKKqtgrKob3W-kGwf2SKx3J1nvu0cxTfto7MEgYv8z70KQeVsPOmfJ9wy3ttfuoJONcP1bn-FY2P_ur4J0bk',
    haldi1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtm2bhCNM2CXP-0DTysfeL0mLmn3hW_JL5sh0moUFIqXzksahCLNtHGeTw9GNEsqXGfWHc4g-Qkfh007Skqs7fEvDCEp6P4tSJBwjEFK8kQZWfCaV7ys-f7kSTqc05YbVM_EbUeJ6o1dtKpSZM-LAihQNHQPreD9OAod4DJ1zJjEu4za-DG3YjFO8ysFmpBr3X02AJ-LseKk4amMB3vxtgnzQ3FoTmD6VMY2bGYOw'
  }
};

// 1x1 sample PNG base64 for real GridFS chunk storage
const SAMPLE_IMAGE_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

// Sample valid minimal MP4 header for GridFS video chunk storage
const SAMPLE_VIDEO_BUFFER = Buffer.from(
  '000000186674797069736f6d0000020069736f6d69736f32617663310000000866726565',
  'hex'
);

async function uploadSampleToGridFS(bucket, metadata, filename, isVideo = false) {
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: isVideo ? 'video/mp4' : 'image/png',
      metadata
    });
    uploadStream.on('error', (err) => reject(err));
    uploadStream.on('finish', () => resolve(uploadStream.id));
    uploadStream.end(isVideo ? SAMPLE_VIDEO_BUFFER : SAMPLE_IMAGE_BUFFER);
  });
}

async function seedCleanDatabase() {
  console.log('================================================================');
  console.log('   MAKE MY MARRIAGE — SEEDING BOLLYWOOD WEDDINGS & RESET DB    ');
  console.log('================================================================\n');

  await connectDB();
  const db = mongoose.connection.db;
  const bucket = getGridFSBucket();

  // 1. CLEAR ALL PREVIOUS DATA (PURGE EVERYTHING)
  console.log('1. Purging all existing users, marriages, events, invitations, and media files...');
  await User.deleteMany({});
  await Marriage.deleteMany({});
  await Event.deleteMany({});
  await Invitation.deleteMany({});

  try {
    await db.collection('uploads.files').deleteMany({});
    await db.collection('uploads.chunks').deleteMany({});
    console.log('   Uploads GridFS collections wiped clean.');
  } catch (err) {
    console.log('   Uploads collections clean or not yet initialized.');
  }
  console.log('✅ Database completely clean.\n');

  // 2. CREATE SINGLE DESIGNATED ADMIN LOGIN: modi@makemymarriage.com
  console.log('2. Provisioning single sovereign admin login: modi@makemymarriage.com...');
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Password@2026', salt);

  const adminUser = await User.create({
    name: 'Narendra Modi',
    email: 'modi@makemymarriage.com',
    passwordHash: hashedPassword,
    role: 'ADMIN'
  });
  console.log(`✅ Admin account created: ${adminUser.email} (Password: Password@2026)\n`);

  const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  // 3. DEFINE 4 ICONIC BOLLYWOOD MOVIE COUPLE WEDDINGS (PAST & FUTURE DATES)
  const BOLLYWOOD_WEDDINGS = [
    // -------------------------------------------------------------
    // COUPLE 1: Raj & Simran (DDLJ) — PAST WEDDING (October 2024)
    // -------------------------------------------------------------
    {
      partnerOneName: 'Raj Malhotra',
      partnerTwoName: 'Simran Singh',
      marriageCode: 'RAJSIM24',
      venue: 'The Grand Oberoi Amarvilas & Mustard Meadows, Agra',
      dates: 'October 18–20, 2024',
      status: 'Completed (Celebrated)',
      coverImage: WEDDING_IMAGES.rajSimran.cover,
      movieBadge: 'DDLJ • Dilwale Dulhania Le Jayenge',
      events: [
        { type: 'ENGAGEMENT', title: 'Ring Ceremony & Shagan', date: '2024-10-18T17:00:00Z', time: '05:00 PM', venue: 'Royal Amarvilas Terrace' },
        { type: 'MEHNDI', title: 'Mehndi Laga Ke Rakhna', date: '2024-10-19T11:00:00Z', time: '11:00 AM', venue: 'Mustard Courtyard Lawn' },
        { type: 'HALDI', title: 'Haldi & Marigold Shower', date: '2024-10-19T15:30:00Z', time: '03:30 PM', venue: 'Fountain Courtyard' },
        { type: 'SANGEET', title: 'Zara Sa Jhoom Loon Main Sangeet', date: '2024-10-19T19:30:00Z', time: '07:30 PM', venue: 'Grand Diwan Ballroom' },
        { type: 'MARRIAGE', title: 'Vedic Pheras & Doli', date: '2024-10-20T11:30:00Z', time: '11:30 AM', venue: 'Heritage Mandap Pavilion' },
        { type: 'OTHERS', title: 'Tujhe Dekha Toh Yeh Jaana Sanam Gala', date: '2024-10-20T19:30:00Z', time: '07:30 PM', venue: 'Starlight Promenade' }
      ],
      samplePhotos: [
        { author: 'Bauji (Baldev Singh)', email: 'baldev.singh@punjab.local', ceremony: 'HALDI' },
        { author: 'Chutki (Rajeshwari)', email: 'chutki@london.local', ceremony: 'HALDI' },
        { author: 'Kuljeet Singh', email: 'kuljeet@patiala.local', ceremony: 'SANGEET' },
        { author: 'Dharamvir Malhotra', email: 'dharamvir@london.local', ceremony: 'ENGAGEMENT' },
        { author: 'Lajwanti (Lajjo)', email: 'lajjo@punjab.local', ceremony: 'MEHNDI' }
      ],
      sampleVideos: [
        { author: 'Rocky & Monty', email: 'rocky@london.local', ceremony: 'SANGEET', title: 'Zara Sa Jhoom Loon Sangeet Performance' }
      ]
    },

    // -------------------------------------------------------------
    // COUPLE 2: Qais (Majnu) & Laila (Laila Majnu) — PAST WEDDING (November 2025)
    // -------------------------------------------------------------
    {
      partnerOneName: 'Qais Bhatt (Majnu)',
      partnerTwoName: 'Laila Sharma',
      marriageCode: 'LAILAM25',
      venue: 'The Khyber Himalayan Resort & Pine Valley, Gulmarg, Kashmir',
      dates: 'November 14–16, 2025',
      status: 'Completed (Celebrated)',
      coverImage: WEDDING_IMAGES.lailaMajnu.cover,
      movieBadge: 'Laila Majnu • Kashmir Epic Romance',
      events: [
        { type: 'ENGAGEMENT', title: 'Nikaah & Ring Covenant', date: '2025-11-14T16:00:00Z', time: '04:00 PM', venue: 'Pine Grove Terrace' },
        { type: 'MEHNDI', title: 'Kashmiri Saffron Henna', date: '2025-11-15T11:00:00Z', time: '11:00 AM', venue: 'Saffron Meadow Pavilion' },
        { type: 'HALDI', title: 'O Meri Laila Haldi Celebration', date: '2025-11-15T15:00:00Z', time: '03:00 PM', venue: 'Chinar Sun Garden' },
        { type: 'SANGEET', title: 'Hafiz Hafiz Musical Night', date: '2025-11-15T19:00:00Z', time: '07:00 PM', venue: 'Chinar Banquet Hall' },
        { type: 'MARRIAGE', title: 'Sacred Vows in the Snow', date: '2025-11-16T11:00:00Z', time: '11:00 AM', venue: 'Snowcrest Mandap' },
        { type: 'OTHERS', title: 'Royal Valley Matrimonial Banquet', date: '2025-11-16T19:00:00Z', time: '07:00 PM', venue: 'Grand Himalayan Ballroom' }
      ],
      samplePhotos: [
        { author: 'Farhad', email: 'farhad@kashmir.local', ceremony: 'HALDI' },
        { author: 'Kaano', email: 'kaano@gulmarg.local', ceremony: 'MEHNDI' },
        { author: 'Amir', email: 'amir@valley.local', ceremony: 'SANGEET' },
        { author: 'Ghulam Sarwar', email: 'sarwar@kashmir.local', ceremony: 'ENGAGEMENT' }
      ],
      sampleVideos: [
        { author: 'Zaid', email: 'zaid@kashmir.local', ceremony: 'SANGEET', title: 'Hafiz Hafiz Musical Night Highlights' }
      ]
    },

    // -------------------------------------------------------------
    // COUPLE 3: Dido Ranjha & Heer Sial (Heer Ranjha) — UPCOMING / LIVE (December 2026)
    // -------------------------------------------------------------
    {
      partnerOneName: 'Dido Ranjha',
      partnerTwoName: 'Heer Sial',
      marriageCode: 'HEERRAN26',
      venue: 'Umaid Bhawan Palace & Chenab River Pavilion, Jodhpur',
      dates: 'December 18–20, 2026',
      status: 'Live Realtime',
      coverImage: WEDDING_IMAGES.heerRanjha.cover,
      movieBadge: 'Heer Ranjha • Eternal Matrimonial Legend',
      events: [
        { type: 'ENGAGEMENT', title: 'Mangni & Royal Shagan', date: '2026-12-18T17:00:00Z', time: '05:00 PM', venue: 'Baradari Courtyard' },
        { type: 'MEHNDI', title: 'Heer Di Mehndi & Folk Raags', date: '2026-12-19T11:00:00Z', time: '11:00 AM', venue: 'Royal Bagh' },
        { type: 'HALDI', title: 'Chenab Golden Haldi Rite', date: '2026-12-19T15:30:00Z', time: '03:30 PM', venue: 'Fountain Courtyard' },
        { type: 'SANGEET', title: 'Flute & Sufi Sangeet Gala', date: '2026-12-19T19:30:00Z', time: '07:30 PM', venue: 'Marwar Heritage Ballroom' },
        { type: 'MARRIAGE', title: 'Anand Karaj & Sacred Nuptials', date: '2026-12-20T11:30:00Z', time: '11:30 AM', venue: 'Grand Chenab Mandap' },
        { type: 'OTHERS', title: 'Imperial Matrimonial Dastarkhwan', date: '2026-12-20T20:00:00Z', time: '08:00 PM', venue: 'Palace Terraces' }
      ],
      samplePhotos: [
        { author: 'Sehti', email: 'sehti@jhang.local', ceremony: 'HALDI' },
        { author: 'Chuchak Sial', email: 'chuchak@sial.local', ceremony: 'ENGAGEMENT' },
        { author: 'Malki', email: 'malki@chenab.local', ceremony: 'MEHNDI' },
        { author: 'Murad Baloch', email: 'murad@takht.local', ceremony: 'HALDI' }
      ],
      sampleVideos: [
        { author: 'Saida Khera', email: 'saida@rangpur.local', ceremony: 'SANGEET', title: 'Chenab Flute & Sufi Performance' }
      ]
    },

    // -------------------------------------------------------------
    // COUPLE 4: Kabir (Bunny) & Naina (YJHD) — FUTURE WEDDING (March 2027)
    // -------------------------------------------------------------
    {
      partnerOneName: 'Kabir Thapar (Bunny)',
      partnerTwoName: 'Naina Talwar',
      marriageCode: 'BUNNYNA27',
      venue: 'The Oberoi Udaivilas & Lake Pichola, Udaipur',
      dates: 'March 24–26, 2027',
      status: 'Scheduled',
      coverImage: WEDDING_IMAGES.bunnyNaina.cover,
      movieBadge: 'YJHD • Yeh Jawaani Hai Deewani',
      events: [
        { type: 'ENGAGEMENT', title: 'Balam Pichkari Engagement Cocktail', date: '2027-03-24T18:00:00Z', time: '06:00 PM', venue: 'Poolside Sunset Deck' },
        { type: 'MEHNDI', title: 'Ghagra Mehndi Afternoon', date: '2027-03-25T12:00:00Z', time: '12:00 PM', venue: 'Mewar Lawn' },
        { type: 'HALDI', title: 'Udaipur Sunshine Haldi', date: '2027-03-25T15:30:00Z', time: '03:30 PM', venue: 'Lakefront Lawn Pavilion' },
        { type: 'SANGEET', title: 'Dilliwaali Girlfriend Sangeet Extravaganza', date: '2027-03-25T20:00:00Z', time: '08:00 PM', venue: 'Chandra Mahal Ballroom' },
        { type: 'MARRIAGE', title: 'Kabira Royal Pheras on Pichola', date: '2027-03-26T11:00:00Z', time: '11:00 AM', venue: 'Floating Island Mandap' },
        { type: 'OTHERS', title: 'Subhanallah Grand Matrimonial Reception', date: '2027-03-26T19:30:00Z', time: '07:30 PM', venue: 'Lakeview Promenade' }
      ],
      samplePhotos: [
        { author: 'Aditi Mehra', email: 'aditi.taran@yjhd.local', ceremony: 'HALDI' },
        { author: 'Avi (Avinash)', email: 'avi@yjhd.local', ceremony: 'SANGEET' },
        { author: 'Rana Ji', email: 'ranaji@udaipur.local', ceremony: 'HALDI' },
        { author: 'Lara', email: 'lara@paris.local', ceremony: 'ENGAGEMENT' },
        { author: 'Taran', email: 'taran@yjhd.local', ceremony: 'MEHNDI' }
      ],
      sampleVideos: [
        { author: 'Aditi & Avi', email: 'buddies@yjhd.local', ceremony: 'SANGEET', title: 'Dilliwaali Girlfriend & Balam Pichkari Reel' }
      ]
    }
  ];

  console.log('3. Seeding 4 Bollywood Movie Couple Weddings (Past & Future)...\n');

  for (const w of BOLLYWOOD_WEDDINGS) {
    const uploadUrl = `${frontendBaseUrl}/guest/upload?code=${w.marriageCode}`;
    const qrCodeUrl = await generateQRCodeDataUrl(uploadUrl);

    // 3a. Create Marriage Vault
    const marriage = await Marriage.create({
      partnerOneName: w.partnerOneName,
      partnerTwoName: w.partnerTwoName,
      marriageCode: w.marriageCode,
      adminId: adminUser._id,
      qrCodeUrl,
      venue: w.venue,
      dates: w.dates,
      status: w.status,
      coverImage: w.coverImage,
      globalStats: {
        totalPhotos: w.samplePhotos.length,
        totalVideos: w.sampleVideos.length,
        totalGuestsEngaged: (w.samplePhotos.length + w.sampleVideos.length) * 12 + 65
      }
    });

    console.log(`  💍 Seeded Wedding: ${w.partnerOneName} & ${w.partnerTwoName} [${w.marriageCode}]`);
    console.log(`     Dates: ${w.dates} (${w.status})`);
    console.log(`     Venue: ${w.venue}`);

    // 3b. Create exactly 6 Events for this wedding
    for (const ev of w.events) {
      const photosForEvent = w.samplePhotos.filter((p) => p.ceremony === ev.type).length;
      const videosForEvent = w.sampleVideos.filter((v) => v.ceremony === ev.type).length;

      await Event.create({
        marriageId: marriage._id,
        eventType: ev.type,
        customTitle: ev.title,
        eventDate: new Date(ev.date),
        eventTime: ev.time,
        venueAddress: ev.venue,
        liveStreamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        eventStats: {
          photoCount: photosForEvent,
          videoCount: videosForEvent
        }
      });
    }

    // 3c. Seed customized invitations for all ceremonies
    for (const ev of w.events) {
      await Invitation.create({
        marriageId: marriage._id,
        marriageCode: w.marriageCode,
        ceremony: ev.type,
        templateStyle: ev.type === 'HALDI' ? 'mandap' : ev.type === 'MEHNDI' ? 'botanical' : 'sunset',
        cardRatio: '4:5',
        coupleNames: `${w.partnerOneName} & ${w.partnerTwoName}`,
        riteTitle: ev.title.toUpperCase(),
        invocation: '॥ श्री गणेशाय नमः ॥ • || Shubham Bhavatu ||',
        dateTime: `${w.dates} • ${ev.time}`,
        venue: `${w.venue} • ${ev.venue}`,
        blessing: 'With the unconditional blessings of elders & boundless joy in our hearts, we request your presence.',
        rsvp: `${w.partnerOneName.split(' ')[0]} & ${w.partnerTwoName.split(' ')[0]} Families • passkey: ${w.marriageCode}`,
        includeQr: true
      });
    }

    // 3d. Upload sample candid photos to GridFS for guest feed
    for (const [idx, sp] of w.samplePhotos.entries()) {
      const filename = `${w.marriageCode.toLowerCase()}-${sp.ceremony.toLowerCase()}-${idx + 1}.png`;
      const metadata = {
        marriageId: marriage._id.toString(),
        marriageCode: w.marriageCode,
        ceremony: sp.ceremony,
        uploaderName: sp.author,
        uploaderEmail: sp.email,
        mediaType: 'PHOTO',
        uploadDate: new Date(new Date(w.events[0].date).getTime() + idx * 3600 * 1000)
      };

      await uploadSampleToGridFS(bucket, metadata, filename, false);
    }

    // 3e. Upload sample video reels to GridFS
    for (const [vIdx, sv] of w.sampleVideos.entries()) {
      const filename = `${w.marriageCode.toLowerCase()}-${sv.ceremony.toLowerCase()}-reel-${vIdx + 1}.mp4`;
      const metadata = {
        marriageId: marriage._id.toString(),
        marriageCode: w.marriageCode,
        ceremony: sv.ceremony,
        uploaderName: sv.author,
        uploaderEmail: sv.email,
        mediaType: 'VIDEO',
        title: sv.title,
        uploadDate: new Date(new Date(w.events[0].date).getTime() + (vIdx + 1) * 7200 * 1000)
      };

      await uploadSampleToGridFS(bucket, metadata, filename, true);
    }

    console.log(`     ✅ 6 Events, 6 Invitations, ${w.samplePhotos.length} GridFS photos & ${w.sampleVideos.length} GridFS videos seeded.`);
    console.log(`     📱 Table Standee QR: Generated pointing to ${uploadUrl}\n`);
  }

  console.log('================================================================');
  console.log('   🎉 DATABASE RESET & BOLLYWOOD CELEBRATIONS SEEDING COMPLETE! ');
  console.log('================================================================\n');
  console.log('Admin Login Credentials:');
  console.log('  Email:    modi@makemymarriage.com');
  console.log('  Password: Password@2026\n');
  console.log('Seeded Couples:');
  console.log('  1. [PAST]   Raj Malhotra & Simran Singh       -> Code: RAJSIM24 (Oct 18-20, 2024)');
  console.log('  2. [PAST]   Qais (Majnu) & Laila Sharma       -> Code: LAILAM25 (Nov 14-16, 2025)');
  console.log('  3. [FUTURE] Dido Ranjha & Heer Sial           -> Code: HEERRAN26 (Dec 18-20, 2026)');
  console.log('  4. [FUTURE] Kabir (Bunny) & Naina Talwar      -> Code: BUNNYNA27 (Mar 24-26, 2027)\n');

  process.exit(0);
}

seedCleanDatabase().catch((err) => {
  console.error('Seeding Failed:', err);
  process.exit(1);
});
