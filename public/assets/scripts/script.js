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

    scene.add(new THREE.AmbientLight(0xfff6e8, 0.45));
    scene.add(new THREE.HemisphereLight(0xfff1d6, 0x6b8a5a, 0.55));
    var key = new THREE.DirectionalLight(0xfff2d8, 1.30);
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
    var fill = new THREE.DirectionalLight(0xbcd0ff, 0.55);
    fill.position.set(-5, 3, 2);
    scene.add(fill);
    var rim = new THREE.DirectionalLight(0xc6e8a8, 0.45);
    rim.position.set(0, 2, -4);
    scene.add(rim);
    // Upward bounce, fakes subsurface translucency on undersides
    var bounce = new THREE.DirectionalLight(0xa8d878, 0.28);
    bounce.position.set(0, -2, 3);
    scene.add(bounce);
    // Top accent, gentle highlight on leaf tops
    var topAccent = new THREE.PointLight(0xfff8e8, 0.55, 8, 1.2);
    topAccent.position.set(0.6, 5.2, 1.8);
    scene.add(topAccent);

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
      color: 0x4a9436, roughness: 0.62, metalness: 0.02, side: THREE.DoubleSide,
      emissive: 0x183d20, emissiveIntensity: 0.18, vertexColors: true,
      flatShading: false
    });
    var leafLightMat = new THREE.MeshStandardMaterial({
      color: 0x7cc04a, roughness: 0.55, metalness: 0.02, side: THREE.DoubleSide,
      emissive: 0x214a25, emissiveIntensity: 0.20, vertexColors: true
    });
    var leafDarkMat = new THREE.MeshStandardMaterial({
      color: 0x2f7022, roughness: 0.68, metalness: 0.02, side: THREE.DoubleSide,
      emissive: 0x0e2814, emissiveIntensity: 0.14, vertexColors: true
    });
    var stemMat = new THREE.MeshStandardMaterial({ color: 0x5e8a2c, roughness: 0.8, metalness: 0 });
    var veinMat = new THREE.MeshStandardMaterial({
      color: 0x86b95b, roughness: 0.58, metalness: 0.02,
      emissive: 0x162d12, emissiveIntensity: 0.06
    });
    var veinFineMat = new THREE.MeshStandardMaterial({
      color: 0x6fa646, roughness: 0.66, metalness: 0.01,
      emissive: 0x10270f, emissiveIntensity: 0.045
    });
    var dewMat = new THREE.MeshPhysicalMaterial({
      color: 0xc8e8ff, roughness: 0.05, metalness: 0,
      transmission: 0.85, thickness: 0.08, ior: 1.33,
      clearcoat: 1, clearcoatRoughness: 0.05,
      transparent: true, opacity: 0.92
    });

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

    function buildLeafShape(seed) {
      seed = seed || 0;
      var s = new THREE.Shape();
      // Subtle asymmetric perturbations per shape variant
      var w = 0.50 + (seed === 1 ? 0.06 : seed === 2 ? -0.04 : 0);
      var w2 = 0.45 + (seed === 1 ? 0.04 : seed === 2 ? -0.03 : 0);
      var ty = 0.65 + (seed === 1 ? -0.04 : seed === 2 ? 0.05 : 0);
      var asym = seed === 2 ? 0.02 : 0;
      s.moveTo(0, 0);
      s.bezierCurveTo(w2, 0.15, w, ty, asym, 1.0);
      s.bezierCurveTo(-w + 0.02, ty + 0.02, -w2 + 0.01, 0.15, 0, 0);
      return s;
    }

    function buildLeafGeo(seed) {
      var leafShape = buildLeafShape(seed);
      var leafGeo = new THREE.ExtrudeGeometry(leafShape, {
        depth: 0.018, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.028, bevelSegments: 5, curveSegments: 40
      });
      leafGeo.translate(0, 0, -0.027);
      var lPos = leafGeo.attributes.position;
      var lColors = new Float32Array(lPos.count * 3);
      var seedHash = (seed + 1) * 11.7;
      for (var li = 0; li < lPos.count; li++) {
        var ly = lPos.getY(li);
        var lz = lPos.getZ(li);
        var lx = lPos.getX(li);
        // Per-leaf curl variation
        var curl = Math.pow(Math.max(ly, 0), 1.6) * (0.17 + seed * 0.012);
        lPos.setZ(li, lz + curl);
        // Approx leaf width profile for edge detection (sin curve peaks ~y=0.5)
        var widthAtY = 0.50 * Math.sin(Math.PI * Math.min(Math.max(ly, 0.0), 1.0));
        var dCenter = Math.abs(lx) / Math.max(0.0008, widthAtY); // 0 center, 1 edge
        var rimT = Math.pow(Math.min(1, Math.max(0, dCenter)), 4);
        var inner = 1 - rimT;
        // Surface micro-detail: layered noise + per-seed phase
        var bumps = (
          Math.sin(ly * 14 + seedHash) * 0.010 +
          Math.sin(lx * 23 + ly * 7 + seedHash) * 0.006 +
          Math.cos(lx * 31 - ly * 17 + seedHash) * 0.004 +
          Math.sin(lx * 47 + ly * 41) * 0.0025 +
          Math.sin(lx * 71 - ly * 53 + seedHash * 0.7) * 0.0015
        ) * (1 - Math.abs(lx));
        // Vein groove
        var veinGroove = -Math.exp(-Math.pow(lx * 14, 2)) * 0.012 * (ly > 0.05 ? 1 : 0);
        // Tiny edge irregularities (push edge in/out slightly to break perfect curve look)
        var edgeNoise = Math.sin(ly * 38 + seedHash) * 0.008 * rimT * (lz > -0.01 ? 1 : 0.4);
        lPos.setZ(li, lPos.getZ(li) + bumps + veinGroove + edgeNoise);

        // Organic color variation
        var noise = (Math.sin(lx * 19 + ly * 13 + seedHash) + Math.cos(lx * 7 - ly * 23)) * 0.5;
        var mottle = (Math.sin(lx * 41 + ly * 33) + Math.cos(lx * 53 - ly * 47 + seedHash)) * 0.18;
        var brighter = 1 - Math.abs(lx) * 0.15;
        var darker = Math.pow(Math.max(0, 1 - ly), 0.8);
        var tip = Math.pow(Math.max(0, ly - 0.55) / 0.45, 1.5);
        // Sparse darker spots / blemishes
        var blemish = 0;
        var bx1 = Math.sin(lx * 4.3 + seedHash * 1.7) * Math.cos(ly * 5.1 - seedHash * 0.9);
        if (bx1 > 0.85) blemish = (bx1 - 0.85) * 0.35;
        var v = 0.78 + noise * 0.09 + mottle * 0.04 + brighter * 0.05 - darker * 0.07 - blemish;
        v = Math.max(0.55, Math.min(1.02, v));
        var rC = v * 0.92;
        var gC = Math.min(1.0, v * 1.06);
        var bC = v * 0.76;
        // Tip warmth
        rC += tip * 0.12;
        gC += tip * 0.05;
        bC -= tip * 0.04;
        // Base/center darkening (vein zone)
        rC -= darker * 0.05;
        gC -= darker * 0.02;
        bC += darker * 0.02;
        // Rim highlight, lighter, slightly yellow at outer edge (catches light)
        var rim = Math.pow(rimT, 2.5);
        rC += rim * 0.10;
        gC += rim * 0.13;
        bC += rim * 0.05;
        // Center vein-zone shadow
        var veinShade = Math.exp(-Math.pow(lx * 18, 2)) * (ly > 0.05 ? 1 : 0) * 0.05;
        rC -= veinShade;
        gC -= veinShade * 1.1;
        bC -= veinShade * 0.6;
        lColors[li * 3] = Math.max(0.14, Math.min(1.0, rC));
        lColors[li * 3 + 1] = Math.max(0.26, Math.min(1.0, gC));
        lColors[li * 3 + 2] = Math.max(0.08, Math.min(1.0, bC));
      }
      leafGeo.setAttribute('color', new THREE.BufferAttribute(lColors, 3));
      leafGeo.computeVertexNormals();
      return leafGeo;
    }

    var leafGeoVariants = [buildLeafGeo(0), buildLeafGeo(1), buildLeafGeo(2)];
    var leafGeo = leafGeoVariants[0]; // backwards compat for veins computed against it

    function tintMaterial(baseMat, hueShift, lightnessMul, satMul) {
      var m = baseMat.clone();
      var c = m.color.clone();
      var hsl = { h: 0, s: 0, l: 0 };
      c.getHSL(hsl);
      hsl.h = (hsl.h + hueShift + 1) % 1;
      hsl.l = Math.max(0, Math.min(1, hsl.l * (lightnessMul || 1)));
      hsl.s = Math.max(0, Math.min(1, hsl.s * (satMul || 1)));
      c.setHSL(hsl.h, hsl.s, hsl.l);
      m.color = c;
      return m;
    }

    function makeLeaf(mat, tiltX, yawY, scale, lengthScale, detailLevel, withDew, geoIdx, tint) {
      detailLevel = detailLevel || 1;
      var g = new THREE.Group();
      var useGeo = leafGeoVariants[(geoIdx || 0) % leafGeoVariants.length];
      var useMat = tint ? tintMaterial(mat, tint.h || 0, tint.l || 1, tint.s || 1) : mat;
      var leaf = new THREE.Mesh(useGeo, useMat);
      leaf.scale.set(scale, (lengthScale || 1.0) * scale, scale);
      leaf.renderOrder = 1;
      leaf.castShadow = true; leaf.receiveShadow = true;
      g.add(leaf);
      var L = (lengthScale || 1.0) * scale;
      if (detailLevel >= 2) {
        var veinSide = -1;
        var veinLift = veinSide * 0.086 * scale;
        var veinPts = [];
        for (var vi = 0; vi <= 16; vi++) {
          var vt = vi / 16;
          var vCurl = Math.pow(vt, 1.6) * 0.18 * scale;
          veinPts.push(new THREE.Vector3(0, vt * L, vCurl + veinLift));
        }
        var veinCurve = new THREE.CatmullRomCurve3(veinPts);
        var midRadius = (detailLevel >= 2 ? 0.018 : 0.014) * scale;
        var veinTube = new THREE.TubeGeometry(veinCurve, 24, midRadius, 6, false);
        var vein = new THREE.Mesh(veinTube, veinMat);
        vein.renderOrder = 3;
        vein.castShadow = false;
        g.add(vein);
        function addSideVein(t0, tEnd, dir, radiusMul, useFine) {
          var sPts = [];
          var sideLift = veinSide * 0.092 * scale;
          for (var si = 0; si <= 10; si++) {
            var sp = si / 10;
            var st = t0 + sp * (tEnd - t0);
            var sCurl = Math.pow(st, 1.6) * 0.18 * scale;
            var widthFactor = 0.30 * (1 - Math.pow(st, 1.2));
            var sideX = dir * sp * widthFactor * scale;
            // gentle wobble for organic feel
            var wob = Math.sin(sp * 6 + (dir > 0 ? 1.7 : 0.4)) * 0.006 * scale;
            sPts.push(new THREE.Vector3(sideX + wob, st * L, sCurl + sideLift));
          }
          var sCurve = new THREE.CatmullRomCurve3(sPts);
          var sTube = new THREE.TubeGeometry(sCurve, 16, (radiusMul || 0.006) * scale, 5, false);
          var sideVein = new THREE.Mesh(sTube, useFine ? veinFineMat : veinMat);
          sideVein.renderOrder = 3;
          sideVein.castShadow = false;
          g.add(sideVein);
        }
        if (detailLevel >= 2) {
          addSideVein(0.16, 0.44, +1, 0.0078);
          addSideVein(0.16, 0.44, -1, 0.0078);
          addSideVein(0.38, 0.64, +1, 0.0066);
          addSideVein(0.38, 0.64, -1, 0.0066);
          addSideVein(0.58, 0.80, +1, 0.0056);
          addSideVein(0.58, 0.80, -1, 0.0056);
          // fine sub-veins between the major ones
          addSideVein(0.26, 0.40, +1, 0.0035, true);
          addSideVein(0.26, 0.40, -1, 0.0035, true);
          addSideVein(0.48, 0.62, +1, 0.0030, true);
          addSideVein(0.48, 0.62, -1, 0.0030, true);
        }
      }
      // Tiny dewdrops near the base of the leaf for a fresh look
      if (withDew) {
        var dews = [
          { x: 0.06, y: 0.22, r: 0.022 },
          { x: -0.10, y: 0.34, r: 0.018 },
          { x: 0.14, y: 0.48, r: 0.014 }
        ];
        for (var di = 0; di < dews.length; di++) {
          var d = dews[di];
          var dCurlZ = Math.pow(d.y, 1.6) * 0.18 * scale + 0.062 * scale;
          var dew = new THREE.Mesh(
            new THREE.SphereGeometry(d.r * scale, 14, 10),
            dewMat
          );
          dew.position.set(d.x * scale, d.y * L, dCurlZ);
          dew.scale.set(1, 0.85, 0.7);
          dew.castShadow = true;
          g.add(dew);
        }
      }
      g.rotation.order = 'YXZ';
      g.rotation.y = yawY;
      g.rotation.x = tiltX;
      return g;
    }

    var centerStem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.35, 12), stemMat);
    centerStem.position.y = 0.17; centerStem.castShadow = true;
    plant.add(centerStem);


    // Each leaf uses a different shape variant + tiny hue/lightness tint for organic variety
    plant.add(makeLeaf(leafMat, -0.10, Math.PI, 1.15, 1.40, 2, true, 0, { h: -0.005, l: 1.04, s: 1.05 }));
    plant.add(makeLeaf(leafLightMat, Math.PI * 0.28, Math.PI * 0.50, 1.00, 1.10, 2, true, 1, { h: 0.012, l: 1.00, s: 0.95 }));
    plant.add(makeLeaf(leafMat, Math.PI * 0.28, -Math.PI * 0.50, 1.00, 1.10, 2, false, 2, { h: -0.008, l: 0.95, s: 1.0 }));
    plant.add(makeLeaf(leafDarkMat, Math.PI * 0.40, Math.PI * 0.25, 0.95, 1.00, 2, false, 1, { h: 0.005, l: 1.0, s: 1.05 }));
    plant.add(makeLeaf(leafDarkMat, Math.PI * 0.40, -Math.PI * 0.25, 0.95, 1.00, 2, false, 2, { h: -0.012, l: 0.92, s: 1.0 }));
    plant.add(makeLeaf(leafMat, Math.PI * 0.45, 0, 0.90, 0.95, 1, false, 0, { h: 0.008, l: 1.02, s: 0.95 }));

    // Mid-layer filler leaves for fuller foliage (placed between the main ones)
    var fillers = [
      { mat: leafMat, tilt: Math.PI * 0.34, yaw: Math.PI * 0.78, sc: 0.78, ls: 0.95, gi: 1, t: { h: 0.006, l: 0.98, s: 1.05 } },
      { mat: leafMat, tilt: Math.PI * 0.34, yaw: -Math.PI * 0.78, sc: 0.80, ls: 0.95, gi: 0, t: { h: -0.010, l: 1.02, s: 0.95 } },
      { mat: leafLightMat, tilt: Math.PI * 0.22, yaw: Math.PI * 0.95, sc: 0.72, ls: 1.00, gi: 2, t: { h: 0.014, l: 1.00, s: 1.00 } },
      { mat: leafLightMat, tilt: Math.PI * 0.22, yaw: -Math.PI * 0.95, sc: 0.74, ls: 1.00, gi: 1, t: { h: 0.004, l: 1.04, s: 0.95 } },
      { mat: leafDarkMat, tilt: Math.PI * 0.50, yaw: Math.PI * 0.62, sc: 0.62, ls: 0.85, gi: 2, t: { h: -0.014, l: 0.90, s: 1.05 } },
      { mat: leafDarkMat, tilt: Math.PI * 0.50, yaw: -Math.PI * 0.62, sc: 0.60, ls: 0.85, gi: 0, t: { h: 0.000, l: 0.92, s: 1.0 } },
      { mat: leafMat, tilt: Math.PI * 0.15, yaw: Math.PI * 1.20, sc: 0.66, ls: 1.05, gi: 1, t: { h: 0.010, l: 1.05, s: 0.95 } },
      { mat: leafMat, tilt: Math.PI * 0.15, yaw: -Math.PI * 1.20, sc: 0.64, ls: 1.05, gi: 2, t: { h: -0.006, l: 1.00, s: 1.05 } }
    ];
    for (var fIdx = 0; fIdx < fillers.length; fIdx++) {
      var fl = fillers[fIdx];
      plant.add(makeLeaf(fl.mat, fl.tilt, fl.yaw, fl.sc, fl.ls, 1, false, fl.gi, fl.t));
    }

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
      hero_h1_a: "Your garden, always in control,", hero_h1_b: "from the palm of your hand.",
      hero_lead: "Monitor soil conditions, control watering from anywhere, and water only when your plants really need it, all from one app.",
      cta_get: "Get started", cta_how: "See how it works",
      tok_moist: "Ambient humidity", tok_flow: "Soil moisture", tok_temp: "Soil temp",
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
      f6_t: "Great for crops", f6_d: "Tuned for vegetable patches, fruit trees, and edible gardens, not just ornamentals.",
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
      help_eyebrow: "Help center", help_title: "What do you need help with?", help_lead: "Find guidance for the AquaSave app experience: dashboard, device setup flow, thresholds, weather advice, schedules, manual watering and history.",
      help_h1_t: "Plans & access", help_h1_d: "What is available now and what will be enabled as connected services grow.",
      help_h2_t: "Account access", help_h2_d: "Sign in, register, language, theme and profile screens.",
      help_h3_t: "Smart irrigation", help_h3_d: "Local thresholds, schedules, rain pause rules and manual watering controls.",
      help_h4_t: "Devices", help_h4_d: "Guided ESP32 setup flow, garden details, locations and device status.",
      help_h5_t: "Dashboard & analytics", help_h5_d: "Humidity, weather, pump tank, weekly trend and on-time watering metrics.",
      help_h6_t: "Technical support", help_h6_d: "Offline states, Wi-Fi setup screens and connection guidance.",
      help_h7_t: "Contact", help_h7_d: "Talk to our team when you need a hand.",
      help_h8_t: "Using the app", help_h8_d: "Tour the dashboard, device records, settings, history and analysis views.",
      faq_eyebrow: "FAQ", faq_title: "Frequently asked questions.", faq_lead: "Browse by category or filter the list to find what you need faster.",
      faq_all: "All", faq_billing: "Access", faq_account: "Account", faq_irrigation: "Smart irrigation", faq_devices: "Devices", faq_plans: "Dashboard", faq_support: "Technical support", faq_contact: "Contact",
      faq_q1: "How do I start using the app?",
      faq_a1: "Open the deployed AquaSave app, register or sign in, and use the Devices section to create your first garden record. The current release focuses on the frontend experience while backend and hardware integration are connected.",
      faq_q2: "Can I change language or theme?",
      faq_a2: "Yes. The app includes Spanish and English UI copy, plus light and dark theme support so the dashboard stays readable in both modes.",
      faq_q3: "What account features are available now?",
      faq_a3: "You can use the login and registration screens, view the profile area, and test password-form feedback. Email recovery and Google sign-in are planned for later backend integration.",
      faq_q4: "How does AquaSave decide when to recommend watering?",
      faq_a4: "The frontend combines configured moisture limits, hot and cold temperature thresholds, rain probability and current garden humidity to show clear watering advice.",
      faq_q5: "How do I add an ESP32 device?",
      faq_a5: "Go to Devices, choose Add device, and follow the guided flow: preparation, Wi-Fi details, simulated verification, garden data, plant type, thresholds, sensor check and summary.",
      faq_q6: "What garden information can I save?",
      faq_a6: "Each device record can include a name, location, plant count, plant type, optional description, humidity thresholds and bilingual location display.",
      faq_q7: "What can I see in the dashboard?",
      faq_a7: "The dashboard shows the active garden, connection badge, humidity, temperature, weather card, rain probability and quick watering controls in one place.",
      faq_q8: "What should I do if a device appears offline?",
      faq_a8: "Check the device status badge and Wi-Fi setup details in the app. Real diagnostics and ESP32 communication will be completed with the backend and firmware integration.",
      faq_q9: "How can I contact the AquaSave team?",
      faq_a9: "Use the contact form on the main site and tell us what you need. We'll route your message to the right person and get back to you.",
      still_t: "Still need help?", still_p: "Couldn't find what you were looking for? Contact us and we'll help you.", still_btn: "Contact us",
      contact_eyebrow: "Contact", contact_title: "Let's build smarter irrigation together.",
      contact_lead: "Have a question, a suggestion, or want to know more about AquaSave? Send us a message, we read every one.",
      form_name: "Name", form_email: "Email", form_subject: "Subject", form_subject_ph: "How can we help?",
      form_msg: "Message", form_msg_ph: "Tell us a bit about your garden or your question…", form_send: "Send message",
      form_thx_t: "Thanks for reaching out!", form_thx_p: "We'll get back to you within a couple of business days.",
      cta_h1: "Start watering smarter,", cta_h2: "your plants will thank you.",
      cta_lead: "Set up the smart device, open the app, and let your garden tell you what it needs.",
      cta_get_final: "Get started with AquaSave",
      foot_slogan: "Efficient irrigation for responsible water use.", foot_by: "A product by",
      foot_explore: "Explore", foot_help: "Help", foot_legal: "Legal",
      foot_help_center: "Help Center", foot_faq: "FAQ", foot_contact_us: "Contact",
      foot_terms: "Terms & Conditions", foot_privacy: "Privacy Policy", foot_cookies: "Cookies", foot_legal_index: "Legal overview",
      foot_copy: "© 2026 EcoDrop · AquaSave · All rights reserved.",
      contact_email_t: "Email us", contact_email_v: "hello@ecodrop.io",
      contact_hours_t: "Reply window", contact_hours_v: "Within 1–2 business days",
      contact_team_t: "Made by EcoDrop", contact_team_v: "A small team that cares about every drop.",
      form_eyebrow: "Send a message", form_pill: "Reply within 1–2 business days",
      contact_perk1: "No bots, a human reads each message",
      contact_perk2: "Replies inside 1–2 business days",
      contact_perk3: "Your info stays with our small team",
      form_privacy_note: "By sending, you accept our privacy policy.",
      cta_or: "or download the app",
      store_apple_top: "Download on the", store_google_top: "Get it on",
      help_search_ph: "Search topics, errors, how-to...",
      help_popular: "Popular:", help_pop1: "watering rules", help_pop2: "ESP32 setup", help_pop3: "manual history",
      help_cat_eyebrow: "Browse by category", help_cat_title: "Find the right answers, fast.",
      help_open: "Open topic",
      help_strip1_t: "Read the FAQ", help_strip1_p: "Quick answers to the most common questions, organized by category.", help_strip1_l: "Open FAQ",
      help_strip2_t: "Open the deployed app", help_strip2_p: "Try the current AquaSave frontend and explore the dashboard, devices, settings and history flows.", help_strip2_l: "Open app",
      faq_search_ph: "Search a question...",
      faq_q10: "Are paid plans active right now?", faq_a10: "Not yet. Plan and access copy is informational in this frontend release; billing, subscriptions and account-level limits will be enabled in a later service integration.",
      faq_q11: "Can I manage more than one garden?", faq_a11: "Yes. The interface lets you create, edit and review multiple garden/device records so each growing area can have its own context.",
      faq_q12: "Can I update device details later?", faq_a12: "Yes. You can edit the garden name, location, plant count and related setup details from the device dialogs.",
      faq_q13: "Can I water manually?", faq_a13: "The dashboard includes a start/stop watering control with a visual active state and timer. In this release it previews the control flow; physical watering depends on the future ESP32 integration.",
      faq_q14: "How do I review irrigation activity?", faq_a14: "Use History to see watering records with date, garden, type, duration, liters and moisture before/after. You can also log manual watering entries in memory.",
      faq_q15: "Does the setup connect to real hardware already?", faq_a15: "The current app includes the frontend setup and verification screens. Real ESP32 pairing, sensor sync and firmware actions are planned for the hardware/backend stage.",
      faq_q16: "What analytics are available?", faq_a16: "The Analysis screen presents pump tank level in liters and percentage, weekly moisture trend, on-time watering indicators and data-availability messages.",
      faq_q17: "Is my data stored remotely now?", faq_a17: "In this frontend release, most app data is represented locally or through mock/state flows. Remote persistence and production security controls will come with backend integration.",
      faq_empty: "No questions match your search. Try different keywords or contact us.",
      legal_eyebrow: "Legal", legal_title: "Transparent terms for responsible use.",
      legal_lead: "Simple terms for using AquaSave, understanding what information we ask for, and knowing what to expect as the app and device experience grows.",
      legal_updated: "Last updated 13 May 2026", legal_reading: "Around 10 min read",
      legal_index: "On this page",
      legal_help_t: "Need a hand?", legal_help_p: "If anything here is unclear, our team is happy to walk you through it in plain words.",
      legal_help_btn: "Contact us",
      legal_s1_t: "Overview",
      legal_s1_p1: "This page explains the main rules for the AquaSave website, the app you can try today, and the device features that will be added over time. Some screens are still previews, so we explain that clearly here.",
      legal_s1_p2: "By using AquaSave you accept the terms below. If you do not agree with any part of them, please stop using the service. These terms apply when you visit the website, try the app, save garden information, review watering guidance, or use device features in the future.",
      legal_s1_c1_t: "Plain language first", legal_s1_c1_p: "We write for humans. Legalese only when it is strictly required.",
      legal_s1_c2_t: "Yours to keep", legal_s1_c2_p: "You can request a copy of these terms at any time through the contact form.",
      legal_s1_c3_t: "Updated when needed", legal_s1_c3_p: "We notify users of significant changes through the website, app, or email when those channels are available.",
      legal_s2_t: "Terms & Conditions",
      legal_s2_p1: "These terms govern your relationship with EcoDrop, the company that builds and operates AquaSave. They explain how AquaSave may be used, what is available today, and what responsibilities apply as more app and device features become available.",
      legal_s2_h1: "Eligibility",
      legal_s2_p2: "You must be old enough under your local law to create an account. If you use AquaSave on behalf of a household or organization, you confirm you are allowed to accept these terms for them.",
      legal_s2_h2: "Account responsibility",
      legal_s2_p3: "You are responsible for keeping your credentials safe and for any activity that happens through your account. Tell us as soon as possible if you suspect unauthorized access. We may suspend sessions if we detect unusual behavior.",
      legal_s2_h3: "Service availability",
      legal_s2_p4: "AquaSave is offered with care, but the product is still growing. Some app screens may show planned flows before they control a real device. Use recommendations as guidance and always check your plants when the situation matters.",
      legal_s2_h4: "Plans & access",
      legal_s2_p5: "If paid plans are enabled later, charges will follow the cycle you select. Until then, plan and access information in the app should be treated as informational.",
      legal_s3_t: "Acceptable use",
      legal_s3_p1: "AquaSave is built to support irrigation decisions for domestic gardens, urban horticulture and small growing areas. We ask that you use it responsibly and avoid behaviors that put other people, the service, devices, or shared infrastructure at risk.",
      legal_s3_l1: "Do not try to interrupt the service, copy protected parts of the product, or access accounts that are not yours.",
      legal_s3_l2: "Do not use AquaSave to control watering systems you are not allowed to operate.",
      legal_s3_l3: "Do not upload content that is unlawful, harassing, or that infringes someone else's rights.",
      legal_s3_l4: "Do not use AquaSave to circumvent local water-use restrictions or regulations.",
      legal_s3_p2: "If we believe your usage breaks these rules, we may pause access temporarily while we look into it. We will reach out so you can clarify and recover access whenever possible.",
      legal_s4_t: "Privacy Policy",
      legal_s4_p1: "Our privacy approach is simple: collect the minimum required to run the service, keep it safe, and never sell it. This section describes the data we handle and why.",
      legal_s4_h1: "What we collect",
      legal_s4_l1: "<strong>Account information</strong>: your username, email when you provide it, language, theme and profile settings.",
      legal_s4_l2: "<strong>Garden information</strong>: garden names, locations, plant counts, plant types, descriptions, watering settings, schedules and device status shown in the app.",
      legal_s4_l3: "<strong>Watering information</strong>: moisture, temperature, weather context, pump level, watering events and manual history entries when you enter them or when a connected device sends them.",
      legal_s4_l4: "<strong>Support data</strong>: messages and attachments you send through the contact form.",
      legal_s4_l5: "<strong>Basic usage data</strong>: browser type, device type and error information used to keep the service stable.",
      legal_s4_h2: "Why we use it",
      legal_s4_p2: "We use this information to show your dashboard, help you configure your garden, suggest watering actions, provide support and improve AquaSave. We do not use garden or watering information to create advertising profiles.",
      legal_s4_h3: "How long we keep it",
      legal_s4_p3: "In this early app version, some information may stay on your device or be used only for testing the experience. When online storage is enabled, we will keep account and garden information only for as long as needed to provide the service and meet legal duties.",
      legal_s5_t: "Your data & rights",
      legal_s5_p1: "Depending on where you live, you may have the right to access, correct, export, or delete your personal data. AquaSave honors these rights regardless of jurisdiction; we believe they are simply good practice.",
      legal_s5_l1: "<strong>Access &amp; export</strong>: download a copy of your data in a portable format from your account settings.",
      legal_s5_l2: "<strong>Correction</strong>: update incorrect details directly in the app or through the contact form.",
      legal_s5_l3: "<strong>Deletion</strong>: delete your account and the data associated with it, except where law requires us to keep records.",
      legal_s5_l4: "<strong>Limit use</strong>: ask us to stop or limit specific uses of your information.",
      legal_s5_l5: "<strong>Complaint</strong>: file a complaint with your local data protection authority if you think we are not handling things correctly.",
      legal_s6_t: "Cookies",
      legal_s6_p1: "AquaSave uses a minimal number of cookies and similar technologies. We try to keep this list as short as possible.",
      legal_s6_th1: "Type", legal_s6_th2: "Purpose", legal_s6_th3: "Duration",
      legal_s6_r1a: "Essential", legal_s6_r1b: "Keep you signed in and remember language preference.", legal_s6_r1c: "Session / 12 months",
      legal_s6_r2a: "Functional", legal_s6_r2b: "Remember UI choices like theme or dashboard layout.", legal_s6_r2c: "12 months",
      legal_s6_r3a: "Analytics (anonymous)", legal_s6_r3b: "Aggregate usage stats to improve the product. No personal profiling.", legal_s6_r3c: "24 months",
      legal_s6_p2: "You can clear cookies from your browser settings at any time. Disabling essential cookies may sign you out and reset preferences.",
      legal_s7_t: "Intellectual property",
      legal_s7_p1: "The AquaSave name, logo, app design, copy and illustrations belong to EcoDrop. You receive a personal, non-exclusive, non-transferable license to use the service for its intended purpose. You keep ownership of the information you add or generate, such as garden details and watering history.",
      legal_s7_p2: "If you publish screenshots or content from AquaSave, please credit EcoDrop and do not imply an endorsement that does not exist.",
      legal_s8_t: "Disclaimer",
      legal_s8_p1: "AquaSave helps you make irrigation decisions, but it cannot guarantee plant results. App previews, readings, weather forecasts and future device actions may be incomplete, delayed or wrong. Always check your garden when the condition of your plants is important.",
      legal_s8_p2: "We provide the service \"as is\" without warranties of fitness for any specific purpose, to the extent permitted by law.",
      legal_s9_t: "Limitation of liability",
      legal_s9_p1: "To the maximum extent allowed by law, EcoDrop is not liable for indirect or consequential damages, lost profits, lost crops, or loss of data resulting from the use or inability to use AquaSave. Where law requires a minimum protection (for example, in consumer relationships), nothing here limits the rights you legally have.",
      legal_s10_t: "Changes to these terms",
      legal_s10_p1: "We may update these terms from time to time. When changes are significant we notify users in advance via email or inside the app and update the \"Last updated\" date at the top of this page. Continuing to use AquaSave after a change means you accept the new version.",
      legal_s11_t: "Contact",
      legal_s11_p1: "For anything related to these terms, privacy, or your data rights, reach out to us from the contact form. A real human reads every message.",
      legal_s12_t: "Security & data protection",
      legal_s12_p1: "Keeping your information safe is important to us. As AquaSave grows, we will use reasonable safeguards to protect account, garden and device information.",
      legal_s12_l1: "<strong>Safe connections</strong>: information sent between the app and AquaSave services should travel through protected channels.",
      legal_s12_l2: "<strong>Protected storage</strong>: sensitive account and garden information will be protected when online storage is available.",
      legal_s12_l3: "<strong>Limited access</strong>: only people or systems that need the information to support AquaSave should access it.",
      legal_s12_l4: "<strong>Backups</strong>: online services will include recovery practices appropriate for the information stored.",
      legal_s12_l5: "<strong>Continuous improvement</strong>: we review security practices and welcome responsible reports of possible problems.",
      legal_s12_p2: "If you find what looks like a security issue, please reach out via the contact form so we can investigate and credit your finding when appropriate.",
      legal_s13_t: "Children's privacy",
      legal_s13_p1: "AquaSave is not designed for children. Accounts are intended for adults and adolescents at or above the digital-consent age that applies in their country (16 in many places, lower in some jurisdictions).",
      legal_s13_p2: "If we learn that a younger person has created an account without proper consent, we will close the account and delete the associated personal data. Parents or guardians who believe a child has provided personal information without authorization can reach us via the contact form to request deletion.",
      legal_s13_p3: "Of course, families regularly use AquaSave together, and that is encouraged. Children can watch the garden, learn about water care, and help schedule cycles, as long as they do so through an adult's account.",
      legal_s14_t: "Third-party services",
      legal_s14_p1: "To run AquaSave reliably we lean on a small set of trusted partners. These providers process specific pieces of data strictly to deliver their part of the service, under contracts that match the privacy commitments we make to you.",
      legal_s14_l1: "<strong>Website and app hosting</strong>: trusted providers help us keep the website and app available.",
      legal_s14_l2: "<strong>Account and messages</strong>: some providers may help with login, password recovery or service notices when those features are available.",
      legal_s14_l3: "<strong>Payments</strong>: if paid plans are introduced, payment providers will handle payment details securely.",
      legal_s14_l4: "<strong>Weather and location</strong>: weather and map providers help the app show local guidance.",
      legal_s14_l5: "<strong>Usage statistics</strong>: privacy-friendly tools may help us understand how the product is used in general, without personal profiling.",
      legal_s14_p2: "If information needs to be handled outside your region, we use appropriate safeguards so it stays protected.",
      legal_s15_t: "Beta &amp; experimental features",
      legal_s15_p1: "Some AquaSave features may appear as previews while the full app and device connection are being completed. These previews help us improve the experience before a broader release.",
      legal_s15_l1: "Preview features may show how a flow will work, change later, or be replaced as the product improves.",
      legal_s15_l2: "We may collect feedback or basic error information to understand whether the app is clear and reliable.",
      legal_s15_l3: "Preview features do not guarantee physical watering or online saving until those services are active.",
      legal_s15_p2: "Feedback is genuinely appreciated. If something feels off in a beta feature, tell us through the contact form so we can fix it before it ships to everyone.",
      legal_s16_t: "Plans, access & future billing",
      legal_s16_t_short: "Plans & access",
      legal_s16_p1: "Paid plans are not active in the current app release. This section explains what would happen if AquaSave introduces subscriptions later.",
      legal_s16_h1: "Current access",
      legal_s16_p2: "You can open the app to try the current experience. Any pricing or plan references are informational until payment features are available.",
      legal_s16_h2: "Future subscriptions",
      legal_s16_p3: "If subscriptions are introduced, renewal dates, access limits and cancellation options will be shown clearly before payment.",
      legal_s16_h3: "Refunds",
      legal_s16_p4: "Refund rules will be published before any paid plan is launched and will respect applicable consumer protection laws.",
      legal_s16_h4: "Failed payments",
      legal_s16_p5: "Failed-payment handling will only apply after payment services are enabled; users will receive clear notices before any access change.",
      legal_s17_t: "Communications & marketing",
      legal_s17_t_short: "Communications",
      legal_s17_p1: "We may send or display three kinds of messages as the service matures:",
      legal_s17_l1: "<strong>Service messages</strong>: important information about account access, device status, watering risks or security.",
      legal_s17_l2: "<strong>Product updates</strong>: occasional emails about new features and meaningful changes. Useful but optional, opt out with one click.",
      legal_s17_l3: "<strong>Newsletters &amp; tips</strong>: monthly content with seasonal tips for your garden and water-saving practices. Strictly opt-in.",
      legal_s17_p2: "We do not sell, rent, or trade your email or phone number, and we do not include third-party advertising in our communications.",
      legal_s18_t: "Governing law & disputes",
      legal_s18_t_short: "Governing law",
      legal_s18_p1: "These terms are governed by the laws of the country where EcoDrop is registered, without prejudice to mandatory consumer protections that apply where you live. Many of those local protections cannot be waived and will always take priority over anything written here.",
      legal_s18_p2: "If a disagreement arises, our preferred path is a friendly conversation through the contact form. Most things we have ever heard about have been resolved that way without escalation.",
      legal_s18_p3: "When that is not enough, you may pursue the matter through the competent courts of your place of residence (for consumers) or through alternative dispute resolution mechanisms recognized by the European Online Dispute Resolution platform when applicable."
    },
    es: {
      nav_benefits: "Beneficios", nav_how: "Cómo funciona", nav_features: "Funciones", nav_about: "Nosotros", nav_help: "Ayuda", nav_faq: "FAQ", nav_contact: "Contáctanos", nav_cta: "Empezar",
      hero_h1_a: "Tu huerto siempre bajo control,", hero_h1_b: "desde la palma de tu mano.",
      hero_lead: "Monitorea las condiciones del suelo, controla el riego desde donde estés y riega solo cuando tus plantas lo necesitan, todo desde una app.",
      cta_get: "Empezar", cta_how: "Ver cómo funciona",
      tok_moist: "Humedad de ambiente", tok_flow: "Humedad de suelo", tok_temp: "Temperatura",
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
      f6_t: "Ideal para cultivos", f6_d: "Pensado para huertos, frutales y plantas que dan frutos y vegetales, no solo ornamentales.",
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
      help_eyebrow: "Centro de ayuda", help_title: "¿Qué ayuda necesitas?", help_lead: "Encuentra ayuda para la experiencia actual de AquaSave: dashboard, flujo de dispositivos, umbrales, clima, horarios, riego manual e historial.",
      help_h1_t: "Planes y acceso", help_h1_d: "Qué está disponible ahora y qué se habilitará cuando crezcan los servicios conectados.",
      help_h2_t: "Acceso a la cuenta", help_h2_d: "Inicio de sesión, registro, idioma, tema y pantallas de perfil.",
      help_h3_t: "Riego inteligente", help_h3_d: "Umbrales locales, horarios, reglas de lluvia y controles de riego manual.",
      help_h4_t: "Dispositivos", help_h4_d: "Flujo guiado ESP32, datos del huerto, ubicaciones y estado del dispositivo.",
      help_h5_t: "Dashboard y análisis", help_h5_d: "Humedad, clima, depósito de bomba, tendencia semanal y métricas de riego a tiempo.",
      help_h6_t: "Soporte técnico", help_h6_d: "Estados sin conexión, pantallas Wi-Fi y guía de conexión.",
      help_h7_t: "Contacto", help_h7_d: "Habla con nuestro equipo cuando lo necesites.",
      help_h8_t: "Usar la app", help_h8_d: "Recorre dashboard, dispositivos, configuración, historial y análisis.",
      faq_eyebrow: "FAQ", faq_title: "Preguntas frecuentes.", faq_lead: "Explora por categoría o filtra la lista para encontrar lo que necesitas más rápido.",
      faq_all: "Todo", faq_billing: "Acceso", faq_account: "Cuenta", faq_irrigation: "Riego inteligente", faq_devices: "Dispositivos", faq_plans: "Dashboard", faq_support: "Soporte técnico", faq_contact: "Contacto",
      faq_q1: "¿Cómo empiezo a usar la app?",
      faq_a1: "Abre la app desplegada de AquaSave, regístrate o inicia sesión, y usa la sección Dispositivos para crear tu primer huerto. Esta versión se enfoca en la experiencia frontend mientras se conecta backend y hardware.",
      faq_q2: "¿Puedo cambiar idioma o tema?",
      faq_a2: "Sí. La app incluye textos en español e inglés, además de modo claro y oscuro para que el dashboard se mantenga legible.",
      faq_q3: "¿Qué funciones de cuenta están disponibles ahora?",
      faq_a3: "Puedes usar las pantallas de login y registro, revisar el área de perfil y probar el feedback del formulario de contraseña. La recuperación por correo y Google sign-in quedan para la integración backend.",
      faq_q4: "¿Cómo decide AquaSave cuándo recomendar riego?",
      faq_a4: "El frontend combina límites de humedad configurados, umbrales de calor y frío, probabilidad de lluvia y humedad actual del huerto para mostrar consejos claros de riego.",
      faq_q5: "¿Cómo agrego un dispositivo ESP32?",
      faq_a5: "Entra a Dispositivos, elige agregar dispositivo y sigue el flujo guiado: preparación, datos Wi-Fi, verificación simulada, datos del huerto, tipo de planta, umbrales, sensores y resumen.",
      faq_q6: "¿Qué información del huerto puedo guardar?",
      faq_a6: "Cada registro de dispositivo puede incluir nombre, ubicación, cantidad de plantas, tipo de planta, descripción opcional, umbrales de humedad y ubicación bilingüe.",
      faq_q7: "¿Qué puedo ver en el dashboard?",
      faq_a7: "El dashboard muestra el huerto activo, estado de conexión, humedad, temperatura, clima, probabilidad de lluvia y controles rápidos de riego en una sola vista.",
      faq_q8: "¿Qué hago si un dispositivo aparece sin conexión?",
      faq_a8: "Revisa el indicador de estado y los datos Wi-Fi en la app. Los diagnósticos reales y la comunicación con ESP32 se completarán con la integración backend y firmware.",
      faq_q9: "¿Cómo contacto al equipo de AquaSave?",
      faq_a9: "Usa el formulario de contacto del sitio principal y cuéntanos qué necesitas. Enviaremos tu mensaje a la persona correcta y te responderemos.",
      still_t: "¿Aún necesitas ayuda?", still_p: "¿No encontraste lo que buscabas? Contáctanos y te ayudaremos.", still_btn: "Contáctanos",
      contact_eyebrow: "Contacto", contact_title: "Construyamos un riego más inteligente juntos.",
      contact_lead: "¿Tienes una pregunta, sugerencia o quieres saber más sobre AquaSave? Envíanos un mensaje, leemos cada uno.",
      form_name: "Nombre", form_email: "Email", form_subject: "Asunto", form_subject_ph: "¿En qué te ayudamos?",
      form_msg: "Mensaje", form_msg_ph: "Cuéntanos un poco sobre tu huerto o tu pregunta…", form_send: "Enviar mensaje",
      form_thx_t: "¡Gracias por escribirnos!", form_thx_p: "Te responderemos en un par de días hábiles.",
      cta_h1: "Empieza a regar con cabeza,", cta_h2: "tus plantas te lo agradecerán.",
      cta_lead: "Instala el dispositivo, abre la app y deja que tu huerto te diga lo que necesita.",
      cta_get_final: "Empezar con AquaSave",
      foot_slogan: "Riego eficiente para un uso responsable del agua.", foot_by: "Un producto de",
      foot_explore: "Explorar", foot_help: "Ayuda", foot_legal: "Legal",
      foot_help_center: "Centro de ayuda", foot_faq: "FAQ", foot_contact_us: "Contacto",
      foot_terms: "Términos y condiciones", foot_privacy: "Política de privacidad", foot_cookies: "Cookies", foot_legal_index: "Resumen legal",
      foot_copy: "© 2026 EcoDrop · AquaSave · Todos los derechos reservados.",
      contact_email_t: "Escríbenos", contact_email_v: "hola@ecodrop.io",
      contact_hours_t: "Tiempo de respuesta", contact_hours_v: "1 a 2 días hábiles",
      contact_team_t: "Hecho por EcoDrop", contact_team_v: "Un equipo pequeño que cuida cada gota.",
      form_eyebrow: "Envía un mensaje", form_pill: "Respondemos en 1–2 días hábiles",
      contact_perk1: "Sin bots, una persona lee cada mensaje",
      contact_perk2: "Respondemos en 1–2 días hábiles",
      contact_perk3: "Tu información se queda con nuestro equipo",
      form_privacy_note: "Al enviar, aceptas nuestra política de privacidad.",
      cta_or: "o descarga la app",
      store_apple_top: "Disponible en", store_google_top: "Consíguelo en",
      help_search_ph: "Busca temas, errores, cómo hacer...",
      help_popular: "Populares:", help_pop1: "reglas de riego", help_pop2: "configurar ESP32", help_pop3: "historial manual",
      help_cat_eyebrow: "Explorar por categoría", help_cat_title: "Encuentra las respuestas correctas, rápido.",
      help_open: "Abrir tema",
      help_strip1_t: "Lee el FAQ", help_strip1_p: "Respuestas rápidas a las preguntas más comunes, organizadas por categoría.", help_strip1_l: "Abrir FAQ",
      help_strip2_t: "Abre la app desplegada", help_strip2_p: "Prueba el frontend actual de AquaSave y explora dashboard, dispositivos, configuración e historial.", help_strip2_l: "Abrir app",
      faq_search_ph: "Busca una pregunta...",
      faq_q10: "¿Los planes de pago ya están activos?", faq_a10: "Todavía no. La información de planes y acceso es referencial en esta versión frontend; la facturación, suscripciones y límites por cuenta se habilitarán en una integración posterior.",
      faq_q11: "¿Puedo gestionar más de un huerto?", faq_a11: "Sí. La interfaz permite crear, editar y revisar varios registros de huerto/dispositivo para que cada zona tenga su propio contexto.",
      faq_q12: "¿Puedo editar los datos del dispositivo después?", faq_a12: "Sí. Puedes editar nombre del huerto, ubicación, cantidad de plantas y otros datos de configuración desde los diálogos del dispositivo.",
      faq_q13: "¿Puedo regar manualmente?", faq_a13: "El dashboard incluye control para iniciar o detener riego con estado visual y temporizador. En esta versión sirve como vista previa del flujo; el riego físico depende de la futura integración ESP32.",
      faq_q14: "¿Cómo reviso la actividad de riego?", faq_a14: "Usa Historial para ver registros con fecha, huerto, tipo, duración, litros y humedad antes/después. También puedes registrar riegos manuales en memoria.",
      faq_q15: "¿La configuración ya conecta con hardware real?", faq_a15: "La app actual incluye pantallas frontend de configuración y verificación. La vinculación real con ESP32, sincronización de sensores y acciones de firmware se implementarán en la etapa de hardware/backend.",
      faq_q16: "¿Qué análisis están disponibles?", faq_a16: "La pantalla de Análisis muestra depósito de la bomba en litros y porcentaje, tendencia semanal de humedad, indicadores de riego a tiempo y mensajes cuando faltan datos.",
      faq_q17: "¿Mis datos ya se guardan remotamente?", faq_a17: "En esta versión frontend, la mayor parte de los datos se representa de forma local o mediante estados de prueba. La persistencia remota y controles de seguridad productivos llegarán con el backend.",
      faq_empty: "Ninguna pregunta coincide con tu búsqueda. Prueba otras palabras o contáctanos.",
      legal_eyebrow: "Legal", legal_title: "Condiciones transparentes para un uso responsable.",
      legal_lead: "Condiciones simples para usar AquaSave, entender qué información pedimos y saber qué esperar mientras la app y el dispositivo siguen evolucionando.",
      legal_updated: "Actualizado el 13 de mayo de 2026", legal_reading: "Lectura de unos 10 min",
      legal_index: "En esta página",
      legal_help_t: "¿Necesitas ayuda?", legal_help_p: "Si algo aquí no queda claro, nuestro equipo te lo explica con palabras sencillas.",
      legal_help_btn: "Contáctanos",
      legal_s1_t: "Resumen",
      legal_s1_p1: "Esta página explica las reglas principales para usar el sitio de AquaSave, la app que puedes probar hoy y las funciones del dispositivo que se agregarán con el tiempo. Algunas pantallas todavía son vistas previas, por eso lo aclaramos aquí.",
      legal_s1_p2: "Al usar AquaSave aceptas los términos siguientes. Si no estás de acuerdo con alguna parte, deja de usar el servicio. Estos términos aplican cuando visitas el sitio, pruebas la app, guardas información de tu huerto, revisas recomendaciones de riego o usas funciones del dispositivo en el futuro.",
      legal_s1_c1_t: "Lenguaje claro", legal_s1_c1_p: "Escribimos para personas. Solo usamos jerga legal cuando es estrictamente necesario.",
      legal_s1_c2_t: "Tuyo cuando lo quieras", legal_s1_c2_p: "Puedes solicitar una copia de estos términos en cualquier momento desde el formulario de contacto.",
      legal_s1_c3_t: "Actualizado cuando hace falta", legal_s1_c3_p: "Avisamos los cambios importantes desde el sitio, la app o por correo cuando esos canales estén disponibles.",
      legal_s2_t: "Términos y condiciones",
      legal_s2_p1: "Estos términos rigen tu relación con EcoDrop, la empresa que construye y opera AquaSave. Explican cómo se puede usar AquaSave, qué está disponible hoy y qué responsabilidades aplican conforme se agreguen más funciones de app y dispositivo.",
      legal_s2_h1: "Quién puede usarlo",
      legal_s2_p2: "Debes tener la edad permitida por la ley de tu país para crear una cuenta. Si usas AquaSave en nombre de un hogar u organización, confirmas que tienes autorización para aceptar estos términos por ellos.",
      legal_s2_h2: "Responsabilidad de la cuenta",
      legal_s2_p3: "Eres responsable de mantener tus credenciales a salvo y de toda la actividad que ocurra a través de tu cuenta. Avísanos cuanto antes si sospechas un acceso no autorizado. Podemos suspender sesiones si detectamos comportamientos inusuales.",
      legal_s2_h3: "Disponibilidad del servicio",
      legal_s2_p4: "AquaSave se ofrece con cuidado, pero el producto todavía está creciendo. Algunas pantallas pueden mostrar flujos planeados antes de controlar un dispositivo real. Usa las recomendaciones como guía y revisa siempre tus plantas cuando la situación lo requiera.",
      legal_s2_h4: "Planes y acceso",
      legal_s2_p5: "Si más adelante se habilitan planes pagados, los cobros seguirán el ciclo que elijas. Hasta entonces, la información de planes y acceso dentro de la app debe entenderse como referencial.",
      legal_s3_t: "Uso aceptable",
      legal_s3_p1: "AquaSave está pensado para apoyar decisiones de riego en huertos domésticos, horticultura urbana y pequeñas zonas de cultivo. Te pedimos que lo uses de forma responsable y evites comportamientos que pongan en riesgo a otras personas, al servicio, a dispositivos o a la infraestructura compartida.",
      legal_s3_l1: "No intentes interrumpir el servicio, copiar partes protegidas del producto ni acceder a cuentas que no son tuyas.",
      legal_s3_l2: "No uses AquaSave para controlar sistemas de riego sobre los que no tienes autorización.",
      legal_s3_l3: "No subas contenido ilegal, ofensivo o que infrinja derechos de terceros.",
      legal_s3_l4: "No uses AquaSave para saltarte restricciones o regulaciones locales sobre el uso del agua.",
      legal_s3_p2: "Si creemos que un uso rompe estas reglas podemos pausar el acceso temporalmente mientras lo revisamos. Te contactaremos para que puedas aclararlo y recuperar el acceso siempre que sea posible.",
      legal_s4_t: "Política de privacidad",
      legal_s4_p1: "Nuestro enfoque es simple: recolectar el mínimo necesario para operar el servicio, mantenerlo seguro y nunca venderlo. Esta sección describe los datos que manejamos y por qué.",
      legal_s4_h1: "Qué recopilamos",
      legal_s4_l1: "<strong>Información de cuenta</strong>: usuario, correo cuando lo proporciones, idioma, tema visual y configuración de perfil.",
      legal_s4_l2: "<strong>Información del huerto</strong>: nombres de huerto, ubicaciones, cantidad de plantas, tipos de planta, descripciones, configuración de riego, horarios y estado del dispositivo mostrado en la app.",
      legal_s4_l3: "<strong>Información de riego</strong>: humedad, temperatura, clima, nivel del depósito, eventos de riego e historial manual cuando los ingreses o cuando un dispositivo conectado los envíe.",
      legal_s4_l4: "<strong>Datos de soporte</strong>: mensajes y adjuntos que envías por el formulario de contacto.",
      legal_s4_l5: "<strong>Datos básicos de uso</strong>: tipo de navegador, tipo de dispositivo e información de errores usada para mantener estable el servicio.",
      legal_s4_h2: "Para qué los usamos",
      legal_s4_p2: "Usamos esta información para mostrar tu panel, ayudarte a configurar tu huerto, sugerir acciones de riego, dar soporte y mejorar AquaSave. No usamos información de huertos o riego para crear perfiles publicitarios.",
      legal_s4_h3: "Cuánto tiempo los guardamos",
      legal_s4_p3: "En esta versión inicial de la app, parte de la información puede quedarse en tu dispositivo o usarse solo para probar la experiencia. Cuando el guardado en línea esté disponible, conservaremos la información de cuenta y huerto solo el tiempo necesario para prestar el servicio y cumplir obligaciones legales.",
      legal_s5_t: "Tus datos y derechos",
      legal_s5_p1: "Según donde vivas, podrías tener derecho a acceder, corregir, exportar o eliminar tus datos personales. AquaSave respeta estos derechos sin importar la jurisdicción; los consideramos buenas prácticas básicas.",
      legal_s5_l1: "<strong>Acceso y exportación</strong>: descarga una copia de tus datos en un formato portable desde la configuración.",
      legal_s5_l2: "<strong>Corrección</strong>: actualiza información incorrecta directamente en la app o por el formulario.",
      legal_s5_l3: "<strong>Eliminación</strong>: elimina tu cuenta y los datos asociados, salvo cuando la ley exija conservarlos.",
      legal_s5_l4: "<strong>Limitar uso</strong>: pídenos detener o limitar usos específicos de tu información.",
      legal_s5_l5: "<strong>Reclamación</strong>: puedes presentar una queja ante tu autoridad local de protección de datos si crees que algo no se está manejando bien.",
      legal_s6_t: "Cookies",
      legal_s6_p1: "AquaSave usa una cantidad mínima de cookies y tecnologías similares. Procuramos que la lista sea lo más corta posible.",
      legal_s6_th1: "Tipo", legal_s6_th2: "Propósito", legal_s6_th3: "Duración",
      legal_s6_r1a: "Esenciales", legal_s6_r1b: "Te mantienen iniciado y recuerdan tu idioma.", legal_s6_r1c: "Sesión / 12 meses",
      legal_s6_r2a: "Funcionales", legal_s6_r2b: "Recuerdan elecciones de UI como tema o disposición del dashboard.", legal_s6_r2c: "12 meses",
      legal_s6_r3a: "Analíticas (anónimas)", legal_s6_r3b: "Estadísticas agregadas para mejorar el producto. Sin perfilado personal.", legal_s6_r3c: "24 meses",
      legal_s6_p2: "Puedes borrar las cookies desde tu navegador cuando quieras. Desactivar las esenciales puede cerrar tu sesión y reiniciar preferencias.",
      legal_s7_t: "Propiedad intelectual",
      legal_s7_p1: "El nombre AquaSave, el logo, el diseño de la app, los textos e ilustraciones pertenecen a EcoDrop. Recibes una licencia personal, no exclusiva e intransferible para usar el servicio según su propósito previsto. Tú conservas la propiedad de la información que agregues o generes, como datos de huerto e historial de riego.",
      legal_s7_p2: "Si publicas capturas o contenido de AquaSave, te pedimos acreditar a EcoDrop y no insinuar respaldos que no existen.",
      legal_s8_t: "Aviso",
      legal_s8_p1: "AquaSave te ayuda a tomar decisiones de riego, pero no puede garantizar resultados en tus plantas. Las vistas de la app, lecturas, pronósticos y futuras acciones del dispositivo pueden estar incompletas, demorarse o equivocarse. Revisa siempre tu huerto cuando el estado de tus plantas sea importante.",
      legal_s8_p2: "Ofrecemos el servicio \"tal como está\", sin garantías de adecuación a un fin específico, hasta donde lo permita la ley.",
      legal_s9_t: "Limitación de responsabilidad",
      legal_s9_p1: "Hasta donde la ley lo permita, EcoDrop no se hace responsable de daños indirectos o consecuentes, lucro cesante, pérdida de cosechas o pérdida de datos derivados del uso o la imposibilidad de uso de AquaSave. Cuando la ley exija una protección mínima (por ejemplo, en relaciones con consumidores), nada de aquí limita los derechos que legalmente tienes.",
      legal_s10_t: "Cambios en estos términos",
      legal_s10_p1: "Podemos actualizar estos términos cada cierto tiempo. Cuando los cambios sean significativos avisamos con antelación por correo o dentro de la app y actualizamos la fecha de la parte superior. Seguir usando AquaSave después de un cambio significa que aceptas la nueva versión.",
      legal_s11_t: "Contacto",
      legal_s11_p1: "Para cualquier asunto sobre estos términos, privacidad o tus derechos sobre tus datos, escríbenos desde el formulario de contacto. Una persona real lee cada mensaje.",
      legal_s12_t: "Seguridad y protección de datos",
      legal_s12_p1: "Mantener tu información segura es importante para nosotros. Conforme AquaSave crezca, usaremos medidas razonables para proteger la información de cuenta, huerto y dispositivo.",
      legal_s12_l1: "<strong>Conexiones seguras</strong>: la información enviada entre la app y AquaSave deberá viajar por canales protegidos.",
      legal_s12_l2: "<strong>Almacenamiento protegido</strong>: la información sensible de cuenta y huerto se protegerá cuando el guardado en línea esté disponible.",
      legal_s12_l3: "<strong>Acceso limitado</strong>: solo personas o sistemas que necesiten la información para dar soporte a AquaSave deberían acceder a ella.",
      legal_s12_l4: "<strong>Copias de respaldo</strong>: los servicios en línea incluirán prácticas de recuperación adecuadas para la información guardada.",
      legal_s12_l5: "<strong>Mejora continua</strong>: revisamos nuestras prácticas de seguridad y recibimos reportes responsables de posibles problemas.",
      legal_s12_p2: "Si encuentras algo que parezca un problema de seguridad, escríbenos por el formulario de contacto para poder investigarlo y darte el crédito que corresponda.",
      legal_s13_t: "Privacidad de menores",
      legal_s13_p1: "AquaSave no está diseñado para niños. Las cuentas son para adultos y adolescentes que cumplan la edad mínima de consentimiento digital en su país (16 en muchos lugares, menor en algunas jurisdicciones).",
      legal_s13_p2: "Si descubrimos que un menor ha creado una cuenta sin el consentimiento adecuado, cerraremos la cuenta y eliminaremos los datos personales asociados. Padres o tutores que crean que un niño ha compartido información sin autorización pueden escribirnos por el formulario para pedir su eliminación.",
      legal_s13_p3: "Por supuesto, las familias usan AquaSave juntas a menudo y eso nos encanta. Los niños pueden mirar el huerto, aprender sobre cuidado del agua y ayudar a programar ciclos, siempre que lo hagan a través de la cuenta de un adulto.",
      legal_s14_t: "Servicios de terceros",
      legal_s14_p1: "Para que AquaSave funcione bien nos apoyamos en un pequeño grupo de socios de confianza. Estos proveedores procesan datos específicos solo para entregar su parte del servicio, bajo contratos que respetan los compromisos de privacidad que te hacemos.",
      legal_s14_l1: "<strong>Alojamiento del sitio y la app</strong>: proveedores confiables nos ayudan a mantener disponible el sitio y la app.",
      legal_s14_l2: "<strong>Cuenta y mensajes</strong>: algunos proveedores podrán ayudar con inicio de sesión, recuperación de contraseña o avisos del servicio cuando esas funciones estén disponibles.",
      legal_s14_l3: "<strong>Pagos</strong>: si se introducen planes pagados, proveedores de pago manejarán los datos de forma segura.",
      legal_s14_l4: "<strong>Clima y ubicación</strong>: proveedores de clima y mapas ayudan a mostrar recomendaciones locales.",
      legal_s14_l5: "<strong>Estadísticas de uso</strong>: herramientas respetuosas con la privacidad pueden ayudarnos a entender el uso general del producto, sin perfiles personales.",
      legal_s14_p2: "Si la información necesita tratarse fuera de tu región, usamos medidas adecuadas para que siga protegida.",
      legal_s15_t: "Funciones beta y experimentales",
      legal_s15_p1: "Algunas funciones de AquaSave pueden aparecer como vistas previas mientras se completa la app y la conexión con el dispositivo. Estas vistas nos ayudan a mejorar la experiencia antes de un lanzamiento más amplio.",
      legal_s15_l1: "Las vistas previas pueden mostrar cómo funcionará un flujo, cambiar después o ser reemplazadas conforme mejore el producto.",
      legal_s15_l2: "Podemos recopilar feedback o información básica de errores para entender si la app es clara y confiable.",
      legal_s15_l3: "Las vistas previas no garantizan riego físico ni guardado en línea hasta que esos servicios estén activos.",
      legal_s15_p2: "Tu feedback nos importa. Si algo se siente raro en una función beta, cuéntanoslo por el formulario para poder arreglarlo antes de que llegue a todos.",
      legal_s16_t: "Planes, acceso y facturación futura",
      legal_s16_t_short: "Planes y acceso",
      legal_s16_p1: "Los planes pagados no están activos en la versión actual de la app. Esta sección explica qué pasaría si AquaSave introduce suscripciones más adelante.",
      legal_s16_h1: "Acceso actual",
      legal_s16_p2: "Puedes abrir la app para probar la experiencia actual. Cualquier referencia a precios o planes es informativa hasta que las funciones de pago estén disponibles.",
      legal_s16_h2: "Suscripciones futuras",
      legal_s16_p3: "Si se introducen suscripciones, las fechas de renovación, límites de acceso y opciones de cancelación se mostrarán con claridad antes del pago.",
      legal_s16_h3: "Reembolsos",
      legal_s16_p4: "Las reglas de reembolso se publicarán antes de lanzar cualquier plan pagado y respetarán las normas de protección al consumidor aplicables.",
      legal_s16_h4: "Pagos fallidos",
      legal_s16_p5: "La gestión de pagos fallidos solo aplicará después de habilitar servicios de pago; los usuarios recibirán avisos claros antes de cualquier cambio de acceso.",
      legal_s17_t: "Comunicaciones y marketing",
      legal_s17_t_short: "Comunicaciones",
      legal_s17_p1: "Podremos enviar o mostrar tres tipos de mensajes conforme el servicio madure:",
      legal_s17_l1: "<strong>Mensajes de servicio</strong>: información importante sobre acceso a cuenta, estado del dispositivo, riesgos de riego o seguridad.",
      legal_s17_l2: "<strong>Actualizaciones de producto</strong>: correos ocasionales sobre nuevas funciones y cambios relevantes. Útiles pero opcionales, te das de baja con un clic.",
      legal_s17_l3: "<strong>Newsletter y consejos</strong>: contenido mensual con consejos de temporada para tu jardín y prácticas de ahorro de agua. Estrictamente opt-in.",
      legal_s17_p2: "No vendemos, alquilamos ni intercambiamos tu correo o teléfono, y no incluimos publicidad de terceros en nuestras comunicaciones.",
      legal_s18_t: "Ley aplicable y disputas",
      legal_s18_t_short: "Ley aplicable",
      legal_s18_p1: "Estos términos se rigen por las leyes del país donde EcoDrop está registrada, sin perjuicio de las protecciones obligatorias para consumidores que apliquen donde vives. Muchas de esas protecciones locales no pueden renunciarse y siempre prevalecen sobre lo escrito aquí.",
      legal_s18_p2: "Si surge un desacuerdo, nuestra ruta preferida es una conversación amistosa a través del formulario de contacto. La gran mayoría de las cosas que hemos visto se resolvieron así sin escalada.",
      legal_s18_p3: "Cuando eso no basta, puedes acudir a los tribunales competentes de tu lugar de residencia (como consumidor) o a mecanismos alternativos de resolución reconocidos por la plataforma europea de Resolución de Disputas en Línea cuando aplique."
    }
  };

  const LANG_STORAGE_KEY = 'aquasave:language';
  const getStoredLang = () => {
    try {
      const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
      return dict[stored] ? stored : 'en';
    } catch (error) {
      return 'en';
    }
  };

  const setLang = (lang, options = {}) => {
    const nextLang = dict[lang] ? lang : 'en';
    const shouldPersist = options.persist !== false;
    if (shouldPersist) {
      try {
        window.localStorage.setItem(LANG_STORAGE_KEY, nextLang);
      } catch (error) {
        // Language switching still works even when storage is unavailable.
      }
    }
    document.documentElement.lang = nextLang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[nextLang] && dict[nextLang][key] != null) {
        const val = dict[nextLang][key];
        if (typeof val === 'string' && val.indexOf('<') !== -1) el.innerHTML = val;
        else el.textContent = val;
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[nextLang] && dict[nextLang][key]) el.placeholder = dict[nextLang][key];
    });
    document.querySelectorAll('.lang').forEach(langWrap => {
      langWrap.classList.toggle('is-es', nextLang === 'es');
    });
    document.querySelectorAll('.lang button').forEach(b => {
      b.classList.toggle('is-active', b.dataset.lang === nextLang);
    });
    // soft fade
    document.querySelectorAll('.lang-fade').forEach(el => {
      el.classList.add('flick');
      setTimeout(() => el.classList.remove('flick'), 200);
    });
  };
  document.querySelectorAll('.lang button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
  setLang(getStoredLang(), { persist: false });

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

  const navEl = document.querySelector('nav.top');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    document.querySelectorAll('.data-token').forEach((c, i) => {
      c.style.translate = `0 ${Math.sin(y / 150 + i) * 4}px`;
    });
    if (navEl) navEl.classList.toggle('is-scrolled', y > 8);
  }, { passive: true });

  // Hamburger menu toggle (uses body.menu-open so the panel/backdrop escape any
  // ancestor backdrop-filter/transform that traps position:fixed)
  const navToggleBtn = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileBackdrop = document.getElementById('mobileBackdrop');
  const mobileMenuClose = document.getElementById('mobileMenuClose');
  if (navToggleBtn && mobileMenu) {
    const closeMenu = () => {
      document.body.classList.remove('menu-open');
      navToggleBtn.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      if (mobileBackdrop) mobileBackdrop.setAttribute('aria-hidden', 'true');
    };
    navToggleBtn.addEventListener('click', () => {
      const open = !document.body.classList.contains('menu-open');
      document.body.classList.toggle('menu-open', open);
      navToggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (mobileBackdrop) mobileBackdrop.setAttribute('aria-hidden', open ? 'false' : 'true');
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', closeMenu);
    });
    if (mobileMenuClose) mobileMenuClose.addEventListener('click', closeMenu);
    if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMenu);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
    const mq = window.matchMedia('(min-width: 1001px)');
    mq.addEventListener('change', (e) => { if (e.matches) closeMenu(); });
  }

  // Tone down decorative animations on small screens for perf and visual calm
  const isSmallScreen = window.matchMedia('(max-width: 760px)').matches;
  const reduceAnim = isSmallScreen || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const eco = document.getElementById('ecoAnim');
  if (eco) {
    const sizes = ['', 's', 't'];
    const ecoCount = reduceAnim ? 6 : 14;
    for (let i = 0; i < ecoCount; i++) {
      const l = document.createElement('span');
      l.className = 'a-leaf ' + sizes[i % 3];
      l.style.setProperty('--y0', (15 + Math.random() * 70) + '%');
      l.style.setProperty('--op', (0.35 + Math.random() * 0.35).toFixed(2));
      l.style.animationDuration = (7.5 + Math.random() * 5.5) + 's';
      l.style.animationDelay = (Math.random() * -12) + 's';
      eco.appendChild(l);
    }
    const cornerLeavesAll = [
      ['t', -30, -14, -4, 0.62, 8.5, -1.4],
      ['', -8, -6, 10, 0.55, 9.2, -3.1],
      ['s', 18, 4, -12, 0.46, 8.8, -2.2],
      ['t', -18, 22, 18, 0.58, 10.1, -4.5],
      ['', 8, 34, -8, 0.5, 9.6, -1.8],
      ['s', 34, 18, 14, 0.44, 8.9, -3.7],
      ['', 20, 58, -18, 0.52, 10.4, -5.2],
      ['s', -2, 72, 8, 0.42, 9.1, -2.9]
    ];
    const cornerLeaves = reduceAnim ? cornerLeavesAll.slice(0, 4) : cornerLeavesAll;
    cornerLeaves.forEach(([size, x, y, y0, op, duration, delay]) => {
      const l = document.createElement('span');
      l.className = 'a-leaf corner ' + size;
      l.style.setProperty('--cx', x + 'px');
      l.style.setProperty('--cy', y + 'px');
      l.style.setProperty('--y0', y0 + 'px');
      l.style.setProperty('--op', op);
      l.style.animationDuration = duration + 's';
      l.style.animationDelay = delay + 's';
      eco.appendChild(l);
    });
  }
  const aqua = document.getElementById('aquaAnim');
  if (aqua) {
    const sizes = ['', 's', 't'];
    const aquaCount = reduceAnim ? 6 : 12;
    for (let i = 0; i < aquaCount; i++) {
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
    const drops = reduceAnim ? 24 : 60;
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
  let currentFaqFilter = 'all';
  const filterFaq = (cat) => {
    currentFaqFilter = cat || 'all';
    document.querySelectorAll('#faqList .faq-item').forEach(it => {
      it.classList.toggle('is-hidden-cat', currentFaqFilter !== 'all' && it.dataset.cat !== currentFaqFilter);
    });
    document.querySelectorAll('#faqFilters button').forEach(b => {
      b.classList.toggle('is-active', b.dataset.filter === currentFaqFilter);
    });
    applyFaqVisibility();
  };
  const applyFaqVisibility = () => {
    const list = document.getElementById('faqList');
    if (!list) return;
    let visible = 0;
    list.querySelectorAll('.faq-item').forEach(it => {
      const hiddenByCat = it.classList.contains('is-hidden-cat');
      const hiddenBySearch = it.classList.contains('is-hidden-search');
      const hidden = hiddenByCat || hiddenBySearch;
      it.classList.toggle('is-hidden', hidden);
      if (!hidden) visible++;
    });
    const empty = document.getElementById('faqEmpty');
    if (empty) empty.hidden = visible !== 0;
  };
  document.querySelectorAll('#faqFilters button').forEach(b => {
    b.addEventListener('click', () => filterFaq(b.dataset.filter));
  });
  // FAQ search
  const faqSearch = document.getElementById('faqSearch');
  if (faqSearch) {
    faqSearch.addEventListener('input', () => {
      const q = faqSearch.value.trim().toLowerCase();
      document.querySelectorAll('#faqList .faq-item').forEach(it => {
        const text = it.textContent.toLowerCase();
        const hide = q.length > 1 && text.indexOf(q) === -1;
        it.classList.toggle('is-hidden-search', hide);
      });
      applyFaqVisibility();
    });
  }
  // Help search, filters help cards
  const helpSearch = document.getElementById('helpSearch');
  if (helpSearch) {
    helpSearch.addEventListener('input', () => {
      const q = helpSearch.value.trim().toLowerCase();
      document.querySelectorAll('#helpGrid .help-card').forEach(c => {
        const text = c.textContent.toLowerCase();
        const hide = q.length > 1 && text.indexOf(q) === -1;
        c.classList.toggle('is-hidden', hide);
      });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== helpSearch) {
        e.preventDefault();
        helpSearch.focus();
      }
    });
  }
  document.querySelectorAll('.help-card[data-help]').forEach(c => {
    if (c.tagName === 'A') return; // already a link with proper href
    c.addEventListener('click', () => {
      const cat = c.dataset.help;
      const faqList = document.getElementById('faqList');
      if (faqList) {
        filterFaq(cat);
        const faqSection = document.getElementById('faq');
        faqSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.location.href = `faq.html#${cat}`;
      }
    });
  });
  const applyFaqHash = () => {
    const faqList = document.getElementById('faqList');
    if (!faqList) return;
    const hash = window.location.hash.replace('#', '');
    const cats = ['billing', 'account', 'irrigation', 'devices', 'plans', 'support', 'contact'];
    if (cats.indexOf(hash) !== -1) filterFaq(hash);
    else filterFaq('all');
  };
  applyFaqHash();
  window.addEventListener('hashchange', applyFaqHash);

  // Legal page TOC scrollspy
  const legalToc = document.querySelector('.legal-toc');
  if (legalToc) {
    const links = Array.from(legalToc.querySelectorAll('a'));
    const sections = links
      .map(a => document.querySelector(a.getAttribute('href')))
      .filter(Boolean);
    const setActive = (id) => {
      links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + id));
    };
    if (sections.length && 'IntersectionObserver' in window) {
      const tocIo = new IntersectionObserver((entries) => {
        const visible = entries.filter(e => e.isIntersecting)
          .sort((a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top);
        if (visible[0]) setActive(visible[0].target.id);
      }, { rootMargin: '-30% 0px -55% 0px', threshold: 0.01 });
      sections.forEach(s => tocIo.observe(s));
    }
  }

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

  // Legacy modal support (only if a modal-backdrop is still present on the page)
  const closeModal = (m) => m.classList.remove('is-open');
  document.querySelectorAll('[data-modal]').forEach(b => {
    b.addEventListener('click', (e) => {
      e.preventDefault();
      const m = document.getElementById('modal-' + b.dataset.modal);
      if (m) m.classList.add('is-open');
    });
  });
  document.querySelectorAll('.modal-backdrop').forEach(bd => {
    bd.addEventListener('click', (e) => { if (e.target === bd) closeModal(bd); });
    const closeBtn = bd.querySelector('.close');
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal(bd));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.querySelectorAll('.modal-backdrop.is-open').forEach(closeModal);
  });
})();
