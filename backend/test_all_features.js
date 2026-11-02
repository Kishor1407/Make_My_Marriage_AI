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
  // SUITE 6: Teardown & Cascading Cleanup
  // -------------------------------------------------------------
  console.log('\n--- SUITE 6: Teardown & Clean Database State ---');
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
