(function () {
  function init() {
    var container = document.getElementById('3d-planter-container');
    if (!container || typeof THREE === 'undefined') return;
    var W = container.clientWidth || 420;
    var H = container.clientHeight || 520;

    var scene = new THREE.Scene();
    scene.background = null;

    var camera = new THREE.PerspectiveCamera(32, W / H, 0.1, 100);
    camera.position.set(0, 3.4, 7.5);
    camera.lookAt(0, 1.05, 0);

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xfff6e8, 0.55));
    scene.add(new THREE.HemisphereLight(0xfff1d6, 0x6b8a5a, 0.5));
    var key = new THREE.DirectionalLight(0xfff2d8, 1.15);
    key.position.set(2.5, 8.5, 3.5);
    key.castShadow = true;
    key.shadow.mapSize.width = 2048;
    key.shadow.mapSize.height = 2048;
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 24;
    key.shadow.camera.left = -3;
    key.shadow.camera.right = 3;
    key.shadow.camera.top = 4.5;
    key.shadow.camera.bottom = -2.5;
    key.shadow.bias = -0.0005;
    key.shadow.normalBias = 0.02;
    key.shadow.radius = 9; // softer penumbra
    scene.add(key);
    var fill = new THREE.DirectionalLight(0xbcd0ff, 0.45);
    fill.position.set(-5, 3, 2);
    scene.add(fill);
    var rim = new THREE.DirectionalLight(0xc6e8a8, 0.3);
    rim.position.set(0, 2, -4);
    scene.add(rim);

    var ground = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.ShadowMaterial({ opacity: 0.22 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.21;
    ground.receiveShadow = true;
    scene.add(ground);

    var clayMat = new THREE.MeshStandardMaterial({ color: 0xc46a35, roughness: 0.85, metalness: 0 });
    var clayDarkMat = new THREE.MeshStandardMaterial({ color: 0x3a2010, roughness: 1, metalness: 0 });
    var soilMat = new THREE.MeshStandardMaterial({ color: 0x4a2a14, roughness: 1, metalness: 0 });
    var soilTopMat = new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 1, metalness: 0, flatShading: true });
    var leafMat = new THREE.MeshStandardMaterial({
      color: 0x4f9e3a, roughness: 0.72, metalness: 0, side: THREE.DoubleSide,
      emissive: 0x0e2410, emissiveIntensity: 0.10, vertexColors: true
    });
    var leafLightMat = new THREE.MeshStandardMaterial({
      color: 0x7cc04a, roughness: 0.72, metalness: 0, side: THREE.DoubleSide,
      emissive: 0x162a14, emissiveIntensity: 0.10, vertexColors: true
    });
    var leafDarkMat = new THREE.MeshStandardMaterial({
      color: 0x357a26, roughness: 0.78, metalness: 0, side: THREE.DoubleSide,
      emissive: 0x0a1c0a, emissiveIntensity: 0.08, vertexColors: true
    });
    var stemMat = new THREE.MeshStandardMaterial({ color: 0x5e8a2c, roughness: 0.8, metalness: 0 });
    var veinMat = new THREE.MeshStandardMaterial({ color: 0x3d6b22, roughness: 0.7, metalness: 0 });

    var planter = new THREE.Group();
    planter.position.y = -0.2;
    scene.add(planter);

    var potBodyGeo = new THREE.CylinderGeometry(1.0, 0.7, 1.32, 64, 1, true);
    var potBody = new THREE.Mesh(potBodyGeo, clayMat);
    potBody.material.side = THREE.DoubleSide;
    potBody.position.y = 0.66;
    potBody.castShadow = true; potBody.receiveShadow = true;
    planter.add(potBody);

    var rimRing = new THREE.Mesh(new THREE.RingGeometry(0.88, 1.10, 64), clayMat);
    rimRing.rotation.x = -Math.PI / 2;
    rimRing.position.y = 1.32;
    rimRing.material.side = THREE.DoubleSide;
    rimRing.castShadow = true; rimRing.receiveShadow = true;
    planter.add(rimRing);

    var innerCavity = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.78, 0.6, 48, 1, true), clayDarkMat);
    innerCavity.material.side = THREE.BackSide;
    innerCavity.position.y = 1.05;
    innerCavity.receiveShadow = true;
    planter.add(innerCavity);

    var bandMat = new THREE.MeshStandardMaterial({ color: 0xa85428, roughness: 0.75, metalness: 0.02 });
    var bandUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.985, 0.965, 0.05, 64, 1, true), bandMat);
    bandUpper.material.side = THREE.DoubleSide;
    bandUpper.position.y = 1.18;
    planter.add(bandUpper);
    var bandLower = new THREE.Mesh(new THREE.CylinderGeometry(0.755, 0.745, 0.05, 64, 1, true), bandMat);
    bandLower.material.side = THREE.DoubleSide;
    bandLower.position.y = 0.18;
    planter.add(bandLower);
    var seamMat = new THREE.MeshStandardMaterial({ color: 0xb05f30, roughness: 0.85, metalness: 0 });
    for (var sm = 0; sm < 6; sm++) {
      var sAng = (sm / 6) * Math.PI * 2 + Math.random() * 0.3;
      var sY = 0.45 + Math.random() * 0.4;
      var rAtY = 0.7 + 0.3 * (sY / 1.32);
      var seam = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.22 + Math.random() * 0.14, 0.004), seamMat);
      seam.position.set(Math.cos(sAng) * (rAtY + 0.005), sY, Math.sin(sAng) * (rAtY + 0.005));
      seam.rotation.y = -sAng + Math.PI / 2;
      planter.add(seam);
    }

    var soilGeo = new THREE.CylinderGeometry(0.88, 0.88, 0.10, 64, 4);
    var sPos = soilGeo.attributes.position;
    for (var s = 0; s < sPos.count; s++) {
      var sy = sPos.getY(s);
      if (sy > 0.04) {
        var sx = sPos.getX(s), sz = sPos.getZ(s);
        var bump = (Math.sin(sx * 9) * Math.cos(sz * 11) + Math.sin(sx * 17 + sz * 13) * 0.5) * 0.025;
        sPos.setY(s, sy + bump);
      }
    }
    soilGeo.computeVertexNormals();
    var soil = new THREE.Mesh(soilGeo, soilTopMat);
    soil.position.y = 1.18;
    soil.receiveShadow = true;
    planter.add(soil);

    var pebbleLightMat = new THREE.MeshStandardMaterial({ color: 0x8a5a36, roughness: 1, metalness: 0, flatShading: true });
    var pebbleDarkMat = new THREE.MeshStandardMaterial({ color: 0x351c0d, roughness: 1, metalness: 0, flatShading: true });
    for (var i = 0; i < 38; i++) {
      var ang = Math.random() * Math.PI * 2;
      var rad = Math.random() * 0.80;
      var pSize = 0.025 + Math.random() * 0.055;
      var pMat;
      var r = i % 4;
      if (r === 0) pMat = soilMat;
      else if (r === 1) pMat = soilTopMat;
      else if (r === 2) pMat = pebbleLightMat;
      else pMat = pebbleDarkMat;
      var pebble = new THREE.Mesh(
        new THREE.SphereGeometry(pSize, 7, 5),
        pMat
      );
      pebble.position.set(Math.cos(ang) * rad, 1.235 + Math.random() * 0.025, Math.sin(ang) * rad);
      pebble.scale.set(1 + Math.random() * 0.4, 0.4 + Math.random() * 0.3, 1 + Math.random() * 0.4);
      pebble.rotation.y = Math.random() * Math.PI;
      pebble.castShadow = true; pebble.receiveShadow = true;
      planter.add(pebble);
    }
    for (var ci = 0; ci < 5; ci++) {
      var cAng = Math.random() * Math.PI * 2;
      var cRad = Math.random() * 0.60;
      var clump = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.06 + Math.random() * 0.04, 0),
        ci % 2 ? soilMat : pebbleDarkMat
      );
      clump.position.set(Math.cos(cAng) * cRad, 1.245, Math.sin(cAng) * cRad);
      clump.scale.set(1.1, 0.45, 1.1);
      clump.rotation.set(Math.random(), Math.random(), Math.random());
      clump.castShadow = true; clump.receiveShadow = true;
      planter.add(clump);
    }

    var plant = new THREE.Group();
    plant.position.y = 1.36;
    planter.add(plant);

    function buildLeafShape() {
      var s = new THREE.Shape();
      s.moveTo(0, 0);
      s.bezierCurveTo(0.45, 0.15, 0.50, 0.65, 0, 1.0);
      s.bezierCurveTo(-0.50, 0.65, -0.45, 0.15, 0, 0);
      return s;
    }
    var leafShape = buildLeafShape();
    var leafGeo = new THREE.ExtrudeGeometry(leafShape, {
      depth: 0.05, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.05, bevelSegments: 4, curveSegments: 32
    });
    leafGeo.translate(0, 0, -0.05);
    var lPos = leafGeo.attributes.position;
    var lColors = new Float32Array(lPos.count * 3);
    for (var li = 0; li < lPos.count; li++) {
      var ly = lPos.getY(li);
      var lz = lPos.getZ(li);
      var lx = lPos.getX(li);
      var curl = Math.pow(Math.max(ly, 0), 1.6) * 0.18;
      lPos.setZ(li, lz + curl);
      var bumps = (
        Math.sin(ly * 14) * 0.008 +
        Math.sin(lx * 23 + ly * 7) * 0.005 +
        Math.cos(lx * 31 - ly * 17) * 0.003 +
        Math.sin(lx * 47 + ly * 41) * 0.002
      ) * (1 - Math.abs(lx));
      lPos.setZ(li, lPos.getZ(li) + bumps);
      var n = (Math.sin(lx * 19 + ly * 13) + Math.cos(lx * 7 - ly * 23)) * 0.5;
      var brighter = 1 - Math.abs(lx) * 0.15;
      var darker = Math.pow(Math.max(0, 1 - ly), 0.8);
      var v = 0.82 + n * 0.10 + brighter * 0.04 - darker * 0.05;
      v = Math.max(0.7, Math.min(1.0, v));
      lColors[li * 3] = v;
      lColors[li * 3 + 1] = Math.min(1.0, v * 1.03);
      lColors[li * 3 + 2] = v * 0.95;
    }
    leafGeo.setAttribute('color', new THREE.BufferAttribute(lColors, 3));
    leafGeo.computeVertexNormals();

    function makeLeaf(mat, tiltX, yawY, scale, lengthScale, detailLevel) {
      detailLevel = detailLevel || 1;
      var g = new THREE.Group();
      var leaf = new THREE.Mesh(leafGeo, mat);
      leaf.scale.set(scale, (lengthScale || 1.0) * scale, scale);
      leaf.castShadow = true; leaf.receiveShadow = true;
      g.add(leaf);
      var L = (lengthScale || 1.0) * scale;
      var veinPts = [];
      for (var vi = 0; vi <= 16; vi++) {
        var vt = vi / 16;
        var vCurl = Math.pow(vt, 1.6) * 0.18 * scale;
        veinPts.push(new THREE.Vector3(0, vt * L, vCurl + 0.05 * scale));
      }
      var veinCurve = new THREE.CatmullRomCurve3(veinPts);
      var midRadius = (detailLevel >= 2 ? 0.016 : 0.013) * scale;
      var veinTube = new THREE.TubeGeometry(veinCurve, 24, midRadius, 6, false);
      var vein = new THREE.Mesh(veinTube, veinMat);
      vein.castShadow = true;
      g.add(vein);
      function addSideVein(t0, tEnd, dir, radiusMul) {
        var sPts = [];
        for (var si = 0; si <= 8; si++) {
          var sp = si / 8;
          var st = t0 + sp * (tEnd - t0);
          var sCurl = Math.pow(st, 1.6) * 0.18 * scale;
          var widthFactor = 0.30 * (1 - Math.pow(st, 1.2));
          var sideX = dir * sp * widthFactor * scale;
          sPts.push(new THREE.Vector3(sideX, st * L, sCurl + 0.052 * scale));
        }
        var sCurve = new THREE.CatmullRomCurve3(sPts);
        var sTube = new THREE.TubeGeometry(sCurve, 14, (radiusMul || 0.006) * scale, 5, false);
        g.add(new THREE.Mesh(sTube, veinMat));
      }
      if (detailLevel >= 2) {
        addSideVein(0.18, 0.42, +1, 0.0075);
        addSideVein(0.18, 0.42, -1, 0.0075);
        addSideVein(0.40, 0.62, +1, 0.0065);
        addSideVein(0.40, 0.62, -1, 0.0065);
        addSideVein(0.60, 0.78, +1, 0.0055);
        addSideVein(0.60, 0.78, -1, 0.0055);
      } else {
        addSideVein(0.30, 0.55, +1, 0.006);
        addSideVein(0.30, 0.55, -1, 0.006);
      }
      g.rotation.order = 'YXZ';
      g.rotation.y = yawY;
      g.rotation.x = tiltX;
      return g;
    }

    var centerStem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.35, 12), stemMat);
    centerStem.position.y = 0.17; centerStem.castShadow = true;
    plant.add(centerStem);


    plant.add(makeLeaf(leafMat, -0.10, Math.PI, 1.15, 1.40, 2));
    plant.add(makeLeaf(leafMat, Math.PI * 0.28, Math.PI * 0.50, 1.00, 1.10));
    plant.add(makeLeaf(leafMat, Math.PI * 0.28, -Math.PI * 0.50, 1.00, 1.10));
    plant.add(makeLeaf(leafDarkMat, Math.PI * 0.40, Math.PI * 0.25, 0.95, 1.00));
    plant.add(makeLeaf(leafDarkMat, Math.PI * 0.40, -Math.PI * 0.25, 0.95, 1.00));
    plant.add(makeLeaf(leafMat, Math.PI * 0.45, 0, 0.90, 0.95));

    planter.rotation.x = 0.16;

    var BASE_X = 0.16;
    var targetRotY = 0, targetRotX = BASE_X;
    var currentRotY = 0, currentRotX = BASE_X;
    var heroEl = document.querySelector('.hero') || container;
    heroEl.addEventListener('mousemove', function (e) {
      var r = heroEl.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5;
      var ny = (e.clientY - r.top) / r.height - 0.5;
      targetRotY = nx * 0.85;
      targetRotX = BASE_X + ny * 0.40;
    });
    heroEl.addEventListener('mouseleave', function () {
      targetRotY = 0; targetRotX = BASE_X;
    });

    function animate() {
      requestAnimationFrame(animate);
      currentRotY += (targetRotY - currentRotY) * 0.10;
      currentRotX += (targetRotX - currentRotX) * 0.10;
      planter.rotation.y = currentRotY;
      planter.rotation.x = currentRotX;
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', function () {
      var w = container.clientWidth, h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

(() => {
  const dict = {
    en: {
      nav_benefits: "Benefits", nav_how: "How it works", nav_features: "Features", nav_about: "About", nav_help: "Help", nav_faq: "FAQ", nav_contact: "Contact us", nav_cta: "Get started",
      hero_h1_a: "Smart irrigation,", hero_h1_b: "less water waste.",
      hero_lead: "Monitor soil conditions, control watering from anywhere, and water only when your plants really need it, all from one app.",
      cta_get: "Get started", cta_how: "See how it works",
      tok_moist: "Soil moisture", tok_flow: "Flow", tok_temp: "Soil temp",
      ben_eyebrow: "Why AquaSave", ben_title: "Watering that works smarter for you.", ben_lead: "Stop guessing. Get the data and the controls you need to keep plants healthy and water bills low.",
      ben1_t: "Save water", ben1_d: "Irrigate based on real soil data and skip cycles when rain is on the way.",
      ben2_t: "Protect your plants", ben2_d: "Get critical alerts when soil moisture drops or rises beyond healthy levels.",
      ben3_t: "Control from anywhere", ben3_d: "Open valves, pause watering, or run a quick cycle from phone or browser.",
      ben4_t: "Avoid watering before rain", ben4_d: "Forecast-aware schedules pause irrigation when nature is about to do the job.",
      ben5_t: "Track your consumption", ben5_d: "See how much water you use day by day and where you can save more.",
      ben6_t: "Make watering easier", ben6_d: "Set it once and let AquaSave keep your garden in great shape, or take manual control anytime.",
      how_eyebrow: "How it works", how_title: "Three steps to smarter watering.", how_lead: "Set up takes minutes. AquaSave guides you through every step.",
      step1_t: "Connect the device", step1_d: "Place the smart device near your garden, plug it in, and pair it with the app via guided setup.",
      step2_t: "Check your data", step2_d: "See live soil moisture, soil temperature, and water flow, at a glance, in clear cards.",
      step3_t: "Automate or take control", step3_d: "Let AquaSave water automatically based on soil and weather, or trigger irrigation manually whenever you want.",
      feat_eyebrow: "Features", feat_title: "Everything you need in one app.", feat_lead: "Designed to be useful from the first day, with no technical fuss.",
      f1_t: "Live soil monitoring", f1_d: "Real-time moisture and temperature readings from connected sensors.",
      f2_t: "Smart irrigation control", f2_d: "Automatic watering based on soil conditions, or manual remote control.",
      f3_t: "Weather-aware watering", f3_d: "Forecast integration pauses irrigation when rain is coming.",
      f4_t: "Critical humidity alerts", f4_d: "Get notified when moisture levels need your attention.",
      f5_t: "Water usage history", f5_d: "Daily, weekly, and monthly consumption, all in one place.",
      f6_t: "Activity summaries", f6_d: "Review general irrigation activity and recent usage patterns in a simple view.",
      f7_t: "Web & mobile access", f7_d: "Use AquaSave from your phone, tablet, or computer, synced everywhere.",
      f8_t: "Guided setup", f8_d: "Step-by-step pairing and configuration, ready in minutes.",
      about_eyebrow: "About us", about_title: "A team behind every drop.", about_lead: "EcoDrop builds technology for smarter water use. AquaSave is our first product, a connected device and app for smarter irrigation.",
      about_tag_brand: "The brand", about_tag_prod: "The product",
      about_eco_p: "EcoDrop is a startup focused on technology that supports smarter and more responsible water use. We design connected products that turn everyday irrigation into something simple, transparent, and sustainable.",
      about_eco_tr1: "Sustainable", about_eco_tr2: "Connected", about_eco_tr3: "Human-first",
      about_aqua_p: "AquaSave is EcoDrop's smart irrigation product. It pairs a small connected device with a web and mobile app so you can monitor irrigation data, receive critical alerts, and control watering from wherever you are.",
      about_aqua_tr1: "Smart device", about_aqua_tr2: "Web & mobile", about_aqua_tr3: "Easy to use",
      sus_eyebrow: "Sustainability", sus_h1: "Every drop matters.", sus_h2: "AquaSave makes them count.",
      sus_lead: "By watering with real data instead of guesses, you reduce waste and help your plants thrive, one cycle at a time.",
      help_eyebrow: "Help center", help_title: "What do you need help with?", help_lead: "Choose a topic and we'll take you straight to the right answers.",
      help_h1_t: "Billing", help_h1_d: "Invoices, charges, and payment details.",
      help_h2_t: "Account", help_h2_d: "Login, password, and profile settings.",
      help_h3_t: "Smart irrigation", help_h3_d: "Automation, schedules, and watering logic.",
      help_h4_t: "Devices", help_h4_d: "Pairing, compatibility, and setup steps.",
      help_h5_t: "Plans", help_h5_d: "Features, upgrades, and plan limits.",
      help_h6_t: "Technical support", help_h6_d: "Troubleshooting and connection issues.",
      help_h7_t: "Contact", help_h7_d: "Talk to our team when you need a hand.",
      help_h8_t: "Using the app", help_h8_d: "Get the most out of AquaSave.",
      faq_eyebrow: "FAQ", faq_title: "Frequently asked questions.", faq_lead: "Browse by category or filter the list to find what you need faster.",
      faq_all: "All", faq_billing: "Billing", faq_account: "Account", faq_irrigation: "Smart irrigation", faq_devices: "Devices", faq_plans: "Plans", faq_support: "Technical support", faq_contact: "Contact",
      faq_q1: "When will I be charged?",
      faq_a1: "Charges follow the billing cycle for the plan you selected. You'll always see the renewal date and payment status in your account area.",
      faq_q2: "Can I update my billing details?",
      faq_a2: "Yes. You can change your billing information, payment method, and invoice details from your account settings.",
      faq_q3: "How do I reset my password?",
      faq_a3: "Use the forgot-password option on the sign-in screen. We'll send you a secure link so you can choose a new password.",
      faq_q4: "How does AquaSave decide when to water?",
      faq_a4: "AquaSave combines soil readings, watering rules, and local weather context so irrigation runs only when conditions actually call for it.",
      faq_q5: "How do I pair the device?",
      faq_a5: "Open the app, choose add device, and follow the guided pairing steps. Keep the device powered and close to your router during setup.",
      faq_q6: "What devices are supported?",
      faq_a6: "AquaSave is designed for the EcoDrop smart irrigation device and its supported sensor accessories. Compatibility details appear during onboarding.",
      faq_q7: "What is included in each plan?",
      faq_a7: "Plans can include different levels of automation, device capacity, reporting, and support. The plan details page compares them side by side.",
      faq_q8: "What should I do if my device goes offline?",
      faq_a8: "First check power, Wi-Fi signal, and device status in the app. If it stays offline, restart the device and contact support so we can help you diagnose it.",
      faq_q9: "How can I contact the AquaSave team?",
      faq_a9: "Use the contact form on the main site and tell us what you need. We'll route your message to the right person and get back to you.",
      still_t: "Still need help?", still_p: "Couldn't find what you were looking for? Contact us and we'll help you.", still_btn: "Contact us",
      contact_eyebrow: "Contact", contact_title: "Let's build smarter irrigation together.",
      contact_lead: "Have a question, a suggestion, or want to know more about AquaSave? Send us a message, we read every one.",
      form_name: "Name", form_email: "Email", form_subject: "Subject", form_subject_ph: "How can we help?",
      form_msg: "Message", form_msg_ph: "Tell us a bit about your garden or your question…", form_send: "Send message",
      form_thx_t: "Thanks for reaching out!", form_thx_p: "We'll get back to you within a couple of business days.",
      cta_h1: "Start watering smarter", cta_h2: "with AquaSave.",
      cta_lead: "Set up the smart device, open the app, and let your garden tell you what it needs.",
      cta_get_final: "Get started with AquaSave",
      foot_slogan: "Smarter irrigation, one drop at a time.", foot_by: "A product by",
      foot_explore: "Explore", foot_help: "Help", foot_legal: "Legal",
      foot_help_center: "Help Center", foot_faq: "FAQ", foot_contact_us: "Contact",
      foot_terms: "Terms & Conditions", foot_privacy: "Privacy Policy",
      terms_title: "Terms & Conditions",
      terms_h1: "Use of the AquaSave website and app",
      terms_p1: "By using the AquaSave website or app, you agree to use the service in a responsible way and only for purposes related to monitoring and controlling your own irrigation setup.",
      terms_h2: "Informational purpose",
      terms_p2: "The information shown in AquaSave is intended to support your irrigation decisions. EcoDrop is not responsible for plant outcomes derived from those decisions.",
      terms_h3: "Product availability",
      terms_p3: "AquaSave is in active development. EcoDrop does not guarantee final availability dates or specific feature sets while the product evolves.",
      terms_h4: "Contact", terms_p4: "Questions about these terms? Reach out through the contact form on this page.",
      priv_title: "Privacy Policy",
      priv_h1: "What we collect", priv_p1: "We collect the basic information you submit through the contact form: name, email, and message.",
      priv_h2: "How we use it", priv_p2: "We use that information only to reply to your inquiry and follow up if needed. Nothing more.",
      priv_h3: "No sale of personal data", priv_p3: "EcoDrop does not sell, rent, or share your personal data with third parties for marketing.",
      priv_h4: "Your privacy", priv_p4: "We're committed to handling your information carefully and only for the purpose you shared it for."
    },
    es: {
      nav_benefits: "Beneficios", nav_how: "Cómo funciona", nav_features: "Funciones", nav_about: "Nosotros", nav_help: "Ayuda", nav_faq: "FAQ", nav_contact: "Contáctanos", nav_cta: "Empezar",
      hero_h1_a: "Riego inteligente,", hero_h1_b: "menos agua desperdiciada.",
      hero_lead: "Monitorea las condiciones del suelo, controla el riego desde donde estés y riega solo cuando tus plantas lo necesitan, todo desde una app.",
      cta_get: "Empezar", cta_how: "Ver cómo funciona",
      tok_moist: "Humedad", tok_flow: "Caudal", tok_temp: "Temperatura",
      ben_eyebrow: "Por qué AquaSave", ben_title: "Un riego que trabaja por ti.", ben_lead: "Deja de adivinar. Obtén los datos y los controles que necesitas para mantener tus plantas sanas y la cuenta de agua baja.",
      ben1_t: "Ahorra agua", ben1_d: "Riega con datos reales del suelo y omite ciclos cuando se acerca la lluvia.",
      ben2_t: "Protege tus plantas", ben2_d: "Recibe alertas cuando la humedad del suelo cae o sube fuera de los niveles saludables.",
      ben3_t: "Controla desde cualquier lugar", ben3_d: "Abre válvulas, pausa el riego o lanza un ciclo rápido desde el móvil o el navegador.",
      ben4_t: "Evita regar antes de llover", ben4_d: "Programaciones que conocen el pronóstico y pausan el riego cuando va a llover.",
      ben5_t: "Sigue tu consumo", ben5_d: "Ve cuánta agua usas día a día y dónde puedes ahorrar más.",
      ben6_t: "Hace el riego más fácil", ben6_d: "Configúralo una vez y deja que AquaSave cuide tu huerto, o toma el control manual cuando quieras.",
      how_eyebrow: "Cómo funciona", how_title: "Tres pasos para regar mejor.", how_lead: "Instalarlo lleva minutos. AquaSave te guía paso a paso.",
      step1_t: "Conecta el dispositivo", step1_d: "Coloca el dispositivo inteligente cerca de tu huerto, conéctalo y vincúlalo con la app guiada.",
      step2_t: "Revisa tus datos", step2_d: "Ve la humedad, la temperatura del suelo y el caudal de agua de un vistazo, en tarjetas claras.",
      step3_t: "Automatiza o toma el control", step3_d: "Deja que AquaSave riegue automáticamente según el suelo y el clima, o riega manualmente cuando quieras.",
      feat_eyebrow: "Funciones", feat_title: "Todo lo que necesitas en una app.", feat_lead: "Diseñada para ser útil desde el primer día, sin complicaciones técnicas.",
      f1_t: "Monitoreo del suelo en vivo", f1_d: "Lecturas de humedad y temperatura en tiempo real desde sensores conectados.",
      f2_t: "Control inteligente del riego", f2_d: "Riego automático según condiciones del suelo o control manual remoto.",
      f3_t: "Riego con clima", f3_d: "La integración con el pronóstico pausa el riego cuando va a llover.",
      f4_t: "Alertas de humedad crítica", f4_d: "Recibe avisos cuando la humedad necesita tu atención.",
      f5_t: "Historial de consumo", f5_d: "Consumo diario, semanal y mensual, todo en un solo lugar.",
      f6_t: "Resumen de actividad", f6_d: "Consulta la actividad general del riego y los patrones recientes de uso en una vista simple.",
      f7_t: "Acceso web y móvil", f7_d: "Usa AquaSave desde tu móvil, tableta o computadora, sincronizado en todo.",
      f8_t: "Configuración guiada", f8_d: "Vinculación y configuración paso a paso, listo en minutos.",
      about_eyebrow: "Nosotros", about_title: "Un equipo detrás de cada gota.", about_lead: "EcoDrop crea tecnología para un uso más inteligente del agua. AquaSave es nuestro primer producto, un dispositivo conectado y una app para regar mejor.",
      about_tag_brand: "La marca", about_tag_prod: "El producto",
      about_eco_p: "EcoDrop es una startup enfocada en tecnología que apoya un uso más inteligente y responsable del agua. Diseñamos productos conectados que vuelven el riego algo simple, transparente y sostenible.",
      about_eco_tr1: "Sostenible", about_eco_tr2: "Conectado", about_eco_tr3: "Centrado en personas",
      about_aqua_p: "AquaSave es el producto de riego inteligente de EcoDrop. Combina un pequeño dispositivo conectado con una app web y móvil para que monitorees datos del riego, recibas alertas críticas y controles el agua desde donde estés.",
      about_aqua_tr1: "Dispositivo inteligente", about_aqua_tr2: "Web y móvil", about_aqua_tr3: "Fácil de usar",
      sus_eyebrow: "Sostenibilidad", sus_h1: "Cada gota cuenta.", sus_h2: "AquaSave la hace contar.",
      sus_lead: "Al regar con datos reales en lugar de adivinar, reduces el desperdicio y ayudas a que tus plantas prosperen, ciclo a ciclo.",
      help_eyebrow: "Centro de ayuda", help_title: "¿Qué ayuda necesitas?", help_lead: "Elige un tema y te llevamos directo a las respuestas correctas.",
      help_h1_t: "Facturación", help_h1_d: "Cobros, pagos y detalles de factura.",
      help_h2_t: "Cuenta", help_h2_d: "Inicio de sesión, contraseña y perfil.",
      help_h3_t: "Riego inteligente", help_h3_d: "Automatización, reglas y lógica de riego.",
      help_h4_t: "Dispositivos", help_h4_d: "Vinculación, compatibilidad y configuración.",
      help_h5_t: "Planes", help_h5_d: "Funciones, mejoras y límites del plan.",
      help_h6_t: "Soporte técnico", help_h6_d: "Problemas de conexión y diagnóstico.",
      help_h7_t: "Contacto", help_h7_d: "Habla con nuestro equipo cuando lo necesites.",
      help_h8_t: "Usar la app", help_h8_d: "Saca el máximo de AquaSave.",
      faq_eyebrow: "FAQ", faq_title: "Preguntas frecuentes.", faq_lead: "Explora por categoría o filtra la lista para encontrar lo que necesitas más rápido.",
      faq_all: "Todo", faq_billing: "Facturación", faq_account: "Cuenta", faq_irrigation: "Riego inteligente", faq_devices: "Dispositivos", faq_plans: "Planes", faq_support: "Soporte técnico", faq_contact: "Contacto",
      faq_q1: "¿Cuándo me cobrarán?",
      faq_a1: "Los cobros siguen el ciclo de facturación del plan que elegiste. Siempre verás la fecha de renovación y el estado del pago en tu cuenta.",
      faq_q2: "¿Puedo actualizar mis datos de facturación?",
      faq_a2: "Sí. Puedes cambiar tu información de facturación, método de pago y datos de factura desde la configuración de tu cuenta.",
      faq_q3: "¿Cómo restablezco mi contraseña?",
      faq_a3: "Usa la opción de olvidé mi contraseña en el acceso. Te enviaremos un enlace seguro para elegir una nueva.",
      faq_q4: "¿Cómo decide AquaSave cuándo regar?",
      faq_a4: "AquaSave combina lecturas del suelo, reglas de riego y contexto climático local para activar el riego solo cuando realmente hace falta.",
      faq_q5: "¿Cómo vinculo el dispositivo?",
      faq_a5: "Abre la app, elige agregar dispositivo y sigue los pasos guiados. Mantén el equipo encendido y cerca del router durante la configuración.",
      faq_q6: "¿Qué dispositivos son compatibles?",
      faq_a6: "AquaSave está diseñado para el dispositivo de riego inteligente EcoDrop y sus accesorios compatibles. Los detalles aparecen durante la activación.",
      faq_q7: "¿Qué incluye cada plan?",
      faq_a7: "Los planes pueden incluir distintos niveles de automatización, capacidad de dispositivos, reportes y soporte. La página de planes los compara lado a lado.",
      faq_q8: "¿Qué hago si mi dispositivo queda offline?",
      faq_a8: "Primero revisa la energía, la señal Wi-Fi y el estado del equipo en la app. Si sigue offline, reinícialo y contacta soporte para ayudarte a diagnosticarlo.",
      faq_q9: "¿Cómo contacto al equipo de AquaSave?",
      faq_a9: "Usa el formulario de contacto del sitio principal y cuéntanos qué necesitas. Enviaremos tu mensaje a la persona correcta y te responderemos.",
      still_t: "¿Aún necesitas ayuda?", still_p: "¿No encontraste lo que buscabas? Contáctanos y te ayudaremos.", still_btn: "Contáctanos",
      contact_eyebrow: "Contacto", contact_title: "Construyamos un riego más inteligente juntos.",
      contact_lead: "¿Tienes una pregunta, sugerencia o quieres saber más sobre AquaSave? Envíanos un mensaje, leemos cada uno.",
      form_name: "Nombre", form_email: "Email", form_subject: "Asunto", form_subject_ph: "¿En qué te ayudamos?",
      form_msg: "Mensaje", form_msg_ph: "Cuéntanos un poco sobre tu huerto o tu pregunta…", form_send: "Enviar mensaje",
      form_thx_t: "¡Gracias por escribirnos!", form_thx_p: "Te responderemos en un par de días hábiles.",
      cta_h1: "Empieza a regar con cabeza", cta_h2: "con AquaSave.",
      cta_lead: "Instala el dispositivo, abre la app y deja que tu huerto te diga lo que necesita.",
      cta_get_final: "Empezar con AquaSave",
      foot_slogan: "Riego más inteligente, gota a gota.", foot_by: "Un producto de",
      foot_explore: "Explorar", foot_help: "Ayuda", foot_legal: "Legal",
      foot_help_center: "Centro de ayuda", foot_faq: "FAQ", foot_contact_us: "Contacto",
      foot_terms: "Términos y condiciones", foot_privacy: "Política de privacidad",
      terms_title: "Términos y condiciones",
      terms_h1: "Uso del sitio y la app de AquaSave",
      terms_p1: "Al usar el sitio o la app de AquaSave aceptas usar el servicio de forma responsable y solo con fines relacionados con el monitoreo y control de tu propio sistema de riego.",
      terms_h2: "Propósito informativo",
      terms_p2: "La información mostrada en AquaSave busca apoyar tus decisiones de riego. EcoDrop no se responsabiliza por los resultados de las plantas derivados de esas decisiones.",
      terms_h3: "Disponibilidad del producto",
      terms_p3: "AquaSave está en desarrollo activo. EcoDrop no garantiza fechas de disponibilidad final ni un conjunto específico de funciones mientras el producto evoluciona.",
      terms_h4: "Contacto", terms_p4: "¿Dudas sobre estos términos? Escríbenos desde el formulario de contacto de esta página.",
      priv_title: "Política de privacidad",
      priv_h1: "Qué recopilamos", priv_p1: "Recopilamos la información básica que envías por el formulario de contacto: nombre, email y mensaje.",
      priv_h2: "Cómo la usamos", priv_p2: "Usamos esa información solo para responder tu consulta y dar seguimiento si es necesario. Nada más.",
      priv_h3: "No vendemos datos personales", priv_p3: "EcoDrop no vende, alquila ni comparte tus datos con terceros con fines de marketing.",
      priv_h4: "Tu privacidad", priv_p4: "Nos comprometemos a tratar tu información con cuidado y solo con el propósito por el que la compartiste."
    }
  };

  const setLang = (lang) => {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[lang] && dict[lang][key]) el.textContent = dict[lang][key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[lang] && dict[lang][key]) el.placeholder = dict[lang][key];
    });
    document.querySelectorAll('.lang').forEach(langWrap => {
      langWrap.classList.toggle('is-es', lang === 'es');
    });
    document.querySelectorAll('.lang button').forEach(b => {
      b.classList.toggle('is-active', b.dataset.lang === lang);
    });
    // soft fade
    document.querySelectorAll('.lang-fade').forEach(el => {
      el.classList.add('flick');
      setTimeout(() => el.classList.remove('flick'), 200);
    });
  };
  document.querySelectorAll('.lang button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
  setLang('en');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = parseInt(e.target.dataset.delay || '0', 10);
        setTimeout(() => e.target.classList.add('in'), delay);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => io.observe(el));

  const scene = document.getElementById('scene');
  if (scene) {
    const stage = scene.parentElement;
    let raf = null;
    stage.addEventListener('mousemove', (e) => {
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        scene.style.transform = `rotateY(${px * 16}deg) rotateX(${-py * 12}deg)`;
      });
    });
    stage.addEventListener('mouseleave', () => {
      scene.style.transform = `rotateY(0deg) rotateX(0deg)`;
    });
  }

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    document.querySelectorAll('.data-token').forEach((c, i) => {
      c.style.translate = `0 ${Math.sin(y / 150 + i) * 4}px`;
    });
  }, { passive: true });

  const eco = document.getElementById('ecoAnim');
  if (eco) {
    const sizes = ['', 's', 't'];
    for (let i = 0; i < 14; i++) {
      const l = document.createElement('span');
      l.className = 'a-leaf ' + sizes[i % 3];
      l.style.setProperty('--y0', (15 + Math.random() * 70) + '%');
      l.style.setProperty('--op', (0.35 + Math.random() * 0.35).toFixed(2));
      l.style.animationDuration = (7.5 + Math.random() * 5.5) + 's';
      l.style.animationDelay = (Math.random() * -12) + 's';
      eco.appendChild(l);
    }
    for (let i = 0; i < 8; i++) {
      const l = document.createElement('span');
      l.className = 'a-leaf corner ' + sizes[i % 3];
      l.style.setProperty('--cx', (18 + Math.random() * 90) + 'px');
      l.style.setProperty('--cy', (16 + Math.random() * 58) + 'px');
      l.style.setProperty('--rot', (-54 + Math.random() * 52) + 'deg');
      l.style.animationDuration = (4.8 + Math.random() * 3.8) + 's';
      l.style.animationDelay = (Math.random() * -6) + 's';
      eco.appendChild(l);
    }
  }
  const aqua = document.getElementById('aquaAnim');
  if (aqua) {
    const sizes = ['', 's', 't'];
    for (let i = 0; i < 12; i++) {
      const d = document.createElement('span');
      d.className = 'a-drop ' + sizes[i % 3];
      d.style.left = (5 + Math.random() * 90) + '%';
      d.style.setProperty('--op', (0.35 + Math.random() * 0.35).toFixed(2));
      d.style.animationDuration = (4 + Math.random() * 4) + 's';
      d.style.animationDelay = (Math.random() * -6) + 's';
      aqua.appendChild(d);
    }
    [25, 55, 80].forEach(x => {
      const r = document.createElement('span');
      r.className = 'a-ripple';
      r.style.setProperty('--rx', x + '%');
      r.style.animationDelay = (-Math.random() * 4) + 's';
      aqua.appendChild(r);
    });
  }

  const rain = document.getElementById('rain');
  if (rain) {
    const drops = 60;
    for (let i = 0; i < drops; i++) {
      const s = document.createElement('span');
      s.style.left = Math.random() * 100 + '%';
      s.style.animationDuration = (1.6 + Math.random() * 1.6) + 's';
      s.style.animationDelay = (Math.random() * -3) + 's';
      s.style.opacity = (0.25 + Math.random() * 0.5).toFixed(2);
      s.style.height = (12 + Math.random() * 16) + 'px';
      rain.appendChild(s);
    }
  }

  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.parentElement.classList.toggle('is-open');
    });
  });
  const filterFaq = (cat) => {
    document.querySelectorAll('#faqList .faq-item').forEach(it => {
      it.classList.toggle('is-hidden', cat !== 'all' && it.dataset.cat !== cat);
    });
    document.querySelectorAll('#faqFilters button').forEach(b => {
      b.classList.toggle('is-active', b.dataset.filter === cat);
    });
  };
  document.querySelectorAll('#faqFilters button').forEach(b => {
    b.addEventListener('click', () => filterFaq(b.dataset.filter));
  });
  document.querySelectorAll('.help-card').forEach(c => {
    c.addEventListener('click', () => {
      const cat = c.dataset.help;
      const faqList = document.getElementById('faqList');
      if (faqList) {
        filterFaq(cat);
        history.replaceState(null, '', `#faq-${cat}`);
        const faqSection = document.getElementById('faq');
        faqSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.location.href = `faq.html#faq-${cat}`;
      }
    });
  });
  const applyFaqHash = () => {
    const faqList = document.getElementById('faqList');
    if (!faqList) return;
    const hash = window.location.hash.replace('#', '');
    if (hash.startsWith('faq-')) {
      filterFaq(hash.replace('faq-', ''));
    } else {
      filterFaq('all');
    }
  };
  applyFaqHash();
  window.addEventListener('hashchange', applyFaqHash);

  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (form && success) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.elements['name'].value.trim();
      const email = form.elements['email'].value.trim();
      const msg = form.elements['message'].value.trim();
      if (!name || !email || !msg) return;
      success.classList.add('show');
      setTimeout(() => {
        success.classList.remove('show');
        form.reset();
      }, 3500);
    });
  }

  const openModal = (id) => {
    const m = document.getElementById('modal-' + id);
    if (m) m.classList.add('is-open');
  };
  const closeModal = (m) => m.classList.remove('is-open');
  document.querySelectorAll('[data-modal]').forEach(b => {
    b.addEventListener('click', (e) => { e.preventDefault(); openModal(b.dataset.modal); });
  });
  document.querySelectorAll('.modal-backdrop').forEach(bd => {
    bd.addEventListener('click', (e) => { if (e.target === bd) closeModal(bd); });
    bd.querySelector('.close').addEventListener('click', () => closeModal(bd));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.querySelectorAll('.modal-backdrop.is-open').forEach(closeModal);
  });
})();
