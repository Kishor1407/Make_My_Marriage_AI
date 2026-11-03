const fs = require('fs');

async function testAllFeatures() {
  console.log('================================================================');
  console.log('    MAKE MY MARRIAGE — COMPREHENSIVE END-TO-END TEST SUITE     ');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  const BASE_URL = 'http://localhost:5000/api/v1';

  // -------------------------------------------------------------
  // SUITE 1: System Health & Gateway
  // -------------------------------------------------------------
  console.log('--- SUITE 1: API Gateway & Health Check ---');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  assert(healthRes.status === 200, 'Health check returns HTTP 200');
  assert(healthData.status === 'healthy', 'Gateway status is "healthy"');
  assert(typeof healthData.uptime === 'number', 'Uptime is tracked');

  // -------------------------------------------------------------
  // SUITE 2: Admin Authentication (JWT & RBAC)
  // -------------------------------------------------------------
  console.log('\n--- SUITE 2: Host Authentication (PRD 3.0) ---');
  const uniqueSuffix = Date.now().toString().slice(-4);
  const testAdminEmail = 'modi@makemymarriage.com';
  const testPassword = 'Password@2026';

  const loginRes = await fetch(`${BASE_URL}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testAdminEmail,
      password: testPassword
    })
  });
  const loginData = await loginRes.json();
  assert(loginRes.status === 200, 'Host Admin login with sovereign modi@makemymarriage.com returns HTTP 200');
  assert(!!loginData.token, 'Login issues valid JWT token');

  const token = loginData.token;

  // Verify /auth/me
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const meData = await meRes.json();
  assert(meRes.status === 200, 'Protected /auth/me profile returns HTTP 200');
  assert((meData.user || meData.data)?.email === testAdminEmail, 'User identity matches registered email');
  assert((meData.user || meData.data)?.role === 'ADMIN', 'Role is verified as ADMIN');

  // Verify Guest Zero-Password Gateway Login (Name & Email Only)
  const guestGatewayRes = await fetch(`${BASE_URL}/auth/guest/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Kabir Malhotra',
      email: 'kabir@malhotra.com'
    })
  });
  const guestGatewayData = await guestGatewayRes.json();
  assert(guestGatewayRes.status === 200, 'Guest zero-password gateway entry returns HTTP 200');
  assert(guestGatewayData.user?.role === 'GUEST', 'Gateway assigns GUEST role');
  assert(guestGatewayData.user?.name === 'Kabir Malhotra', 'Gateway retains guest name attribution');

  // Verify Secret Passcode Rejection for Invalid Code
  const invalidPasscodeRes = await fetch(`${BASE_URL}/auth/guest/verify-passcode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      marriageCode: 'INVALID99',
      name: 'Kabir Malhotra',
      email: 'kabir@malhotra.com'
    })
  });
  assert(invalidPasscodeRes.status === 404, 'Invalid wedding passcode correctly rejected with HTTP 404');

  // Verify Secret Passcode Unlock for Valid Code (RAJSIM24)
  const validPasscodeRes = await fetch(`${BASE_URL}/auth/guest/verify-passcode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      marriageCode: 'RAJSIM24',
      name: 'Kabir Malhotra',
      email: 'kabir@malhotra.com'
    })
  });
  const validPasscodeData = await validPasscodeRes.json();
  assert(validPasscodeRes.status === 200, 'Valid secret passcode returns HTTP 200');
  assert(validPasscodeData.success === true, 'Sanctuary unlocked successfully');
  assert(!!validPasscodeData.user?.assignedMarriageId, 'Assigned marriage ID bound to guest session');

  // -------------------------------------------------------------
  // SUITE 3: Marriage Management (PRD 4.1 & 4.2)
  // -------------------------------------------------------------
  console.log('\n--- SUITE 3: Marriage Vault Management (PRD 4.1 & 4.2) ---');
  const testCode = `TEST${uniqueSuffix}`;

  const createRes = await fetch(`${BASE_URL}/marriages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      partnerOneName: 'Kabir Sen',
      partnerTwoName: 'Tanya Roy',
      customCode: testCode,
      venue: 'Taj Exotica Seaside Resort, Goa',
      dates: 'December 20–22, 2026',
      status: 'Live Realtime'
    })
  });
  const createData = await createRes.json();
  assert(createRes.status === 201, `Create Marriage returns HTTP 201 for code ${testCode}`);
  assert(createData.data?.marriageCode === testCode, 'Marriage code correctly assigned');
  assert(!!createData.data?.qrCodeUrl, 'Standee QR Code data URL automatically generated');

  const marriageId = createData.data._id;

  // Verify 6 events were auto-provisioned (PRD 4.3)
  const eventsRes = await fetch(`${BASE_URL}/marriages/${marriageId}/events`);
  const eventsData = await eventsRes.json();
  assert(eventsRes.status === 200, 'Fetch Events returns HTTP 200');
  assert(eventsData.count === 6, 'Exactly 6 canonical wedding events provisioned');
  const eventTypes = eventsData.data.map((e) => e.eventType);
  assert(
    eventTypes.includes('ENGAGEMENT') &&
    eventTypes.includes('MEHNDI') &&
    eventTypes.includes('HALDI') &&
    eventTypes.includes('SANGEET') &&
    eventTypes.includes('MARRIAGE') &&
    eventTypes.includes('OTHERS'),
    'All 6 canonical rites present (Engagement, Mehndi, Haldi, Sangeet, Marriage, Others)'
  );

  // Update Marriage details
  const updateRes = await fetch(`${BASE_URL}/marriages/${marriageId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      venue: 'Taj Exotica Seaside Resort & Pavilion, South Goa'
    })
  });
  const updateData = await updateRes.json();
  assert(updateRes.status === 200, 'Update Marriage returns HTTP 200');
  assert(updateData.data?.venue.includes('Pavilion'), 'Venue successfully updated');

  // -------------------------------------------------------------
  // SUITE 4: QR Photo Dump & Guest Attribution (PRD 4.4)
  // -------------------------------------------------------------
  console.log('\n--- SUITE 4: QR-Powered Photo Dump & Attribution (PRD 4.4) ---');
  // 1x1 PNG sample image buffer
  const samplePngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );

  const guestName = 'Simran Kaur';
  const guestEmail = 'simran.kaur@testwedding.com';

  const formData = new FormData();
  const blob = new Blob([samplePngBuffer], { type: 'image/png' });
  formData.append('files', blob, 'simran_haldi_candid.png');
  formData.append('passcode', testCode);
  formData.append('ceremony', 'HALDI');
  formData.append('uploaderName', guestName);
  formData.append('uploaderEmail', guestEmail);

  const uploadRes = await fetch(`${BASE_URL}/media/guest-upload`, {
    method: 'POST',
    body: formData
  });
  const uploadData = await uploadRes.json();
  assert(uploadRes.status === 201, 'Guest photo upload returns HTTP 201 Created');
  assert(uploadData.count === 1, 'Upload batch reports 1 photo processed');
  assert(uploadData.files[0]?.uploaderName === guestName, 'Attributed to uploader name');
  assert(uploadData.files[0]?.uploaderEmail === guestEmail, 'Attributed to uploader email');
  assert(uploadData.files[0]?.ceremony === 'HALDI', 'Ceremony stamped as HALDI');

  const fileId = uploadData.files[0].id;
  const streamUrl = uploadData.files[0].streamUrl;
  assert(!!fileId && !!streamUrl, 'GridFS file ID and streamUrl generated');

  // Verify gallery retrieval
  const galleryRes = await fetch(`${BASE_URL}/media/gallery/${testCode}`);
  const galleryData = await galleryRes.json();
  assert(galleryRes.status === 200, 'Gallery retrieval returns HTTP 200');
  assert(galleryData.count >= 1, 'Gallery includes the newly uploaded photo');
  const matchingPhoto = galleryData.photos.find((p) => p.id === fileId);
  assert(!!matchingPhoto, 'Photo located in marriage gallery feed');
  assert(matchingPhoto.uploaderName === guestName, 'Gallery photo displays guest author name');

  // Verify binary streaming directly from GridFS
  const streamRes = await fetch(`http://localhost:5000${streamUrl}`);
  assert(streamRes.status === 200, 'Binary streaming endpoint returns HTTP 200');
  assert(streamRes.headers.get('content-type') === 'image/png', 'Content-Type is image/png');
  const imageBytes = await streamRes.arrayBuffer();
  assert(imageBytes.byteLength === 70, `Streamed exact PNG binary buffer (${imageBytes.byteLength} bytes)`);

  // -------------------------------------------------------------
  // SUITE 5: Digital Invitation Studio (PRD 4.5)
  // -------------------------------------------------------------
  console.log('\n--- SUITE 5: Digital Invitation Studio & Poster Generator (PRD 4.5) ---');
  // Fetch default invitations for the 6 rites
  const invitesRes = await fetch(`${BASE_URL}/invitations/${testCode}`);
  const invitesData = await invitesRes.json();
  assert(invitesRes.status === 200, 'Fetch invitations returns HTTP 200');
  assert(invitesData.count === 6, 'All 6 rites configured with defaults');

  // Save customized copy for Haldi rite
  const customTitle = 'ROYAL HALDI & FLORAL SHOWER';
  const customBlessing = 'May this holy rite bestow eternal radiance, laughter and auspicious beginnings.';

  const saveInviteRes = await fetch(`${BASE_URL}/invitations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      marriageCode: testCode,
      ceremony: 'HALDI',
      templateStyle: 'mandap',
      cardRatio: '4:5',
      coupleNames: 'Kabir Sen & Tanya Roy',
      riteTitle: customTitle,
      invocation: '॥ श्री गणेशाय नमः ॥ • || Shubham Bhavatu ||',
      dateTime: 'Friday, December 20, 2026 • 10:30 AM',
      venue: 'Taj Exotica Seaside Resort, Goa • Grand Sunset Lawn',
      blessing: customBlessing,
      rsvp: 'Sen & Roy Families • +91 98765 00000',
      includeQr: true
    })
  });
  const saveInviteData = await saveInviteRes.json();
  assert(saveInviteRes.status === 200, 'Save invitation returns HTTP 200');
  assert(saveInviteData.data?.riteTitle === customTitle, 'Custom ceremony title persisted');

  // Fetch single customized ceremony
  const getSingleInviteRes = await fetch(`${BASE_URL}/invitations/${testCode}?ceremony=HALDI`);
  const getSingleInviteData = await getSingleInviteRes.json();
  assert(getSingleInviteRes.status === 200, 'Fetch single ceremony invite returns HTTP 200');
  assert(getSingleInviteData.data?.riteTitle === customTitle, 'Retrieved custom title matches');
  assert(getSingleInviteData.data?.blessing === customBlessing, 'Retrieved custom blessing matches');

  // Upload client-rendered card PNG to GridFS
  const renderUploadRes = await fetch(`${BASE_URL}/invitations/render-upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      marriageCode: testCode,
      ceremony: 'HALDI',
      imageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    })
  });
  const renderUploadData = await renderUploadRes.json();
  assert(renderUploadRes.status === 201, 'Rendered card upload returns HTTP 201 Created');
  assert(!!renderUploadData.streamUrl, 'Rendered card streamUrl created');

  // -------------------------------------------------------------
  // SUITE 6: Live Stream Integration & Virtual Cinema (PRD 4.6)
  // -------------------------------------------------------------
  console.log('\n--- SUITE 6: Live Stream Integration (PRD 4.6) ---');
  // Update stream configuration via Host Stream Studio API
  const streamConfigRes = await fetch(`${BASE_URL}/events/config/stream`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      marriageCode: testCode,
      ceremony: 'HALDI',
      liveStreamUrl: 'https://www.youtube.com/watch?v=live_test_broadcast',
      streamStatus: 'LIVE',
      customTitle: 'The Golden Haldi & Floral Shower'
    })
  });
  const streamConfigData = await streamConfigRes.json();
  assert(streamConfigRes.status === 200, 'Update stream config returns HTTP 200');
  assert(streamConfigData.data?.streamStatus === 'LIVE', 'Stream broadcast state updated to LIVE');
  assert(streamConfigData.data?.liveStreamUrl.includes('live_test_broadcast'), 'YouTube Live link correctly stored');

  // Verify guest can fetch events and view stream link
  const guestEventsRes = await fetch(`${BASE_URL}/events/marriage/${testCode}`);
  const guestEventsData = await guestEventsRes.json();
  assert(guestEventsRes.status === 200, 'Fetch events for marriage returns HTTP 200');
  const haldiEvent = guestEventsData.data.find((e) => e.eventType === 'HALDI');
  assert(haldiEvent?.streamStatus === 'LIVE', 'Guest receives LIVE broadcast status');
  assert(haldiEvent?.liveStreamUrl.includes('live_test_broadcast'), 'Guest receives active YouTube live stream URL');

  // -------------------------------------------------------------
  // SUITE 7: Media Segregation & Official Video Reels (PRD 4.7)
  // -------------------------------------------------------------
  console.log('\n--- SUITE 7: Media Segregation (PRD 4.7) ---');

  // Test 7.1: Videos Tab query returns exclusively official video reels
  const videoGalleryRes = await fetch(`${BASE_URL}/media/gallery/RAJSIM24?mediaType=VIDEO`);
  const videoGalleryData = await videoGalleryRes.json();
  assert(videoGalleryRes.status === 200, 'Video gallery query returns HTTP 200');
  assert(videoGalleryData.count >= 4, 'RAJSIM24 contains seeded official video reels');
  const allAreVideos = videoGalleryData.photos.every((item) => item.mediaType === 'VIDEO');
  assert(allAreVideos, 'Strict Isolation: Videos query returns ONLY mediaType=VIDEO');

  // Test 7.2: Photos Tab query returns exclusively candid photos
  const photoGalleryRes = await fetch(`${BASE_URL}/media/gallery/RAJSIM24?mediaType=PHOTO`);
  const photoGalleryData = await photoGalleryRes.json();
  assert(photoGalleryRes.status === 200, 'Photo gallery query returns HTTP 200');
  assert(photoGalleryData.count >= 5, 'RAJSIM24 contains seeded candid photos');
  const allArePhotos = photoGalleryData.photos.every((item) => item.mediaType === 'PHOTO');
  assert(allArePhotos, 'Strict Isolation: Photos query returns ONLY mediaType=PHOTO');

  // Test 7.3: Admin can curate and publish official 4K video reel into GridFS
  const curateReelRes = await fetch(`${BASE_URL}/media/curate-reel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      marriageCode: testCode,
      ceremony: 'SANGEET',
      title: 'E2E Royal Dance Choreography 4K',
      duration: '02:15',
      curatorName: 'Host Atelier Concierge'
    })
  });
  const curateReelData = await curateReelRes.json();
  assert(curateReelRes.status === 201, 'Admin curate-reel returns HTTP 201 Created');
  assert(curateReelData.reel?.title === 'E2E Royal Dance Choreography 4K', 'Curated reel title saved correctly');
  assert(curateReelData.reel?.ceremony === 'SANGEET', 'Curated reel ceremony tagged as SANGEET');
  assert(!!curateReelData.reel?.streamUrl, 'Curated reel streamUrl created for GridFS stream');

  // Test 7.4: Video streaming endpoint supports HTTP 206 Range requests
  const sampleReelId = curateReelData.reel.id;
  const streamRangeRes = await fetch(`${BASE_URL}/media/stream/${sampleReelId}`, {
    headers: { Range: 'bytes=0-15' }
  });
  assert(streamRangeRes.status === 206, 'GridFS video stream supports HTTP 206 Partial Content');
  assert(!!streamRangeRes.headers.get('content-range'), 'Content-Range header present in 206 response');

  // Test 7.5: Unauthenticated or Guest cannot curate official video reel (PRD 4.7 Guard)
  const unauthCurateRes = await fetch(`${BASE_URL}/media/curate-reel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      marriageCode: testCode,
      ceremony: 'HALDI',
      title: 'Unverified Guest Video'
    })
  });
  assert(unauthCurateRes.status === 401, 'Unauthenticated video reel curation is rejected (HTTP 401)');

  // -------------------------------------------------------------
  // SUITE 8: Instant Blessings Bar & Photo Reactions
  // -------------------------------------------------------------
  console.log('\n--- SUITE 8: Instant Blessings Bar & Photo Reactions ---');
  // Test 8.1: Send Blessing to Marriage Vault
  const blessingRes = await fetch(`${BASE_URL}/marriages/${testCode}/blessing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'prem' })
  });
  assert(blessingRes.status === 200, 'Send blessing returns HTTP 200');
  const blessingData = await blessingRes.json();
  assert(blessingData.success === true, 'Blessing response reports success');
  assert(typeof blessingData.blessings?.prem === 'number', 'Prem blessing counter incremented');

  // Test 8.2: Get Blessing Counters
  const getBlessingsRes = await fetch(`${BASE_URL}/marriages/${testCode}/blessings`);
  assert(getBlessingsRes.status === 200, 'Get blessings returns HTTP 200');
  const getBlessingsData = await getBlessingsRes.json();
  assert(getBlessingsData.blessings?.totalSent >= 1, 'Total blessings tracked accurately');

  // Test 8.3: Photo Like Reaction
  const likeRes = await fetch(`${BASE_URL}/media/${fileId}/like`, {
    method: 'POST'
  });
  assert(likeRes.status === 200, 'Photo like reaction returns HTTP 200');
  const likeData = await likeRes.json();
  assert(likeData.likes >= 1, 'Photo likes counter incremented');

  // Test 8.4: Live Stream Signal Telemetry
  const signalRes = await fetch(`${BASE_URL}/events/stream-signal/${testCode}`);
  assert(signalRes.status === 200, 'Stream signal telemetry returns HTTP 200');
  const signalData = await signalRes.json();
  assert(signalData.success === true, 'Stream signal reports success');
  assert(typeof signalData.data?.latencyMs === 'number', 'Telemetry tracks ping latency');
  assert(signalData.data?.resolution === '1080p60 Full HD', 'Telemetry confirms 1080p60 Full HD resolution');

  // Test 8.5: Cryptographic SHA-256 Integrity Seal
  const auditRes = await fetch(`${BASE_URL}/marriages/${testCode}/audit-seal`);
  assert(auditRes.status === 200, 'Audit seal certificate returns HTTP 200');
  const auditData = await auditRes.json();
  assert(auditData.success === true, 'Audit seal reports success');
  assert(typeof auditData.data?.sha256Hash === 'string' && auditData.data.sha256Hash.length === 64, 'Generated valid 64-char SHA-256 digest');
  assert(auditData.data?.integrityStatus === 'AUTHENTIC_UNMODIFIED', 'Cryptographic integrity verified');

  // Test 8.6: Guest Roster Live Attendance
  const rosterRes = await fetch(`${BASE_URL}/invitations/${testCode}/roster`);
  assert(rosterRes.status === 200, 'Guest roster metrics returns HTTP 200');
  const rosterData = await rosterRes.json();
  assert(rosterData.success === true, 'Guest roster reports success');
  assert(rosterData.data?.confirmedGuestsCount >= 1, 'Roster confirms attendee count');

  // -------------------------------------------------------------
  // SUITE 9: Teardown & Cascading Cleanup
  // -------------------------------------------------------------
  console.log('\n--- SUITE 9: Teardown & Clean Database State ---');
  const delRes = await fetch(`${BASE_URL}/marriages/${marriageId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  assert(delRes.status === 200, 'Delete test marriage returns HTTP 200');

  const checkDelRes = await fetch(`${BASE_URL}/marriages/${testCode}`);
  assert(checkDelRes.status === 404, 'Deleted marriage is no longer accessible (HTTP 404)');

  console.log('\n================================================================');
  console.log(`  🎉 ALL FEATURES VERIFIED! ${passedTests} / ${totalTests} TESTS PASSED CLEANLY! `);
  console.log('================================================================\n');
}

testAllFeatures().catch((err) => {
  console.error('\n❌ TEST RUNNER FAILED:', err);
  process.exit(1);
});
